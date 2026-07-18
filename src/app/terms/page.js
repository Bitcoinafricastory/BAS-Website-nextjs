import Link from 'next/link';
import { SITE_URL } from '@/lib/schema';

export const metadata = {
  title: 'Terms of Use',
  description: 'The terms governing your use of the Bitcoin Africa Story website.',
  alternates: { canonical: `${SITE_URL}/terms` },
};

export default function TermsPage() {
  return (
    <div className="pt-16 bg-black text-white min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-semibold mb-3">Terms of Use</h1>
        <p className="text-sm text-gray-500 mb-12">Last updated: July 18, 2026</p>

        <div className="prose prose-invert prose-lg max-w-none prose-headings:font-semibold prose-a:text-yellow-500 prose-strong:text-white">
          <p>
            Welcome to Bitcoin Africa Story. By using this site, you agree to these terms. If you don&rsquo;t agree, please don&rsquo;t use the site.
            Read this alongside our <Link href="/privacy">Privacy Policy</Link>, which explains what we do with any information you give us.
          </p>

          <h2>1. What This Site Is</h2>
          <p>
            Bitcoin Africa Story is a source of news, education, community reporting, and event listings about Bitcoin adoption across Africa.
            Everything here — articles, the education programs, the directory, event listings, and the podcast — is provided for informational and educational purposes.
          </p>
          <p>
            <strong>Nothing on this site is financial, investment, tax, or legal advice.</strong> Bitcoin&rsquo;s price and the regulatory environment around it can both
            change quickly. Do your own research, and talk to a qualified professional before making financial decisions.
          </p>

          <h2>2. The Directory and Submitted Content</h2>
          <p>
            Anyone can submit a community, organisation, project, or event to be considered for our Directory or Events listings. Submission does not guarantee
            publication — our reporters review and verify listings before they go live, and we may decline, edit, or remove a listing at our discretion, including
            after it&rsquo;s published.
          </p>
          <p>
            A listing in our Directory reflects that our reporters did the verification work described on that listing (see the badge shown on each profile) —
            it is not a guarantee, endorsement, or warranty of any kind about that organisation&rsquo;s legitimacy, security, or trustworthiness. Always do your own
            due diligence before engaging with any listed organisation, especially before sending funds.
          </p>

          <h2>3. Acceptable Use</h2>
          <p>When using forms on this site (newsletter, contact, submissions), you agree not to:</p>
          <ul>
            <li>Submit false, misleading, or impersonating information</li>
            <li>Use the forms to spam, harass, or send unsolicited commercial messages</li>
            <li>Attempt to compromise the site&rsquo;s security or scrape data at scale</li>
          </ul>
          <p>We may block or remove access for anyone who violates this.</p>

          <h2>4. Intellectual Property</h2>
          <p>
            Original articles, educational materials, and reporting published by Bitcoin Africa Story are our own work and protected by copyright. You&rsquo;re welcome
            to share links to our content. If you&rsquo;d like to republish, reproduce, or adapt our work beyond fair use, contact us first at{' '}
            <a href="mailto:bitcoinafricastory@proton.me">bitcoinafricastory@proton.me</a>.
          </p>
          <p>Logos, images, and materials belonging to organisations featured in our Directory or News remain the property of their respective owners.</p>
          <p>The Bitcoin Whitepaper and other third-party materials we link to remain the property of their original authors; we link to them for reference, not as our own work.</p>

          <h2>5. External Links</h2>
          <p>
            Our Resources page and articles link to third-party sites (wallets, tools, documentation, and more) that we don&rsquo;t control. We link to them because
            we&rsquo;ve found them genuinely useful, but we&rsquo;re not responsible for their content, security, or availability, and linking to them isn&rsquo;t a
            guarantee of their accuracy or safety. Use your own judgment.
          </p>

          <h2>6. Donations</h2>
          <p>
            Donations made through BTCPay Server or our static QR code are Bitcoin/Lightning payments. <strong>Bitcoin transactions are generally irreversible.</strong>{' '}
            Please double-check the amount and destination before sending. If you send a donation in error, contact us at{' '}
            <a href="mailto:bitcoinafricastory@proton.me">bitcoinafricastory@proton.me</a> — we&rsquo;ll do what we reasonably can to help, but we cannot guarantee a
            refund, since that depends on whether funds have already moved on from us.
          </p>

          <h2>7. No Warranty</h2>
          <p>
            This site is provided &ldquo;as is.&rdquo; We work to keep information accurate and up to date, but we make no guarantee that everything on the site is
            complete, current, or error-free — particularly given how quickly the Bitcoin space moves. We are not liable for any loss or damage arising from your
            use of, or reliance on, this site.
          </p>

          <h2>8. Limitation of Liability</h2>
          <p>
            Bitcoin Africa Story is not a financial advisory service, and no one on our team is a licensed financial advisor. Nothing we publish is personalized
            financial advice, and we are not responsible for financial decisions you make based on content found here. That&rsquo;s why we encourage everyone to do
            their own research and not just take our word for it.
          </p>
          <p>
            To the fullest extent permitted by law, Bitcoin Africa Story and its team are not liable for any indirect, incidental, or consequential damages arising
            from your use of the site, including — but not limited to — financial decisions made based on content published here, or interactions with organisations
            found through our Directory.
          </p>

          <h2>9. Changes to These Terms</h2>
          <p>
            We may update these terms as the site evolves. Continued use of the site after a change means you accept the updated terms. Meaningful changes will be
            reflected with a new &ldquo;Last updated&rdquo; date above.
          </p>

          <h2>10. Contact Us</h2>
          <p>Questions about these terms: <a href="mailto:bitcoinafricastory@proton.me">bitcoinafricastory@proton.me</a></p>
        </div>
      </div>
    </div>
  );
}
