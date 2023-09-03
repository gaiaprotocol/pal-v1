import { msg, Router } from "common-dapp-module";
import Config from "./Config.js";
import PalContract from "./contract/PalContract.js";
import TokenHoldingsAggregatorContract from "./contract/TokenHoldingsAggregatorContract.js";
import SupabaseManager from "./SupabaseManager.js";
import WalletManager from "./user/WalletManager.js";
import Activity from "./view/Activity.js";
import ChatRoom from "./view/ChatRoom.js";
import Layout from "./view/Layout.js";
import Rooms from "./view/Rooms.js";
import Settings from "./view/Settings.js";

export default async function install() {
  if (sessionStorage.__spa_path) {
    Router.goNoHistory(sessionStorage.__spa_path);
    sessionStorage.removeItem("__spa_path");
  }

  await msg.loadYAMLs({
    en: ["/locales/en.yml"],
  });

  await SupabaseManager.connect();
  WalletManager.init();
  PalContract.init(Config.palAddress);
  TokenHoldingsAggregatorContract.init(Config.tokenHoldingsAggregatorAddress);

  Router.route("**", Layout);
  Router.route("activity", Activity);
  Router.route("settings", Settings);
  Router.route(["", "{twitterUsername}"], Rooms, ["activity", "settings"]);
  Router.route("{twitterUsername}", ChatRoom, ["activity", "settings"]);
}
