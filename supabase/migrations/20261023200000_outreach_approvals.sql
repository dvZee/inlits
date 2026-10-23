begin;
create table public.intelligence_campaigns (
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,business_id uuid not null,
 name text not null check(length(name) between 1 and 100),revision integer not null default 1,
 permission_revision integer,permission_expires_at timestamptz,send_limit integer not null default 0 check(send_limit between 0 and 50),cancelled boolean not null default false,
 created_at timestamptz not null default now(),unique(id,user_id),foreign key(business_id,user_id) references public.intelligence_business_workspaces(id,user_id) on delete cascade
);
create table public.intelligence_outreach_drafts (
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,campaign_id uuid not null,
 recipient text not null check(recipient=lower(trim(recipient)) and recipient ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' and length(recipient)<=254),
 company text not null check(length(company) between 1 and 200),subject text not null check(length(subject) between 1 and 200 and subject !~ E'[\r\n]'),body text not null check(length(body) between 1 and 10000),
 unsubscribe_token uuid not null default gen_random_uuid(),revision integer not null default 1,review text not null default 'pending' check(review in ('pending','approved','rejected')),approved_revision integer,
 created_at timestamptz not null default now(),unique(id,user_id),foreign key(campaign_id,user_id) references public.intelligence_campaigns(id,user_id) on delete cascade
);
create table public.intelligence_outreach_versions (
 draft_id uuid not null references public.intelligence_outreach_drafts(id) on delete cascade,revision integer not null,user_id uuid not null references auth.users(id) on delete cascade,
 recipient text not null,company text not null,subject text not null,body text not null,final_body text not null,public_origin text not null,unsubscribe_token uuid not null,created_at timestamptz not null default now(),primary key(draft_id,revision)
);
create table public.intelligence_suppressions (
 user_id uuid not null references auth.users(id) on delete cascade,recipient text not null,reason text not null,created_at timestamptz not null default now(),primary key(user_id,recipient)
);
create table public.intelligence_outbox (
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,campaign_id uuid not null,draft_id uuid not null,revision integer not null,
 recipient text not null,status text not null default 'queued' check(status in ('queued','dispatching','accepted','delivered','bounced','failed','unknown','cancelled','suppressed')),
 provider_id text unique,error_code text,unsubscribe_token uuid not null default gen_random_uuid() unique,
 claimed_at timestamptz,created_at timestamptz not null default now(),unique(campaign_id,recipient),
 foreign key(draft_id,revision) references public.intelligence_outreach_versions(draft_id,revision) on delete cascade,
 foreign key(campaign_id,user_id) references public.intelligence_campaigns(id,user_id) on delete cascade
);
create table public.intelligence_audit_events (
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,event text not null,entity_id uuid,details jsonb not null default '{}',created_at timestamptz not null default now()
);
do $$ declare t text; begin
 foreach t in array array['campaigns','outreach_drafts','outreach_versions','suppressions','outbox','audit_events'] loop
 execute format('alter table public.intelligence_%I enable row level security',t);
 execute format('create policy owner_read on public.intelligence_%I for select to authenticated using(auth.uid()=user_id)',t);
 execute format('grant select on public.intelligence_%I to authenticated',t);
 execute format('grant all on public.intelligence_%I to service_role',t);
 end loop;
end $$;
create function public.intelligence_create_campaign(business uuid,title text) returns public.intelligence_campaigns language plpgsql security definer set search_path=public as $$
declare c public.intelligence_campaigns;
begin
 if auth.uid() is null or not exists(select 1 from public.intelligence_business_workspaces where id=business and user_id=auth.uid()) then raise exception 'Workspace not available'; end if;
 insert into public.intelligence_campaigns(user_id,business_id,name) values(auth.uid(),business,title) returning * into c;return c;
end; $$;
create function public.intelligence_save_outreach(campaign uuid,draft uuid,expected_revision integer,email text,company text,subject text,body text,origin text) returns public.intelligence_outreach_drafts language plpgsql security definer set search_path=public as $$
declare c public.intelligence_campaigns; d public.intelligence_outreach_drafts;
begin
 select * into strict c from public.intelligence_campaigns where id=campaign and user_id=auth.uid() for update;
 if c.cancelled then raise exception 'Campaign cancelled'; end if;
 if origin !~ '^https://[^/]+$' then raise exception 'Public HTTPS origin required'; end if;
 if draft is null then
 insert into public.intelligence_outreach_drafts(user_id,campaign_id,recipient,company,subject,body) values(auth.uid(),campaign,lower(trim(email)),company,subject,body) returning * into d;
 else
 select * into strict d from public.intelligence_outreach_drafts where id=draft and campaign_id=campaign and user_id=auth.uid() for update;
 if expected_revision is null or d.revision!=expected_revision then raise exception 'Draft changed; reload before editing'; end if;
 if exists(select 1 from public.intelligence_outbox where draft_id=draft and status in ('dispatching','accepted','delivered','unknown')) then raise exception 'This message has already entered delivery'; end if;
 update public.intelligence_outreach_drafts set recipient=lower(trim(email)),company=intelligence_save_outreach.company,subject=intelligence_save_outreach.subject,body=intelligence_save_outreach.body,revision=revision+1,review='pending',approved_revision=null,unsubscribe_token=gen_random_uuid() where id=draft returning * into d;
 end if;
 insert into public.intelligence_outreach_versions(draft_id,revision,user_id,recipient,company,subject,body,final_body,public_origin,unsubscribe_token) values(d.id,d.revision,d.user_id,d.recipient,d.company,d.subject,d.body,d.body||E'\n\nStop these messages: '||origin||'/unsubscribe?token='||d.unsubscribe_token::text,origin,d.unsubscribe_token);
 update public.intelligence_campaigns set revision=revision+1,permission_revision=null,permission_expires_at=null where id=campaign;
 update public.intelligence_outbox set status='cancelled',error_code='campaign_edited' where campaign_id=campaign and status='queued';
 insert into public.intelligence_audit_events(user_id,event,entity_id,details) values(auth.uid(),'draft_saved',d.id,jsonb_build_object('revision',d.revision));return d;
end; $$;
create function public.intelligence_review_outreach(draft uuid,expected_revision integer,approve boolean) returns boolean language plpgsql security definer set search_path=public as $$
declare d public.intelligence_outreach_drafts;
begin
 -- Same lock order as edits/dispatch: campaign first, draft second.
 select * into strict d from public.intelligence_outreach_drafts where id=draft and user_id=auth.uid();
 perform 1 from public.intelligence_campaigns where id=d.campaign_id for update;
 update public.intelligence_outreach_drafts set review=case when approve then 'approved' else 'rejected' end,approved_revision=case when approve then revision else null end where id=draft and user_id=auth.uid() and revision=expected_revision returning * into d;
 if not found then raise exception 'Draft changed; reload before reviewing'; end if;
 if not approve then update public.intelligence_outbox set status='cancelled',error_code='approval_revoked' where draft_id=draft and status='queued';end if;
 insert into public.intelligence_audit_events(user_id,event,entity_id,details) values(auth.uid(),case when approve then 'draft_approved' else 'draft_rejected' end,draft,jsonb_build_object('revision',expected_revision));return true;
end; $$;
create function public.intelligence_campaign_permission(campaign uuid,expected_revision integer,allow_send boolean,recipient_limit integer) returns boolean language plpgsql security definer set search_path=public as $$
declare c public.intelligence_campaigns;
begin
 select * into strict c from public.intelligence_campaigns where id=campaign and user_id=auth.uid() for update;
 if expected_revision is null or c.revision!=expected_revision or c.cancelled then raise exception 'Campaign changed; review current recipients first'; end if;
 if allow_send and recipient_limit not between 1 and 50 then raise exception 'Limit must be 1 to 50'; end if;
 update public.intelligence_campaigns set permission_revision=case when allow_send then revision else null end,permission_expires_at=case when allow_send then now()+interval '24 hours' else null end,send_limit=case when allow_send then recipient_limit else 0 end where id=campaign;
 if not allow_send then update public.intelligence_outbox set status='cancelled',error_code='permission_revoked' where campaign_id=campaign and status='queued';end if;
 insert into public.intelligence_audit_events(user_id,event,entity_id,details) values(auth.uid(),case when allow_send then 'sending_authorized' else 'sending_revoked' end,campaign,jsonb_build_object('revision',c.revision,'limit',recipient_limit));return true;
end; $$;
create function public.intelligence_queue_campaign(campaign uuid,expected_revision integer) returns integer language plpgsql security definer set search_path=public as $$
declare c public.intelligence_campaigns; n integer; existing integer;
begin
 select * into strict c from public.intelligence_campaigns where id=campaign and user_id=auth.uid() for update;
 if expected_revision is null or c.revision!=expected_revision or c.permission_revision is distinct from c.revision or c.permission_expires_at<=now() or c.cancelled then raise exception 'Current sending permission required'; end if;
 select count(*) into existing from public.intelligence_outbox where campaign_id=campaign and status not in ('cancelled','suppressed','failed');
 select count(distinct recipient) into n from public.intelligence_outreach_drafts d where campaign_id=campaign and review='approved' and approved_revision=revision and not exists(select 1 from public.intelligence_suppressions s where s.user_id=auth.uid() and s.recipient=d.recipient) and not exists(select 1 from public.intelligence_outbox o where o.campaign_id=campaign and o.recipient=d.recipient and o.status not in ('cancelled'));
 if existing+n>c.send_limit then raise exception 'Campaign sending limit exceeded';end if;
 insert into public.intelligence_outbox(user_id,campaign_id,draft_id,revision,recipient,unsubscribe_token)
 select distinct on(d.recipient) auth.uid(),campaign,d.id,d.revision,d.recipient,d.unsubscribe_token from public.intelligence_outreach_drafts d where d.campaign_id=campaign and d.review='approved' and d.approved_revision=d.revision and not exists(select 1 from public.intelligence_suppressions s where s.user_id=auth.uid() and s.recipient=d.recipient) order by d.recipient,d.created_at
 on conflict(campaign_id,recipient) do update set draft_id=excluded.draft_id,revision=excluded.revision,status='queued',error_code=null,unsubscribe_token=excluded.unsubscribe_token where intelligence_outbox.status='cancelled';
 get diagnostics n=row_count;return n;
end; $$;
create function public.intelligence_cancel_campaign(campaign uuid) returns void language plpgsql security definer set search_path=public as $$
begin
 update public.intelligence_campaigns set cancelled=true,permission_revision=null,permission_expires_at=null where id=campaign and user_id=auth.uid();if not found then raise exception 'Campaign not available';end if;
 update public.intelligence_outbox set status='cancelled',error_code='campaign_cancelled' where campaign_id=campaign and status='queued';
 insert into public.intelligence_audit_events(user_id,event,entity_id) values(auth.uid(),'campaign_cancelled',campaign);
end; $$;
create function public.intelligence_claim_outreach() returns setof public.intelligence_outbox language plpgsql security definer set search_path=public as $$
declare c public.intelligence_campaigns; o public.intelligence_outbox;
begin
 -- Ambiguous interrupted dispatches never automatically retry.
 update public.intelligence_outbox set status='unknown',error_code='dispatch_interrupted' where status='dispatching' and claimed_at<now()-interval '5 minutes';
 select c1.* into c from public.intelligence_campaigns c1 where not c1.cancelled and c1.permission_revision=c1.revision and c1.permission_expires_at>now() and exists(select 1 from public.intelligence_outbox where campaign_id=c1.id and status='queued') order by c1.created_at for update skip locked limit 1;
 if not found then return;end if;
 if (select count(*) from public.intelligence_outbox where user_id=c.user_id and claimed_at>=date_trunc('day',now()) and status in ('dispatching','accepted','delivered','unknown','bounced'))>=50 then return;end if;
 update public.intelligence_outbox o1 set status='suppressed' where o1.campaign_id=c.id and o1.status='queued' and exists(select 1 from public.intelligence_suppressions s where s.user_id=o1.user_id and s.recipient=o1.recipient);
 select o1.* into o from public.intelligence_outbox o1 join public.intelligence_outreach_drafts d on d.id=o1.draft_id where o1.campaign_id=c.id and o1.status='queued' and d.review='approved' and d.approved_revision=o1.revision and d.revision=o1.revision order by o1.created_at for update of o1 skip locked limit 1;
 if not found then return;end if;
 if (select count(*) from public.intelligence_outbox where campaign_id=c.id and status in ('dispatching','accepted','delivered','unknown','bounced'))>=c.send_limit then return;end if;
 return query update public.intelligence_outbox set status='dispatching',claimed_at=now() where id=o.id returning *;
end; $$;
create function public.intelligence_unsubscribe(token uuid) returns void language plpgsql security definer set search_path=public as $$
declare o public.intelligence_outbox;
begin
 select * into o from public.intelligence_outbox where unsubscribe_token=token;if not found then return;end if;
 insert into public.intelligence_suppressions(user_id,recipient,reason) values(o.user_id,o.recipient,'unsubscribe') on conflict do nothing;
 update public.intelligence_outbox set status='suppressed' where user_id=o.user_id and recipient=o.recipient and status='queued';
end; $$;
-- Revoke implicit PUBLIC execution on all newly introduced RPCs, then grant only the required principals.
do $$ declare f record;begin
 for f in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('intelligence_create_campaign','intelligence_save_outreach','intelligence_review_outreach','intelligence_campaign_permission','intelligence_queue_campaign','intelligence_cancel_campaign') loop
 execute format('revoke all on function %s from public',f.signature);execute format('grant execute on function %s to authenticated',f.signature);
 end loop;
end $$;
revoke all on function public.intelligence_claim_outreach() from public;
revoke all on function public.intelligence_unsubscribe(uuid) from public;
grant execute on function public.intelligence_claim_outreach(),public.intelligence_unsubscribe(uuid) to service_role;

create function public.intelligence_review_many(campaign uuid,items jsonb,approve boolean) returns integer language plpgsql security definer set search_path=public as $$
declare d jsonb;n integer:=0;
begin
 if auth.uid() is null or not exists(select 1 from public.intelligence_campaigns where id=campaign and user_id=auth.uid()) then raise exception 'Campaign not available';end if;
 if jsonb_typeof(items)!='array' or jsonb_array_length(items) not between 1 and 50 then raise exception 'Choose 1 to 50 drafts';end if;
 perform 1 from public.intelligence_campaigns where id=campaign for update;
 for d in select jsonb_array_elements(items) loop
 if not exists(select 1 from public.intelligence_outreach_drafts where id=(d->>'id')::uuid and campaign_id=campaign and user_id=auth.uid()) then raise exception 'Draft not available';end if;
 perform public.intelligence_review_outreach((d->>'id')::uuid,(d->>'revision')::integer,approve);n=n+1;
 end loop;return n;
end; $$;
revoke all on function public.intelligence_review_many(uuid,jsonb,boolean) from public;
grant execute on function public.intelligence_review_many(uuid,jsonb,boolean) to authenticated;


create table public.intelligence_mail_events(id text primary key,provider_email_id text not null,event_type text not null,received_at timestamptz not null default now());
alter table public.intelligence_mail_events enable row level security;
grant all on public.intelligence_mail_events to service_role;
create function public.intelligence_mail_event(event_id text,email_id text,event_type text) returns boolean language plpgsql security definer set search_path=public as $$
declare o public.intelligence_outbox;
begin
 if exists(select 1 from public.intelligence_mail_events where id=event_id) then return true;end if;
 select * into o from public.intelligence_outbox where provider_id=email_id for update;if not found then return false;end if;
 insert into public.intelligence_mail_events(id,provider_email_id,event_type) values(event_id,email_id,event_type) on conflict do nothing;
 if event_type in ('email.bounced','email.complained','email.suppressed') then
 update public.intelligence_outbox set status='bounced',error_code=event_type where id=o.id;
 insert into public.intelligence_suppressions(user_id,recipient,reason) values(o.user_id,o.recipient,event_type) on conflict do nothing;
 update public.intelligence_outbox set status='suppressed' where user_id=o.user_id and recipient=o.recipient and status='queued';
 elsif event_type='email.delivered' and o.status not in ('bounced','suppressed') then update public.intelligence_outbox set status='delivered',error_code=null where id=o.id;
 elsif event_type='email.failed' and o.status not in ('bounced','suppressed','delivered') then update public.intelligence_outbox set status='failed',error_code=event_type where id=o.id;
 end if;return true;
end; $$;
revoke all on function public.intelligence_mail_event(text,text,text) from public;
grant execute on function public.intelligence_mail_event(text,text,text) to service_role;

create view public.intelligence_current_versions with (security_invoker=true) as select v.* from public.intelligence_outreach_versions v join public.intelligence_outreach_drafts d on d.id=v.draft_id and d.revision=v.revision;
grant select on public.intelligence_current_versions to authenticated;

create view public.intelligence_campaign_overview with (security_invoker=true) as
select c.*,
 (select count(*) from public.intelligence_outreach_drafts d where d.campaign_id=c.id) as draft_count,
 (select count(distinct d.recipient) from public.intelligence_outreach_drafts d where d.campaign_id=c.id) as unique_recipient_count,
 (select count(distinct d.recipient) from public.intelligence_outreach_drafts d where d.campaign_id=c.id and d.review='approved' and d.approved_revision=d.revision) as approved_unique_count
from public.intelligence_campaigns c;
grant select on public.intelligence_campaign_overview to authenticated;

commit;
