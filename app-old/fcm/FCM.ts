import { EventContainer } from "@common-module/app";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
import Config from "../Config.js";
import SupabaseManager from "../SupabaseManager.js";

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

class FCM extends EventContainer {
  public messaging = getMessaging(app);

  public async requestNotificationPermission() {
    return await (() => {
      return new Promise<NotificationPermission>((resolve) => {
        Notification.requestPermission((permission) => resolve(permission));
      });
    })();
  }

  public async saveToken() {
    const token = await getToken(this.messaging, {
      vapidKey: Config.fcmVapidKey,
    });
    await SupabaseManager.supabase.from("user_fcm_tokens").upsert(
      { token },
    );
    return token;
  }

  public async requestPermissionAndSaveToken() {
    const permission = await this.requestNotificationPermission();
    if (permission === "granted") {
      return await this.saveToken();
    }
  }
}

export default new FCM();
