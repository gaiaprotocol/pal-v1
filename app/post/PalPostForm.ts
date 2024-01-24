import { msg, Router, Snackbar } from "@common-module/app";
import { PostForm } from "@common-module/social";
import BlockchainType from "../blockchain/BlockchainType.js";
import PalPost, { PostTarget } from "../database-interface/PalPost.js";
import PalSignedUserManager from "../user/PalSignedUserManager.js";
import PalPostService from "./PalPostService.js";

export default class PalPostForm extends PostForm {
  public target: number = PostTarget.EVERYONE;
  public chain: BlockchainType | undefined;
  public tokenAddress: string | undefined;

  constructor(
    private parentPostId?: number,
    focus?: boolean,
    private callback?: (post: PalPost) => void,
  ) {
    super([
      PalSignedUserManager.user?.avatar_thumb,
      PalSignedUserManager.user?.stored_avatar_thumb,
    ], focus);
  }

  protected async post(message: string, files: File[]): Promise<void> {
    const post = !this.parentPostId
      ? await PalPostService.post(
        this.target,
        this.chain,
        this.tokenAddress,
        message,
        files,
      )
      : await PalPostService.comment(this.parentPostId, message, files);

    new Snackbar({
      message: msg("post-form-posted-snackbar-message"),
      action: {
        title: msg("post-form-posted-snackbar-button"),
        click: () => Router.go(`/post/${post.id}`, undefined, post),
      },
    });

    if (this.callback) this.callback(post);
  }
}
