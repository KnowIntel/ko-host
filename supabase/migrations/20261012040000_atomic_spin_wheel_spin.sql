
CREATE OR REPLACE FUNCTION public.spin_live_wheel_atomic(
  p_experience_id uuid,
  p_participant_id uuid,
  p_activity_id uuid
)
RETURNS TABLE (
  option_id text,
  option_label text,
  awarded_points integer,
  spun_at timestamptz
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_shared_state jsonb;
  v_activity_state jsonb;
  v_configuration jsonb;
  v_options jsonb;
  v_option jsonb;
  v_existing_state jsonb;
  v_previous_spins jsonb;
  v_result jsonb;

  v_multi boolean;
  v_allow_multiple boolean;
  v_option_count integer;
  v_option_index integer;
  v_spin_number integer;

  v_raw_points numeric;
  v_points integer;

  v_source_id text;
  v_now timestamptz := clock_timestamp();
BEGIN
  /*
   * Serialize participant operations through the experience row.
   * This also coordinates with existing host state updates.
   */
  PERFORM 1
  FROM public.live_experiences
  WHERE id = p_experience_id
    AND is_enabled = true
    AND status = 'live'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Live experience is not available';
  END IF;

  /*
   * Validate and lock the participant.
   */
  PERFORM 1
  FROM public.live_participants
  WHERE id = p_participant_id
    AND experience_id = p_experience_id
    AND status = 'active'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Live participant is not active';
  END IF;

  /*
   * Validate the Spin Wheel activity.
   */
  SELECT configuration
  INTO v_configuration
  FROM public.live_activities
  WHERE id = p_activity_id
    AND experience_id = p_experience_id
    AND activity_type = 'spin_wheel'
    AND status = 'active'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Spin Wheel activity is not active';
  END IF;

  /*
   * Lock and inspect the current shared state.
   */
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
      RAISE EXCEPTION 'Spin Wheel activity is not selected';
    END IF;
  ELSE
    IF NOT EXISTS (
      SELECT 1
      FROM public.live_experience_state
      WHERE experience_id = p_experience_id
        AND current_activity_id = p_activity_id
        AND current_activity_type = 'spin_wheel'
    ) THEN
      RAISE EXCEPTION 'Spin Wheel activity is not current';
    END IF;
  END IF;

  /*
   * Normalize valid wheel options.
   */
  SELECT COALESCE(
    jsonb_agg(item.value ORDER BY item.ordinality),
    '[]'::jsonb
  )
  INTO v_options
  FROM jsonb_array_elements(
    CASE
      WHEN jsonb_typeof(v_configuration->'options') = 'array'
        THEN v_configuration->'options'
      ELSE '[]'::jsonb
    END
  ) WITH ORDINALITY AS item(value, ordinality)
  WHERE jsonb_typeof(item.value) = 'object'
    AND jsonb_typeof(item.value->'id') = 'string'
    AND jsonb_typeof(item.value->'label') = 'string';

  v_option_count := jsonb_array_length(v_options);

  IF v_option_count = 0 THEN
    RAISE EXCEPTION 'This Spin Wheel has no options';
  END IF;

  v_allow_multiple :=
    v_configuration->'allowMultipleSpins' = 'true'::jsonb;

  /*
   * Lock the participant's activity history.
   * The experience lock also prevents competing spins
   * from calculating the same spin number.
   */
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

  v_previous_spins :=
    CASE
      WHEN jsonb_typeof(v_existing_state->'spins') = 'array'
        THEN v_existing_state->'spins'
      ELSE '[]'::jsonb
    END;

  IF jsonb_array_length(v_previous_spins) > 0
     AND NOT v_allow_multiple THEN
    RAISE EXCEPTION 'You already spun this wheel';
  END IF;

  v_spin_number :=
    jsonb_array_length(v_previous_spins) + 1;

  /*
   * Select a random valid option.
   *
   * Each option has equal probability.
   */
  v_option_index :=
    floor(random() * v_option_count)::integer;

  v_option := v_options->v_option_index;

  /*
   * Calculate points with the existing
   * 0–100000 reward bounds.
   */
  BEGIN
    v_raw_points :=
      (v_option->>'points')::numeric;
  EXCEPTION
    WHEN invalid_text_representation
      OR numeric_value_out_of_range THEN
      v_raw_points := 0;
  END;

  IF v_raw_points IS NULL
     OR v_raw_points = 'NaN'::numeric THEN
    v_points := 0;
  ELSE
    v_points :=
      LEAST(
        100000,
        GREATEST(0, trunc(v_raw_points))
      )::integer;
  END IF;

  v_source_id :=
    p_activity_id::text || ':spin:' || v_spin_number;

  /*
   * Insert points before updating history.
   * Any failure rolls back the entire function.
   */
  INSERT INTO public.live_point_transactions (
    experience_id,
    participant_id,
    amount,
    source_type,
    source_id,
    reason
  )
  VALUES (
    p_experience_id,
    p_participant_id,
    v_points,
    'spin_wheel',
    v_source_id,
    'Spin Wheel: ' || (v_option->>'label')
  );

  v_result := jsonb_build_object(
    'optionId', v_option->>'id',
    'label', v_option->>'label',
    'awardedPoints', v_points,
    'spunAt', v_now
  );

  /*
   * Append history without losing existing fields.
   */
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
      'spins', v_previous_spins || jsonb_build_array(v_result),
      'lastSpin', v_result
    ),
    v_now
  )
  ON CONFLICT (participant_id, activity_id)
  DO UPDATE SET
    state = EXCLUDED.state,
    updated_at = EXCLUDED.updated_at;

  RETURN QUERY
  SELECT
    v_option->>'id',
    v_option->>'label',
    v_points,
    v_now;
END;
$$;

REVOKE ALL ON FUNCTION public.spin_live_wheel_atomic(
  uuid, uuid, uuid
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.spin_live_wheel_atomic(
  uuid, uuid, uuid
) TO service_role;
