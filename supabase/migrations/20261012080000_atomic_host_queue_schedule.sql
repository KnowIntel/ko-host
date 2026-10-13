-- Host queue and schedule operations, serialized per Live experience.
-- Deploy the RPCs before switching the API routes to use them.

CREATE UNIQUE INDEX IF NOT EXISTS live_song_requests_one_playing_per_experience
  ON public.live_song_requests (experience_id)
  WHERE status = 'playing';

CREATE UNIQUE INDEX IF NOT EXISTS live_schedule_entries_one_current_per_experience
  ON public.live_schedule_entries (experience_id)
  WHERE status = 'current';

CREATE UNIQUE INDEX IF NOT EXISTS live_schedule_entries_unique_sort_position
  ON public.live_schedule_entries (experience_id, sort_order);

CREATE OR REPLACE FUNCTION public.update_live_song_request_status_atomic(
  p_experience_id uuid,
  p_request_id uuid,
  p_status text
)
RETURNS TABLE (
  id uuid,
  song_title text,
  artist_name text,
  status text,
  sort_order integer,
  requested_at timestamptz
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_target public.live_song_requests%ROWTYPE;
  v_updated public.live_song_requests%ROWTYPE;
BEGIN
  IF p_status IS NULL OR p_status NOT IN ('queued', 'playing', 'played', 'rejected') THEN
    RAISE EXCEPTION 'Invalid Song Request status' USING ERRCODE = '22023';
  END IF;

  -- Serialize host operations against this experience.
  PERFORM 1 FROM public.live_experiences e
  WHERE e.id = p_experience_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Live experience not found' USING ERRCODE = 'P0002';
  END IF;

  -- Validate before touching any existing playing record.
  SELECT r.* INTO v_target
  FROM public.live_song_requests r
  WHERE r.id = p_request_id AND r.experience_id = p_experience_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Song Request not found' USING ERRCODE = 'P0002';
  END IF;

  IF p_status = 'playing' THEN
    UPDATE public.live_song_requests r
    SET status = 'queued', updated_at = now()
    WHERE r.experience_id = p_experience_id
      AND r.status = 'playing'
      AND r.id <> p_request_id;
  END IF;

  UPDATE public.live_song_requests r
  SET status = p_status, updated_at = now()
  WHERE r.id = p_request_id AND r.experience_id = p_experience_id
  RETURNING r.* INTO v_updated;

  RETURN QUERY SELECT v_updated.id, v_updated.song_title,
    v_updated.artist_name, v_updated.status,
    v_updated.sort_order, v_updated.requested_at;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_live_schedule_entry_status_atomic(
  p_experience_id uuid,
  p_entry_id uuid,
  p_status text
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  starts_at timestamptz,
  ends_at timestamptz,
  status text,
  sort_order integer
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_target public.live_schedule_entries%ROWTYPE;
  v_updated public.live_schedule_entries%ROWTYPE;
BEGIN
  IF p_status IS NULL OR p_status NOT IN ('upcoming', 'current', 'completed', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid Schedule status' USING ERRCODE = '22023';
  END IF;

  PERFORM 1 FROM public.live_experiences e
  WHERE e.id = p_experience_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Live experience not found' USING ERRCODE = 'P0002';
  END IF;

  SELECT s.* INTO v_target
  FROM public.live_schedule_entries s
  WHERE s.id = p_entry_id AND s.experience_id = p_experience_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Schedule entry not found' USING ERRCODE = 'P0002';
  END IF;

  IF p_status = 'current' THEN
    UPDATE public.live_schedule_entries s
    SET status = 'upcoming', updated_at = now()
    WHERE s.experience_id = p_experience_id
      AND s.status = 'current'
      AND s.id <> p_entry_id;
  END IF;

  UPDATE public.live_schedule_entries s
  SET status = p_status, updated_at = now()
  WHERE s.id = p_entry_id AND s.experience_id = p_experience_id
  RETURNING s.* INTO v_updated;

  RETURN QUERY SELECT v_updated.id, v_updated.title,
    v_updated.description, v_updated.starts_at,
    v_updated.ends_at, v_updated.status, v_updated.sort_order;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_live_schedule_entry_atomic(
  p_experience_id uuid,
  p_title text,
  p_description text,
  p_starts_at timestamptz,
  p_ends_at timestamptz
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  starts_at timestamptz,
  ends_at timestamptz,
  status text,
  sort_order integer,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_next_sort integer;
  v_created public.live_schedule_entries%ROWTYPE;
BEGIN
  IF p_title IS NULL OR btrim(p_title) = '' OR length(btrim(p_title)) > 200 THEN
    RAISE EXCEPTION 'Invalid Schedule title' USING ERRCODE = '22023';
  END IF;
  IF p_description IS NOT NULL AND length(p_description) > 1000 THEN
    RAISE EXCEPTION 'Invalid Schedule description' USING ERRCODE = '22023';
  END IF;
  IF p_starts_at IS NOT NULL AND p_ends_at IS NOT NULL
     AND p_ends_at < p_starts_at THEN
    RAISE EXCEPTION 'Schedule end time cannot be before the start time'
      USING ERRCODE = '22023';
  END IF;

  PERFORM 1 FROM public.live_experiences e
  WHERE e.id = p_experience_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Live experience not found' USING ERRCODE = 'P0002';
  END IF;

  SELECT COALESCE(MAX(s.sort_order), -1) + 1 INTO v_next_sort
  FROM public.live_schedule_entries s
  WHERE s.experience_id = p_experience_id;

  INSERT INTO public.live_schedule_entries (
    experience_id, title, description, starts_at, ends_at,
    status, sort_order, created_at, updated_at
  ) VALUES (
    p_experience_id, btrim(p_title), COALESCE(p_description, ''),
    p_starts_at, p_ends_at, 'upcoming', v_next_sort, now(), now()
  ) RETURNING * INTO v_created;

  RETURN QUERY SELECT v_created.id, v_created.title,
    v_created.description, v_created.starts_at,
    v_created.ends_at, v_created.status, v_created.sort_order,
    v_created.created_at, v_created.updated_at;
END;
$$;

REVOKE ALL ON FUNCTION public.update_live_song_request_status_atomic(uuid, uuid, text)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_live_schedule_entry_status_atomic(uuid, uuid, text)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_live_schedule_entry_atomic(uuid, text, text, timestamptz, timestamptz)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.update_live_song_request_status_atomic(uuid, uuid, text)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.update_live_schedule_entry_status_atomic(uuid, uuid, text)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.create_live_schedule_entry_atomic(uuid, text, text, timestamptz, timestamptz)
  TO service_role;
