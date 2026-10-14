-- Ko-Host Live
-- Fix Single Activity Mode selection when the
-- multiple-activity setting is absent (NULL).

DO $$
DECLARE
  v_definition text;
BEGIN
  SELECT pg_get_functiondef(
    'public.update_live_experience_state_atomic(uuid,jsonb,uuid,text,boolean,text,jsonb)'::regprocedure
  )
  INTO v_definition;

  IF v_definition IS NULL THEN
    RAISE EXCEPTION 'Live state function not found';
  END IF;

  IF position(
    'v_multi :=' IN v_definition
  ) = 0 THEN
    RAISE EXCEPTION 'Expected mode assignment not found';
  END IF;

  v_definition := replace(
    v_definition,
    'v_multi :=' || E'\r\n' ||
    '    v_state->>''allowMultipleActiveActivities'' = ''true'';',
    'v_multi := COALESCE(' || E'\n' ||
    '    v_state->>''allowMultipleActiveActivities'' = ''true'',' || E'\n' ||
    '    false' || E'\n' ||
    '  );'
  );

  IF position('v_multi := COALESCE(' IN v_definition) = 0
     OR position(
       'v_state->>''allowMultipleActiveActivities'' = ''true'';'
       IN v_definition
     ) > 0
  THEN
    RAISE EXCEPTION 'Function replacement failed';
  END IF;

  EXECUTE v_definition;
END;
$$;