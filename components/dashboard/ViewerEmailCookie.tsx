"use client";

import { useEffect } from "react";

export default function ViewerEmailCookie({ email }: { email: string }) {
  useEffect(() => {
    if (!email) return;

    document.cookie = `kht_viewer_email=${encodeURIComponent(
      email,
    )}; path=/; max-age=31536000; samesite=lax; secure`;
  }, [email]);

  return null;
}