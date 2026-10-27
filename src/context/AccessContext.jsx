'use client';

import { createContext, useContext } from 'react';
import { canUseSection, canOpenPath, canPublishArticles, canDelete } from '@/lib/staff-access';

// What the signed-in person may do in the dashboard, from /api/admin/check:
// { owner, role, sections, email }. Used to hide pages and buttons; the
// security rules enforce the same limits on the data itself.
const AccessContext = createContext(null);

export function AccessProvider({ access, children }) {
  return <AccessContext.Provider value={access}>{children}</AccessContext.Provider>;
}

export function useAccess() {
  const access = useContext(AccessContext);
  return {
    access,
    isOwner: !!access?.owner,
    role: access?.role || null,
    can: (section) => canUseSection(access, section),
    canOpen: (path) => canOpenPath(access, path),
    canPublish: canPublishArticles(access),
    canDelete: canDelete(access),
  };
}
