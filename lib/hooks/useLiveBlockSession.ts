"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type LiveBlockSessionRow<TState> = {
  id: string;
  microsite_id: string;
  block_id: string;
  block_type: string;
  state: TState;
  created_at?: string;
  updated_at?: string;
};

type PostgresUpdatePayload<TState> = {
  new: LiveBlockSessionRow<TState>;
  old: LiveBlockSessionRow<TState>;
};

type UseLiveBlockSessionArgs<TState> = {
  micrositeId?: string | null;
  blockId: string;
  blockType: string;
  initialState: TState;
  enabled?: boolean;
};

export function useLiveBlockSession<TState>({
  micrositeId,
  blockId,
  blockType,
  initialState,
  enabled = true,
}: UseLiveBlockSessionArgs<TState>) {
  const [state, setState] = useState<TState>(initialState);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const mountedRef = useRef(true);
  const initialStateRef = useRef(initialState);

  useEffect(() => {
    initialStateRef.current = initialState;
  }, [initialState]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!enabled || !micrositeId) {
        setState(initialStateRef.current);
        setSessionId(null);
        setIsReady(true);
        return;
      }

      setIsReady(false);

      const { data, error } = await supabase
        .from("live_block_sessions")
        .select("*")
        .eq("microsite_id", micrositeId)
        .eq("block_id", blockId)
        .maybeSingle();

      if (cancelled || !mountedRef.current) return;

      if (error) {
        console.error("Failed to load live block session:", {
          message: (error as any)?.message,
          details: (error as any)?.details,
          hint: (error as any)?.hint,
          code: (error as any)?.code,
          raw: error,
        });
        setState(initialStateRef.current);
        setSessionId(null);
        setIsReady(true);
        return;
      }

      if (data) {
        const row = data as LiveBlockSessionRow<TState>;
        setSessionId(row.id);
        setState(row.state ?? initialStateRef.current);
        setIsReady(true);
        return;
      }

      const { data: created, error: createError } = await supabase
        .from("live_block_sessions")
        .insert({
          microsite_id: micrositeId,
          block_id: blockId,
          block_type: blockType,
          state: initialStateRef.current,
        })
        .select("*")
        .single();

      if (cancelled || !mountedRef.current) return;

      if (createError) {
        console.error("Failed to create live block session:", {
          message: (createError as any)?.message,
          details: (createError as any)?.details,
          hint: (createError as any)?.hint,
          code: (createError as any)?.code,
          raw: createError,
        });
        setState(initialStateRef.current);
        setSessionId(null);
        setIsReady(true);
        return;
      }

      if (created) {
        const row = created as LiveBlockSessionRow<TState>;
        setSessionId(row.id);
        setState(row.state ?? initialStateRef.current);
      }

      setIsReady(true);
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, [enabled, micrositeId, blockId, blockType]);

  useEffect(() => {
    if (!enabled || !sessionId) return;

    const channel = supabase.channel(`live-block-session-${sessionId}`);

    channel.on(
      "postgres_changes" as any,
      {
        event: "UPDATE",
        schema: "public",
        table: "live_block_sessions",
        filter: `id=eq.${sessionId}`,
      },
      (payload: PostgresUpdatePayload<TState>) => {
        if (!mountedRef.current) return;
        setState(payload.new.state ?? initialStateRef.current);
      },
    );

    void channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enabled, sessionId]);

  const updateState = useCallback(
    async (
      nextStateOrUpdater: TState | ((previousState: TState) => TState),
    ) => {
      if (!enabled || !sessionId) return;

      const nextState =
        typeof nextStateOrUpdater === "function"
          ? (nextStateOrUpdater as (previousState: TState) => TState)(state)
          : nextStateOrUpdater;

      setState(nextState);
      setIsSaving(true);

      const { error } = await supabase
        .from("live_block_sessions")
        .update({
          state: nextState,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sessionId);

      if (error) {
        console.error("Failed to update live block session:", {
          message: (error as any)?.message,
          details: (error as any)?.details,
          hint: (error as any)?.hint,
          code: (error as any)?.code,
          raw: error,
        });
      }

      if (mountedRef.current) {
        setIsSaving(false);
      }
    },
    [enabled, sessionId, state],
  );

  return {
    state,
    updateState,
    sessionId,
    isReady,
    isSaving,
  };
}