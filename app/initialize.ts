import {
  AppInitializer,
  MaterialIconSystem,
  msg,
  Router,
  SplashLoader,
} from "common-app-module";
import { TestChatView, TestPostListView, TestPostView } from "sofi-module";
import Config from "./Config.js";

msg.setMessages({});

MaterialIconSystem.launch();

export default async function initialize(config: Config) {
  AppInitializer.initialize(
    config.supabaseUrl,
    config.supabaseAnonKey,
    config.dev,
  );

  await SplashLoader.load("Loading...", []);

  Router.route("test/chat", TestChatView);
  Router.route("test/posts", TestPostListView);
  Router.route("test/post", TestPostView);
}
