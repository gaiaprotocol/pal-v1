import { DomNode } from "common-app-module";

export default class Icon extends DomNode {
  constructor(iconName: string) {
    super("span.icon.material-symbols-outlined");
    this.domElement.translate = false;
    this.text = iconName;
  }
}
