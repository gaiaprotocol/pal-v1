import { Rich, Supabase, UploadManager } from "@common-module/app";
import { PostSelectQuery, PostService } from "@common-module/social";
import BlockchainType from "../blockchain/BlockchainType.js";
import PalPost, { PostTarget } from "../database-interface/PalPost.js";
import LoginRequiredPopup from "../user/LoginRequiredPopup.js";
import PalSignedUserManager from "../user/PalSignedUserManager.js";

class PalPostService extends PostService<PalPost> {
  constructor() {
    super("posts", "reposts", "post_likes", PostSelectQuery, 50);
  }

  private async upload(files: File[]): Promise<Rich> {
    const rich: Rich = { files: [] };
    await Promise.all(files.map(async (file) => {
      if (PalSignedUserManager.user) {
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
