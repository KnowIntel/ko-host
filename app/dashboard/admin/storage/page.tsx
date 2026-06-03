import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "knowintelligentlife@gmail.com";

const buckets = [
  {
    name: "claim-offer-attachments",
    visibility: "Private",
    policies: 0,
    fileSizeLimit: "10 MB",
    mimeTypes: "Any",
    purpose: "Custom development request attachments",
    risk: "Sensitive private files",
  },
  {
    name: "videos",
    visibility: "Private",
    policies: 1,
    fileSizeLimit: "5 MB",
    mimeTypes: "Any",
    purpose: "Uploaded video assets",
    risk: "Small video limit",
  },
  {
    name: "file-share-uploads",
    visibility: "Private",
    policies: 0,
    fileSizeLimit: "25 MB",
    mimeTypes: "Any",
    purpose: "File share block uploads",
    risk: "User-generated private files",
  },
  {
    name: "microsite-thumbnails",
    visibility: "Public",
    policies: 0,
    fileSizeLimit: "Unset / 50 MB default",
    mimeTypes: "Any",
    purpose: "Microsite thumbnail images",
    risk: "Public media",
  },
  {
    name: "uploads",
    visibility: "Public",
    policies: 4,
    fileSizeLimit: "10 MB",
    mimeTypes: "PNG, JPEG, WebP, MP4, WebM, QuickTime",
    purpose: "General builder image/video uploads",
    risk: "Primary public upload bucket",
  },
  {
    name: "microsite-gallery",
    visibility: "Public",
    policies: 0,
    fileSizeLimit: "Unset / 50 MB default",
    mimeTypes: "Any",
    purpose: "Gallery images and public microsite media",
    risk: "Large public media",
  },
  {
    name: "enrollment-board-images",
    visibility: "Public",
    policies: 0,
    fileSizeLimit: "5 MB",
    mimeTypes: "JPEG, PNG, WebP",
    purpose: "Public profile images for Enrollment Board entries",
    risk: "Public user-generated images",
  },
];

const cleanupTools = [
  "Detect orphaned media",
  "Find oversized files",
  "Review duplicate assets",
  "Audit private attachments",
  "Generate signed previews",
  "Flag public buckets with broad MIME rules",
  "Track storage growth",
  "Review upload policy coverage",
];

export default async function AdminStoragePage() {
  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

  if (userEmail !== ADMIN_EMAIL) {
    notFound();
  }

  const publicBuckets = buckets.filter((bucket) => bucket.visibility === "Public");
  const privateBuckets = buckets.filter((bucket) => bucket.visibility === "Private");
  const policyCount = buckets.reduce((total, bucket) => total + bucket.policies, 0);
  const unrestrictedMimeBuckets = buckets.filter((bucket) => bucket.mimeTypes === "Any");

  const storageRiskScore =
  unrestrictedMimeBuckets.length +
  privateBuckets.filter((bucket) => bucket.policies === 0).length;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
              Ko-Host Admin
            </div>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-neutral-950">
              Storage
            </h1>

            <p className="mt-2 text-sm text-neutral-600">
              Supabase bucket inventory, visibility review, upload limits, and future cleanup tools.
            </p>
          </div>

          <Link
            href="/dashboard/admin"
            className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-bold text-neutral-900 hover:border-neutral-900"
          >
            Back to Admin
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <Stat label="Total Buckets" value={buckets.length} />
        <Stat label="Public" value={publicBuckets.length} />
        <Stat label="Private" value={privateBuckets.length} />
        <Stat label="Policies" value={policyCount} />
        <Stat label="Any MIME" value={unrestrictedMimeBuckets.length} />
        <Stat label="Risk Score" value={storageRiskScore} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <BucketGroup title="Public Buckets" buckets={publicBuckets} />

        <BucketGroup title="Private Buckets" buckets={privateBuckets} />

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-neutral-950">
            Storage Health
          </h2>

          <div className="mt-4 space-y-2">
            <HealthRow
              label="Public Buckets"
              value={publicBuckets.length}
            />

            <HealthRow
              label="Private Buckets"
              value={privateBuckets.length}
            />

            <HealthRow
              label="Unrestricted MIME"
              value={unrestrictedMimeBuckets.length}
            />

            <HealthRow
              label="Risk Score"
              value={storageRiskScore}
            />
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-100 px-5 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-neutral-950">
              Full Bucket Inventory
            </h2>

            <span className="text-xs font-bold text-neutral-500">
              {buckets.length} bucket{buckets.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-xs uppercase tracking-[0.08em] text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-black">Bucket</th>
                <th className="px-4 py-3 font-black">Visibility</th>
                <th className="px-4 py-3 font-black">Policies</th>
                <th className="px-4 py-3 font-black">File Limit</th>
                <th className="px-4 py-3 font-black">MIME Types</th>
                <th className="px-4 py-3 font-black">Purpose</th>
                <th className="px-4 py-3 font-black">Risk Note</th>
              </tr>
            </thead>

            <tbody>
              {buckets.map((bucket) => (
                <tr key={bucket.name} className="border-t border-neutral-100 align-top">
                  <td className="px-4 py-4 font-mono text-xs font-bold text-neutral-900">
                    {bucket.name}
                  </td>

                  <td className="px-4 py-4">
                    <VisibilityBadge visibility={bucket.visibility} />
                  </td>

                  <td className="px-4 py-4 text-xs font-semibold text-neutral-700">
                    {bucket.policies}
                  </td>

                  <td className="px-4 py-4 text-xs font-semibold text-neutral-700">
                    {bucket.fileSizeLimit}
                  </td>

                  <td className="px-4 py-4 text-xs font-semibold text-neutral-700">
                    {bucket.mimeTypes}
                  </td>

                  <td className="px-4 py-4 text-xs font-semibold text-neutral-700">
                    {bucket.purpose}
                  </td>

                  <td className="px-4 py-4 text-xs font-semibold text-neutral-700">
                    {bucket.risk}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-neutral-950">
            Storage Watchlist
          </h2>

          <div className="mt-4 space-y-2">
            {unrestrictedMimeBuckets.map((bucket) => (
              <div
                key={bucket.name}
                className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3"
              >
                <div className="font-bold text-amber-900">
                  {bucket.name}
                </div>

                <div className="mt-1 text-xs font-semibold text-amber-700">
                  Allows any MIME type. Review whether this bucket should be restricted.
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-neutral-950">
            Future Cleanup Tools
          </h2>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {cleanupTools.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3 text-sm font-bold text-neutral-700"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

type StorageBucket = (typeof buckets)[number];

function BucketGroup({
  title,
  buckets: bucketItems,
}: {
  title: string;
  buckets: StorageBucket[];
}) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-black text-neutral-950">{title}</h2>

      <div className="mt-4 space-y-2">
        {bucketItems.map((bucket) => (
          <div
            key={bucket.name}
            className="rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-mono text-xs font-black text-neutral-900">
                {bucket.name}
              </div>

              <VisibilityBadge visibility={bucket.visibility} />
            </div>

            <div className="mt-2 text-xs font-semibold leading-5 text-neutral-600">
              {bucket.purpose}
            </div>

            <div className="mt-2 text-xs font-bold text-neutral-500">
              Limit: {bucket.fileSizeLimit}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HealthRow({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-100 px-4 py-3">
      <span className="font-semibold text-neutral-700">
        {label}
      </span>

      <span className="font-black text-neutral-950">
        {value}
      </span>
    </div>
  );
}

function VisibilityBadge({ visibility }: { visibility: string }) {
  return (
    <span
      className={[
        "rounded-full px-2.5 py-1 text-xs font-black ring-1",
        visibility === "Public"
          ? "bg-green-50 text-green-700 ring-green-200"
          : "bg-neutral-100 text-neutral-600 ring-neutral-200",
      ].join(" ")}
    >
      {visibility}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-black uppercase tracking-[0.12em] text-neutral-400">
        {label}
      </div>

      <div className="mt-3 text-3xl font-black tracking-tight text-neutral-950">
        {value}
      </div>
    </div>
  );
}