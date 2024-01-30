import { AvatarUtil, DomNode, el, Router } from "@common-module/app";
import { SocialUserPublic } from "@common-module/social";

export default class UserListItem extends DomNode {
  constructor(user: SocialUserPublic) {
    super(".user-list-item");

    const avatar = el(".avatar");

    AvatarUtil.selectLoadable(avatar, [
      user.avatar_thumb,
      user.stored_avatar_thumb,
    ]);

    this.append(
      avatar,
      el(".name", user.display_name),
    );
    this.onDom("click", () => Router.go(`/${user.x_username}`));
  }
}
