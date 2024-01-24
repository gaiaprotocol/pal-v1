import { DomNode, el } from "@common-module/app";
import BlockchainType from "../blockchain/BlockchainType.js";
import PalPost, { PostTarget } from "../database-interface/PalPost.js";
import TokenSelector from "../token/TokenSelector.js";
import PalPostForm from "./PalPostForm.js";
import PostTargetSelector from "./PostTargetSelector.js";

export default class NewPostForm extends DomNode {
  private targetSelector: PostTargetSelector;
  private tokenSelector: TokenSelector;
  private form: PalPostForm;

  constructor(focus?: boolean, callback?: (post: PalPost) => void) {
    super(".new-post-form");

    this.append(
      el(
        "header",
        this.targetSelector = new PostTargetSelector(),
        this.tokenSelector = new TokenSelector().hide(),
      ),
      this.form = new PalPostForm(
        undefined,
        focus,
        callback ? (post) => callback(post) : undefined,
      ),
    );

    this.targetSelector.on(
      "change",
      (target: number) => {
        this.form.target = target;
        if (target === PostTarget.TOKEN_HOLDERS) {
          this.tokenSelector.show();
          this.form.chain = this.tokenSelector.chain;
          this.form.tokenAddress = this.tokenSelector.tokenAddress;
        } else {
          this.form.chain = undefined;
          this.form.tokenAddress = undefined;
        }
      },
    );

    this.tokenSelector.on(
      "change",
      (chain: BlockchainType, tokenAddress: string) => {
        this.form.chain = chain;
        this.form.tokenAddress = tokenAddress;
      },
    );
  }

  public show() {
    this.deleteClass("hidden");
    return this;
  }

  public hide() {
    this.addClass("hidden");
    return this;
  }
}
