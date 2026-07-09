import toast from 'react-hot-toast';
import { api } from '@/config/api';
import { firebaseConfig, vapidKey, isPushConfigured } from '@/config/firebase';

/**
 * Web push (FCM) lifecycle: register the service worker, ask permission, get an
 * FCM token, and register/unregister it with the backend.
 *
 * Fully lazy and env-gated: if Firebase isn't configured, every function returns
 * immediately and the firebase SDK is never even imported. Errors are swallowed
 * — push must never break auth or navigation.
 */

let currentToken: string | null = null;
let foregroundBound = false;

function swRegistrationUrl(): string {
  const params = new URLSearchParams({
    apiKey: firebaseConfig.apiKey ?? '',
    authDomain: firebaseConfig.authDomain ?? '',
    projectId: firebaseConfig.projectId ?? '',
    storageBucket: firebaseConfig.storageBucket ?? '',
    messagingSenderId: firebaseConfig.messagingSenderId ?? '',
    appId: firebaseConfig.appId ?? '',
  });
  return `/firebase-messaging-sw.js?${params.toString()}`;
}

async function getFirebaseMessaging() {
  const { initializeApp, getApps, getApp } = await import('firebase/app');
  const messagingMod = await import('firebase/messaging');

  const supported = await messagingMod.isSupported().catch(() => false);
  if (!supported) return null;

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig as Record<string, string>);
  return { messaging: messagingMod.getMessaging(app), messagingMod };
}

/**
 * Ask for permission, obtain an FCM token, register it with the backend, and
 * start listening for foreground messages. Safe to call on every login /
 * app load — it's idempotent.
 */
export async function initPush(): Promise<void> {
  try {
    if (!isPushConfigured()) return;
    if (!('serviceWorker' in navigator) || !('Notification' in window)) return;

    const fb = await getFirebaseMessaging();
    if (!fb) return;
    const { messaging, messagingMod } = fb;

    // Don't prompt if the user already denied — respect their choice.
    if (Notification.permission === 'denied') return;
    if (Notification.permission === 'default') {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') return;
    }

    const registration = await navigator.serviceWorker.register(swRegistrationUrl());

    const token = await messagingMod.getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });
    
    console.log("FCM TOKEN:", token);
    
    if (!token) return;

    currentToken = token;
    await api.post('/notifications/devices/register/', { token, platform: 'web' });

    // Foreground messages (app is open/focused): FCM won't show these itself.
    if (!foregroundBound) {
      foregroundBound = true;
      messagingMod.onMessage(messaging, (payload) => {
        const title = payload.notification?.title;
        const body = payload.notification?.body;
        if (title || body) {
          if (Notification.permission === 'granted') {
            navigator.serviceWorker.ready.then(reg => {
              // `image` and `actions` are valid at runtime (service-worker
              // notifications) but missing from TS's built-in NotificationOptions.
              type RichNotificationOptions = NotificationOptions & {
                image?: string;
                actions?: { action: string; title: string }[];
              };
              const notificationOptions: RichNotificationOptions = {
                body,
                icon: '/favicon.svg',
                badge: '/favicon.svg',
                data: { url: payload.data?.action_url || '/' }
              };

              if (payload.data?.image_url) {
                notificationOptions.image = payload.data.image_url;
              }

              if (payload.data?.button_text) {
                notificationOptions.actions = [
                  {
                    action: 'click_action',
                    title: payload.data.button_text
                  }
                ];
              }

              reg.showNotification(title || 'Notification', notificationOptions);
            });
          } else {
            toast(`${title ?? ''}${title && body ? ' — ' : ''}${body ?? ''}`.trim(), {
              icon: '🔔',
              duration: 5000,
            });
          }
        }
      });
    }
  } catch {
    /* best-effort */
  }
}

/**
 * Unregister this device's token (called on logout). Deletes the token both on
 * the backend and in FCM so no more pushes are sent to this browser.
 */
export async function disablePush(): Promise<void> {
  try {
    if (!isPushConfigured()) return;

    const token = currentToken;
    if (token) {
      await api.post('/notifications/devices/unregister/', { token }).catch(() => {});
    }

    const fb = await getFirebaseMessaging();
    if (fb) {
      await fb.messagingMod.deleteToken(fb.messaging).catch(() => {});
    }
    currentToken = null;
  } catch {
    /* best-effort */
  }
}
