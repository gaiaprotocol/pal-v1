import {
  Button,
  el,
  MaterialIcon,
  msg,
  Tabs,
  View,
  ViewParams,
} from "@common-module/app";
import { FollowingPostList, GlobalPostList } from "@common-module/social";
import PalPost from "../database-interface/PalPost.js";
import Layout from "../layout/Layout.js";
import PalSignedUserManager from "../user/PalSignedUserManager.js";
import NewPostForm from "./NewPostForm.js";
import PalPostInteractions from "./PalPostInteractions.js";
import PalPostService from "./PalPostService.js";
import PostLoadingAnimation from "./PostLoadingAnimation.js";
import PostPopup from "./PostPopup.js";
import TokenHeldPostList from "./TokenHeldPostList.js";

export default class PostsView extends View {
  private tabs: Tabs | undefined;
  private globalPostList: GlobalPostList<PalPost>;
  private followingPostList: FollowingPostList<PalPost> | undefined;
  private tokenHeldPostList: TokenHeldPostList | undefined;

  constructor(params: ViewParams) {
    super();

    Layout.append(
      this.container = el(
        ".posts-view",
        el(
          "main",
          PalSignedUserManager.signed ? new NewPostForm() : undefined,
          el(
            ".post-container",
            PalSignedUserManager.signed
              ? this.tabs = new Tabs(
                "posts-view-tabs",
                PalSignedUserManager.walletLinked
                  ? [
                    { id: "global", label: msg("posts-view-global-tab") },
                    { id: "following", label: msg("posts-view-following-tab") },
                    {
                      id: "token-held",
                      label: msg("posts-view-token-held-tab"),
                    },
                  ]
                  : [
                    { id: "global", label: msg("posts-view-global-tab") },
                    { id: "following", label: msg("posts-view-following-tab") },
                  ],
              )
              : undefined,
            this.globalPostList = new GlobalPostList<PalPost>(
              PalPostService,
              {
                signedUserId: PalSignedUserManager.user?.user_id,
                wait: true,
              },
              PalPostInteractions,
              new PostLoadingAnimation(),
            ),
            PalSignedUserManager.signed
              ? this.followingPostList = new FollowingPostList(
                PalPostService,
                {
                  signedUserId: PalSignedUserManager.user?.user_id!,
                  wait: true,
                },
                PalPostInteractions,
                new PostLoadingAnimation(),
              )
              : undefined,
            PalSignedUserManager.walletLinked
              ? this.tokenHeldPostList = new TokenHeldPostList()
              : undefined,
          ),
        ),
        PalSignedUserManager.signed
          ? new Button({
            tag: ".post",
            icon: new MaterialIcon("add"),
            click: () => new PostPopup(),
          })
          : undefined,
      ),
    );

    if (!this.tabs) {
      this.globalPostList.show();
    } else {
      this.tabs.on("select", (id: string) => {
        [this.globalPostList, this.followingPostList, this.tokenHeldPostList]
          .forEach((list) => list?.hide());
        if (id === "global") this.globalPostList.show();
        else if (id === "following") this.followingPostList?.show();
        else if (id === "token-held") this.tokenHeldPostList?.show();
      }).init();
    }
  }
}
