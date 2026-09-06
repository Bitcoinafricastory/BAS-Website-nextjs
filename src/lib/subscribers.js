/**
 * Helpers for reading subscriber records written by the BlinkSub webhook
 * (src/app/api/blink-webhook/route.js) at Firestore subscribers/{email}.
 *
 * Why this exists: BlinkSub fires `subscription.paid`/`renewed` (sets
 * paid: true) and `subscription.expiring` (a heads-up, doesn't change
 * `paid`) — but as of the current BlinkSub deployment, it never fires
 * anything when a subscription actually lapses past its expiry date. So a
 * reader whose subscription expired and was never renewed will still have
 * `paid: true` sitting in Firestore indefinitely; nothing updates it.
 *
 * That means any future "is this reader currently a paying subscriber?"
 * check must NOT trust the `paid` flag alone — it has to also confirm
 * `paidUntil` hasn't passed. Once BlinkSub adds a `subscription.canceled`/
 * expired event, this stays correct either way; it's just then also backed
 * up by an explicit flip of `paid` to false.
 */

export function isActiveSubscriber(subscriberDoc) {
  if (!subscriberDoc) return false;
  if (subscriberDoc.paid !== true) return false;
  if (!subscriberDoc.paidUntil) return false;
  const paidUntil = new Date(subscriberDoc.paidUntil);
  if (Number.isNaN(paidUntil.getTime())) return false;
  return paidUntil.getTime() > Date.now();
}
