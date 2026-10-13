
CREATE OR REPLACE FUNCTION public.submit_live_trivia_answer_atomic(
  p_experience_id uuid,
  p_participant_id uuid,
  p_activity_id uuid,
  p_question_id text,
  p_choice_id text
)
RETURNS TABLE (
  question_id text,
  choice_id text,
  correct boolean,
  awarded_points integer,
  participant_score bigint,
  answered_at timestamptz
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

  v_questions jsonb;
  v_question jsonb;
  v_choices jsonb;
  v_activity_runtime jsonb;
  v_question_source jsonb;

  v_question_id text;
  v_choice_id text;
  v_authoritative_question_id text;
  v_correct_choice_id text;

  v_correct boolean;
  v_raw_points numeric;
  v_possible_points integer;
  v_awarded_points integer;

  v_existing_state jsonb;
  v_existing_answers jsonb;
  v_next_answers jsonb;
  v_next_state jsonb;

  v_score bigint;
  v_now timestamptz := clock_timestamp();
BEGIN
  v_question_id := btrim(COALESCE(p_question_id, ''));
  v_choice_id := btrim(COALESCE(p_choice_id, ''));

  IF v_question_id = ''
     OR v_choice_id = ''
     OR length(v_question_id) > 200
     OR length(v_choice_id) > 200
  THEN
    RAISE EXCEPTION 'Invalid Trivia answer';
  END IF;

  /*
   * Lock the experience to serialize atomic
   * Live operations affecting this experience.
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
   * Lock and validate the Trivia activity.
   */
  SELECT configuration
  INTO v_configuration
  FROM public.live_activities
  WHERE id = p_activity_id
    AND experience_id = p_experience_id
    AND activity_type = 'trivia'
    AND status = 'active'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Trivia activity is not active';
  END IF;

  /*
   * Read authoritative shared state under lock.
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
   * Validate selected activity in both modes.
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
      RAISE EXCEPTION 'Trivia activity is not selected';
    END IF;
  ELSE
    IF v_current_activity_id IS DISTINCT FROM p_activity_id
       OR v_current_activity_type IS DISTINCT FROM 'trivia'
    THEN
      RAISE EXCEPTION 'Trivia activity is not current';
    END IF;
  END IF;

  /*
   * Resolve authoritative question.
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
   * Preserve first-question fallback.
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
    RAISE EXCEPTION 'That Trivia question is no longer active';
  END IF;

  SELECT entry.value
  INTO v_question
  FROM jsonb_array_elements(v_questions) AS entry(value)
  WHERE jsonb_typeof(entry.value) = 'object'
    AND btrim(COALESCE(entry.value->>'id', ''))
      = v_authoritative_question_id
  LIMIT 1;

  IF v_question IS NULL THEN
    RAISE EXCEPTION 'Invalid Trivia question';
  END IF;

  /*
   * Validate selected answer.
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
    RAISE EXCEPTION 'Invalid Trivia answer';
  END IF;

  v_correct_choice_id :=
    CASE
      WHEN jsonb_typeof(v_question->'correctChoiceId') = 'string'
        THEN btrim(v_question->>'correctChoiceId')
      ELSE ''
    END;

  IF v_correct_choice_id = '' THEN
    RAISE EXCEPTION 'Trivia question is not configured correctly';
  END IF;

  v_correct := v_choice_id = v_correct_choice_id;

  /*
   * Match the existing scoring behavior:
   * numeric JSON values only, default 100,
   * truncated and clamped to 0..100000.
   */
  v_raw_points :=
    CASE
      WHEN jsonb_typeof(v_question->'points') = 'number'
        THEN (v_question->>'points')::numeric
      ELSE 100
    END;

  v_possible_points :=
    LEAST(
      100000,
      GREATEST(
        0,
        trunc(v_raw_points)
      )
    )::integer;

  v_awarded_points :=
    CASE
      WHEN v_correct THEN v_possible_points
      ELSE 0
    END;

  /*
   * Insert points first.
   *
   * A zero-point entry for incorrect answers
   * preserves duplicate protection.
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
    v_awarded_points,
    'trivia_question',
    p_activity_id::text || ':' ||
      v_authoritative_question_id,
    CASE
      WHEN v_correct THEN 'Correct Trivia answer'
      ELSE 'Incorrect Trivia answer'
    END
  );

  /*
   * Read existing history under lock.
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

  v_existing_answers :=
    CASE
      WHEN jsonb_typeof(v_existing_state->'answers') = 'object'
        THEN v_existing_state->'answers'
      ELSE '{}'::jsonb
    END;

  v_next_answers :=
    v_existing_answers ||
    jsonb_build_object(
      v_authoritative_question_id,
      jsonb_build_object(
        'choiceId', v_choice_id,
        'correct', v_correct,
        'awardedPoints', v_awarded_points,
        'answeredAt', v_now
      )
    );

  v_next_state :=
    v_existing_state ||
    jsonb_build_object(
      'answers', v_next_answers,
      'lastAnsweredQuestionId',
        v_authoritative_question_id
    );

  /*
   * Save history in the same transaction
   * as the point award.
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
    v_next_state,
    v_now
  )
  ON CONFLICT (participant_id, activity_id)
  DO UPDATE SET
    state = EXCLUDED.state,
    updated_at = EXCLUDED.updated_at;

  /*
   * Return authoritative score from ledger.
   */
  SELECT COALESCE(SUM(amount), 0)::bigint
  INTO v_score
  FROM public.live_point_transactions
  WHERE experience_id = p_experience_id
    AND participant_id = p_participant_id;

  RETURN QUERY
  SELECT
    v_authoritative_question_id,
    v_choice_id,
    v_correct,
    v_awarded_points,
    v_score,
    v_now;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_live_trivia_answer_atomic(
  uuid,
  uuid,
  uuid,
  text,
  text
)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.submit_live_trivia_answer_atomic(
  uuid,
  uuid,
  uuid,
  text,
  text
)
TO service_role;
