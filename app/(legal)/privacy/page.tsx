export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 pt-24 pb-12">
      <h1 className="text-3xl font-semibold">Privacy Policy</h1>

      <p className="mt-4 text-sm text-neutral-600">
        Last updated: 4/18/2026
      </p>

      <section className="mt-8 space-y-6 text-sm text-neutral-700">
        <p>
          Ko-Host (“we,” “our,” or “us”) respects your privacy and is committed
          to protecting your information. This Privacy Policy explains how we
          collect, use, and safeguard your data when you use our platform.
        </p>

        <p>
          By using Ko-Host, you agree to the collection and use of information
          in accordance with this policy.
        </p>

        <div>
          <h2 className="text-lg font-semibold">Information We Collect</h2>
          <p className="mt-2">
            We collect information in several ways to provide and improve the
            Service.
          </p>

          <h3 className="mt-4 text-base font-semibold">Information You Provide Directly</h3>
          <p className="mt-2">This includes:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Account information (such as name, email address, and login credentials)</li>
            <li>Microsite content (text, images, links, and other materials you publish)</li>
            <li>Form submissions and user-generated inputs</li>
            <li>Communications with us (such as support inquiries)</li>
          </ul>

          <h3 className="mt-4 text-base font-semibold">Automatically Collected Information</h3>
          <p className="mt-2">
            When you use Ko-Host, we may collect certain technical information,
            including:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Device type and browser information</li>
            <li>IP address and general location data</li>
            <li>Usage data (pages visited, interactions, and activity on the platform)</li>
          </ul>

          <p className="mt-3">
            This data helps us understand how the Service is used and improve
            performance and usability.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">How We Use Information</h2>
          <p className="mt-2">We use the information we collect to:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Operate and maintain the platform</li>
            <li>Provide core functionality (such as hosting and displaying microsites)</li>
            <li>Process transactions and manage payments</li>
            <li>Improve user experience, features, and performance</li>
            <li>Monitor and prevent misuse, abuse, or security issues</li>
            <li>Communicate with you regarding your account or support requests</li>
          </ul>

          <p className="mt-3">We do not sell your personal information.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Third-Party Services</h2>
          <p className="mt-2">
            Ko-Host relies on trusted third-party providers to operate the
            platform. These services may process or store your data as part of
            their functionality.
          </p>

          <p className="mt-2">Key providers include:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Clerk – authentication and user account management</li>
            <li>Stripe – payment processing</li>
            <li>Supabase – database and storage infrastructure</li>
          </ul>

          <p className="mt-3">
            These providers operate under their own privacy policies and
            security practices. By using Ko-Host, you acknowledge that your data
            may be processed by these services as necessary to provide
            functionality.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Data Security</h2>
          <p className="mt-2">
            We take reasonable administrative, technical, and organizational
            measures to protect your information from unauthorized access, loss,
            misuse, or alteration.
          </p>

          <p className="mt-2">
            However, no method of transmission over the internet or electronic
            storage is completely secure. While we strive to protect your data,
            we cannot guarantee absolute security.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Data Retention</h2>
          <p className="mt-2">
            We retain your information only for as long as necessary to:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Provide the Service</li>
            <li>Comply with legal obligations</li>
            <li>Resolve disputes and enforce agreements</li>
          </ul>

          <p className="mt-3">
            Because Ko-Host microsites are designed to be temporary, certain
            content may be automatically removed or archived after its active
            period.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Your Rights and Choices</h2>
          <p className="mt-2">You have control over your information.</p>
          <p className="mt-2">You may:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Request access to the data we hold about you</li>
            <li>Request correction or deletion of your data</li>
            <li>Delete your account at any time</li>
          </ul>

          <p className="mt-3">
            To make a request, contact us using the information below.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Children’s Privacy</h2>
          <p className="mt-2">
            Ko-Host is not intended for use by individuals under the age of 13.
            We do not knowingly collect personal information from children.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Changes to This Policy</h2>
          <p className="mt-2">
            We may update this Privacy Policy from time to time to reflect
            changes in our practices or for legal and operational reasons.
          </p>

          <p className="mt-2">
            Continued use of the Service after updates are posted constitutes
            your acceptance of the revised policy.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Contact</h2>
          <p className="mt-2">
            If you have any questions or requests regarding this Privacy Policy,
            please contact:
          </p>

          <p className="mt-2">support@ko-host.com</p>
        </div>
      </section>
    </main>
  );
}