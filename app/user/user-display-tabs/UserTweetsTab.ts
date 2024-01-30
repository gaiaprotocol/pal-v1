import { DomNode } from "@common-module/app";

export default class UserTweetsTab extends DomNode {
  constructor() {
    super(".user-tweets-tab");
  }

  public show() {
    this.deleteClass("hidden");
  }

  public hide() {
    this.addClass("hidden");
  }
}
