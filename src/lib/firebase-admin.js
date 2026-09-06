/**
 * Shared firebase-admin singleton for server-side API routes (webhooks, cron
 * jobs, anything that needs to write to Firestore with elevated privileges
 * rather than through the client SDK's security rules).
 *
 * This project didn't have a production-ready admin init before — the only
 * prior firebase-admin usage was scripts/migrate-authors.js, which reads a
 * local service-account.json file. That works for a one-off script run on a
 * developer's machine, but not on Vercel, where there is no such file on
 * disk. This reads credentials from environment variables instead, which is
 * the standard, Vercel-safe pattern.
 *
 * Required env vars (set in Vercel → Settings → Environment Variables):
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_CLIENT_EMAIL
 *   FIREBASE_PRIVATE_KEY   — paste the full key including
 *                            "-----BEGIN PRIVATE KEY-----...END-----".
 *                            Vercel stores newlines as literal "\n" in the
 *                            env var value; the replace() below converts
 *                            them back to real newlines before use.
 *
 * All three come from a Firebase service account JSON file:
 * Firebase Console → Project Settings → Service Accounts → Generate new
 * private key. Copy project_id / client_email / private_key from that JSON
 * into the three env vars above — never commit the JSON file itself.
 */
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const adminDb = admin.firestore();
export default admin;
