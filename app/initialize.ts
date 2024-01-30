import {
  AppInitializer,
  AuthUtil,
  el,
  MaterialIconSystem,
  msg,
  Router,
  SplashLoader,
} from "@common-module/app";
import { inject_social_msg } from "@common-module/social";
import messages_en from "../locales/en.yml";
import messages_ja from "../locales/ja.yml";
import messages_zh from "../locales/zh.yml";
import messages_zh_HK from "../locales/zh_HK.yml";
import messages_zh_TW from "../locales/zh_TW.yml";
import ActivityView from "./activity/ActivityView.js";
import { initBlockchains } from "./blockchain/Blockchains.js";
import BlockTimeManager from "./BlockTimeManager.js";
import GeneralChatRoomView from "./chat-general/GeneralChatRoomView.js";
import TokenChatRoomView from "./chat-token/TokenChatRoomView.js";
import ChatsView from "./chat/ChatsView.js";
import Config from "./Config.js";
import Env from "./Env.js";
import ExploreView from "./explorer/ExplorerView.js";
import Layout from "./layout/Layout.js";
import PostsView from "./post/PostsView.js";
import PostView from "./post/PostView.js";
import SettingsView from "./settings/SettingsView.js";
import PalSignedUserManager from "./user/PalSignedUserManager.js";
import UserView from "./user/UserView.js";
import WalletManager from "./wallet/WalletManager.js";

inject_social_msg();
msg.setMessages({
  en: messages_en,
  zh: messages_zh,
  "zh-tw": messages_zh_TW,
  "zh-hk": messages_zh_HK,
  ja: messages_ja,
});

MaterialIconSystem.launch();

export default async function initialize(config: Config) {
  Env.dev = config.dev;
  Env.infuraKey = config.infuraKey;
  Env.messageForWalletLinking = config.messageForWalletLinking;

  initBlockchains();

  AppInitializer.initialize(
    config.supabaseUrl,
    config.supabaseAnonKey,
    config.dev,
  );

  WalletManager.init(config.walletConnectProjectId);

  await SplashLoader.load(el("img", { src: "/images/logo-transparent.png" }), [
    PalSignedUserManager.fetchUserOnInit(),
    BlockTimeManager.init(),
  ]);

  Router.route("**", Layout, ["test/**"]);

  Router.route("activity", ActivityView);
  Router.route("explore", ExploreView);
  Router.route("settings", SettingsView);

  Router.route(["", "posts"], PostsView);
  Router.route("post/{postId}", PostView);

  Router.route(["chats", "general", "{chain}/{tokenAddress}"], ChatsView, [
    "post/{postId}",
    "{xUsername}/holding",
    "{xUsername}/following",
    "{xUsername}/followers",
  ]);
  Router.route(["chats", "general"], GeneralChatRoomView);
  Router.route("{chain}/{tokenAddress}", TokenChatRoomView, [
    "post/{postId}",
    "{xUsername}/holding",
    "{xUsername}/following",
    "{xUsername}/followers",
  ]);

  Router.route("{xUsername}", UserView, [
    "activity",
    "explore",
    "settings",
    "posts",
    "chats",
    "general",
  ]);

  AuthUtil.checkEmailAccess();
}
