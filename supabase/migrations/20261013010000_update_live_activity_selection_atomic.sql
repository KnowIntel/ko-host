
-- Ko-Host Live
-- Atomically manage Single/Multiple Activity selection.

CREATE OR REPLACE FUNCTION public.update_live_activity_selection_atomic(
  p_experience_id uuid,
  p_allow_multiple boolean,
  p_activity_ids uuid[]
)
RETURNS public.live_experience_state
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_row public.live_experience_state%ROWTYPE;
  v_ids uuid[];
  v_valid_count integer;
  v_current_id uuid;
  v_current_type text;
BEGIN
  -- Serialize all updates for this experience.
  PERFORM 1
  FROM public.live_experiences
  WHERE id = p_experience_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Live experience not found';
  END IF;

IF p_allow_multiple IS NULL OR p_activity_ids IS NULL THEN
  RAISE EXCEPTION 'Selection settings are required';
END IF;

IF cardinality(p_activity_ids) > 100 THEN
  RAISE EXCEPTION 'Too many selected activities';
END IF;

SELECT COALESCE(array_agg(id ORDER BY first_position), ARRAY[]::uuid[])
INTO v_ids
FROM (
  SELECT id, MIN(position) AS first_position
  FROM unnest(p_activity_ids) WITH ORDINALITY AS selected(id, position)
  WHERE id IS NOT NULL
  GROUP BY id
) AS unique_ids;

  IF NOT p_allow_multiple AND cardinality(v_ids) > 1 THEN
    RAISE EXCEPTION 'Single Activity Mode permits one selection';
  END IF;

  SELECT count(*)
  INTO v_valid_count
  FROM public.live_activities
  WHERE experience_id = p_experience_id
    AND status = 'active'
    AND id = ANY(v_ids);

  IF v_valid_count <> cardinality(v_ids) THEN
    RAISE EXCEPTION 'Selection contains an inactive or invalid activity';
  END IF;

  INSERT INTO public.live_experience_state (experience_id)
  VALUES (p_experience_id)
  ON CONFLICT (experience_id) DO NOTHING;

  SELECT *
  INTO STRICT v_row
  FROM public.live_experience_state
  WHERE experience_id = p_experience_id
  FOR UPDATE;

IF NOT p_allow_multiple THEN
v_current_id := v_ids[1];

  SELECT activity_type
  INTO v_current_type
  FROM public.live_activities
  WHERE id = v_current_id
    AND experience_id = p_experience_id
    AND status = 'active';

  IF v_current_type IS NULL THEN
    v_current_id := NULL;
  END IF;
ELSE
  v_current_id := v_row.current_activity_id;
  v_current_type := v_row.current_activity_type;
END IF;

  UPDATE public.live_experience_state
  SET
    state = (
      CASE
        WHEN jsonb_typeof(state) = 'object' THEN state
        ELSE '{}'::jsonb
      END
    ) || jsonb_build_object(
      'allowMultipleActiveActivities', p_allow_multiple,
      'activeActivityIds',
      CASE
        WHEN p_allow_multiple THEN to_jsonb(v_ids)
        ELSE '[]'::jsonb
      END
    ),
    current_activity_id = v_current_id,
    current_activity_type = v_current_type,
    updated_at = now()
  WHERE experience_id = p_experience_id
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION
  public.update_live_activity_selection_atomic(uuid, boolean, uuid[])
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION
  public.update_live_activity_selection_atomic(uuid, boolean, uuid[])
TO service_role;
