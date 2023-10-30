import { BodyNode, DomNode } from "common-app-module";

export default class SplashScreen extends DomNode {
  constructor() {
    super(".splash-screen");
    this.appendTo(BodyNode);
  }
}
