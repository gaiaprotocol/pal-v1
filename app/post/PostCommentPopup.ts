import { Component, el, MaterialIcon, Popup } from "@common-module/app";
import { Post, PostContentDisplay } from "@common-module/social";
import PalPostForm from "./PalPostForm.js";

export default class PostCommentPopup extends Popup {
  constructor(sourcePost: Post) {
    super({ barrierDismissible: true });

    this.append(
      new Component(
        ".popup.post-comment-popup",
        el(
          "header",
          el("button.close", new MaterialIcon("close"), {
            click: () => this.delete(),
          }),
        ),
        new PostContentDisplay(sourcePost),
        new PalPostForm(sourcePost.id, true, () => this.delete()),
      ),
    );
  }
}
