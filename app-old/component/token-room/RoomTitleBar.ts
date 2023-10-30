import { DomNode, el } from "common-app-module";
import TokenInfoCacher from "../../cacher/TokenInfoCacher.js";
import TokenInfo from "../../data/TokenInfo.js";
import TokenInfoPopup from "../../popup/token/TokenInfoPopup.js";
import FavoriteButton from "../FavoriteButton.js";
import Icon from "../Icon.js";
import TokenSummary from "../TokenSummary.js";

export default class RoomTitleBar extends DomNode {
  private title: DomNode;
  private tokenSummaryContainer: DomNode;
  private pcFavoriteButton: FavoriteButton;
  private mobileFavoriteButton: FavoriteButton;

  private currentTokenAddress: string | undefined;

  constructor() {
    super(".room-title-bar");
    this.append(
      this.title = el("h1", {
        click: () => {
          if (this.currentTokenAddress) {
            const popup = new TokenInfoPopup(this.currentTokenAddress);
            popup.on("buyToken", () => this.fireEvent("buyToken"));
            popup.on("sellToken", () => this.fireEvent("sellToken"));
          }
        },
      }),
      this.pcFavoriteButton = new FavoriteButton({
        tag: ".pc-favorite-button",
      }),
      this.tokenSummaryContainer = el(".token-summary-container"),
      this.mobileFavoriteButton = new FavoriteButton({
        tag: ".mobile-favorite-button",
      }),
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
    this.tokenSummaryContainer.empty();

    const summary = new TokenSummary(tokenAddress).appendTo(
      this.tokenSummaryContainer,
    );
    summary.on("buyToken", () => this.fireEvent("buyToken"));
    summary.on("sellToken", () => this.fireEvent("sellToken"));

    this.currentTokenAddress = tokenAddress;

    this.pcFavoriteButton.check(tokenAddress);
    this.mobileFavoriteButton.check(tokenAddress);

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
