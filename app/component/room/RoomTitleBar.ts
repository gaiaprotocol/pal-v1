import { DomNode, el } from "common-dapp-module";
import TokenInfoCacher from "../../cacher/TokenInfoCacher.js";
import TokenInfo from "../../data/TokenInfo.js";
import Icon from "../Icon.js";
import TokenSummary from "../TokenSummary.js";

export default class RoomTitleBar extends DomNode {
  private title: DomNode;
  private tokenSummaryContainer: DomNode;
  private currentTokenAddress: string | undefined;

  constructor() {
    super(".room-title-bar");
    this.append(
      this.title = el("h1"),
      this.tokenSummaryContainer = el(".token-summary-container"),
      el("a.close-button", new Icon("close"), {
        click: () => history.back(),
      }),
    );

    this.onDelegate(
      TokenInfoCacher,
      "tokenInfoChanged",
      (tokenInfo: TokenInfo) => {
        if (tokenInfo.token_address === this.currentTokenAddress) {
          this.displayTokenInfo(tokenInfo);
        }
      },
    );
  }

  public async loadTokenInfo(tokenAddress: string) {
    this.tokenSummaryContainer.empty().append(new TokenSummary(tokenAddress));

    this.currentTokenAddress = tokenAddress;
    this.title.empty();
    const tokenInfo = await TokenInfoCacher.get(tokenAddress);
    if (tokenInfo) {
      this.displayTokenInfo(tokenInfo);
    }
  }

  private displayTokenInfo(tokenInfo: TokenInfo) {
    this.title.text = tokenInfo.metadata.roomName ?? tokenInfo.name;
  }
}
