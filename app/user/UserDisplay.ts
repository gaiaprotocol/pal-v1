import { DomNode, el, Tabs } from "@common-module/app";
import { PreviewUserPublic } from "@common-module/social";
import PalUserPublic from "../database-interface/PalUserPublic.js";
import UserBioTab from "./user-display-tabs/UserBioTab.js";
import UserCommentsTab from "./user-display-tabs/UserCommentsTab.js";
import UserHoldingTokensTab from "./user-display-tabs/UserHoldingTokensTab.js";
import UserLikedPostsTab from "./user-display-tabs/UserLikedPostsTab.js";
import UserOwnedTokensTab from "./user-display-tabs/UserOwnedTokensTab.js";
import UserPostsTab from "./user-display-tabs/UserPostsTab.js";
import UserRepostsTab from "./user-display-tabs/UserRepostsTab.js";
import UserTweetsTab from "./user-display-tabs/UserTweetsTab.js";
import UserProfile from "./UserProfile.js";

export default class UserDisplay extends DomNode {
  private userId: string | undefined;
  private userBio: string | undefined;

  private userProfile: UserProfile;
  private bioAndTweetTabContainer: DomNode;
  private tokenTabContainer: DomNode;
  private postAndFollowerTabContainer: DomNode;

  private bioAndTweetTabs: Tabs | undefined;

  constructor(
    private xUsername: string,
    previewUser: PreviewUserPublic | undefined,
  ) {
    super(".user-display");

    this.append(
      this.userProfile = new UserProfile(xUsername, previewUser),
      this.bioAndTweetTabContainer = el(".bio-and-tweet-tab-container"),
      this.tokenTabContainer = el(".token-tab-container"),
      this.postAndFollowerTabContainer = el(".post-and-follower-tab-container"),
    );

    if (previewUser) {
      this.userId = previewUser.user_id;
      this.renderTabs();
    }
  }

  public set user(user: PalUserPublic | undefined) {
    if (!user) {
      this.userProfile.user = undefined;
      [
        this.bioAndTweetTabContainer,
        this.tokenTabContainer,
        this.postAndFollowerTabContainer,
      ].forEach((container) => container.empty());
    } else {
      this.userProfile.user = user;

      if (user.user_id !== this.userId) {
        this.userId = user.user_id;
        this.userBio = user.metadata?.bio;
        this.renderTabs();
      }
    }

    if (this.bioAndTweetTabs && !this.bioAndTweetTabs.deleted) {
      this.bioAndTweetTabs.select(
        this.userBio ? "user-bio" : "user-tweets",
      );
    }
  }

  private renderTabs() {
    const bioTab = new UserBioTab(this.userBio);
    const tweetsTab = new UserTweetsTab(this.xUsername);
    this.bioAndTweetTabs = new Tabs("bio-and-tweet-tabs", [{
      id: "user-bio",
      label: "Bio",
    }, {
      id: "user-tweets",
      label: "Tweets",
    }]).on(
      "select",
      (id: string) => {
        [bioTab, tweetsTab].forEach((tab) => tab.hide());
        if (id === "user-bio") bioTab.show();
        else if (id === "user-tweets") tweetsTab.show();
      },
    ).init();
    this.bioAndTweetTabContainer.empty().append(
      this.bioAndTweetTabs,
      bioTab,
      tweetsTab,
    );

    const ownedTokensTab = new UserOwnedTokensTab(this.userId!);
    const holdingTokensTab = new UserHoldingTokensTab(this.userId!);
    const tokenTabs = new Tabs("token-tabs", [{
      id: "user-owned-tokens",
      label: "Owned Tokens",
    }, {
      id: "user-holding-tokens",
      label: "Holding Tokens",
    }]).on(
      "select",
      (id: string) => {
        [ownedTokensTab, holdingTokensTab].forEach((tab) => tab.hide());
        if (id === "user-owned-tokens") ownedTokensTab.show();
        else if (id === "user-holding-tokens") holdingTokensTab.show();
      },
    ).init();
    this.tokenTabContainer.empty().append(
      tokenTabs,
      ownedTokensTab,
      holdingTokensTab,
    );

    const postsTab = new UserPostsTab(this.userId!);
    const commentsTab = new UserCommentsTab(this.userId!);
    const repostsTab = new UserRepostsTab(this.userId!);
    const likedPostsTab = new UserLikedPostsTab(this.userId!);
    const postAndFollowerTabs = new Tabs("post-and-follower-tabs", [{
      id: "user-posts",
      label: "Posts",
    }, {
      id: "user-comments",
      label: "Comments",
    }, {
      id: "user-reposts",
      label: "Reposts",
    }, {
      id: "user-liked-posts",
      label: "Liked",
    }]).on(
      "select",
      (id: string) => {
        [postsTab, commentsTab, repostsTab, likedPostsTab].forEach((tab) =>
          tab.hide()
        );
        if (id === "user-posts") postsTab.show();
        else if (id === "user-comments") commentsTab.show();
        else if (id === "user-reposts") repostsTab.show();
        else if (id === "user-liked-posts") likedPostsTab.show();
      },
    ).init();
    this.postAndFollowerTabContainer.empty().append(
      postAndFollowerTabs,
      postsTab,
      commentsTab,
      repostsTab,
      likedPostsTab,
    );
  }
}
