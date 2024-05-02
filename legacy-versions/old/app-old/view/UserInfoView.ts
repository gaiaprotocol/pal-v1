import { DomNode, el, View, ViewParams } from "@common-module/app";
import UserDetailsCacher from "../cacher/UserDetailsCacher.js";
import TokenList, { TokenListFilter } from "../component/list/TokenList.js";
import ListLoading from "../component/ListLoading.js";
import ProfileImageDisplay from "../component/ProfileImageDisplay.js";
import Tabs from "../component/tab/Tabs.js";
import SupabaseManager from "../SupabaseManager.js";
import Layout from "./Layout.js";

export default class UserInfoView extends View {
  private container: DomNode;

  private socialLinks: DomNode | undefined;
  private timeline: DomNode | undefined;
  private timelineLoading: ListLoading | undefined;
  private tabs: Tabs | undefined;
  private tokenList: TokenList | undefined;

  constructor(params: ViewParams) {
    super();
    Layout.append(
      this.container = el(
        ".user-info-view",
      ),
    );
    if (params.xUsername) {
      this.loadXUser(params.xUsername);
    }
  }

  public changeParams(params: ViewParams): void {
    if (params.xUsername) {
      this.loadXUser(params.xUsername);
    }
  }

  private async loadXUser(xUsername: string): Promise<void> {
    const { data, error } = await SupabaseManager.supabase.from(
      "user_details",
    )
      .select("*")
      .eq("metadata ->> xUsername", xUsername);
    if (error) {
      console.error(error);
      return;
    }

    const userDetails = data?.[0];

    this.container.empty();
    if (!userDetails) {
      this.container.append(
        el("h1", "User not found"),
      );
    } else {
      UserDetailsCacher.set(userDetails);

      let profileImage;
      this.container.append(
        el(
          "h1",
          profileImage = new ProfileImageDisplay(),
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
          this.timeline = el(
            ".timeline",
            this.timelineLoading = new ListLoading(),
          ),
        ),
        this.tabs = new Tabs([
          { id: "tokens", label: "Tokens" },
        ]),
        this.tokenList = new TokenList(
          TokenListFilter.SpecificUser,
          userDetails.wallet_address,
        ),
      );

      profileImage.load(userDetails.wallet_address);

      this.tabs.on("select", (id: string) => {
        this.tokenList?.inactive();

        if (id === "tokens") {
          this.tokenList?.active();
        }
      });
      this.tabs.select("tokens");

      let timelineWidth = this.container.rect.width - 48;
      if (timelineWidth > 600) {
        timelineWidth = 600;
      }

      (window as any).twttr.widgets.createTimeline(
        {
          sourceType: "profile",
          screenName: userDetails.metadata.xUsername,
        },
        this.timeline.domElement,
        {
          width: timelineWidth,
          height: 300,
          theme: "dark",
        },
      ).then(() => this.timelineLoading?.delete());
    }
  }

  public close(): void {
    this.container.delete();
    super.close();
  }
}
