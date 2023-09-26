import { EventContainer } from "common-dapp-module";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
import Config from "./Config.js";
import SupabaseManager from "./SupabaseManager.js";

const firebaseConfig = {
  apiKey: "AIzaSyCHj4X6ZIufSm-Hga1dBCo95ZYdoxaeoOU",
  authDomain: "pal-74fe1.firebaseapp.com",
  projectId: "pal-74fe1",
  storageBucket: "pal-74fe1.appspot.com",
  messagingSenderId: "929231849192",
  appId: "1:929231849192:web:4633eb375dcdce3bb1ab5d",
  measurementId: "G-NJPN5K4TYJ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

class FCMManager extends EventContainer {
  public messaging = getMessaging(app);

  public async saveToken() {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(this.messaging, {
        vapidKey: Config.fcmVapidKey,
      });
      await SupabaseManager.supabase.from("user_fcm_tokens").upsert(
        { token },
      );
      return token;
    }
  }
}

export default new FCMManager();
