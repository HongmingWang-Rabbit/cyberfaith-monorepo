import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "CyberFaith Privacy Policy — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        Privacy Policy
      </h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toISOString().slice(0, 10)}</p>

      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-xl font-semibold text-foreground">1. Introduction</h2>
          <p>
            CyberFaith (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the Destiny Loom application. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service, in compliance with the General Data Protection Regulation (GDPR) and other applicable data protection laws.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">2. Data Controller</h2>
          <p>
            CyberFaith is the data controller responsible for your personal data. For questions about this policy or your rights, contact us at: <a href="mailto:privacy@cyberfaith.app" className="text-primary">privacy@cyberfaith.app</a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">3. Data We Collect</h2>
          <p>We collect the following categories of personal data:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Account Information:</strong> Name, email address, and profile picture (via Google OAuth)</li>
            <li><strong>Profile Data:</strong> Display name, username, zodiac sign, MBTI type</li>
            <li><strong>Reading Data:</strong> Tarot, I Ching, zodiac, four pillars, and MBTI readings and results</li>
            <li><strong>Journal Entries:</strong> Personal reflections and mood data you create</li>
            <li><strong>Social Data:</strong> Friend connections, comments, reactions, follows</li>
            <li><strong>Points &amp; Achievements:</strong> Karma points, unlocked achievements, arcade game history</li>
            <li><strong>Technical Data:</strong> IP address, browser type, device information (for security and analytics)</li>
            <li><strong>Payment Data:</strong> Processed by Stripe; we store only subscription tier and Stripe customer ID</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">4. Legal Basis for Processing (GDPR Art. 6)</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Consent:</strong> For optional features like push notifications and email digests</li>
            <li><strong>Contract Performance:</strong> To provide the services you&apos;ve signed up for</li>
            <li><strong>Legitimate Interest:</strong> For security, fraud prevention, and service improvement</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">5. How We Use Your Data</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provide, maintain, and improve the service</li>
            <li>Generate AI-powered spiritual readings</li>
            <li>Enable social features (friends, community feed, comments)</li>
            <li>Send notifications you&apos;ve opted into</li>
            <li>Process payments via Stripe</li>
            <li>Ensure security and prevent abuse</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">6. Data Sharing</h2>
          <p>We do not sell your personal data. We share data only with:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>AI Providers:</strong> Anonymous reading inputs sent to generate results</li>
            <li><strong>Stripe:</strong> Payment processing</li>
            <li><strong>Vercel:</strong> Hosting and analytics</li>
            <li><strong>Google:</strong> OAuth authentication</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">7. Your Rights (GDPR)</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Access:</strong> Request a copy of all your personal data (via Settings → Export My Data)</li>
            <li><strong>Rectification:</strong> Update your personal information in Settings</li>
            <li><strong>Erasure:</strong> Delete your account and all associated data (via Settings → Delete Account)</li>
            <li><strong>Data Portability:</strong> Export your data in JSON format</li>
            <li><strong>Restriction:</strong> Request limitation of processing</li>
            <li><strong>Object:</strong> Object to processing based on legitimate interest</li>
            <li><strong>Withdraw Consent:</strong> For consent-based processing, at any time</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">8. Data Retention</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Active Accounts:</strong> Data retained while your account is active</li>
            <li><strong>Deleted Accounts:</strong> Personal data anonymized immediately; residual data purged within 30 days</li>
            <li><strong>Backups:</strong> Encrypted backups retained for up to 90 days, then destroyed</li>
            <li><strong>Legal Obligations:</strong> Some data may be retained longer if required by law</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">9. Security</h2>
          <p>
            We implement industry-standard security measures including encryption in transit (TLS), parameterized database queries, input sanitization, rate limiting, and regular security audits.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">10. Cookies</h2>
          <p>
            We use essential cookies for authentication and optional analytics cookies (Vercel Analytics). You can manage your cookie preferences via the cookie consent banner.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">11. Children&apos;s Privacy</h2>
          <p>
            Our service is not directed to individuals under 16. We do not knowingly collect data from children.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">12. Changes</h2>
          <p>
            We may update this policy. Material changes will be communicated via email or in-app notification.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">13. Contact</h2>
          <p>
            For privacy-related inquiries: <a href="mailto:privacy@cyberfaith.app" className="text-primary">privacy@cyberfaith.app</a>
          </p>
          <p>
            You also have the right to lodge a complaint with your local data protection authority.
          </p>
        </section>
      </div>
    </div>
  );
}
