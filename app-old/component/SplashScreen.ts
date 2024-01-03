import { BodyNode, DomNode } from "@common-module/app";

export default class SplashScreen extends DomNode {
  constructor() {
    super(".splash-screen");
    this.appendTo(BodyNode);
  }
}
