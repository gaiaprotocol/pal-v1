import { DomNode, LottieAnimation } from "@common-module/app";
import animationData from "./message-loading-animation.json" assert {
  type: "json",
};

export default class MessageLoadingAnimation extends DomNode {
  constructor() {
    super(".message-loading-animation");
    this.style({ width: 80, height: 80 });
    this.append(
      new LottieAnimation(".message-loading-animation", animationData),
    );
  }
}
