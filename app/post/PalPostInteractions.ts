import { Router } from "@common-module/app";
import { Author, PostInteractions } from "@common-module/social";
import PalPost from "../database-interface/PalPost.js";
import LoginRequiredPopup from "../user/LoginRequiredPopup.js";
import PalSignedUserManager from "../user/PalSignedUserManager.js";
import PostCommentPopup from "./PostCommentPopup.js";
import PostOwnerMenu from "./PostOwnerMenu.js";

class PalPostInteractions implements PostInteractions<PalPost> {
  public openPostView(post: PalPost) {
    Router.go(`/post/${post.id}`, undefined, post);
  }

  public openAuthorProfile(author: Author) {
    Router.go(`/${author.x_username}`, undefined, author);
  }

  public openOwnerMenu(postId: number, rect: DOMRect) {
    new PostOwnerMenu(postId, {
      left: rect.right - 120,
      top: rect.top + 30,
    });
  }

  public openCommentPopup(post: PalPost) {
    if (!PalSignedUserManager.signed) {
      new LoginRequiredPopup();
    } else {
      new PostCommentPopup(post);
    }
  }
}

export default new PalPostInteractions();
