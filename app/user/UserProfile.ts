import {
  AvatarUtil,
  Constants,
  DateUtil,
  DomNode,
  el,
  LoadingSpinner,
  MaterialIcon,
  msg,
} from "@common-module/app";
import { PreviewUserPublic } from "@common-module/social";
import { ethers } from "ethers";
import PalUserPublic from "../database-interface/PalUserPublic.js";
import UserWalletDataService from "../wallet/UserWalletDataService.js";
import PalUserService from "./PalUserService.js";

export default class UserProfile extends DomNode {
  private userWalletAddress: string | undefined;

  private infoContainer: DomNode;
  private feesEarnedDisplay: DomNode;
  private portfolioValueDisplay: DomNode;

  constructor(xUsername: string, previewUser: PreviewUserPublic | undefined) {
    super(".user-profile");
    this.append(
      this.infoContainer = el(".info-container"),
      el(
        ".metrics-container",
        el("h2", msg("user-profile-metrics-title")),
        el(
          "section.earned",
          el(".icon-container", new MaterialIcon("savings")),
          el(
            ".metric",
            el("h3", msg("user-profile-metrics-fees-earned-title")),
            this.feesEarnedDisplay = el(".value", new LoadingSpinner()),
          ),
        ),
        el(
          "section.portfolio-value",
          el(".icon-container", new MaterialIcon("account_balance")),
          el(
            ".metric",
            el("h3", msg("user-profile-metrics-portfolio-value-title")),
            this.portfolioValueDisplay = el(".value", new LoadingSpinner()),
          ),
        ),
      ),
    );
    if (previewUser) this.renderUserInfo(previewUser);
  }

  public set user(user: PalUserPublic | undefined) {
    this.infoContainer.empty();
    if (!user) {
      this.feesEarnedDisplay.text = "0";
      this.portfolioValueDisplay.text = "0";
    } else {
      this.renderUserInfo(user);
      if (user.wallet_address !== this.userWalletAddress) {
        this.userWalletAddress = user.wallet_address;
        this.fetchFeesEarned();
        this.fetchPortfolioValue();
      }
    }
  }

  private renderUserInfo(user: PreviewUserPublic & { created_at?: string }) {
    const avatar = el(".trader-avatar");

    AvatarUtil.selectLoadable(avatar, [
      user.avatar_thumb,
      user.stored_avatar_thumb,
    ]);

    this.infoContainer.append(
      avatar,
      el(
        ".info",
        el("h2", user.display_name),
        el("h3", `@${user.x_username}`, {
          href: `https://x.com/${user.x_username}`,
          target: "_blank",
        }),
        el(
          ".link",
          `https://pal.social/${user.x_username}`,
          el("button.copy", new MaterialIcon("content_copy"), {
            click: (event, button) => {
              navigator.clipboard.writeText(
                `https://pal.social/${user.x_username}`,
              );
              button.empty().append(new MaterialIcon("check"));
            },
          }),
        ),
        el(
          "p",
          msg("user-profile-joined", {
            date: DateUtil.format(
              user.created_at ?? Constants.NEGATIVE_INFINITY,
            ),
          }),
        ),
        el(
          ".actions",
          el("a", "𝕏", {
            href: `https://twitter.com/${user.x_username}`,
            target: "_blank",
          }),
        ),
      ),
    );
  }

  private async fetchFeesEarned() {
    const walletData = this.userWalletAddress
      ? await UserWalletDataService.fetch(
        this.userWalletAddress,
      )
      : undefined;
    this.feesEarnedDisplay.text = ethers.formatEther(
      walletData ? walletData.total_earned_trading_fees : "0",
    );
  }

  private async fetchPortfolioValue() {
    const portfolioValue = this.userWalletAddress
      ? await PalUserService.fetchPortfolioValue(this.userWalletAddress)
      : "0";
    this.portfolioValueDisplay.text = ethers.formatEther(portfolioValue);
  }
}
