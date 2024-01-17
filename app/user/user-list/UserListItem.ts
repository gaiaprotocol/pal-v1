import { DomNode, el, Router } from "@common-module/app";
import { AvatarUtil, SocialUserPublic } from "@common-module/social";

export default class UserListItem extends DomNode {
  constructor(user: SocialUserPublic) {
    super(".user-list-item");

    const profileImage = el(".profile-image");

    AvatarUtil.selectLoadable(profileImage, [
      user.avatar_thumb,
      user.stored_avatar_thumb,
    ]);

    this.append(
      el(
        ".info",
        profileImage,
        el(".name", user.display_name),
      ),
    );
    this.onDom("click", () => Router.go(`/${user.x_username}`));
  }
}
