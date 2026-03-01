// app/dashboard/microsites/new/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function NewMicrositePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold tracking-tight">Create microsite</h2>
      <p className="mt-2 text-sm text-neutral-700">
        Phase 1 stub. In Phase 4 you’ll choose template → claim slug → configure modules → publish.
      </p>

      <div className="mt-6 rounded-xl bg-neutral-50 p-4 text-sm text-neutral-700">
        Auth OK. userId: <span className="font-mono">{userId}</span>
      </div>
    </div>
  );
}