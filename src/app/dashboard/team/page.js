'use client';

import { useEffect, useMemo, useState } from 'react';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import app, { db, auth } from '@/lib/firebase';
import { ROLES, SECTIONS, STAFF_AI_DAILY_LIMIT, aiUsageDay } from '@/lib/staff-access';
import { logActivity } from '@/lib/activity-log';
import { useAccess } from '@/context/AccessContext';
import { UserPlus, LoaderCircle, Pencil, ShieldOff, ShieldCheck, Trash2, CheckCircle2, AlertCircle, X, Mail } from 'lucide-react';

// Team & Access (owner only). Each person is a document in the private
// `staff` collection, keyed by lower-case email, which the security rules
// read to decide what they may change. Removing access takes effect on their
// next save; turning someone off doesn't delete their login or their work.

const EMPTY = { name: '', email: '', role: 'editor', sections: [], active: true };

function randomPassword() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(36).padStart(2, '0')).join('') + 'Aa1!';
}

// Creates the login with a throwaway password in a separate Firebase app
// instance (so the owner stays signed in), then emails the person a link to
// set their own password.
async function createLoginAndInvite(email) {
  const helper = initializeApp(app.options, `invite-${Date.now()}`);
  const helperAuth = getAuth(helper);
  try {
    await createUserWithEmailAndPassword(helperAuth, email, randomPassword());
    await sendPasswordResetEmail(helperAuth, email);
    await signOut(helperAuth);
    return { status: 'invited' };
  } catch (err) {
    if (err?.code === 'auth/email-already-in-use') return { status: 'exists' };
    if (err?.code === 'auth/admin-restricted-operation' || err?.code === 'auth/operation-not-allowed') return { status: 'signup-off' };
    return { status: 'failed', code: err?.code };
  } finally {
    deleteApp(helper).catch(() => {});
  }
}

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(onClose, toast.long ? 12000 : 4000);
    return () => clearTimeout(t);
  }, [toast, onClose]);
  if (!toast) return null;
  const isError = toast.type === 'error';
  return (
    <div className={`fixed bottom-6 right-6 z-[60] max-w-md flex items-start gap-3 px-5 py-3 rounded-xl border shadow-2xl ${isError ? 'bg-red-950 border-red-800 text-red-200' : 'bg-green-950 border-green-800 text-green-200'}`}>
      {isError ? <AlertCircle size={18} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={18} className="mt-0.5 shrink-0" />}
      <span className="text-sm font-medium">{toast.message}</span>
      <button onClick={onClose} className="shrink-0 opacity-70 hover:opacity-100"><X size={16} /></button>
    </div>
  );
}

export default function TeamPage() {
  const { isOwner } = useAccess();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null); // null = closed; { ...EMPTY, isNew }
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const [usage, setUsage] = useState({});
  const [confirmRemove, setConfirmRemove] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'staff'),
      (snap) => { setStaff(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); setLoading(false); },
      () => setLoading(false),
    );
    return () => unsub();
  }, []);

  // Today's AI requests per person.
  useEffect(() => {
    let cancelled = false;
    Promise.all(staff.map(async (s) => {
      try {
        const snap = await getDoc(doc(db, 'aiUsage', s.id));
        const data = snap.exists() ? snap.data() : null;
        const today = data?.day?.toMillis?.() === aiUsageDay().getTime();
        return [s.id, today ? data.count || 0 : 0];
      } catch {
        return [s.id, null];
      }
    })).then((pairs) => { if (!cancelled) setUsage(Object.fromEntries(pairs)); });
    return () => { cancelled = true; };
  }, [staff]);

  const sorted = useMemo(
    () => [...staff].sort((a, b) => (b.active !== false) - (a.active !== false) || (a.name || a.id).localeCompare(b.name || b.id)),
    [staff],
  );

  if (!isOwner) return null;

  const notify = (type, message, long = false) => setToast({ type, message, long });
  const toggleSection = (id) => setForm((f) => ({
    ...f,
    sections: f.sections.includes(id) ? f.sections.filter((s) => s !== id) : [...f.sections, id],
  }));

  const save = async () => {
    const email = form.email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { notify('error', 'Enter a valid email address.'); return; }
    if (!form.sections.length) { notify('error', 'Tick at least one section they can work on.'); return; }
    if (email === auth.currentUser?.email?.toLowerCase()) { notify('error', 'That’s your own address. You already have full access as the owner.'); return; }
    setBusy(true);
    try {
      const data = {
        name: form.name.trim(),
        email,
        role: form.role,
        sections: SECTIONS.map((s) => s.id).filter((id) => form.sections.includes(id)),
        active: form.active !== false,
        updatedAt: serverTimestamp(),
      };
      if (form.isNew) {
        if (staff.some((s) => s.id === email)) { notify('error', 'This person is already on the team. Edit them instead.'); setBusy(false); return; }
        await setDoc(doc(db, 'staff', email), { ...data, addedBy: auth.currentUser?.email || '', createdAt: serverTimestamp() });
        logActivity({ action: 'access changed', collection: 'staff', id: email, title: `Added ${data.name || email} as ${data.role}` });
        const invite = await createLoginAndInvite(email);
        if (invite.status === 'invited') notify('success', `Added. ${data.name || email} has been emailed a link to set their password, then they sign in at /admin.`, true);
        else if (invite.status === 'exists') notify('success', `Added. ${email} already has a login, so they can sign in at /admin with their password (or use “Forgot password?”).`, true);
        else if (invite.status === 'signup-off') notify('error', `Added to the team, but new logins are switched off in Firebase. Create the login in Firebase Console → Authentication → Users → Add user, then ask them to use “Forgot password?” on /admin.`, true);
        else notify('error', `Added to the team, but the login couldn’t be created (${invite.code || 'unknown error'}). Create it in Firebase Console → Authentication → Users.`, true);
      } else {
        await updateDoc(doc(db, 'staff', form.id), data);
        logActivity({ action: 'access changed', collection: 'staff', id: form.id, title: `${data.name || email}: ${data.role}, ${data.sections.join(', ')}${data.active ? '' : ' (access off)'}` });
        notify('success', 'Access updated. It applies from their next action.');
      }
      setForm(null);
    } catch (err) {
      console.error('team save failed', err);
      notify('error', 'Could not save. Have the new security rules been published in Firebase? See the notes on this page.', true);
    } finally {
      setBusy(false);
    }
  };

  const setActive = async (s, active) => {
    try {
      await updateDoc(doc(db, 'staff', s.id), { active, updatedAt: serverTimestamp() });
      logActivity({ action: 'access changed', collection: 'staff', id: s.id, title: `${s.name || s.id}: access ${active ? 'turned on' : 'turned off'}` });
      notify('success', active ? 'Access turned back on.' : 'Access turned off. They can no longer change anything.');
    } catch {
      notify('error', 'Could not change access.');
    }
  };

  const remove = async (s) => {
    setConfirmRemove(null);
    try {
      await deleteDoc(doc(db, 'staff', s.id));
      logActivity({ action: 'access changed', collection: 'staff', id: s.id, title: `Removed ${s.name || s.id} from the team` });
      notify('success', 'Removed from the team. Their past work and activity stay.');
    } catch {
      notify('error', 'Could not remove them.');
    }
  };

  const sectionLabel = (id) => SECTIONS.find((s) => s.id === id)?.label || id;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Team &amp; Access</h1>
          <p className="text-gray-400 text-sm mt-1">Give people their own login and choose which parts of the dashboard they can work on. Only you can delete anything.</p>
        </div>
        <button onClick={() => setForm({ ...EMPTY, isNew: true })} className="inline-flex items-center gap-2 px-4 py-2.5 bg-yellow-500 text-black font-medium rounded-xl hover:bg-yellow-400 transition-colors self-start">
          <UserPlus size={18} /> Add person
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoaderCircle className="animate-spin text-yellow-500" size={28} /></div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16 bg-[#0A0A0A] border border-gray-800 rounded-2xl">
          <p className="text-gray-300 font-medium">No one else has access yet.</p>
          <p className="text-gray-500 text-sm mt-1">Use “Add person” to give someone their own login.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((s) => {
            const on = s.active !== false;
            return (
              <div key={s.id} className={`bg-[#0A0A0A] border rounded-xl p-4 ${on ? 'border-gray-800' : 'border-gray-900 opacity-60'}`}>
                <div className="flex flex-wrap items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-500 grid place-items-center font-bold shrink-0">
                    {(s.name || s.id).slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-white">{s.name || s.id}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${s.role === 'editor' ? 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10' : 'text-blue-300 border-blue-500/40 bg-blue-500/10'}`}>
                        {s.role === 'editor' ? 'EDITOR' : 'WRITER'}
                      </span>
                      {!on && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border border-red-500/40 text-red-300 bg-red-500/10">ACCESS OFF</span>}
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Mail size={12} /> {s.id}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(s.sections || []).map((id) => (
                        <span key={id} className="px-2 py-0.5 rounded-md text-xs bg-white/5 border border-gray-800 text-gray-300">{sectionLabel(id)}</span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      AI today: {usage[s.id] == null ? '–' : `${usage[s.id]} of ${STAFF_AI_DAILY_LIMIT}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setForm({ ...EMPTY, ...s, email: s.id, sections: s.sections || [], isNew: false })} title="Edit access" className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-yellow-500 hover:bg-white/5"><Pencil size={16} /></button>
                    <button onClick={() => setActive(s, !on)} title={on ? 'Turn access off' : 'Turn access on'} className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-yellow-500 hover:bg-white/5">{on ? <ShieldOff size={16} /> : <ShieldCheck size={16} />}</button>
                    <button onClick={() => setConfirmRemove(s)} title="Remove from team" className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/5"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 p-5 rounded-2xl border border-gray-800 bg-[#0A0A0A] text-sm text-gray-400 space-y-2">
        <p className="font-semibold text-gray-200">How access works</p>
        <p><b className="text-gray-200">Editor:</b> adds, edits and publishes in their sections.</p>
        <p><b className="text-gray-200">Writer:</b> articles stay as drafts or go “In review” for you or an editor to publish. In their other sections they add and edit like an editor.</p>
        <p>Nobody but you can delete. Team &amp; Access, the Activity Log, Analytics and the newsletter list are yours only. Everyone else gets {STAFF_AI_DAILY_LIMIT} AI requests a day.</p>
        <p>Turning access off stops them at once and keeps their login and past work. Their changes are listed in the Activity Log.</p>
      </div>

      {form && (
        <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-6 max-w-xl w-full my-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">{form.isNew ? 'Add person' : `Edit ${form.name || form.email}`}</h2>
              <button onClick={() => setForm(null)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Alex Okafor" className="w-full px-4 py-3 bg-black/40 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input type="email" value={form.email} disabled={!form.isNew} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@example.com" className="w-full px-4 py-3 bg-black/40 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 disabled:opacity-60" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Level</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ROLES.map((r) => (
                    <button key={r.value} type="button" onClick={() => setForm({ ...form, role: r.value })} className={`text-left p-3 rounded-xl border transition-colors ${form.role === r.value ? 'border-yellow-500 bg-yellow-500/10' : 'border-gray-800 hover:border-gray-700'}`}>
                      <div className="font-semibold text-sm">{r.label}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{r.hint}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">Sections they can work on</label>
                  <button type="button" onClick={() => setForm({ ...form, sections: form.sections.length === SECTIONS.length ? [] : SECTIONS.map((s) => s.id) })} className="text-xs text-yellow-500 hover:underline">
                    {form.sections.length === SECTIONS.length ? 'Clear all' : 'Select all'}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SECTIONS.map((sec) => (
                    <label key={sec.id} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer ${form.sections.includes(sec.id) ? 'border-yellow-500/60 bg-yellow-500/5' : 'border-gray-800 hover:border-gray-700'}`}>
                      <input type="checkbox" checked={form.sections.includes(sec.id)} onChange={() => toggleSection(sec.id)} className="mt-1 accent-yellow-500" />
                      <span>
                        <span className="block text-sm font-medium">{sec.label}</span>
                        {sec.hint && <span className="block text-xs text-gray-500">{sec.hint}</span>}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {!form.isNew && (
                <label className="flex items-center gap-3 text-sm">
                  <input type="checkbox" checked={form.active !== false} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="accent-yellow-500" />
                  Access on
                </label>
              )}

              {form.isNew && (
                <p className="text-xs text-gray-500">They’ll get an email with a link to set their password, then sign in at bitcoinafricastory.com/admin.</p>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={save} disabled={busy} className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 disabled:opacity-50">
                  {busy && <LoaderCircle className="animate-spin" size={18} />}
                  {form.isNew ? 'Add and send invite' : 'Save access'}
                </button>
                <button onClick={() => setForm(null)} className="px-6 py-2.5 bg-white/5 border border-gray-800 rounded-lg hover:bg-white/10">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-2">Remove {confirmRemove.name || confirmRemove.id}?</h3>
            <p className="text-gray-400 text-sm mb-6">They lose dashboard access straight away. Their login, their past work and the activity log stay. To pause access instead, use the shield button.</p>
            <div className="flex gap-3">
              <button onClick={() => remove(confirmRemove)} className="flex-1 px-4 py-2.5 bg-red-500 text-white font-medium rounded-lg hover:bg-red-400">Remove</button>
              <button onClick={() => setConfirmRemove(null)} className="flex-1 px-4 py-2.5 bg-white/5 border border-gray-800 rounded-lg hover:bg-white/10">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
