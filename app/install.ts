import { msg, Router } from "common-dapp-module";
import Activity from "./view/Activity.js";
import Layout from "./view/Layout.js";
import Rooms from "./view/Rooms.js";
import Settings from "./view/Settings.js";
import ChatRoom from "./view/ChatRoom.js";

export default async function install() {
  if (sessionStorage.__spa_path) {
    Router.goNoHistory(sessionStorage.__spa_path);
    sessionStorage.removeItem("__spa_path");
  }

  await msg.loadYAMLs({
    en: ["/locales/en.yml"],
  });

  Router.route("**", Layout);
  Router.route("activity", Activity);
  Router.route("settings", Settings);
  Router.route(["", "{twitterUsername}"], Rooms, ["activity", "settings"]);
  Router.route("{twitterUsername}", ChatRoom, ["activity", "settings"]);
}
