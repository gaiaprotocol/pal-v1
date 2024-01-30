import { AvatarUtil, DomNode, el, Router } from "@common-module/app";
import { Author, PostInteractions } from "@common-module/social";
import PalPost from "../database-interface/PalPost.js";
import { TokenInfoPopup } from "../index.js";
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

  public displayTarget(post: PalPost): DomNode {
    const tokenImage = el(".token-image");

    AvatarUtil.selectLoadable(tokenImage, [
      post.target_details?.token_image_thumb,
    ]);

    return el(".target-token", tokenImage, post.target_details?.token_name, {
      click: (event) => {
        event.stopPropagation();
        if (post.chain && post.token_address) {
          new TokenInfoPopup(
            post.chain,
            post.token_address,
            undefined,
            {
              chain: post.chain,
              token_address: post.token_address,
              name: post.target_details?.token_name!,
              symbol: post.target_details?.token_symbol!,
              image: post.target_details?.token_image_thumb,
              image_thumb: post.target_details?.token_image_thumb,
            },
          );
        }
      },
    });
  }
}

export default new PalPostInteractions();
