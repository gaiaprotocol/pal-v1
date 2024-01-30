import { DomNode, ListLoadingBar, Store } from "@common-module/app";
import Token from "../database-interface/Token.js";
import TokenListItem from "./TokenListItem.js";

export interface TokenListOptions {
  storeName?: string;
  emptyMessage: string;
}

export default abstract class TokenList extends DomNode {
  private store: Store | undefined;
  private refreshed = false;

  constructor(tag: string, options: TokenListOptions) {
    super(tag + ".token-list");
    this.store = options.storeName ? new Store(options.storeName) : undefined;
    this.domElement.setAttribute("data-empty-message", options.emptyMessage);

    if (this.store) {
      const cached = this.store.get<Token[]>("cached-tokens");
      if (cached) {
        for (const token of cached) {
          this.addItem(token);
        }
      }
    }
  }

  protected addItem(token: Token) {
    new TokenListItem(token).appendTo(this);
  }

  protected abstract fetchTokens(): Promise<Token[]>;

  protected async refresh() {
    this.append(new ListLoadingBar());

    const tokens = await this.fetchTokens();
    this.store?.set("cached-tokens", tokens, true);

    if (!this.deleted) {
      this.empty();
      for (const token of tokens) {
        this.addItem(token);
      }
      this.refreshed = true;
    }
  }

  public show() {
    this.deleteClass("hidden");
    if (!this.refreshed) this.refresh();
    return this;
  }

  public hide() {
    this.addClass("hidden");
  }
}
