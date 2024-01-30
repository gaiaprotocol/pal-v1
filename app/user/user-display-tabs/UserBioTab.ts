import { DomNode } from "@common-module/app";

export default class UserBioTab extends DomNode {
  constructor(bio: string | undefined) {
    super(".user-bio-tab");
  }

  public show() {
    this.deleteClass("hidden");
  }

  public hide() {
    this.addClass("hidden");
  }
}
