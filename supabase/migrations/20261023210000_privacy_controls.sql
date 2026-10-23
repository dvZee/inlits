begin;
create function public.intelligence_export_data() returns jsonb language plpgsql security definer set search_path=public as $$
declare actor uuid:=auth.uid();t text;rows jsonb;result jsonb:=jsonb_build_object('format_version',1,'exported_at',now());
begin
 if actor is null then raise exception 'Authentication required';end if;
 foreach t in array array['personal_facts','fact_history','assessment_sessions','decision_records','business_workspaces','work_goals','jobs','leads','schedules','campaigns','outreach_drafts','outreach_versions','outbox','audit_events','suppressions','usage'] loop
 execute format('select coalesce(jsonb_agg(to_jsonb(r)),''[]''::jsonb) from public.intelligence_%I r where user_id=$1',t) into rows using actor;
 result=result||jsonb_build_object(t,rows);
 end loop;return result;
end; $$;
create function public.intelligence_delete_data(confirmation text) returns boolean language plpgsql security definer set search_path=public as $$
declare actor uuid:=auth.uid();
begin
 if actor is null or confirmation!='DELETE INTELLIGENCE DATA' then raise exception 'Explicit confirmation required';end if;
 -- Preserve truthful delivery records while a provider request is in flight.
 if exists(select 1 from public.intelligence_outbox where user_id=actor and status='dispatching') then raise exception 'An email dispatch is in flight; wait until its state settles before deleting';end if;
 -- Stale worker leases cannot publish after these owned rows are removed.
 delete from public.intelligence_business_workspaces where user_id=actor;
 delete from public.intelligence_jobs where user_id=actor;
 delete from public.intelligence_decision_records where user_id=actor;
 delete from public.intelligence_personal_facts where user_id=actor;
 delete from public.intelligence_assessment_sessions where user_id=actor;
 delete from public.intelligence_usage where user_id=actor;
 delete from public.intelligence_suppressions where user_id=actor;
 delete from public.intelligence_audit_events where user_id=actor;
 return true;
end; $$;
revoke all on function public.intelligence_export_data() from public;
revoke all on function public.intelligence_delete_data(text) from public;
grant execute on function public.intelligence_export_data(),public.intelligence_delete_data(text) to authenticated;
commit;
