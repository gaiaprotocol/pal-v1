import { DomNode, el, View, ViewParams } from "common-dapp-module";
import { ethers } from "ethers";
import Layout from "./Layout.js";

export default class Activity extends View {
  private container: DomNode;

  constructor(params: ViewParams) {
    super();
    Layout.append(
      this.container = el(
        ".activity-view",
      ),
    );
  }

  public changeParams(params: ViewParams): void {
  }

  public close(): void {
    this.container.delete();
    super.close();
  }
}