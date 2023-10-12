import { DomNode } from "common-dapp-module";
import FavoriteManager from "../FavoriteManager.js";
import Icon from "./Icon.js";

export default class FavoriteButton extends DomNode {
  private currentTokenAddress: string | undefined;

  constructor(options: {
    tag?: string;
  }) {
    super("a.favorite-button" + (options.tag ?? ""));

    this.onDom("click", async () => {
      if (this.currentTokenAddress) {
        if (!FavoriteManager.check(this.currentTokenAddress)) {
          FavoriteManager.add(this.currentTokenAddress);
        } else {
          FavoriteManager.remove(this.currentTokenAddress);
        }
      }
    });

    this.onDelegate(FavoriteManager, "add", (tokenAddress: string) => {
      if (tokenAddress === this.currentTokenAddress) {
        this.check(tokenAddress);
      }
    });

    this.onDelegate(FavoriteManager, "remove", (tokenAddress: string) => {
      if (tokenAddress === this.currentTokenAddress) {
        this.check(tokenAddress);
      }
    });
  }

  public check(tokenAddress: string) {
    this.currentTokenAddress = tokenAddress;
    this.empty();
    if (!FavoriteManager.check(tokenAddress)) {
      this.append(new Icon("heart_plus"));
    } else {
      this.append(new Icon("heart_minus"));
    }
  }
}
