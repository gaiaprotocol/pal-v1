import { DomNode, el, ListLoadingBar, Store } from "@common-module/app";
import BlockchainType from "../blockchain/BlockchainType.js";
import Token from "../database-interface/Token.js";
import PalSignedUserManager from "../user/PalSignedUserManager.js";
import TokenService from "./TokenService.js";

export default class TokenSelector extends DomNode {
  private store: Store;
  private select: DomNode<HTMLSelectElement>;
  private refreshed = false;
  private lastCreatedAt: string | undefined;

  constructor() {
    super(".token-selector");
    this.addAllowedEvents("change");
    this.append(
      this.select = el(
        "select",
        {
          change: (event, select) =>
            this.fireEvent("change", this.chain, this.tokenAddress),
        },
      ),
    );

    this.store = new Store("held-tokens");
    const cached = this.store.get<Token[]>("cached-tokens");
    if (cached) {
      for (const token of cached) {
        this.select.append(
          el("option", token.name, {
            value: `${token.chain}-${token.token_address}`,
          }),
        );
      }
    }
  }

  private async refresh() {
    if (PalSignedUserManager.user?.wallet_address) {
      this.select.append(new ListLoadingBar());

      const tokens = await TokenService.fetchHeldOrOwnedTokens(
        PalSignedUserManager.user.wallet_address,
        this.lastCreatedAt,
      );
      this.store.set("cached-krews", tokens, true);

      if (!this.deleted) {
        this.select.empty();
        for (const token of tokens) {
          this.select.append(
            el("option", token.name, {
              value: `${token.chain}-${token.token_address}`,
            }),
          );
        }
        this.lastCreatedAt = tokens[tokens.length - 1]?.created_at;
      }
    }
  }

  public get chain() {
    const value = this.select.domElement.value;
    const [chain] = value.split("-");
    return chain as BlockchainType;
  }

  public get tokenAddress() {
    const value = this.select.domElement.value;
    const [, tokenAddress] = value.split("-");
    return tokenAddress;
  }

  public show() {
    this.deleteClass("hidden");
    if (!this.refreshed) this.refresh();
    return this;
  }

  public hide() {
    this.addClass("hidden");
    return this;
  }
}
