import { DomNode, el } from "common-dapp-module";
import { generateJazziconDataURL } from "common-dapp-module/lib/component/Jazzicon.js";
import { ethers } from "ethers";
import TokenInfoCacher from "../cacher/TokenInfoCacher.js";
import UserDetailsCacher from "../cacher/UserDetailsCacher.js";
import PalContract from "../contract/PalContract.js";
import TokenInfoPopup from "../popup/token/TokenInfoPopup.js";
import UserInfoPopup from "../popup/user/UserInfoPopup.js";

export default class TokenSummary extends DomNode {
  constructor(private tokenAddress: string) {
    super(".token-summary.loading");
    this.onDom("click", () => new TokenInfoPopup(tokenAddress));
    this.loadPrice();
  }

  private async loadPrice() {
    const price = await PalContract.getBuyPrice(
      this.tokenAddress,
      ethers.parseEther("1"),
    );

    const tokenInfo = await TokenInfoCacher.get(this.tokenAddress);
    if (tokenInfo) {
      const tokenOwner = await UserDetailsCacher.get(tokenInfo.owner);
      let profileImageSrc;
      if (tokenOwner) {
        profileImageSrc = tokenOwner.profile_image;
      } else {
        profileImageSrc = generateJazziconDataURL(
          tokenInfo.owner,
        );
      }

      if (tokenOwner && !this.deleted) {
        this.append(
          el("img.profile-image", {
            src: profileImageSrc,
            click: (event) => {
              event.stopPropagation();
              new UserInfoPopup(tokenOwner);
            },
          }),
          el("span.symbol", tokenInfo.symbol),
          el("span.price", `${ethers.formatEther(price)} ETH`),
        );
      }
    }

    this.deleteClass("loading");
  }
}
