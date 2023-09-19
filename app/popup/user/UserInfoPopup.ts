import {
  Button,
  ButtonType,
  Component,
  DomNode,
  el,
  Popup,
} from "common-dapp-module";
import Icon from "../../component/Icon.js";
import TokenList, { TokenListFilter } from "../../component/list/TokenList.js";
import ProfileImageDisplay from "../../component/ProfileImageDisplay.js";
import Tabs from "../../component/tab/Tabs.js";
import UserDetails from "../../data/UserDetails.js";

export default class UserInfoPopup extends Popup {
  public content: DomNode;

  private socialLinks: DomNode;
  private timeline: DomNode;
  private tabs: Tabs;
  private tokenList: TokenList;

  constructor(userDetails: UserDetails) {
    super({ barrierDismissible: true });

    let profileImage;
    this.append(
      this.content = new Component(
        ".user-info-popup",
        el(
          "h1",
          profileImage = new ProfileImageDisplay(),
          el("span.name", userDetails.display_name),
          el("a.close-button", new Icon("close"), {
            click: () => this.delete(),
          }),
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
          this.timeline = el(".timeline"),
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

    profileImage.load(userDetails.wallet_address);

    this.tabs.on("select", (id: string) => {
      this.tokenList.inactive();

      if (id === "tokens") {
        this.tokenList.active();
      }
    });
    this.tabs.select("tokens");

    (window as any).twttr.widgets.createTimeline(
      {
        sourceType: "profile",
        screenName: userDetails.metadata.xUsername,
      },
      this.timeline.domElement,
      {
        width: 552,
        height: 300,
        theme: "dark",
      },
    );
  }
}
