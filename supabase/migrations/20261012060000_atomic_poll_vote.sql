
CREATE OR REPLACE FUNCTION public.submit_live_poll_vote_atomic(
  p_experience_id uuid,
  p_participant_id uuid,
  p_activity_id uuid,
  p_question_id text,
  p_choice_id text
)
RETURNS TABLE (
  question_id text,
  choice_id text,
  voted_at timestamptz
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_configuration jsonb;
  v_shared_state jsonb;
  v_current_activity_id uuid;
  v_current_activity_type text;
  v_multi boolean;
  v_question_id text;
  v_choice_id text;
  v_authoritative_question_id text;
  v_questions jsonb;
  v_question jsonb;
  v_choices jsonb;
  v_activity_runtime jsonb;
  v_question_source jsonb;
  v_now timestamptz := clock_timestamp();
BEGIN
  v_question_id := btrim(COALESCE(p_question_id, ''));
  v_choice_id := btrim(COALESCE(p_choice_id, ''));

  IF v_question_id = ''
     OR v_choice_id = ''
     OR length(v_question_id) > 200
     OR length(v_choice_id) > 200
  THEN
    RAISE EXCEPTION 'Invalid Poll vote';
  END IF;

  /*
   * Serialize with other atomic Live operations
   * using the experience row lock.
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
   * Confirm participant remains active.
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
   * Validate the Poll activity and lock
   * its configuration.
   */
  SELECT configuration
  INTO v_configuration
  FROM public.live_activities
  WHERE id = p_activity_id
    AND experience_id = p_experience_id
    AND activity_type = 'poll'
    AND status = 'active'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Poll activity is not active';
  END IF;

  /*
   * Lock and read authoritative shared state.
   */
  SELECT
    current_activity_id,
    current_activity_type,
    state
  INTO
    v_current_activity_id,
    v_current_activity_type,
    v_shared_state
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

  /*
   * Validate activity selection for both modes.
   */
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
      RAISE EXCEPTION 'Poll activity is not selected';
    END IF;
  ELSE
    IF v_current_activity_id IS DISTINCT FROM p_activity_id
       OR v_current_activity_type IS DISTINCT FROM 'poll'
    THEN
      RAISE EXCEPTION 'Poll activity is not current';
    END IF;
  END IF;

  /*
   * Resolve the current question using the
   * same rules as the existing Poll API.
   */
  v_questions :=
    CASE
      WHEN jsonb_typeof(v_configuration->'questions') = 'array'
        THEN v_configuration->'questions'
      ELSE '[]'::jsonb
    END;

  IF v_multi THEN
    v_activity_runtime :=
      CASE
        WHEN jsonb_typeof(
          v_shared_state->'activityRuntime'
        ) = 'object'
          THEN v_shared_state->'activityRuntime'
        ELSE '{}'::jsonb
      END;

    v_question_source :=
      v_activity_runtime
        ->(p_activity_id::text)
        ->'currentQuestionId';
  ELSE
    v_question_source :=
      v_shared_state->'currentQuestionId';
  END IF;

  v_authoritative_question_id :=
    CASE
      WHEN jsonb_typeof(v_question_source) = 'string'
        THEN btrim(v_question_source #>> '{}')
      ELSE ''
    END;

  /*
   * Fall back to the first configured question.
   */
  IF v_authoritative_question_id = '' THEN
    v_authoritative_question_id :=
      btrim(
        COALESCE(
          v_questions->0->>'id',
          ''
        )
      );
  END IF;

  IF v_authoritative_question_id = ''
     OR v_question_id <> v_authoritative_question_id
  THEN
    RAISE EXCEPTION 'That Poll question is no longer active';
  END IF;

  /*
   * Confirm the question exists in this Poll.
   */
  SELECT entry.value
  INTO v_question
  FROM jsonb_array_elements(v_questions) AS entry(value)
  WHERE jsonb_typeof(entry.value) = 'object'
    AND btrim(COALESCE(entry.value->>'id', ''))
      = v_authoritative_question_id
  LIMIT 1;

  IF v_question IS NULL THEN
    RAISE EXCEPTION 'Invalid Poll question';
  END IF;

  /*
   * Confirm the selected choice belongs
   * to the authoritative question.
   */
  v_choices :=
    CASE
      WHEN jsonb_typeof(v_question->'choices') = 'array'
        THEN v_question->'choices'
      ELSE '[]'::jsonb
    END;

  IF NOT EXISTS (
    SELECT 1
    FROM jsonb_array_elements(v_choices) AS entry(value)
    WHERE jsonb_typeof(entry.value) = 'object'
      AND btrim(COALESCE(entry.value->>'id', ''))
        = v_choice_id
  ) THEN
    RAISE EXCEPTION 'Invalid Poll choice';
  END IF;

  /*
   * The existing unique constraint prevents
   * multiple votes for the same activity/question.
   */
  INSERT INTO public.live_poll_votes (
    experience_id,
    participant_id,
    activity_id,
    question_id,
    choice_id,
    created_at
  )
  VALUES (
    p_experience_id,
    p_participant_id,
    p_activity_id,
    v_authoritative_question_id,
    v_choice_id,
    v_now
  );

  RETURN QUERY
  SELECT
    v_authoritative_question_id,
    v_choice_id,
    v_now;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_live_poll_vote_atomic(
  uuid,
  uuid,
  uuid,
  text,
  text
)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.submit_live_poll_vote_atomic(
  uuid,
  uuid,
  uuid,
  text,
  text
)
TO service_role;
