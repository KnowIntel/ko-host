import Link from "next/link";

export default function CreateRootPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Pick a template</h1>
      <p className="mt-2 text-sm text-neutral-600">
        You need to start from the Template Library.
      </p>

      <Link
        href="/templates"
        className="mt-6 inline-flex rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90"
      >
        Go to Templates
      </Link>
    </main>
  );
}