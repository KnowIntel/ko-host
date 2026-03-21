export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Privacy Policy</h1>

      <p className="mt-4 text-sm text-neutral-600">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <section className="mt-8 space-y-4 text-sm text-neutral-700">
        <h2 className="text-lg font-semibold">Information We Collect</h2>
        <p>
          We collect information you provide directly, such as account details,
          microsite content, and form submissions.
        </p>

        <h2 className="text-lg font-semibold">How We Use Information</h2>
        <p>
          We use your information to operate, improve, and secure the platform.
        </p>

        <h2 className="text-lg font-semibold">Third Parties</h2>
        <p>
          We use third-party services including Clerk (authentication), Stripe
          (payments), and Supabase (data storage).
        </p>

        <h2 className="text-lg font-semibold">Data Security</h2>
        <p>
          We take reasonable measures to protect your data but cannot guarantee
          absolute security.
        </p>

        <h2 className="text-lg font-semibold">Your Rights</h2>
        <p>
          You may request deletion of your data by contacting support.
        </p>

        <h2 className="text-lg font-semibold">Contact</h2>
        <p>
          Email: support@ko-host.com
        </p>
      </section>
    </main>
  );
}