import { DomNode, el, MaterialIcon } from "common-app-module";
import { AuthorUtil, SoFiUserPublic } from "sofi-module";

export default class TitleBarUserDisplay extends DomNode {
  constructor(user: SoFiUserPublic) {
    super(".title-bar-user-display");

    const profileImage = el(".profile-image");

    AuthorUtil.selectLoadableProfileImage(profileImage, [
      user.avatar_thumb,
      user.stored_avatar_thumb,
    ]);

    this.append(
      profileImage,
      el(".name", user.display_name),
      el("button.dropdown", new MaterialIcon("arrow_drop_down")),
    );

    this.onDom("click", (event) => {
      //TODO:
    });
  }
}
