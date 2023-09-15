import { DomNode, el } from "common-dapp-module";

export default class ProfileImageDisplay extends DomNode {
  constructor(src?: string) {
    super(".profile-image-display.loading");
    if (src) {
      this.src = src;
    }
  }

  public set src(src: string) {
    const img = el<HTMLImageElement>("img");
    img.onDom("load", () => {
      this.append(img);
      this.deleteClass("loading");
    });
    img.domElement.src = src;
  }
}
