import { getNetwork } from "@wagmi/core";
import { msg, Router } from "common-dapp-module";
import BlockTimeCacher from "./cacher/BlockTimeCacher.js";
import Config from "./Config.js";
import PalContract from "./contract/PalContract.js";
import TokenHoldingsAggregatorContract from "./contract/TokenHoldingsAggregatorContract.js";
import OnlineUserManager from "./OnlineUserManager.js";
import ChangeChainPopup from "./popup/ChangeChainPopup.js";
import SupabaseManager from "./SupabaseManager.js";
import WalletManager from "./user/WalletManager.js";
import ActivityView from "./view/ActivityView.js";
import Explorer from "./view/Explorer.js";
import Layout from "./view/Layout.js";
import Rooms from "./view/Rooms.js";
import RoomView from "./view/RoomView.js";
import Settings from "./view/Settings.js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";

dayjs.extend(relativeTime);

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
  OnlineUserManager.init();
  await BlockTimeCacher.init();

  PalContract.init(Config.palAddress);
  TokenHoldingsAggregatorContract.init(Config.tokenHoldingsAggregatorAddress);

  Router.route("**", Layout);
  Router.route("activity", ActivityView);
  Router.route("explorer", Explorer);
  Router.route("settings", Settings);
  Router.route(["", "{tokenAddress}"], Rooms, [
    "activity",
    "explorer",
    "settings",
  ]);
  Router.route("{tokenAddress}", RoomView, [
    "activity",
    "explorer",
    "settings",
  ]);

  if (!WalletManager.connected) {
    await WalletManager.connect();
  }
  const { chain } = getNetwork();
  if (chain?.id !== Config.palChainId) {
    new ChangeChainPopup();
  }
}
