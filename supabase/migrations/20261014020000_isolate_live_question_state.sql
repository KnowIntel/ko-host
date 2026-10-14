
-- Ko-Host Live
-- Isolate Trivia and Poll question state in Multiple Activity Mode.
-- Preserve legacy behavior in Single Activity Mode.

CREATE OR REPLACE FUNCTION public.update_live_experience_state_atomic(
  p_experience_id uuid,
  p_state_patch jsonb DEFAULT '{}'::jsonb,
  p_activity_id uuid DEFAULT NULL,
  p_activity_type text DEFAULT NULL,
  p_update_current_activity boolean DEFAULT false,
  p_host_runtime_key text DEFAULT NULL,
  p_host_runtime_value jsonb DEFAULT NULL
)
RETURNS public.live_experience_state
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_row public.live_experience_state%ROWTYPE;
  v_patch jsonb;
  v_state jsonb;
  v_runtime jsonb;
  v_activity_state jsonb;
  v_multi boolean;
  v_target_id uuid;
  v_target_type text;
BEGIN
  -- Serialize updates for the same Live experience.
  PERFORM 1
  FROM public.live_experiences
  WHERE id = p_experience_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Live experience not found';
  END IF;

  -- Initialize shared state if it does not already exist.
  INSERT INTO public.live_experience_state (experience_id)
  VALUES (p_experience_id)
  ON CONFLICT (experience_id) DO NOTHING;

  SELECT *
  INTO STRICT v_row
  FROM public.live_experience_state
  WHERE experience_id = p_experience_id
  FOR UPDATE;

  v_patch := CASE
    WHEN jsonb_typeof(p_state_patch) = 'object'
      THEN p_state_patch
    ELSE '{}'::jsonb
  END;

  v_state := CASE
    WHEN jsonb_typeof(v_row.state) = 'object'
      THEN v_row.state
    ELSE '{}'::jsonb
  END;

  v_multi :=
    v_state->>'allowMultipleActiveActivities' = 'true';

  -- Validate activity-specific Host runtime updates.
  IF p_host_runtime_key IS NOT NULL THEN
    IF NOT (
      (p_host_runtime_key = 'lotteryWinner'
        AND p_activity_type = 'lottery')
      OR
      (p_host_runtime_key = 'currentDropId'
        AND p_activity_type = 'mystery_drop')
    ) THEN
      RAISE EXCEPTION 'Unsupported host runtime update';
    END IF;

    IF p_activity_id IS NULL THEN
      RAISE EXCEPTION 'Host activity ID is required';
    END IF;

    SELECT id, activity_type
    INTO v_target_id, v_target_type
    FROM public.live_activities
    WHERE id = p_activity_id
      AND experience_id = p_experience_id
      AND activity_type = p_activity_type
      AND status = 'active';

    IF v_target_id IS NULL THEN
      RAISE EXCEPTION 'Host activity is not active';
    END IF;

    IF v_multi AND NOT (
      COALESCE(
        CASE
          WHEN jsonb_typeof(v_state->'activeActivityIds') = 'array'
            THEN v_state->'activeActivityIds'
          ELSE '[]'::jsonb
        END,
        '[]'::jsonb
      ) @> jsonb_build_array(p_activity_id::text)
    ) THEN
      RAISE EXCEPTION 'Host activity is not selected';
    END IF;

    IF NOT v_multi AND (
      v_row.current_activity_id IS DISTINCT FROM p_activity_id
      OR
      v_row.current_activity_type IS DISTINCT FROM p_activity_type
    ) THEN
      RAISE EXCEPTION 'Host activity is not current';
    END IF;
  END IF;

  -- Preserve server-managed selection and runtime properties.
  -- In Multiple Activity Mode, question selection belongs
  -- only to the targeted activity.
  v_state := v_state || (
    v_patch
      - 'allowMultipleActiveActivities'
      - 'activeActivityIds'
      - 'activityRuntime'
      - CASE
          WHEN v_multi THEN 'currentQuestionId'
          ELSE ''
        END
  );

  -- Maintain independent Poll/Trivia question pointers.
  IF p_host_runtime_key IS NULL
    AND p_activity_id IS NOT NULL
    AND p_activity_type IN ('poll', 'trivia')
    AND v_patch ? 'currentQuestionId'
  THEN
    -- Validate the target activity.
    PERFORM 1
    FROM public.live_activities
    WHERE id = p_activity_id
      AND experience_id = p_experience_id
      AND activity_type = p_activity_type
      AND status = 'active';

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Question activity is not active';
    END IF;

    -- Multiple Mode must target a selected activity.
    IF v_multi AND NOT (
      (
        CASE
          WHEN jsonb_typeof(v_state->'activeActivityIds') = 'array'
            THEN v_state->'activeActivityIds'
          ELSE '[]'::jsonb
        END
      ) @> jsonb_build_array(p_activity_id::text)
    ) THEN
      RAISE EXCEPTION 'Question activity is not selected';
    END IF;

    v_runtime := CASE
      WHEN jsonb_typeof(v_state->'activityRuntime') = 'object'
        THEN v_state->'activityRuntime'
      ELSE '{}'::jsonb
    END;

    v_activity_state := CASE
      WHEN jsonb_typeof(v_runtime->(p_activity_id::text)) = 'object'
        THEN v_runtime->(p_activity_id::text)
      ELSE '{}'::jsonb
    END;

    v_runtime := v_runtime || jsonb_build_object(
      p_activity_id::text,
      v_activity_state || jsonb_build_object(
        'currentQuestionId',
        v_patch->'currentQuestionId'
      )
    );

    v_state := jsonb_set(
      v_state,
      '{activityRuntime}',
      v_runtime,
      true
    );
  END IF;

  -- Write Host runtime state without replacing other activities.
  IF p_host_runtime_key IS NOT NULL THEN
    IF v_multi THEN
      v_runtime := CASE
        WHEN jsonb_typeof(v_state->'activityRuntime') = 'object'
          THEN v_state->'activityRuntime'
        ELSE '{}'::jsonb
      END;

      v_activity_state := CASE
        WHEN jsonb_typeof(v_runtime->(p_activity_id::text)) = 'object'
          THEN v_runtime->(p_activity_id::text)
        ELSE '{}'::jsonb
      END;

      v_runtime := v_runtime || jsonb_build_object(
        p_activity_id::text,
        v_activity_state || jsonb_build_object(
          p_host_runtime_key,
          p_host_runtime_value
        )
      );

      v_state := jsonb_set(
        v_state,
        '{activityRuntime}',
        v_runtime,
        true
      );
    ELSE
      v_state := v_state || jsonb_build_object(
        p_host_runtime_key,
        p_host_runtime_value
      );
    END IF;
  END IF;

  -- Legacy current-activity fields are single-mode only.
  IF p_update_current_activity AND NOT v_multi THEN
    v_row.current_activity_id := p_activity_id;
    v_row.current_activity_type := p_activity_type;
  END IF;

  UPDATE public.live_experience_state
  SET
    state = v_state,
    current_activity_id = v_row.current_activity_id,
    current_activity_type = v_row.current_activity_type,
    updated_at = now()
  WHERE experience_id = p_experience_id
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

-- Restrict execution to trusted server-side access.
REVOKE ALL ON FUNCTION
  public.update_live_experience_state_atomic(
    uuid, jsonb, uuid, text, boolean, text, jsonb
  )
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION
  public.update_live_experience_state_atomic(
    uuid, jsonb, uuid, text, boolean, text, jsonb
  )
TO service_role;
