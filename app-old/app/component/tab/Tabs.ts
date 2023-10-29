import { DomNode } from "common-dapp-module";
import Tab from "./Tab.js";

export default class Tabs extends DomNode {
  public children: Tab[] = [];

  constructor(tabs: { id: string; label: string }[]) {
    super("ul.tabs");
    for (const t of tabs) {
      const tab = new Tab(t.id, t.label);
      tab.onDom("click", () => this.select(t.id));
      this.append(tab);
    }
  }

  public select(id: string) {
    for (const tab of this.children) {
      tab.active = tab._id === id;
    }
    this.fireEvent("select", id);
  }
}
