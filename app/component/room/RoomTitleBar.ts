import { DomNode, el } from "common-dapp-module";
import TokenInfoCacher from "../../cacher/TokenInfoCacher.js";
import TokenInfo from "../../data/TokenInfo.js";
import Icon from "../Icon.js";
import TokenSummary from "../TokenSummary.js";

export default class RoomTitleBar extends DomNode {
  private infoContainer: DomNode;
  private currentTokenAddress: string | undefined;

  constructor() {
    super(".room-title-bar");
    this.append(
      this.infoContainer = el(".info-container"),
      el("a", new Icon("close"), {
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
    this.currentTokenAddress = tokenAddress;
    this.infoContainer.empty();
    const tokenInfo = await TokenInfoCacher.get(tokenAddress);
    if (tokenInfo) {
      this.displayTokenInfo(tokenInfo);
    }
  }

  private displayTokenInfo(tokenInfo: TokenInfo) {
    this.infoContainer.empty().append(
      el("h1", tokenInfo.metadata.roomName ?? tokenInfo.name),
      new TokenSummary(tokenInfo.token_address),
    );
  }
}
