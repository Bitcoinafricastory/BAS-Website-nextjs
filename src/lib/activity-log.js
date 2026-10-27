import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

// Records who changed what in the dashboard, for the owner's Activity Log.
// Fire-and-forget: a failed log entry never blocks or undoes the change.
// The security rules only accept entries whose `by` is the signer's own
// email and whose time is the server's, and nobody can edit or delete them.
//
// action: 'created' | 'updated' | 'published' | 'sent for review' |
//         'approved' | 'rejected' | 'deleted' | 'linked' | 'access changed'
export function logActivity({ action, collection: col, id = '', title = '' }) {
  const email = auth.currentUser?.email;
  if (!email || !action) return;
  addDoc(collection(db, 'activityLog'), {
    by: email.toLowerCase(),
    action: String(action).slice(0, 40),
    collection: String(col || '').slice(0, 60),
    docId: String(id || '').slice(0, 200),
    title: String(title || '').slice(0, 200),
    at: serverTimestamp(),
  }).catch((err) => console.warn('activity log entry not saved', err?.code || err));
}
