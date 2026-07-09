/* Firebase Cloud Messaging service worker (background push handler).
 *
 * A service worker can't read the app's build-time env vars, so the Firebase
 * web config is passed in the registration URL query string (these values are
 * public web config, safe to expose). See src/services/push.service.ts.
 *
 * Uses the compat SDK via importScripts — the standard FCM SW pattern.
 */
/* eslint-disable */
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

const params = new URL(self.location).searchParams;
const firebaseConfig = {
  apiKey: params.get('apiKey'),
  authDomain: params.get('authDomain'),
  projectId: params.get('projectId'),
  storageBucket: params.get('storageBucket'),
  messagingSenderId: params.get('messagingSenderId'),
  appId: params.get('appId'),
};

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title = (payload.notification && payload.notification.title) || 'New notification';
    const body = (payload.notification && payload.notification.body) || '';
    const data = payload.data || {};
    
    const notificationOptions = {
      body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      data: { url: data.action_url || '/' },
    };

    if (data.image_url) {
      notificationOptions.image = data.image_url;
    }

    if (data.button_text) {
      notificationOptions.actions = [
        {
          action: 'click_action',
          title: data.button_text
        }
      ];
    }

    self.registration.showNotification(title, notificationOptions);
  });
}

// Allow testing from Chrome DevTools 'Push' button
self.addEventListener('push', (event) => {
  // If it's an FCM push, firebase.messaging() intercepts it and prevents this from showing a duplicate IF the payload format matches FCM's internal format.
  // However, for manual DevTools testing, this will handle it.
  if (event.data) {
    try {
      const data = event.data.json();
      // Only show if it's not a standard FCM structure (which is handled by onBackgroundMessage)
      if (!data.notification && !data.data?.['gcm.message_id']) {
        event.waitUntil(
          self.registration.showNotification(data.title || 'Test Notification', {
            body: data.body || 'Push from DevTools',
            icon: '/favicon.svg',
          })
        );
      }
    } catch {
      event.waitUntil(
        self.registration.showNotification('Test Notification', {
          body: event.data.text() || 'Push from DevTools',
          icon: '/favicon.svg',
        })
      );
    }
  }
});

// Focus/open the app on notification click, honouring the action_url.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
