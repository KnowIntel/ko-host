export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 pt-24 pb-12">
      <h1 className="text-3xl font-semibold">Terms of Service</h1>

      <p className="mt-4 text-sm text-neutral-600">
        Last updated: 4/18/2026
      </p>

      <section className="mt-8 space-y-6 text-sm text-neutral-700">
        <p>
          By accessing or using Ko-Host (“the Service”), you agree to be bound by
          these Terms of Service. If you do not agree to these terms, you must not
          access or use the platform.
        </p>

        <div>
          <h2 className="text-lg font-semibold">Use of Service</h2>
          <p className="mt-2">
            Ko-Host provides a platform that enables users to create, customize,
            and share temporary microsites through unique subdomains.
          </p>
          <p className="mt-2">
            You agree to use the Service only for lawful purposes and in a manner
            that does not violate any applicable laws, regulations, or
            third-party rights. You are solely responsible for all content you
            create, upload, publish, or distribute through Ko-Host.
          </p>

          <ul className="mt-3 list-disc pl-5 space-y-1">
            <li>Engage in illegal, fraudulent, or deceptive activities</li>
            <li>Harass, abuse, or harm others</li>
            <li>Distribute malicious code, spam, or harmful content</li>
            <li>Infringe upon intellectual property or privacy rights</li>
          </ul>

          <p className="mt-3">
            Ko-Host reserves the right to remove content or restrict access at
            its sole discretion if it determines that content violates these
            terms or is otherwise inappropriate.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Accounts</h2>
          <p className="mt-2">
            To access certain features, you may be required to create an account.
          </p>

          <ul className="mt-3 list-disc pl-5 space-y-1">
            <li>Maintaining the confidentiality and security of your account credentials</li>
            <li>All activity that occurs under your account</li>
            <li>Ensuring that the information you provide is accurate and up to date</li>
          </ul>

          <p className="mt-3">
            You agree to notify Ko-Host immediately of any unauthorized use of
            your account or any breach of security.
          </p>

          <p className="mt-2">
            Ko-Host is not liable for any loss or damage arising from your failure
            to safeguard your account.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Payments</h2>
          <p className="mt-2">
            Certain features of Ko-Host may require payment. All payments are
            processed securely through third-party providers, including Stripe.
          </p>

          <ul className="mt-3 list-disc pl-5 space-y-1">
            <li>You are authorized to use the payment method provided</li>
            <li>All payment information submitted is accurate</li>
          </ul>

          <p className="mt-3">
            Unless explicitly stated otherwise:
          </p>

          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>All payments are final</li>
            <li>Fees are non-refundable</li>
          </ul>

          <p className="mt-3">
            Ko-Host reserves the right to modify pricing, features, or payment
            terms at any time.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Content Ownership and License</h2>
          <p className="mt-2">
            You retain full ownership of any content you create and publish
            through Ko-Host.
          </p>

          <p className="mt-2">
            By using the Service, you grant Ko-Host a limited, non-exclusive,
            worldwide license to host, store, display, and distribute your
            content solely for the purpose of operating, improving, and providing
            the Service.
          </p>

          <p className="mt-2">
            You represent and warrant that:
          </p>

          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>You have the rights necessary to use and share your content</li>
            <li>Your content does not violate any laws or third-party rights</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Termination</h2>
          <p className="mt-2">
            Ko-Host reserves the right to suspend, restrict, or terminate your
            access to the Service at any time, with or without notice, if you
            violate these Terms of Service or engage in behavior deemed harmful
            to the platform or its users.
          </p>

          <p className="mt-2">
            You may stop using the Service at any time.
          </p>

          <p className="mt-2">
            Upon termination:
          </p>

          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Your access to the platform may be revoked</li>
            <li>Your content may be removed or made inaccessible</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Disclaimer</h2>
          <p className="mt-2">
            The Service is provided on an “as is” and “as available” basis.
          </p>

          <p className="mt-2">
            Ko-Host makes no warranties, express or implied, regarding:
          </p>

          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>The reliability, availability, or performance of the platform</li>
            <li>The accuracy or completeness of any content</li>
            <li>The suitability of the Service for any particular purpose</li>
          </ul>

          <p className="mt-2">
            Use of the Service is at your own risk.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Limitation of Liability</h2>
          <p className="mt-2">
            To the fullest extent permitted by law, Ko-Host shall not be liable
            for any indirect, incidental, consequential, or special damages
            arising out of or related to your use of the Service.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Changes to Terms</h2>
          <p className="mt-2">
            Ko-Host reserves the right to update or modify these Terms of Service
            at any time.
          </p>

          <p className="mt-2">
            Continued use of the Service after changes are posted constitutes
            your acceptance of the updated terms.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Contact</h2>
          <p className="mt-2">
            If you have any questions regarding these Terms of Service, please contact:
          </p>

          <p className="mt-2">support@ko-host.com</p>
        </div>
      </section>
    </main>
  );
}