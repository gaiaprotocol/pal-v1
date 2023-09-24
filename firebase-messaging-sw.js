import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
const firebaseApp = initializeApp({
  apiKey: "AIzaSyCHj4X6ZIufSm-Hga1dBCo95ZYdoxaeoOU",
  authDomain: "pal-74fe1.firebaseapp.com",
  projectId: "pal-74fe1",
  storageBucket: "pal-74fe1.appspot.com",
  messagingSenderId: "929231849192",
  appId: "1:929231849192:web:4633eb375dcdce3bb1ab5d",
  measurementId: "G-NJPN5K4TYJ",
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = getMessaging(firebaseApp);
onBackgroundMessage(messaging, (payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload,
  );
  // Customize notification here
  const notificationTitle = "Background Message Title";
  const notificationOptions = {
    body: "Background Message body.",
    icon: "/images/icon-192x192.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
