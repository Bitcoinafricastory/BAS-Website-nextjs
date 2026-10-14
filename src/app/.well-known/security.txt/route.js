// RFC 9116 security contact, served at /.well-known/security.txt.
// A route handler (not public/.well-known) is how this Next.js version
// serves .well-known files reliably.
const BODY = [
  'Contact: mailto:bitcoinafricastory@proton.me',
  'Expires: 2027-10-14T00:00:00.000Z',
  'Preferred-Languages: en',
  'Canonical: https://www.bitcoinafricastory.com/.well-known/security.txt',
  '',
].join('\n');

export function GET() {
  return new Response(BODY, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
