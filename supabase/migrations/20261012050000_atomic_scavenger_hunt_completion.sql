
CREATE OR REPLACE FUNCTION public.complete_live_scavenger_hunt_item_atomic(
  p_experience_id uuid,
  p_participant_id uuid,
  p_activity_id uuid,
  p_item_id text,
  p_response_text text DEFAULT ''
)
RETURNS TABLE (
  item_id text,
  awarded_points integer,
  completed_count integer,
  total_items integer,
  all_completed boolean
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_configuration jsonb;
  v_shared_state jsonb;
  v_existing_state jsonb;
  v_completed_items jsonb;
  v_next_completed_items jsonb;

  v_items jsonb;
  v_item jsonb;
  v_item_id text;
  v_response_text text;

  v_multi boolean;
  v_raw_points numeric;
  v_points integer;

  v_total integer;
  v_completed integer;
  v_all_completed boolean;

  v_now timestamptz := clock_timestamp();
  v_source_id text;
BEGIN
  /*
   * Normalize participant input.
   */
  v_item_id := left(btrim(COALESCE(p_item_id, '')), 200);

  v_response_text :=
    left(btrim(COALESCE(p_response_text, '')), 1000);

  IF v_item_id = '' THEN
    RAISE EXCEPTION 'Scavenger Hunt item is required';
  END IF;

  /*
   * Lock the experience to serialize completion
   * operations with host state changes.
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
    AND status = 'active'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Live participant is not active';
  END IF;

  /*
   * Validate and lock the activity.
   */
  SELECT configuration
  INTO v_configuration
  FROM public.live_activities
  WHERE id = p_activity_id
    AND experience_id = p_experience_id
    AND activity_type = 'scavenger_hunt'
    AND status = 'active'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Scavenger Hunt activity is not active';
  END IF;

  /*
   * Lock shared state and validate selection.
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
      RAISE EXCEPTION 'Scavenger Hunt activity is not selected';
    END IF;
  ELSE
    IF NOT EXISTS (
      SELECT 1
      FROM public.live_experience_state
      WHERE experience_id = p_experience_id
        AND current_activity_id = p_activity_id
        AND current_activity_type = 'scavenger_hunt'
    ) THEN
      RAISE EXCEPTION 'Scavenger Hunt activity is not current';
    END IF;
  END IF;

  /*
   * Normalize the configured items array.
   */
  v_items :=
    CASE
      WHEN jsonb_typeof(v_configuration->'items') = 'array'
        THEN v_configuration->'items'
      ELSE '[]'::jsonb
    END;

  /*
   * Find the submitted item.
   * Match the existing API's trimmed item IDs.
   */
  SELECT entry.value
  INTO v_item
  FROM jsonb_array_elements(v_items) AS entry(value)
  WHERE jsonb_typeof(entry.value) = 'object'
    AND left(
      btrim(
        COALESCE(entry.value->>'id', '')
      ),
      200
    ) = v_item_id
  LIMIT 1;

  IF v_item IS NULL THEN
    RAISE EXCEPTION 'Invalid Scavenger Hunt item';
  END IF;

  /*
   * Calculate points using the existing bounds.
   */
  BEGIN
    v_raw_points := (v_item->>'points')::numeric;
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

  /*
   * Lock existing participant progress.
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

  v_completed_items :=
    CASE
      WHEN jsonb_typeof(v_existing_state->'completedItems') = 'object'
        THEN v_existing_state->'completedItems'
      ELSE '{}'::jsonb
    END;

  /*
   * Reject a duplicate before inserting points.
   * The unique point transaction index provides
   * an additional database-level safeguard.
   */
  IF v_completed_items ? v_item_id THEN
    RAISE EXCEPTION 'You already completed this item';
  END IF;

  v_source_id :=
    p_activity_id::text || ':' || v_item_id;

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
    'scavenger_hunt_item',
    v_source_id,
    'Scavenger Hunt: ' ||
      COALESCE(NULLIF(v_item->>'title', ''), 'Item')
  );

  /*
   * Merge completion history atomically.
   */
  v_next_completed_items :=
    v_completed_items ||
    jsonb_build_object(
      v_item_id,
      jsonb_build_object(
        'completedAt', v_now,
        'awardedPoints', v_points,
        'responseText', v_response_text
      )
    );

  /*
   * Count only configured items that have
   * matching completion records.
   *
   * This prevents obsolete history entries
   * from inflating the completion count.
   */
  SELECT
    COUNT(*)::integer,
    COUNT(*) FILTER (
      WHERE v_next_completed_items ?
        left(
          btrim(COALESCE(entry.value->>'id', '')),
          200
        )
    )::integer
  INTO v_total, v_completed
  FROM jsonb_array_elements(v_items) AS entry(value)
  WHERE jsonb_typeof(entry.value) = 'object'
    AND NULLIF(
      left(
        btrim(COALESCE(entry.value->>'id', '')),
        200
      ),
      ''
    ) IS NOT NULL;

  v_all_completed :=
    v_total > 0 AND v_completed >= v_total;

  /*
   * Preserve unrelated participant-state fields.
   */
  INSERT INTO public.live_participant_activity_state (
    experience_id,
    participant_id,
    activity_id,
    state,
    completed_at,
    updated_at
  )
  VALUES (
    p_experience_id,
    p_participant_id,
    p_activity_id,
    v_existing_state || jsonb_build_object(
      'completedItems', v_next_completed_items,
      'completedCount', v_completed
    ),
    CASE
      WHEN v_all_completed THEN v_now
      ELSE NULL
    END,
    v_now
  )
  ON CONFLICT (participant_id, activity_id)
  DO UPDATE SET
    state = EXCLUDED.state,
    completed_at = EXCLUDED.completed_at,
    updated_at = EXCLUDED.updated_at;

  RETURN QUERY
  SELECT
    v_item_id,
    v_points,
    v_completed,
    v_total,
    v_all_completed;
END;
$$;

REVOKE ALL ON FUNCTION
  public.complete_live_scavenger_hunt_item_atomic(
    uuid, uuid, uuid, text, text
  )
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION
  public.complete_live_scavenger_hunt_item_atomic(
    uuid, uuid, uuid, text, text
  )
TO service_role;
