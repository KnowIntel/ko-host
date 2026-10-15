begin;

-- General microsite progress trackers are independent of Ko-Host Live.
-- site_key and block_id are resolved and authorized by the application server.
-- participant_id is a server-verified UUID, never trusted from a client payload.
create table if not exists public.progress_tracker_states (
  id uuid primary key default gen_random_uuid(),
  site_key text not null,
  block_id text not null,
  participant_id uuid not null,
  current_targets jsonb not null default '{}'::jsonb,
  actuals jsonb not null default '{}'::jsonb,
  completed_rows jsonb not null default '{}'::jsonb,
  session_number bigint not null default 1 check (session_number > 0),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint progress_tracker_state_identity unique (site_key, block_id, participant_id),
  constraint progress_tracker_state_json check (
    jsonb_typeof(current_targets) = 'object' and
    jsonb_typeof(actuals) = 'object' and
    jsonb_typeof(completed_rows) = 'object'
  )
);

create table if not exists public.progress_tracker_history (
  id uuid primary key default gen_random_uuid(),
  state_id uuid not null references public.progress_tracker_states(id) on delete cascade,
  session_number bigint not null,
  completion_key uuid not null,
  snapshot jsonb not null,
  completed_at timestamptz not null default now(),
  constraint progress_tracker_history_session_unique unique (state_id, session_number),
  constraint progress_tracker_history_request_unique unique (state_id, completion_key),
  constraint progress_tracker_history_snapshot_object check (jsonb_typeof(snapshot) = 'object')
);

create index if not exists progress_tracker_history_state_time_idx
  on public.progress_tracker_history (state_id, completed_at desc);

alter table public.progress_tracker_states enable row level security;
alter table public.progress_tracker_history enable row level security;

-- No browser-facing RLS policies. All access goes through authenticated,
-- authorized server endpoints using the service role.
revoke all on public.progress_tracker_states from public, anon, authenticated;
revoke all on public.progress_tracker_history from public, anon, authenticated;

-- The server must serialize writes by locking the state row, and must never
-- accept site_key, participant_id, or block_id as authorization proof.
-- This RPC atomically archives the completed session and advances configured
-- numeric targets, while deduplicating retries by completion_key.
create or replace function public.complete_progress_tracker_session(
  p_state_id uuid,
  p_completion_key uuid,
  p_configuration jsonb
)
returns public.progress_tracker_history
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_state public.progress_tracker_states%rowtype;
  v_history public.progress_tracker_history%rowtype;
  v_rows jsonb;
  v_measurements jsonb;
  v_row jsonb;
  v_measurement jsonb;
  v_row_id text;
  v_measurement_id text;
  v_targets jsonb;
  v_row_targets jsonb;
  v_old numeric;
  v_next numeric;
  v_step numeric;
  v_mode text;
  v_trigger text;
begin
  if p_completion_key is null or p_configuration is null then
    raise exception 'Completion key and configuration are required';
  end if;

  select * into v_state from public.progress_tracker_states
    where id = p_state_id for update;
  if not found then raise exception 'Tracker state not found'; end if;

  select * into v_history from public.progress_tracker_history
    where state_id = p_state_id and completion_key = p_completion_key;
  if found then return v_history; end if;

  v_rows := p_configuration->'rows';
  v_measurements := p_configuration->'measurements';
  v_trigger := p_configuration->>'progressionTrigger';
  if jsonb_typeof(v_rows) is distinct from 'array' or
     jsonb_typeof(v_measurements) is distinct from 'array' or
     jsonb_array_length(v_rows) = 0 then
    raise exception 'Invalid tracker configuration';
  end if;

  for v_row in select value from jsonb_array_elements(v_rows) loop
    v_row_id := v_row->>'id';
    if v_row_id is null or v_state.completed_rows->>v_row_id is distinct from 'true' then
      raise exception 'All configured rows must be checked before completion';
    end if;
  end loop;

  insert into public.progress_tracker_history
    (state_id, session_number, completion_key, snapshot)
  values (
    v_state.id, v_state.session_number, p_completion_key,
    jsonb_build_object(
      'title', p_configuration->'title',
      'rows', v_rows,
      'measurements', v_measurements,
      'targets', v_state.current_targets,
      'actuals', v_state.actuals,
      'completedRows', v_state.completed_rows,
      'sessionNumber', v_state.session_number
    )
  ) returning * into v_history;

  v_targets := v_state.current_targets;
  if v_trigger = 'completion' then
    for v_row in select value from jsonb_array_elements(v_rows) loop
      v_row_id := v_row->>'id';
      v_row_targets := coalesce(v_targets->v_row_id, v_row->'targets', '{}'::jsonb);
      if jsonb_typeof(v_row_targets) is distinct from 'object' then
        v_row_targets := '{}'::jsonb;
      end if;
      for v_measurement in select value from jsonb_array_elements(v_measurements) loop
        v_measurement_id := v_measurement->>'id';
        v_mode := v_measurement#>>'{progression,mode}';
        if v_measurement_id is null or v_mode not in ('increase', 'decrease') or
           coalesce((v_measurement->>'targetEnabled')::boolean, false) = false then
          continue;
        end if;
        if jsonb_typeof(v_row_targets->v_measurement_id) <> 'number' then
          continue;
        end if;
        v_old := (v_row_targets->>v_measurement_id)::numeric;
        v_step := greatest(0, coalesce(nullif(v_measurement#>>'{progression,step}', '')::numeric, 0));
        v_next := case when v_mode = 'increase' then v_old + v_step else v_old - v_step end;
        if v_measurement#>>'{progression,min}' is not null then
          v_next := greatest(v_next, (v_measurement#>>'{progression,min}')::numeric);
        end if;
        if v_measurement#>>'{progression,max}' is not null then
          v_next := least(v_next, (v_measurement#>>'{progression,max}')::numeric);
        end if;
        v_row_targets := jsonb_set(v_row_targets, array[v_measurement_id], to_jsonb(v_next), true);
      end loop;
      v_targets := jsonb_set(v_targets, array[v_row_id], v_row_targets, true);
    end loop;
  end if;

  update public.progress_tracker_states
    set current_targets = v_targets,
        actuals = '{}'::jsonb,
        completed_rows = '{}'::jsonb,
        session_number = session_number + 1,
        updated_at = now()
    where id = v_state.id;

  return v_history;
end;
$$;

revoke all on function public.complete_progress_tracker_session(uuid, uuid, jsonb)
  from public, anon, authenticated;
grant execute on function public.complete_progress_tracker_session(uuid, uuid, jsonb)
  to service_role;

commit;
