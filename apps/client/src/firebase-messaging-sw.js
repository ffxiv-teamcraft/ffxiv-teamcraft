//SOURCE: https://github.com/firebase/quickstart-js/blob/master/messaging/firebase-messaging-sw.js

// Import and configure the Firebase SDK
// These scripts are made available when the app is served or deployed on Firebase Hosting
// If you do not serve/host your project using Firebase Hosting see https://firebase.google.com/docs/web/setup
importScripts('https://www.gstatic.com/firebasejs/8.1.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.1.1/firebase-messaging.js');

// TODO make this production once dev is done.
firebase.initializeApp({
  apiKey: 'AIzaSyCkrNPf7XlyuxQeqNtynvDFDnQ-XigG3WA',
  authDomain: 'ffxiv-teamcraft-beta.firebaseapp.com',
  databaseURL: 'https://ffxiv-teamcraft-beta.firebaseio.com',
  projectId: 'ffxiv-teamcraft-beta',
  storageBucket: 'ffxiv-teamcraft-beta.appspot.com',
  messagingSenderId: '716469847404',
  appId: '1:716469847404:web:d1716789557f9cca5e1f49'
});


const messaging = firebase.messaging();


// If you would like to customize notifications that are received in the
// background (Web app is closed or not in browser focus) then you should
// implement this optional method.
// [START background_handler]
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  if (payload.notification) {
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: '/assets/logo.png'
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
  }
});
// [END background_handler]
