import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "CyberFaith Terms of Service — rules and guidelines for using Destiny Loom.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        Terms of Service
      </h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toISOString().slice(0, 10)}</p>

      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Destiny Loom by CyberFaith (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">2. Description of Service</h2>
          <p>
            Destiny Loom provides AI-powered spiritual readings including Tarot, I Ching, Zodiac, Four Pillars, MBTI analysis, and related features. All readings are for entertainment and self-reflection purposes only and should not be considered professional advice.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">3. User Accounts</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>You must be at least 16 years old to use the Service</li>
            <li>You are responsible for maintaining the security of your account</li>
            <li>You must provide accurate information during registration</li>
            <li>One account per person; sharing accounts is not permitted</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">4. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Use the Service for any illegal purpose</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Post spam, offensive, or misleading content</li>
            <li>Attempt to bypass security measures or rate limits</li>
            <li>Scrape, bot, or automate access to the Service</li>
            <li>Reverse-engineer or decompile the Service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">5. User Content</h2>
          <p>
            You retain ownership of content you create (journal entries, comments). By posting public content, you grant CyberFaith a non-exclusive license to display it within the Service. We may remove content that violates these terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">6. Subscriptions &amp; Payments</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Free tier is available with limited features</li>
            <li>Pro subscriptions are billed monthly via Stripe</li>
            <li>You may cancel your subscription at any time</li>
            <li>Refunds are handled per our refund policy and applicable law</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">7. Karma Points</h2>
          <p>
            Karma points are virtual currency with no monetary value. They cannot be exchanged for real currency. We reserve the right to modify the points system.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">8. Disclaimer</h2>
          <p>
            THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND. AI-generated readings are for entertainment only. We do not guarantee the accuracy, completeness, or usefulness of any reading. Do not make important life decisions based solely on readings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">9. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, CyberFaith shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">10. Termination</h2>
          <p>
            We may suspend or terminate your account for violation of these terms. You may delete your account at any time via Settings. Upon termination, your data will be handled per our Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">11. Changes</h2>
          <p>
            We may update these terms. Continued use after changes constitutes acceptance. Material changes will be communicated via email or in-app notification.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">12. Governing Law</h2>
          <p>
            These terms are governed by applicable law. For EU residents, this does not affect your statutory consumer rights under GDPR.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">13. Contact</h2>
          <p>
            For questions about these terms: <a href="mailto:legal@cyberfaith.app" className="text-primary">legal@cyberfaith.app</a>
          </p>
        </section>
      </div>
    </div>
  );
}
