import { ErrorAlert, msg, Router } from "common-dapp-module";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import BlockTimeCacher from "./cacher/BlockTimeCacher.js";
import TokenInfoCacher from "./cacher/TokenInfoCacher.js";
import UserDetailsCacher from "./cacher/UserDetailsCacher.js";
import SplashScreen from "./component/SplashScreen.js";
import Config from "./Config.js";
import PalContract from "./contract/PalContract.js";
import TokenHoldingsAggregatorContract from "./contract/TokenHoldingsAggregatorContract.js";
import OnlineUserManager from "./OnlineUserManager.js";
import SupabaseManager from "./SupabaseManager.js";
import WalletManager from "./user/WalletManager.js";
import ActivityView from "./view/ActivityView.js";
import Explorer from "./view/Explorer.js";
import Layout from "./view/Layout.js";
import Rooms from "./view/Rooms.js";
import RoomView from "./view/RoomView.js";
import Settings from "./view/Settings.js";
import UserInfoView from "./view/UserInfoView.js";

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
const analytics = getAnalytics(app);

dayjs.extend(relativeTime);

export default async function install() {
  if (sessionStorage.__spa_path) {
    Router.goNoHistory(sessionStorage.__spa_path);
    sessionStorage.removeItem("__spa_path");
  }

  const splash = new SplashScreen();

  await Promise.all([
    msg.loadYAMLs({
      en: ["/locales/en.yml"],
    }),
    SupabaseManager.connect(),
    BlockTimeCacher.init(),
  ]);

  splash.delete();

  TokenInfoCacher.init();
  UserDetailsCacher.init();
  WalletManager.init();
  OnlineUserManager.init();

  PalContract.init(Config.palAddress);
  TokenHoldingsAggregatorContract.init(Config.tokenHoldingsAggregatorAddress);

  Router.route("**", Layout);
  Router.route("activity", ActivityView);
  Router.route("explorer", Explorer);
  Router.route("settings", Settings);
  Router.route(["", "0x{tokenAddress}"], Rooms);
  Router.route("0x{tokenAddress}", RoomView);
  Router.route("{xUsername}", UserInfoView, [
    "activity",
    "explorer",
    "settings",
    "0x{tokenAddress}",
  ]);

  const params = new URLSearchParams(location.search);
  let errorDiscription = params.get("error_description")!;
  if (errorDiscription) {
    if (
      errorDiscription === "Error getting user email from external provider"
    ) {
      errorDiscription +=
        ".\nPlease add an email in your X account settings and allow email access.";
    }
    new ErrorAlert({
      title: "Error",
      message: errorDiscription,
    });
  }
}
