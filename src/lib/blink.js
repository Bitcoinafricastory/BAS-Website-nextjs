// Blink usernames, as used by the Blink donation button. People paste them in
// all sorts of shapes ("@name", "name@blink.sv", "https://pay.blink.sv/name"),
// so reduce whatever was entered to the bare username.

const BLINK_USERNAME = /^[a-z0-9_]{3,50}$/;

export function normalizeBlinkUsername(value) {
  let v = String(value || '').trim().toLowerCase();
  if (!v) return '';
  v = v.replace(/^lightning:/, '');
  v = v.replace(/^https?:\/\/(pay\.)?blink\.sv\//, '');
  v = v.replace(/^@/, '');
  v = v.replace(/@blink\.sv$/, '');
  v = v.replace(/\/+$/, '');
  return v;
}

export function isValidBlinkUsername(value) {
  return BLINK_USERNAME.test(value);
}
