import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import ViewerEmailCookie from "@/components/dashboard/ViewerEmailCookie";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "knowintelligentlife@gmail.com";

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    return <div className="p-6">Unauthorized</div>;
  }

const userEmail =
  user?.primaryEmailAddress?.emailAddress?.toLowerCase().trim() ?? "";

const isAdmin =
  userEmail === "knowintelligentlife@gmail.com";
    // userEmail === "michel.darbeau@gmail.com";

  return (
    <div className="space-y-6">
      <ViewerEmailCookie email={userEmail} />
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>

        <p className="mt-2 text-sm text-neutral-700">
          Manage your templates, microsites, and submissions.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/dashboard/microsites"
            className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            View Microsites
          </Link>

{isAdmin && (
  <Link
    href="/dashboard/admin"
    className="inline-flex items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 hover:bg-blue-100"
  >
    Admin Control Center
  </Link>
)}
        </div>
      </div>
    </div>
  );
}