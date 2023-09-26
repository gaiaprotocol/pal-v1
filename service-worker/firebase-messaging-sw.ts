import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging/sw";

const firebaseApp = initializeApp({
  apiKey: "AIzaSyCHj4X6ZIufSm-Hga1dBCo95ZYdoxaeoOU",
  authDomain: "pal-74fe1.firebaseapp.com",
  projectId: "pal-74fe1",
  storageBucket: "pal-74fe1.appspot.com",
  messagingSenderId: "929231849192",
  appId: "1:929231849192:web:4633eb375dcdce3bb1ab5d",
  measurementId: "G-NJPN5K4TYJ",
});

getMessaging(firebaseApp);
