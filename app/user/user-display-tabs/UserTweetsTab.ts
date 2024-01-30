import { DomNode, ListLoadingBar } from "@common-module/app";

export default class UserTweetsTab extends DomNode {
  private loaded = false;

  constructor(private xUsername: string) {
    super(".user-tweets-tab");
  }

  public show() {
    this.deleteClass("hidden");
    if (!this.loaded) {
      this.loaded = true;

      const loading = new ListLoadingBar().appendTo(this);

      (window as any).twttr.widgets.createTimeline(
        {
          sourceType: "profile",
          screenName: this.xUsername,
        },
        this.domElement,
        {
          height: 300,
          theme: "dark",
        },
      ).then(() => loading.delete());
    }
  }

  public hide() {
    this.addClass("hidden");
  }
}
