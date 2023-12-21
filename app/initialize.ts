import {
  AppInitializer,
  el,
  MaterialIconSystem,
  msg,
  Router,
  SplashLoader,
} from "common-app-module";
import { TestChatView, TestPostListView, TestPostView } from "sofi-module";
import Config from "./Config.js";
import EnvironmentManager from "./EnvironmentManager.js";
import Layout from "./layout/Layout.js";
import PalSignedUserManager from "./user/PalSignedUserManager.js";

msg.setMessages({});

MaterialIconSystem.launch();

export default async function initialize(config: Config) {
  AppInitializer.initialize(
    config.supabaseUrl,
    config.supabaseAnonKey,
    config.dev,
  );

  EnvironmentManager.messageForWalletLinking = config.messageForWalletLinking;

  await SplashLoader.load(el("img", { src: "/images/logo-transparent.png" }), [
    PalSignedUserManager.fetchUserOnInit(),
  ]);

  Router.route("**", Layout, ["test/**"]);

  Router.route("test/chat", TestChatView);
  Router.route("test/posts", TestPostListView);
  Router.route("test/post", TestPostView);
}
