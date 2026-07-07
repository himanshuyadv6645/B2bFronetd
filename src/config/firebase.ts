/**
 * Firebase (Cloud Messaging) config, read from Vite env vars.
 *
 * All values are public web config — safe to ship to the browser. The VAPID key
 * is the Web Push public key from Firebase Console → Cloud Messaging.
 *
 * If the required vars are missing, `isPushConfigured()` is false and the whole
 * push feature stays dormant (no SDK loaded, no permission prompt).
 */

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

export const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;

export function isPushConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.messagingSenderId &&
      firebaseConfig.appId &&
      vapidKey
  );
}
