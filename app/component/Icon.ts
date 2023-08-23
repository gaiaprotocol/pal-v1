import { DomNode } from "common-dapp-module";

export default class Icon extends DomNode {
  constructor(iconName: string) {
    super("span.icon.material-symbols-outlined");
    this.text = iconName;
  }
}
