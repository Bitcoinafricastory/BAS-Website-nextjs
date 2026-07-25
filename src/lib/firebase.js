import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Same config as the existing React app (src/firebase.js).
// This is a public web API key, safe to expose client-side and use in
// server components — access is governed by Firestore security rules,
// not by keeping this key secret.
const firebaseConfig = {
  apiKey: 'AIzaSyCC_PkB6ku4wHa9cv9At49EBAqFEkLFTmY',
  authDomain: 'bas-website-75a3f.firebaseapp.com',
  projectId: 'bas-website-75a3f',
  storageBucket: 'bas-website-75a3f.firebasestorage.app',
  messagingSenderId: '479794328516',
  appId: '1:479794328516:web:aa54b7ad01090aa44c6a91',
  measurementId: 'G-GHQSRJ6MQH',
};

// Avoid re-initializing on hot reload / multiple server component renders
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
