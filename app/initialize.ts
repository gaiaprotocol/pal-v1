import {
  AppInitializer,
  el,
  MaterialIconSystem,
  msg,
  Router,
  SplashLoader,
} from "@common-module/app";
import {
  AuthUtil,
  inject_social_msg,
  TestChatView,
  TestPostListView,
  TestPostView,
} from "@common-module/social";
import messages_en from "../locales/en.yml";
import messages_ja from "../locales/ja.yml";
import messages_zh from "../locales/zh.yml";
import messages_zh_HK from "../locales/zh_HK.yml";
import messages_zh_TW from "../locales/zh_TW.yml";
import ActivityView from "./activity/ActivityView.js";
import { initBlockchains } from "./blockchain/Blockchains.js";
import BlockTimeManager from "./BlockTimeManager.js";
import Config from "./Config.js";
import Env from "./Env.js";
import EnvironmentManager from "./EnvironmentManager.js";
import ExploreView from "./explorer/ExplorerView.js";
import Layout from "./layout/Layout.js";
import SettingsView from "./settings/SettingsView.js";
import PalSignedUserManager from "./user/PalSignedUserManager.js";
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

  initBlockchains();

  AppInitializer.initialize(
    config.supabaseUrl,
    config.supabaseAnonKey,
    config.dev,
  );

  EnvironmentManager.messageForWalletLinking = config.messageForWalletLinking;

  WalletManager.init(config.walletConnectProjectId);

  await SplashLoader.load(el("img", { src: "/images/logo-transparent.png" }), [
    PalSignedUserManager.fetchUserOnInit(),
    BlockTimeManager.init(),
  ]);

  Router.route("**", Layout, ["test/**"]);
  Router.route("activity", ActivityView);
  Router.route("explore", ExploreView);
  Router.route("settings", SettingsView);

  Router.route("test/chat", TestChatView);
  Router.route("test/posts", TestPostListView);
  Router.route("test/post", TestPostView);

  AuthUtil.checkEmailAccess();
}
