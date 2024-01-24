import { DomNode, LottieAnimation } from "@common-module/app";
import animationData from "./post-loading-animation.json" assert {
  type: "json",
};

export default class PostLoadingAnimation extends DomNode {
  constructor() {
    super(".post-loading-animation");
    this.style({ width: 80, height: 80 });
    this.append(
      new LottieAnimation(".post-loading-animation", animationData),
    );
  }
}
