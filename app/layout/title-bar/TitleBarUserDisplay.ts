import { DomNode, el } from "@common-module/app";
import { AuthorUtil, SoFiUserPublic } from "@common-module/social";
import SidePanel from "../SidePanel.js";

export default class TitleBarUserDisplay extends DomNode {
  constructor(user: SoFiUserPublic) {
    super(".title-bar-user-display");

    const avatar = el(".avatar");

    AuthorUtil.selectLoadableAvatar(avatar, [
      user.avatar_thumb,
      user.stored_avatar_thumb,
    ]);

    this.append(
      avatar,
      el(".name", user.display_name),
    );

    this.onDom("click", () => new SidePanel());
  }
}
