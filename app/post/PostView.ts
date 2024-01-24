import { el, View, ViewParams } from "@common-module/app";
import PalPost from "../database-interface/PalPost.js";
import Layout from "../layout/Layout.js";
import PalSignedUserManager from "../user/PalSignedUserManager.js";
import PalPostService from "./PalPostService.js";
import PalPostDisplay from "./PalPostDisplay.js";

export default class PostView extends View {
  private postDisplay: PalPostDisplay | undefined;
  private lastCommentId: number | undefined;

  constructor(params: ViewParams, uri: string, data?: any) {
    super();
    Layout.append(this.container = el(".post-view"));
    this.render(parseInt(params.postId!), data);
  }

  public changeParams(params: ViewParams, uri: string, data?: any): void {
    this.render(parseInt(params.postId!), data);
  }

  private async render(postId: number, previewPost?: PalPost) {
    this.container.empty().append(
      this.postDisplay = new PalPostDisplay(postId, previewPost),
    );

    const data = await PalPostService.fetchPost(
      postId,
      undefined,
      PalSignedUserManager.user?.user_id,
    );

    this.postDisplay.data = data;
    this.lastCommentId = data.posts[data.posts.length - 1]?.id;
  }
}
