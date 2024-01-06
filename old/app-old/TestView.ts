import { BodyNode, DomNode, el, View, ViewParams } from "@common-module/app";
import Lottie, { AnimationItem } from "lottie-web";
import animationData from "./loading.json" assert { type: "json" };

export default class TestView extends View {
  private container: DomNode;
  private animation: AnimationItem;

  constructor(params: ViewParams) {
    super();
    BodyNode.append(
      this.container = el(
        ".test-view",
      ),
    );

    this.container.style({
      width: 500,
      height: 500,
    });

    console.log("TEST!");

    this.animation = Lottie.loadAnimation({
      container: this.container.domElement,
      renderer: "svg",
      loop: true,
      autoplay: true,
      animationData,
    });
  }

  public close(): void {
    this.animation.destroy();
    this.container.delete();
    super.close();
  }
}
