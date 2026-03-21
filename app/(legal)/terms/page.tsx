export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Terms of Service</h1>

      <p className="mt-4 text-sm text-neutral-600">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <section className="mt-8 space-y-4 text-sm text-neutral-700">
        <p>
          By using Ko-Host, you agree to these Terms of Service. If you do not
          agree, do not use the platform.
        </p>

        <h2 className="text-lg font-semibold">Use of Service</h2>
        <p>
          Ko-Host allows users to create and share microsites. You are responsible
          for the content you publish and must not use the platform for illegal,
          harmful, or abusive purposes.
        </p>

        <h2 className="text-lg font-semibold">Accounts</h2>
        <p>
          You are responsible for maintaining the security of your account and
          any activity that occurs under it.
        </p>

        <h2 className="text-lg font-semibold">Payments</h2>
        <p>
          Paid features are billed through Stripe. All payments are non-refundable
          unless otherwise stated.
        </p>

        <h2 className="text-lg font-semibold">Content Ownership</h2>
        <p>
          You retain ownership of your content. By using Ko-Host, you grant us a
          limited license to host and display your content.
        </p>

        <h2 className="text-lg font-semibold">Termination</h2>
        <p>
          We may suspend or terminate access if you violate these terms.
        </p>

        <h2 className="text-lg font-semibold">Disclaimer</h2>
        <p>
          The service is provided "as is" without warranties of any kind.
        </p>

        <h2 className="text-lg font-semibold">Contact</h2>
        <p>
          For questions, contact: support@ko-host.com
        </p>
      </section>
    </main>
  );
}