import { AvatarUtil, DomNode, el, MaterialIcon } from "@common-module/app";
import BlockchainType from "../blockchain/BlockchainType.js";
import Token from "../database-interface/Token.js";
import { TokenInfoPopup } from "../index.js";
import TokenService from "../token/TokenService.js";

export default class TokenChatRoomHeader extends DomNode {
  private tokenImage: DomNode;
  private title: DomNode;
  private token: Token | undefined;

  constructor(
    private chain: BlockchainType,
    private tokenAddress: string,
    previewToken?: Token,
  ) {
    super(".token-chat-room-header");

    this.tokenImage = el(".token-image", {
      click: () =>
        new TokenInfoPopup(
          chain,
          tokenAddress,
          this.token,
          previewToken,
        ),
    });

    AvatarUtil.selectLoadable(this.tokenImage, [
      previewToken?.image_thumb,
      previewToken?.stored_image_thumb,
    ]);

    this.append(
      el("button.back", new MaterialIcon("arrow_back"), {
        click: () => history.back(),
      }),
      this.tokenImage,
      this.title = el(
        "h1",
        previewToken?.name,
        {
          click: () =>
            new TokenInfoPopup(
              chain,
              tokenAddress,
              this.token,
              previewToken,
            ),
        },
      ),
    );

    this.fetchToken();
  }

  private async fetchToken() {
    this.token = await TokenService.fetchToken(this.chain, this.tokenAddress);
    if (this.token) {
      AvatarUtil.selectLoadable(this.tokenImage, [
        this.token.image_thumb,
        this.token.stored_image_thumb,
      ]);

      this.title.text = this.token.name;
    }
  }
}
