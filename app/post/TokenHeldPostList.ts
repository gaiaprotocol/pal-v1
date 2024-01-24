import { msg } from "@common-module/app";
import { PostList } from "@common-module/social";
import PalPost from "../database-interface/PalPost.js";
import PalSignedUserManager from "../user/PalSignedUserManager.js";
import PalPostInteractions from "./PalPostInteractions.js";
import PalPostService from "./PalPostService.js";
import PostLoadingAnimation from "./PostLoadingAnimation.js";

export default class TokenHeldPostList extends PostList<PalPost> {
  constructor() {
    super(
      ".token-held-post-list",
      PalPostService,
      {
        storeName: "key-held-posts",
        signedUserId: PalSignedUserManager.user?.user_id,
        emptyMessage: msg("token-held-post-list-empty-message"),
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
    if (PalSignedUserManager.user?.wallet_address) {
      const result = await PalPostService.fetchTokenHeldPosts(
        PalSignedUserManager.user.user_id,
        PalSignedUserManager.user.wallet_address,
        this.lastPostId,
      );
      return {
        fetchedPosts: result.posts.map((p) => ({
          posts: [p],
          mainPostId: p.id,
        })),
        repostedPostIds: result.repostedPostIds,
        likedPostIds: result.likedPostIds,
      };
    } else {
      return {
        fetchedPosts: [],
        repostedPostIds: [],
        likedPostIds: [],
      };
    }
  }
}
