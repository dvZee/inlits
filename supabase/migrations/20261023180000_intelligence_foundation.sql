-- Additive only. Does not modify legacy users, content, subscriptions or profiles.
begin;
create table public.intelligence_personal_facts (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 label text not null check(length(label) between 1 and 100), value text not null check(length(value) between 1 and 2000),
 kind text not null check(kind in ('fact','inference','hypothesis')), source text not null default 'user' check(source='user'),
 consented_at timestamptz not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.intelligence_fact_history (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 fact_id uuid not null references public.intelligence_personal_facts(id) on delete cascade,
 previous_value jsonb not null, created_at timestamptz not null default now()
);
create table public.intelligence_assessment_sessions (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 assessment_id text not null check(assessment_id in ('values','thinking','communication','career','money','habits')),
 version integer not null check(version=1), answers jsonb not null check(jsonb_typeof(answers)='array' and jsonb_array_length(answers)=3),
 result jsonb, status text not null check(status in ('in_progress','completed')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check((status='completed' and result is not null) or (status='in_progress' and result is null))
);
create table public.intelligence_decision_records (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 topic text not null check(length(topic) between 1 and 200), options jsonb not null check(jsonb_typeof(options)='array' and jsonb_array_length(options) between 2 and 3),
 selected integer not null check(selected between 0 and 2), reason text not null check(length(reason) between 1 and 2000),
 next_step text not null check(length(next_step) between 1 and 2000),
 context_snapshot jsonb not null default '[]', context_consent boolean not null default false,
 outcome text check(length(outcome)<=2000), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(selected < jsonb_array_length(options)), check(context_consent or context_snapshot='[]'::jsonb), unique(id,user_id)
);
create table public.intelligence_business_workspaces (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 name text not null check(length(name) between 1 and 100), business_type text not null check(business_type in ('agency','services','ecommerce','creator')),
 goal text not null check(length(goal) between 1 and 2000), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,user_id)
);
create table public.intelligence_work_goals (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 business_id uuid not null, decision_id uuid not null, title text not null, next_step text not null,
 status text not null default 'planned' check(status in ('planned','cancelled')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(business_id,user_id) references public.intelligence_business_workspaces(id,user_id) on delete cascade,
 foreign key(decision_id,user_id) references public.intelligence_decision_records(id,user_id) on delete cascade,
 unique(user_id,decision_id,business_id)
);
create function public.intelligence_record_fact_revision() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if new.user_id is distinct from old.user_id then raise exception 'Ownership cannot change'; end if;
 if row(new.label,new.value,new.kind) is distinct from row(old.label,old.value,old.kind) then
 insert into public.intelligence_fact_history(user_id,fact_id,previous_value) values(old.user_id,old.id,jsonb_build_object('label',old.label,'value',old.value,'kind',old.kind,'updated_at',old.updated_at));
 end if;
 new.updated_at=now(); return new;
end; $$;
create trigger intelligence_fact_revision before update on public.intelligence_personal_facts for each row execute function public.intelligence_record_fact_revision();
create function public.intelligence_create_goal(decision uuid,business uuid) returns public.intelligence_work_goals language plpgsql security invoker set search_path=public as $$
declare d public.intelligence_decision_records; g public.intelligence_work_goals;
begin
 select * into strict d from public.intelligence_decision_records where id=decision and user_id=auth.uid();
 if not exists(select 1 from public.intelligence_business_workspaces where id=business and user_id=auth.uid()) then raise exception 'Workspace not available'; end if;
 -- Share only the chosen next step: private ME context is not copied into business data.
 insert into public.intelligence_work_goals(user_id,business_id,decision_id,title,next_step)
 values(auth.uid(),business,decision,d.topic,d.next_step) on conflict(user_id,decision_id,business_id) do nothing;
 select * into strict g from public.intelligence_work_goals where user_id=auth.uid() and decision_id=decision and business_id=business;
 return g;
end; $$;
revoke all on function public.intelligence_create_goal(uuid,uuid) from public;
grant execute on function public.intelligence_create_goal(uuid,uuid) to authenticated;
-- No service-role bypass in the application. Every table enforces account ownership.
do $$ declare t text; begin
 foreach t in array array['personal_facts','assessment_sessions','decision_records','business_workspaces','work_goals'] loop
 execute format('alter table public.intelligence_%I enable row level security',t);
 execute format('create policy owner_select on public.intelligence_%I for select to authenticated using (auth.uid()=user_id)',t);
 execute format('create policy owner_insert on public.intelligence_%I for insert to authenticated with check (auth.uid()=user_id)',t);
 execute format('create policy owner_update on public.intelligence_%I for update to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id)',t);
 execute format('create policy owner_delete on public.intelligence_%I for delete to authenticated using (auth.uid()=user_id)',t);
 execute format('create index on public.intelligence_%I(user_id,created_at desc)',t);
 execute format('grant select,insert,update,delete on public.intelligence_%I to authenticated',t);
 execute format('revoke all on public.intelligence_%I from anon',t);
 end loop;
end $$;
alter table public.intelligence_fact_history enable row level security;
create policy owner_read on public.intelligence_fact_history for select to authenticated using(auth.uid()=user_id);
grant select on public.intelligence_fact_history to authenticated;
revoke all on public.intelligence_fact_history from anon;

create table public.intelligence_assessment_definitions (
 assessment_id text not null, version integer not null, definition jsonb not null,
 primary key(assessment_id,version)
);
insert into public.intelligence_assessment_definitions values ('values',1,'{"id":"values","title":"Values & identity","domain":"Personality & identity","questions":["I can name the values behind my recent choices.","My weekly commitments reflect what matters to me.","I can explain a boundary I will protect."],"next":"Choose one commitment this week that reflects a value you want to protect."}'),
('thinking',1,'{"id":"thinking","title":"Thinking & decisions","domain":"Cognition","questions":["I look for evidence that could change my mind.","I compare alternatives before a consequential choice.","I separate what I know from what I assume."],"next":"For your next decision, write down one assumption and how you will check it."}'),
('communication',1,'{"id":"communication","title":"Communication & connection","domain":"Emotional & social","questions":["I check that I understood someone before responding.","I can explain a disagreement respectfully.","I ask for clarification when expectations are unclear."],"next":"In your next conversation, reflect back what you heard before offering your view."}'),
('career',1,'{"id":"career","title":"Career & enterprise","domain":"Career & entrepreneurship","questions":["I can name a skill people have paid me to use or asked my help with.","I have checked whether my intended customers need my offer.","I know the next practical step toward my professional goal."],"next":"Ask one potential customer or collaborator about a problem you can help solve."}'),
('money',1,'{"id":"money","title":"Money habits","domain":"Financial","questions":["I know my essential monthly expenses.","I check the full cost before a financial commitment.","I have a plan for an unexpected expense."],"next":"Write down essential expenses and one realistic step toward an emergency reserve."}'),
('habits',1,'{"id":"habits","title":"Habits & energy","domain":"Personal development","questions":["I make commitments that fit my available energy.","I return to a useful habit after an interruption.","I notice when I need rest or support."],"next":"Choose one small habit with a clear cue and a manageable first step."}');
alter table public.intelligence_assessment_definitions enable row level security;
create policy read_definitions on public.intelligence_assessment_definitions for select to authenticated using(true);
grant select on public.intelligence_assessment_definitions to authenticated;
revoke all on public.intelligence_assessment_definitions from anon;
alter table public.intelligence_assessment_sessions add foreign key(assessment_id,version) references public.intelligence_assessment_definitions(assessment_id,version);
create function public.intelligence_validate_assessment() returns trigger language plpgsql security invoker set search_path=public as $$
declare answer jsonb; total integer:=0; def jsonb;
begin
 if TG_OP='UPDATE' then
  if old.status='completed' then raise exception 'Completed reflections are immutable'; end if;
  if row(new.user_id,new.assessment_id,new.version) is distinct from row(old.user_id,old.assessment_id,old.version) then raise exception 'Assessment identity is immutable'; end if;
 end if;
 for answer in select jsonb_array_elements(new.answers) loop
  if answer='null'::jsonb then
   if new.status='completed' then raise exception 'All answers required'; end if;
  else
   if jsonb_typeof(answer)!='number' or answer::text !~ '^[1-5]$' then raise exception 'Answers must be integers 1 to 5'; end if;
   total=total+(answer::text)::integer;
  end if;
 end loop;
 if new.status='completed' then
  select definition into strict def from public.intelligence_assessment_definitions where assessment_id=new.assessment_id and version=new.version;
  new.result=jsonb_build_object('total',total,'maximum',15,'version',new.version,'next',def->>'next','disclaimer','A short self-reflection, not a validated psychological test, clinical screening, diagnosis, or prediction. Your answers describe your current self-report and may change with context.','interpretation',case when total>=12 then 'You currently report practicing these behaviors often. Look for a real example that supports or challenges this pattern.' when total>=8 then 'Your answers describe a mixed pattern. Notice which behavior is easiest and which needs support.' else 'You currently report these behaviors less often. Choose one manageable change rather than treating this as a fixed trait.' end);
 else new.result=null; end if;
 new.updated_at=now(); return new;
end; $$;
create trigger intelligence_assessment_validate before insert or update on public.intelligence_assessment_sessions for each row execute function public.intelligence_validate_assessment();

commit;
