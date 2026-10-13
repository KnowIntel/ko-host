
CREATE OR REPLACE FUNCTION public.enter_live_lottery_atomic(
  p_experience_id uuid,
  p_participant_id uuid,
  p_activity_id uuid
)
RETURNS TABLE (
  entry_number integer,
  entered_at timestamptz,
  entry_count integer,
  max_entries integer
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_configuration jsonb;
  v_shared_state jsonb;
  v_existing_state jsonb;
  v_entries jsonb;
  v_entry jsonb;

  v_multi boolean;
  v_max_entries integer;
  v_entry_count integer;
  v_raw_max numeric;
  v_now timestamptz := clock_timestamp();
BEGIN
  -- Serialize Live operations using the experience row.
  PERFORM 1
  FROM public.live_experiences
  WHERE id = p_experience_id
    AND is_enabled = true
    AND status = 'live'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Live experience is not available';
  END IF;

  -- Confirm the participant remains active.
  PERFORM 1
  FROM public.live_participants
  WHERE id = p_participant_id
    AND experience_id = p_experience_id
    AND status = 'active'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Live participant is not active';
  END IF;

  -- Validate and lock this Lottery.
  SELECT configuration
  INTO v_configuration
  FROM public.live_activities
  WHERE id = p_activity_id
    AND experience_id = p_experience_id
    AND activity_type = 'lottery'
    AND status = 'active'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lottery activity is not active';
  END IF;

  -- Read authoritative activity selection.
  SELECT state
  INTO v_shared_state
  FROM public.live_experience_state
  WHERE experience_id = p_experience_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Live experience state not found';
  END IF;

  v_shared_state :=
    CASE
      WHEN jsonb_typeof(v_shared_state) = 'object'
        THEN v_shared_state
      ELSE '{}'::jsonb
    END;

  v_multi :=
    v_shared_state->>'allowMultipleActiveActivities' = 'true';

  IF v_multi THEN
    IF NOT (
      (
        CASE
          WHEN jsonb_typeof(
            v_shared_state->'activeActivityIds'
          ) = 'array'
            THEN v_shared_state->'activeActivityIds'
          ELSE '[]'::jsonb
        END
      ) @> jsonb_build_array(p_activity_id::text)
    ) THEN
      RAISE EXCEPTION 'Lottery activity is not selected';
    END IF;
  ELSE
    IF NOT EXISTS (
      SELECT 1
      FROM public.live_experience_state
      WHERE experience_id = p_experience_id
        AND current_activity_id = p_activity_id
        AND current_activity_type = 'lottery'
    ) THEN
      RAISE EXCEPTION 'Lottery activity is not current';
    END IF;
  END IF;

  -- Preserve the existing 1–100 entry limit.
  BEGIN
    v_raw_max :=
      (v_configuration->>'maxEntriesPerParticipant')::numeric;
  EXCEPTION
    WHEN invalid_text_representation
      OR numeric_value_out_of_range THEN
      v_raw_max := NULL;
  END;

  IF v_raw_max IS NULL
     OR v_raw_max = 'NaN'::numeric THEN
    v_max_entries := 1;
  ELSE
    v_max_entries :=
      LEAST(
        100,
        GREATEST(1, trunc(v_raw_max))
      )::integer;
  END IF;

  -- Read the participant's history for this Lottery.
  SELECT state
  INTO v_existing_state
  FROM public.live_participant_activity_state
  WHERE experience_id = p_experience_id
    AND participant_id = p_participant_id
    AND activity_id = p_activity_id
  FOR UPDATE;

  v_existing_state :=
    CASE
      WHEN jsonb_typeof(v_existing_state) = 'object'
        THEN v_existing_state
      ELSE '{}'::jsonb
    END;

  v_entries :=
    CASE
      WHEN jsonb_typeof(v_existing_state->'entries') = 'array'
        THEN v_existing_state->'entries'
      ELSE '[]'::jsonb
    END;

  v_entry_count := jsonb_array_length(v_entries);

  IF v_entry_count >= v_max_entries THEN
    RAISE EXCEPTION
      'You have already reached the maximum number of entries';
  END IF;

  v_entry_count := v_entry_count + 1;

  v_entry := jsonb_build_object(
    'entryNumber', v_entry_count,
    'enteredAt', v_now
  );

  -- Append the entry atomically.
  INSERT INTO public.live_participant_activity_state (
    experience_id,
    participant_id,
    activity_id,
    state,
    updated_at
  )
  VALUES (
    p_experience_id,
    p_participant_id,
    p_activity_id,
    v_existing_state || jsonb_build_object(
      'entries', v_entries || jsonb_build_array(v_entry),
      'entryCount', v_entry_count
    ),
    v_now
  )
  ON CONFLICT (participant_id, activity_id)
  DO UPDATE SET
    state = EXCLUDED.state,
    updated_at = EXCLUDED.updated_at;

  RETURN QUERY
  SELECT
    v_entry_count,
    v_now,
    v_entry_count,
    v_max_entries;
END;
$$;

REVOKE ALL ON FUNCTION public.enter_live_lottery_atomic(
  uuid, uuid, uuid
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.enter_live_lottery_atomic(
  uuid, uuid, uuid
) TO service_role;
