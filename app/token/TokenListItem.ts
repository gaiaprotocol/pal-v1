import {
  AvatarUtil,
  DomNode,
  el,
  Router,
  StringUtil,
} from "@common-module/app";
import { ethers } from "ethers";
import Token from "../database-interface/Token.js";
import PalSignedUserManager from "../user/PalSignedUserManager.js";
import TokenInfoPopup from "./TokenInfoPopup.js";

export default class TokenListItem extends DomNode {
  constructor(token: Token) {
    super(".token-list-item");

    const tokenImage = el(".token-image", {
      click: () => new TokenInfoPopup(token.chain, token.token_address, token),
    });

    AvatarUtil.selectLoadable(tokenImage, [
      token.image_thumb,
      token.stored_image_thumb,
    ]);

    const owner = el(
      "a",
      typeof token.owner === "string"
        ? StringUtil.shortenEthereumAddress(token.owner)
        : token.owner.display_name,
      {
        click: () =>
          typeof token.owner === "string"
            ? undefined
            : Router.go(`/${token.owner.x_username}`),
      },
    );

    const tokenName = el("a", token.name, {
      click: () => new TokenInfoPopup(token.chain, token.token_address, token),
    });

    const symbol = el("a", " (", token.symbol, ").", {
      click: () => new TokenInfoPopup(token.chain, token.token_address, token),
    });

    const holderCount = StringUtil.numberWithCommas(String(token.holder_count));

    const price = StringUtil.numberWithCommas(
      ethers.formatEther(token.last_fetched_price),
    );

    this.append(
      el("header", tokenImage),
      el(
        "main",
        el(
          "p.description",
          ...((typeof token.owner === "string"
              ? token.owner
              : token.owner.wallet_address) ===
              PalSignedUserManager.user?.wallet_address
            ? ["Your token "]
            : [owner, "'s token "]),
          tokenName,
          symbol,
        ),
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
