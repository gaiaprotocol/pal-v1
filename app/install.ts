import { msg, Router } from "common-dapp-module";
import Layout from "./view/Layout.js";

export default async function install() {
  if (sessionStorage.__spa_path) {
    Router.goNoHistory(sessionStorage.__spa_path);
    sessionStorage.removeItem("__spa_path");
  }

  await msg.loadYAMLs({
    en: ["/locales/en.yml"],
  });

  Router.route("**", Layout);
}
