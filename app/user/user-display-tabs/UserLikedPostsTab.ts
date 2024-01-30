import { PostList } from "@common-module/social";
import PalPost from "../../database-interface/PalPost.js";
import PalPostInteractions from "../../post/PalPostInteractions.js";
import PalPostService from "../../post/PalPostService.js";
import PostLoadingAnimation from "../../post/PostLoadingAnimation.js";
import PalSignedUserManager from "../PalSignedUserManager.js";

export default class UserLikedPostsTab extends PostList<PalPost> {
  constructor(userId: string) {
    super(
      ".user-liked-posts-tab",
      PalPostService,
      {
        storeName: userId === PalSignedUserManager.user?.user_id
          ? "signed-user-liked-posts"
          : undefined,
        signedUserId: PalSignedUserManager.user?.user_id,
        emptyMessage: "This user has not liked anything yet.",
      },
      PalPostInteractions,
      new PostLoadingAnimation(),
    );
  }

  protected async fetchPosts(): Promise<
    {
      fetchedPosts: { posts: PalPost[]; mainPostId: number }[];
      repostedPostIds: number[];
      likedPostIds: number[];
    }
  > {
    throw new Error("Method not implemented.");
  }
}
