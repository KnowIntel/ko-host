
CREATE OR REPLACE FUNCTION public.reveal_live_mystery_drop_atomic(
  p_experience_id uuid,
  p_participant_id uuid,
  p_activity_id uuid
)
RETURNS TABLE (
  drop_id text,
  drop_title text,
  drop_content text,
  awarded_points integer,
  revealed_at timestamptz
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_shared_state jsonb;
  v_activity_runtime jsonb;
  v_activity_state jsonb;
  v_configuration jsonb;
  v_drops jsonb;
  v_drop jsonb;
  v_drop_id text;
  v_multi boolean;
  v_raw_points numeric;
  v_points integer;
  v_now timestamptz := clock_timestamp();
  v_source_id text;
BEGIN
  /*
   * Lock the experience first.
   *
   * This follows the same lock order as the
   * existing atomic shared-state function.
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
   * Validate the participant.
   */
  PERFORM 1
  FROM public.live_participants
  WHERE id = p_participant_id
    AND experience_id = p_experience_id
    AND status = 'active';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Live participant is not active';
  END IF;

  /*
   * Validate the Mystery Drop activity
   * and retrieve its configuration.
   */
  SELECT configuration
  INTO v_configuration
  FROM public.live_activities
  WHERE id = p_activity_id
    AND experience_id = p_experience_id
    AND activity_type = 'mystery_drop'
    AND status = 'active';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mystery Drop activity is not active';
  END IF;

  /*
   * Read the current shared state while
   * holding the experience lock.
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
    v_shared_state->>'allowMultipleActiveActivities'
      = 'true';

  /*
   * Validate activity selection.
   */
  IF v_multi THEN
    IF NOT (
      CASE
        WHEN jsonb_typeof(
          v_shared_state->'activeActivityIds'
        ) = 'array'
        THEN v_shared_state->'activeActivityIds'
        ELSE '[]'::jsonb
      END
      @> jsonb_build_array(p_activity_id::text)
    ) THEN
      RAISE EXCEPTION
        'Mystery Drop activity is not selected';
    END IF;

    v_activity_runtime :=
      CASE
        WHEN jsonb_typeof(
          v_shared_state->'activityRuntime'
        ) = 'object'
        THEN v_shared_state->'activityRuntime'
        ELSE '{}'::jsonb
      END;

    v_activity_state :=
      CASE
        WHEN jsonb_typeof(
          v_activity_runtime->(p_activity_id::text)
        ) = 'object'
        THEN v_activity_runtime->(p_activity_id::text)
        ELSE '{}'::jsonb
      END;

    v_drop_id :=
      NULLIF(
        btrim(
          v_activity_state->>'currentDropId'
        ),
        ''
      );
  ELSE
    IF NOT EXISTS (
      SELECT 1
      FROM public.live_experience_state
      WHERE experience_id = p_experience_id
        AND current_activity_id = p_activity_id
        AND current_activity_type = 'mystery_drop'
    ) THEN
      RAISE EXCEPTION
        'Mystery Drop activity is not current';
    END IF;

    v_drop_id :=
      NULLIF(
        btrim(v_shared_state->>'currentDropId'),
        ''
      );
  END IF;

  IF v_drop_id IS NULL THEN
    RAISE EXCEPTION
      'There is no Mystery Drop available right now';
  END IF;

  /*
   * Locate the selected drop in its
   * activity-specific configuration.
   */
  v_drops :=
    CASE
      WHEN jsonb_typeof(
        v_configuration->'drops'
      ) = 'array'
        THEN v_configuration->'drops'
      ELSE '[]'::jsonb
    END;

  SELECT item.value
  INTO v_drop
  FROM jsonb_array_elements(v_drops)
    AS item(value)
  WHERE item.value->>'id' = v_drop_id
  LIMIT 1;

  IF v_drop IS NULL THEN
    RAISE EXCEPTION
      'The current Mystery Drop is unavailable';
  END IF;

  /*
   * Calculate the reward on the server.
   * Invalid values award zero points.
   */
  BEGIN
    v_raw_points :=
      (v_drop->>'points')::numeric;
  EXCEPTION WHEN invalid_text_representation
              OR numeric_value_out_of_range
  THEN
    v_raw_points := 0;
  END;

  v_points :=
    CASE
      WHEN v_raw_points IS NULL THEN 0
      ELSE LEAST(
        100000,
        GREATEST(
          0,
          trunc(v_raw_points)
        )
      )::integer
    END;

  /*
   * Include both activity and drop IDs
   * in the duplicate-protection key.
   */
  v_source_id :=
    p_activity_id::text || ':' || v_drop_id;

  /*
   * Insert the points transaction.
   *
   * Existing unique index:
   * (experience_id, participant_id,
   *  source_type, source_id)
   *
   * Duplicate attempts raise 23505.
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
    'mystery_drop',
    v_source_id,
    'Mystery Drop: ' ||
      COALESCE(v_drop->>'title', 'Drop')
  );

  /*
   * Atomically merge this reveal into
   * the participant's activity state.
   *
   * ON CONFLICT updates the existing
   * JSON instead of replacing it with
   * a stale copy read by the API.
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
    jsonb_build_object(
      'revealedDrops',
      jsonb_build_object(
        v_drop_id,
        jsonb_build_object(
          'revealedAt', v_now,
          'awardedPoints', v_points
        )
      )
    ),
    v_now
  )
  ON CONFLICT (participant_id, activity_id)
  DO UPDATE SET
    state = jsonb_set(
      CASE
        WHEN jsonb_typeof(
          live_participant_activity_state.state
        ) = 'object'
        THEN live_participant_activity_state.state
        ELSE '{}'::jsonb
      END,
      '{revealedDrops}',
      (
        CASE
          WHEN jsonb_typeof(
            live_participant_activity_state.state
              ->'revealedDrops'
          ) = 'object'
          THEN live_participant_activity_state.state
            ->'revealedDrops'
          ELSE '{}'::jsonb
        END
      ) ||
      jsonb_build_object(
        v_drop_id,
        jsonb_build_object(
          'revealedAt', v_now,
          'awardedPoints', v_points
        )
      ),
      true
    ),
    updated_at = v_now;

  /*
   * Both writes succeed or neither does.
   */
  RETURN QUERY
  SELECT
    v_drop_id,
    COALESCE(v_drop->>'title', ''),
    COALESCE(v_drop->>'content', ''),
    v_points,
    v_now;
END;
$$;

REVOKE ALL ON FUNCTION
  public.reveal_live_mystery_drop_atomic(
    uuid, uuid, uuid
  )
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION
  public.reveal_live_mystery_drop_atomic(
    uuid, uuid, uuid
  )
TO service_role;
