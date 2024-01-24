import { DomNode, el, msg } from "@common-module/app";
import { PostTarget } from "../database-interface/PalPost.js";

export default class PostTargetSelector extends DomNode {
  constructor() {
    super(".post-target-selector");
    this.addAllowedEvents("change");
    this.append(
      el(
        "select",
        el(
          "option",
          { value: String(PostTarget.EVERYONE) },
          msg("post-target-everyone"),
        ),
        el(
          "option",
          { value: String(PostTarget.TOKEN_HOLDERS) },
          msg("post-target-token-holders"),
        ),
        {
          change: (event, select) =>
            this.fireEvent(
              "change",
              Number((select.domElement as HTMLSelectElement).value),
            ),
        },
      ),
    );
  }
}
