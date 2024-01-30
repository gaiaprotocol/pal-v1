import { el, Router, View } from "@common-module/app";
import Layout from "./layout/Layout.js";
import PalSignedUserManager from "./user/PalSignedUserManager.js";
import UserDisplay from "./user/UserDisplay.js";

export default class ProfileView extends View {
  private userDisplay: UserDisplay;

  constructor() {
    super();
    Layout.append(
      this.container = el(
        ".profile-view",
        this.userDisplay = new UserDisplay(
          PalSignedUserManager.user?.x_username ?? "",
          undefined,
        ),
      ),
    );
    this.userDisplay.user = PalSignedUserManager.user;

    if (!PalSignedUserManager.signed) {
      setTimeout(() => Router.goNoHistory("/"));
    }
  }
}
