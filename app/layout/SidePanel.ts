import {
  BodyNode,
  Button,
  DomNode,
  el,
  MaterialIcon,
  Router,
} from "@common-module/app";
import { AvatarUtil } from "@common-module/social";
import CreateTokenPopup from "../token/CreateTokenPopup.js";
import PalSignedUserManager from "../user/PalSignedUserManager.js";

export default class SidePanel extends DomNode {
  constructor() {
    super(".side-panel");

    const profileImage = el(".profile-image");

    if (PalSignedUserManager.user) {
      AvatarUtil.selectLoadable(profileImage, [
        PalSignedUserManager.user.avatar_thumb,
        PalSignedUserManager.user.stored_avatar_thumb,
      ]);
    }

    this.append(el(
      "main",
      el(
        "header",
        PalSignedUserManager.user
          ? el(
            ".signed-user",
            profileImage,
            el(
              ".info",
              el(".name", PalSignedUserManager.user.display_name),
              el(".x-username", `@${PalSignedUserManager.user.x_username}`),
            ),
            {
              click: () => {
                Router.go("/profile");
                this.delete();
              },
            },
          )
          : undefined,
        new Button({
          tag: ".close",
          icon: new MaterialIcon("close"),
          click: () => {
            this.delete();
          },
        }),
      ),
      el(
        "ul.menu",
        el(
          "li",
          el("a", "Profile", {
            click: () => {
              Router.go("/profile");
              this.delete();
            },
          }),
        ),
        el(
          "li",
          el("a", "Settings", {
            click: () => {
              Router.go("/settings");
              this.delete();
            },
          }),
        ),
        el(
          "li",
          el("a", "Logout", {
            click: () => {
              PalSignedUserManager.signOut();
              this.delete();
            },
          }),
        ),
      ),
      el(
        "section.tokens",
        el(
          "header",
          el("h3", "Your Tokens"),
          new Button({
            icon: new MaterialIcon("add"),
            click: () => {
              new CreateTokenPopup();
              this.delete();
            },
          }),
        ),
      ),
    ));

    this.onDom("click", (event: MouseEvent) => {
      if (event.target === this.domElement) {
        this.delete();
      }
    });
    BodyNode.append(this);
  }
}
