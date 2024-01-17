import { DomNode, el, Router, StringUtil } from "@common-module/app";
import { AvatarUtil } from "@common-module/social";
import { ethers } from "ethers";
import Token from "../database-interface/Token.js";
import TokenInfoPopup from "./TokenInfoPopup.js";

export default class TokenListItem extends DomNode {
  constructor(token: Token) {
    super(".token-list-item");

    const tokenImage = el(".token-image", {
      click: () => new TokenInfoPopup(),
    });

    AvatarUtil.selectLoadable(tokenImage, [
      token.image_thumb,
      token.stored_image_thumb,
    ]);

    const owner = el("a", token.owner.display_name, {
      click: () => Router.go(`/${token.owner.x_username}`),
    });

    const tokenName = el("a", token.name, {
      click: () => new TokenInfoPopup(),
    });

    const symbol = el("a", " (", token.symbol, ").", {
      click: () => new TokenInfoPopup(),
    });

    const holderCount = StringUtil.numberWithCommas(String(token.holder_count));

    const price = StringUtil.numberWithCommas(
      ethers.formatEther(token.last_fetched_price),
    );

    this.append(
      el("header", tokenImage),
      el(
        "main",
        el("p.description", owner, "'s token ", tokenName, symbol),
        el(
          ".info",
          holderCount,
          " holders, ",
          el(
            "span.price" + (token.is_price_up ? ".up" : ".down"),
            price,
            " ETH.",
          ),
        ),
      ),
    );
  }
}
