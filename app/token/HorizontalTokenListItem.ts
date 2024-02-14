import { AvatarUtil, DomNode, el, StringUtil } from "@common-module/app";
import { ethers } from "ethers";
import Token from "../database-interface/Token.js";
import { TokenInfoPopup } from "../index.js";

export default class HorizontalTokenListItem extends DomNode {
  constructor(token: Token) {
    super(".horizontal-token-list-item");

    const tokenImage = el(".token-image");

    AvatarUtil.selectLoadable(tokenImage, [
      token.image_thumb,
      token.stored_image_thumb,
    ]);

    const tokenName = el("a", token.name);
    const symbol = el("a", " (", token.symbol, ").");
    const holderCount = StringUtil.numberWithCommas(String(token.holder_count));
    const price = StringUtil.numberWithCommas(
      ethers.formatEther(token.last_fetched_price),
    );

    this.append(
      el("header", tokenImage),
      el(
        "main",
        el("p.description", tokenName, symbol),
        el(
          ".info",
          holderCount,
          token.holder_count === 1 ? " holder, " : " holders, ",
          el(
            "span.price" +
              (token.is_price_up === undefined
                ? ""
                : (token.is_price_up ? ".up" : ".down")),
            price,
            " ETH.",
          ),
        ),
      ),
    ).onDom(
      "click",
      () => new TokenInfoPopup(token.chain, token.token_address, token),
    );
  }
}
