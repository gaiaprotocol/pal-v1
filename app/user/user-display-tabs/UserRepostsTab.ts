import { PostList } from "@common-module/social";
import PalPost from "../../database-interface/PalPost.js";
import PalPostInteractions from "../../post/PalPostInteractions.js";
import PalPostService from "../../post/PalPostService.js";
import PostLoadingAnimation from "../../post/PostLoadingAnimation.js";
import PalSignedUserManager from "../PalSignedUserManager.js";

export default class UserRepostsTab extends PostList<PalPost> {
  private lastRepostedAt: string | undefined;

  constructor(private userId: string) {
    super(
      ".user-reposts-tab",
      PalPostService,
      {
        storeName: userId === PalSignedUserManager.user?.user_id
          ? "signed-user-reposts"
          : undefined,
        signedUserId: PalSignedUserManager.user?.user_id,
        emptyMessage: "This user has not reposted anything yet.",
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
    const result = await PalPostService.fetchReposts(
      this.userId,
      this.lastRepostedAt,
    );
    this.lastRepostedAt = result.lastRepostedAt;
    return {
      fetchedPosts: result.data.posts.map((p) => ({
        posts: [p],
        mainPostId: p.id,
      })),
      repostedPostIds: result.data.repostedPostIds,
      likedPostIds: result.data.likedPostIds,
    };
  }
}
