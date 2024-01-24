import { DomNode } from "@common-module/app";
import { PostThread } from "@common-module/social";
import PalPost from "../database-interface/PalPost.js";
import PalSignedUserManager from "../user/PalSignedUserManager.js";
import PalPostForm from "./PalPostForm.js";
import PalPostInteractions from "./PalPostInteractions.js";
import PalPostService from "./PalPostService.js";

export default class PalPostDisplay extends DomNode {
  private thread: PostThread<PalPost> | undefined;

  constructor(private postId: number, preview: PalPost | undefined) {
    super(".post-display");
    if (preview) {
      this.append(
        this.thread = new PostThread(
          [preview],
          PalPostService,
          {
            inView: true,
            mainPostId: preview.id,
            repostedPostIds: [],
            likedPostIds: [],
            newPostIds: [],
            signedUserId: PalSignedUserManager.user?.user_id,
          },
          PalPostInteractions,
          new PalPostForm(
            postId,
            undefined,
            (post) => this.thread?.addComment(post),
          ),
        ),
      );
    }
  }

  public set data(data: {
    posts: PalPost[];
    repostedPostIds: number[];
    likedPostIds: number[];
  }) {
    this.empty().append(
      this.thread = new PostThread(
        data.posts,
        PalPostService,
        {
          inView: true,
          mainPostId: this.postId,
          repostedPostIds: data.repostedPostIds,
          likedPostIds: data.likedPostIds,
          newPostIds: [],
          signedUserId: PalSignedUserManager.user?.user_id,
        },
        PalPostInteractions,
        new PalPostForm(
          this.postId,
          undefined,
          (post) => this.thread?.addComment(post),
        ),
      ),
    );
  }
}
