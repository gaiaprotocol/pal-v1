import { DomNode } from "@common-module/app";
import { PreviewUserPublic } from "@common-module/social";
import PalUserPublic from "../database-interface/PalUserPublic.js";

export default class UserDisplay extends DomNode {
  constructor(xUsername: string, previewUser: PreviewUserPublic | undefined) {
    super(".user-display");
  }

  public set user(user: PalUserPublic | undefined) {
    //TODO:
    this.append("WIP");
  }
}
