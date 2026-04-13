export const dynamic = "force-dynamic";

import SpeedDatingPrivateRoom from "@/components/blocks/SpeedDatingPrivateRoom";

export default async function DatingPrivateRoomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const safeSlug = decodeURIComponent(String(slug || "")).trim().toLowerCase();

  return (
    <main className="min-h-screen bg-[#fcfbf8] px-4 py-6">
      <div className="mx-auto max-w-6xl">
        <SpeedDatingPrivateRoom slug={safeSlug} />
      </div>
    </main>
  );
}