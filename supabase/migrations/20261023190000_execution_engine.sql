begin;
create table public.intelligence_jobs (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 business_id uuid, kind text not null check(kind in ('decision_research','lead_research','daily_brief','hermes_plan')),
 input jsonb not null, result jsonb, status text not null default 'queued' check(status in ('queued','running','completed','retryable','failed','cancelled')),
 idempotency_key uuid not null, attempts integer not null default 0, max_attempts integer not null default 3 check(max_attempts between 1 and 3),
 available_at timestamptz not null default now(), lease_token uuid, lease_until timestamptz,
 error_code text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(user_id,idempotency_key), foreign key(business_id,user_id) references public.intelligence_business_workspaces(id,user_id) on delete cascade
);
create index intelligence_job_queue on public.intelligence_jobs(available_at) where status in ('queued','retryable','running');
create index intelligence_jobs_owner on public.intelligence_jobs(user_id,created_at desc);
alter table public.intelligence_jobs enable row level security;
create policy owner_read on public.intelligence_jobs for select to authenticated using(auth.uid()=user_id);
grant select on public.intelligence_jobs to authenticated;
revoke all on public.intelligence_jobs from anon;
create table public.intelligence_usage (
 user_id uuid not null references auth.users(id) on delete cascade, day date not null, ai_jobs integer not null default 0, primary key(user_id,day)
);
alter table public.intelligence_usage enable row level security;
create policy owner_read on public.intelligence_usage for select to authenticated using(auth.uid()=user_id);
grant select on public.intelligence_usage to authenticated;
create function public.intelligence_enqueue(kind text,topic text,business uuid,share_personal boolean,consent_ai boolean,request_key uuid) returns public.intelligence_jobs language plpgsql security definer set search_path=public as $$
declare actor uuid:=auth.uid(); j public.intelligence_jobs; context jsonb:='[]'; used integer;
begin
 if actor is null then raise exception 'Authentication required'; end if;
 if kind not in ('decision_research','lead_research','daily_brief','hermes_plan') or length(trim(topic)) not between 1 and 2000 then raise exception 'Invalid request'; end if;
 if kind in ('decision_research','lead_research','hermes_plan') and not consent_ai then raise exception 'AI processing consent required'; end if;
 select * into j from public.intelligence_jobs where user_id=actor and idempotency_key=request_key;
 if found then if j.kind is distinct from kind or j.business_id is distinct from business or j.input->>'topic' is distinct from topic or coalesce((j.input->>'share_personal')::boolean,false) is distinct from share_personal or (j.input->>'ai_consent')::boolean is distinct from consent_ai then raise exception 'Idempotency key reused with changed request';end if;return j;end if;
 if business is not null and not exists(select 1 from public.intelligence_business_workspaces where id=business and user_id=actor) then raise exception 'Workspace not available'; end if;
 if kind!='decision_research' and business is null then raise exception 'Workspace required'; end if;
 if share_personal and kind!='decision_research' then raise exception 'Personal context cannot be shared into business jobs'; end if;
 if share_personal then select coalesce(jsonb_agg(jsonb_build_object('label',label,'value',value,'kind',f.kind)),'[]') into context from (select f.label,f.value,f.kind from public.intelligence_personal_facts f where f.user_id=actor order by f.created_at desc limit 30) f; end if;
 -- Serialize retries and concurrent double-clicks before reserving a daily allowance.
 perform pg_advisory_xact_lock(hashtext(actor::text));
 select * into j from public.intelligence_jobs where user_id=actor and idempotency_key=request_key; if found then if j.kind is distinct from kind or j.business_id is distinct from business or j.input->>'topic' is distinct from topic or coalesce((j.input->>'share_personal')::boolean,false) is distinct from share_personal or (j.input->>'ai_consent')::boolean is distinct from consent_ai then raise exception 'Idempotency key reused with changed request';end if;return j;end if;
 insert into public.intelligence_usage(user_id,day,ai_jobs) values(actor,current_date,1) on conflict(user_id,day) do update set ai_jobs=intelligence_usage.ai_jobs+1 where intelligence_usage.ai_jobs<10 returning ai_jobs into used;
 if used is null then raise exception 'Daily job allowance reached'; end if;
 insert into public.intelligence_jobs(user_id,business_id,kind,input,idempotency_key) values(actor,business,kind,jsonb_build_object('topic',topic,'context',context,'ai_consent',consent_ai,'share_personal',share_personal),request_key) returning * into j;
 return j;
end; $$;
create function public.intelligence_cancel_job(job uuid) returns boolean language plpgsql security definer set search_path=public as $$
begin update public.intelligence_jobs set status='cancelled',lease_token=null,lease_until=null,updated_at=now() where id=job and user_id=auth.uid() and status in ('queued','retryable','running'); return found; end; $$;
-- Service-only leased claims. Expired claims can be retried; stale workers cannot publish.
create table public.intelligence_global_usage(day date primary key,attempts integer not null default 0);
alter table public.intelligence_global_usage enable row level security;
grant all on public.intelligence_global_usage to service_role;
create function public.intelligence_claim_job() returns setof public.intelligence_jobs language plpgsql security definer set search_path=public as $$
declare claimed public.intelligence_jobs;
begin
 perform pg_advisory_xact_lock(hashtext('inlits-global-job-budget'));
 update public.intelligence_jobs set status='failed',error_code='attempts_exhausted',lease_token=null,lease_until=null where status='running' and lease_until<now() and attempts>=max_attempts;
 with candidate as (select id from public.intelligence_jobs where available_at<=now() and attempts<max_attempts and (kind='daily_brief' or coalesce((select u.attempts from public.intelligence_global_usage u where u.day=current_date),0)<20) and (status in ('queued','retryable') or (status='running' and lease_until<now())) order by available_at for update skip locked limit 1)
 update public.intelligence_jobs j set status='running',attempts=attempts+1,lease_token=gen_random_uuid(),lease_until=now()+interval '5 minutes',updated_at=now() from candidate c where j.id=c.id returning j.* into claimed;
 if not found then return;end if;
 if claimed.kind!='daily_brief' then insert into public.intelligence_global_usage(day,attempts) values(current_date,1) on conflict(day) do update set attempts=intelligence_global_usage.attempts+1;end if;
 return next claimed;
end; $$;
create function public.intelligence_finish_job(job uuid,lease uuid,output jsonb,failure text,retry boolean) returns boolean language plpgsql security definer set search_path=public as $$
begin
 if failure is null and (output is null or jsonb_typeof(output)!='object') then raise exception 'Verified artifact required'; end if;
 update public.intelligence_jobs set status=case when failure is null then 'completed' when retry and attempts<max_attempts then 'retryable' else 'failed' end,result=case when failure is null then output else null end,error_code=left(failure,100),available_at=now()+make_interval(secs=>least(300,30*attempts)),lease_token=null,lease_until=null,updated_at=now() where id=job and status='running' and lease_token=lease and lease_until>now();
 return found;
end; $$;
create table public.intelligence_schedules (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 business_id uuid not null, enabled boolean not null default true, next_run_at timestamptz not null, created_at timestamptz not null default now(),
 foreign key(business_id,user_id) references public.intelligence_business_workspaces(id,user_id) on delete cascade, unique(user_id,business_id)
);
alter table public.intelligence_schedules enable row level security;
create policy owner_read on public.intelligence_schedules for select to authenticated using(auth.uid()=user_id);
grant select on public.intelligence_schedules to authenticated;
create function public.intelligence_schedule_brief(business uuid,enabled boolean) returns void language plpgsql security definer set search_path=public as $$
begin
 if auth.uid() is null or not exists(select 1 from public.intelligence_business_workspaces where id=business and user_id=auth.uid()) then raise exception 'Workspace not available'; end if;
 insert into public.intelligence_schedules(user_id,business_id,enabled,next_run_at) values(auth.uid(),business,enabled,now()) on conflict(user_id,business_id) do update set enabled=excluded.enabled;
end; $$;
create function public.intelligence_tick_schedules() returns integer language plpgsql security definer set search_path=public as $$
declare s public.intelligence_schedules; n integer:=0;
begin
 for s in select * from public.intelligence_schedules where enabled and next_run_at<=now() for update skip locked loop
 if exists(select 1 from public.intelligence_jobs where user_id=s.user_id and business_id=s.business_id and kind='daily_brief' and status in ('queued','running','retryable')) then update public.intelligence_schedules set next_run_at=now()+interval '24 hours' where id=s.id;continue;end if;
 insert into public.intelligence_jobs(user_id,business_id,kind,input,idempotency_key) values(s.user_id,s.business_id,'daily_brief','{"topic":"Daily business brief","context":[],"ai_consent":false}',gen_random_uuid());
 update public.intelligence_schedules set next_run_at=now()+interval '24 hours' where id=s.id; n=n+1;
 end loop; return n;
end; $$;
-- Explicit grants; SECURITY DEFINER functions are not public application APIs by default.
revoke all on function public.intelligence_enqueue(text,text,uuid,boolean,boolean,uuid) from public;
revoke all on function public.intelligence_cancel_job(uuid) from public;
revoke all on function public.intelligence_schedule_brief(uuid,boolean) from public;
revoke all on function public.intelligence_claim_job() from public;
revoke all on function public.intelligence_finish_job(uuid,uuid,jsonb,text,boolean) from public;
revoke all on function public.intelligence_tick_schedules() from public;
grant execute on function public.intelligence_enqueue(text,text,uuid,boolean,boolean,uuid), public.intelligence_cancel_job(uuid), public.intelligence_schedule_brief(uuid,boolean) to authenticated;
grant execute on function public.intelligence_claim_job(), public.intelligence_finish_job(uuid,uuid,jsonb,text,boolean), public.intelligence_tick_schedules() to service_role;
grant all on public.intelligence_jobs,public.intelligence_usage,public.intelligence_schedules to service_role;

create table public.intelligence_runtime_health(id text primary key check(id='worker'),last_seen_at timestamptz not null,capabilities jsonb not null);
alter table public.intelligence_runtime_health enable row level security;
create policy health_read on public.intelligence_runtime_health for select to authenticated using(true);
grant select on public.intelligence_runtime_health to authenticated;
grant all on public.intelligence_runtime_health to service_role;
create table public.intelligence_leads (
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,business_id uuid not null,
 company text not null,website text not null,domain text not null,qualification text not null,source_url text not null,job_id uuid references public.intelligence_jobs(id) on delete set null,
 created_at timestamptz not null default now(),unique(user_id,business_id,domain),unique(id,user_id),
 foreign key(business_id,user_id) references public.intelligence_business_workspaces(id,user_id) on delete cascade
);
alter table public.intelligence_leads enable row level security;
create policy owner_read on public.intelligence_leads for select to authenticated using(auth.uid()=user_id);
grant select on public.intelligence_leads to authenticated;
grant all on public.intelligence_leads to service_role;
create function public.intelligence_publish_leads() returns trigger language plpgsql security definer set search_path=public as $$
declare l jsonb; host text;
begin
 if new.status='completed' and new.kind='lead_research' and old.status!='completed' then
  for l in select jsonb_array_elements(new.result->'leads') loop
   host=lower(regexp_replace(split_part(regexp_replace(l->>'website','^https://',''), '/',1),'^www\.',''));
   insert into public.intelligence_leads(user_id,business_id,company,website,domain,qualification,source_url,job_id) values(new.user_id,new.business_id,l->>'company',l->>'website',host,l->>'qualification',l->>'source_url',new.id)
   on conflict(user_id,business_id,domain) do update set qualification=excluded.qualification,source_url=excluded.source_url,job_id=excluded.job_id;
  end loop;
 end if;return new;
end; $$;
create trigger intelligence_leads_publish after update on public.intelligence_jobs for each row execute function public.intelligence_publish_leads();


alter table public.intelligence_decision_records add column source_job_id uuid references public.intelligence_jobs(id) on delete set null;
alter table public.intelligence_decision_records add column evidence jsonb not null default '[]';
alter table public.intelligence_decision_records add unique(user_id,source_job_id);
create function public.intelligence_accept_decision(job uuid,selected_option integer) returns public.intelligence_decision_records language plpgsql security definer set search_path=public as $$
declare j public.intelligence_jobs;d public.intelligence_decision_records;
begin
 select * into strict j from public.intelligence_jobs where id=job and user_id=auth.uid() and kind='decision_research' and status='completed';
 if selected_option<0 or selected_option>=jsonb_array_length(j.result->'options') then raise exception 'Choose an available option';end if;
 insert into public.intelligence_decision_records(user_id,topic,options,selected,reason,next_step,context_snapshot,context_consent,source_job_id,evidence) values(auth.uid(),left(j.input->>'topic',200),j.result->'options',selected_option,left(j.result->>'recommendation',2000),left(j.result->>'next_step',2000),j.input->'context',jsonb_array_length(j.input->'context')>0,j.id,j.result->'sources') on conflict(user_id,source_job_id) do nothing;
 select * into strict d from public.intelligence_decision_records where user_id=auth.uid() and source_job_id=j.id;return d;
end; $$;
revoke all on function public.intelligence_accept_decision(uuid,integer) from public;
grant execute on function public.intelligence_accept_decision(uuid,integer) to authenticated;

commit;
