import { SITE_URL } from '@/lib/schema';

export const metadata = {
  title: 'Privacy Policy',
  description: 'How Bitcoin Africa Story collects, uses, and protects information from visitors to this site.',
  alternates: { canonical: `${SITE_URL}/privacy` },
};

export default function PrivacyPage() {
  return (
    <div className="pt-16 bg-black text-white min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-semibold mb-3">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-12">Last updated: July 18, 2026</p>

        <div className="prose prose-invert prose-lg max-w-none prose-headings:font-semibold prose-a:text-yellow-500 prose-strong:text-white">
          <p>
            Bitcoin Africa Story (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;) tells Africa&rsquo;s Bitcoin story through journalism, education, events, and community reporting.
            This policy explains what information we collect from people who visit or use this site, why, and what you can do about it.
          </p>
          <p>
            We built this site the way we think about Bitcoin itself: collect only what&rsquo;s needed, hold it as briefly as makes sense, and never treat your data as something to sell.
          </p>

          <h2>1. What We Collect, and Why</h2>
          <p>We don&rsquo;t run ad trackers, and we don&rsquo;t collect data &ldquo;just in case.&rdquo; Here is everything the site actually gathers, tied to the specific feature that gathers it:</p>

          <p><strong>Newsletter signup</strong><br />
          If you subscribe, we store your email address so we can send you new stories, education updates, and event announcements. That&rsquo;s the only reason we ask for it. We do not sell, rent, or trade this list to anyone, ever.</p>

          <p><strong>Reaching out directly</strong><br />
          Our Contact page links to <a href="mailto:bitcoinafricastory@proton.me">bitcoinafricastory@proton.me</a> — clicking it opens your own email app. We don&rsquo;t store or log anything from that; whatever you send us lives in your and our email inboxes, the same as any other email.</p>

          <p><strong>Directory and Event submissions</strong><br />
          If you submit a community, project, or event to be listed, we store what you provide (organisation details, contact info, links) so our reporters can review and verify it before anything goes live. Submitting something doesn&rsquo;t guarantee it gets published — our reporters check listings before they go public.</p>

          <p><strong>Donations</strong><br />
          If you donate via BTCPay Server or our static QR code, you&rsquo;re paying directly in Bitcoin. Bitcoin and Lightning payments are pseudonymous by nature — you don&rsquo;t need to identify yourself to give, and BTCPay Server doesn&rsquo;t collect or store any personal donor information. We never receive card numbers, billing addresses, or identity documents from a donation.</p>

          <p><strong>Video content</strong><br />
          Some pages embed YouTube videos, using YouTube&rsquo;s privacy-enhanced mode where possible. If you play an embedded video, Google/YouTube may set their own cookies or collect data according to their own privacy policy — that&rsquo;s between you and Google, not something we control or receive.</p>

          <p>We do not currently run analytics or ad-tracking scripts on this site. If that changes, we&rsquo;ll update this policy before it does.</p>

          <h2>2. Where Your Data Lives</h2>
          <p>
            We don&rsquo;t share, sell, or hand off your data to anyone. It lives on the infrastructure that runs this site: Firebase (a Google Cloud product) for storage,
            Vercel for hosting, and BTCPay Server specifically for processing Bitcoin donations. These are the technical services the site runs on, not third parties we give your data to.
          </p>

          <h2>3. How Long We Keep It</h2>
          <ul>
            <li>Newsletter emails: kept until you unsubscribe or ask us to remove them.</li>
            <li>Directory/event submissions: kept as part of our editorial record, whether or not the listing is published.</li>
          </ul>
          <p>If you want something deleted sooner, see Section 4.</p>

          <h2>4. Your Rights</h2>
          <p>You can ask us to:</p>
          <ul>
            <li>Show you what we have on file for your email or submission</li>
            <li>Correct inaccurate information</li>
            <li>Delete your data (unsubscribe from the newsletter, or remove a submission record)</li>
          </ul>
          <p>Email us at <a href="mailto:bitcoinafricastory@proton.me">bitcoinafricastory@proton.me</a> to make any of these requests. We&rsquo;ll respond as quickly as we reasonably can.</p>

          <h2>5. Children&rsquo;s Privacy</h2>
          <p>
            Our education content is built to be accessible to learners of all ages, including students. We don&rsquo;t knowingly collect personal information directly
            from children without a parent or guardian&rsquo;s involvement (for example, through the newsletter). If you believe a child has submitted
            personal information to us directly, contact us and we&rsquo;ll remove it.
          </p>

          <h2>6. Changes to This Policy</h2>
          <p>
            We may update this policy as the site grows. Meaningful changes will be reflected with a new &ldquo;Last updated&rdquo; date at the top of this page.
            We encourage checking back occasionally.
          </p>

          <h2>7. Contact Us</h2>
          <p>Questions about this policy or your data: <a href="mailto:bitcoinafricastory@proton.me">bitcoinafricastory@proton.me</a></p>
        </div>
      </div>
    </div>
  );
}
