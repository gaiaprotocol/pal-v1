import {
  Button,
  ButtonType,
  Component,
  DomNode,
  el,
  Popup,
} from "common-dapp-module";
import TokenList, { TokenListFilter } from "../../component/list/TokenList.js";
import ProfileImageDisplay from "../../component/ProfileImageDisplay.js";
import Tabs from "../../component/tab/Tabs.js";
import UserDetails from "../../data/UserDetails.js";
import Icon from "../../component/Icon.js";

export default class UserInfoPopup extends Popup {
  public content: DomNode;

  private socialLinks: DomNode;
  private tabs: Tabs;
  private tokenList: TokenList;

  constructor(userDetails: UserDetails) {
    super({ barrierDismissible: true });
    this.append(
      this.content = new Component(
        ".user-info-popup",
        el(
          "h1",
          new ProfileImageDisplay(userDetails.profile_image),
          el("span.name", userDetails.display_name),
        ),
        el(
          "main",
          this.socialLinks = el(
            "ul.social-links",
            el(
              "li.x",
              el("span.icon", "𝕏"),
              el(
                "a",
                {
                  href: `https://x.com/${userDetails.metadata.xUsername}`,
                  target: "_blank",
                },
                `@${userDetails.metadata.xUsername}`,
              ),
            ),
          ),
        ),
        this.tabs = new Tabs([
          { id: "tokens", label: "Tokens" },
        ]),
        this.tokenList = new TokenList(
          TokenListFilter.SpecificUser,
          userDetails.wallet_address,
        ),
        el(
          "footer",
          new Button({
            type: ButtonType.Text,
            tag: ".close-button",
            click: () => this.delete(),
            title: "Close",
          }),
        ),
      ),
    );

    this.tabs.on("select", (id: string) => {
      this.tokenList.inactive();

      if (id === "tokens") {
        this.tokenList.active();
      }
    });
    this.tabs.select("tokens");
  }
}
