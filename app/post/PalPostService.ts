import {
  ErrorAlert,
  msg,
  Rich,
  Supabase,
  UploadManager,
} from "@common-module/app";
import { PostSelectQuery, PostService } from "@common-module/social";
import BlockchainType from "../blockchain/BlockchainType.js";
import PalPost, { PostTarget } from "../database-interface/PalPost.js";
import LoginRequiredPopup from "../user/LoginRequiredPopup.js";
import PalSignedUserManager from "../user/PalSignedUserManager.js";

class PalPostService extends PostService<PalPost> {
  constructor() {
    super("posts", "reposts", "post_likes", PostSelectQuery, 50);
  }

  protected enhancePostData(posts: PalPost[]): {
    posts: PalPost[];
    repostedPostIds: number[];
    likedPostIds: number[];
  } {
    const result = super.enhancePostData(posts);

    for (const post of result.posts as any) {
      if (post.token_name || post.token_symbol || post.token_image_thumb) {
        post.target_details = {
          token_name: post.token_name,
          token_symbol: post.token_symbol,
          token_image_thumb: post.token_image_thumb,
        };
      }
    }

    return result;
  }

  private async upload(files: File[]): Promise<Rich> {
    const rich: Rich = { files: [] };
    await Promise.all(files.map(async (file) => {
      if (PalSignedUserManager.user) {
        try {
          const url = await UploadManager.uploadAttachment(
            "post_upload_files",
            PalSignedUserManager.user.user_id,
            file,
            60 * 60 * 24 * 30,
          );
          rich.files?.push({
            url,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          });
        } catch (e: any) {
          if (e.error === "Payload too large") {
            new ErrorAlert({
              title: msg("file-too-large-alert-title"),
              message: msg("file-too-large-alert-message", {
                maxFileSize: "1 MB",
              }),
            });
          }
          throw e;
        }
      }
    }));
    return rich;
  }

  public async post(
    target: PostTarget,
    chain: BlockchainType | undefined,
    tokenAddress: string | undefined,
    message: string,
    files: File[],
  ) {
    const rich = files.length ? await this.upload(files) : undefined;
    const data = await this.safeInsertAndSelect({
      target,
      chain,
      token_address: tokenAddress,
      message,
      rich,
    });
    this.notifyNewGlobalPost(data);
    return data;
  }

  public async comment(parent: number, message: string, files: File[]) {
    const rich = files.length ? await this.upload(files) : undefined;
    return await this.safeInsertAndSelect({ parent, message, rich });
  }

  public async fetchTokenHeldPosts(
    userId: string,
    walletAddress: string,
    lastPostId?: number,
  ) {
    const { data, error } = await Supabase.client.rpc("get_token_held_posts", {
      p_user_id: userId,
      p_wallet_address: walletAddress,
      last_post_id: lastPostId,
      max_count: this.fetchLimit,
    });
    if (error) throw error;
    return this.enhancePostData(data ?? []);
  }

  public checkSigned() {
    if (!PalSignedUserManager.signed) {
      new LoginRequiredPopup();
      throw new Error("User is not signed in.");
    }
  }
}

export default new PalPostService();
