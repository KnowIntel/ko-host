"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function RedirectToBuilder() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id || "");

  useEffect(() => {
    if (id) {
      router.replace(`/dashboard/microsites/${id}/builder`);
    }
  }, [id, router]);

  return null;
}