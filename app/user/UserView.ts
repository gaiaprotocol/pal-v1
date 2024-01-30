import { el, View, ViewParams } from "@common-module/app";
import { PreviewUserPublic } from "@common-module/social";
import Layout from "../layout/Layout.js";
import PalUserService from "./PalUserService.js";
import UserDisplay from "./UserDisplay.js";

export default class UserView extends View {
  private userDisplay: UserDisplay | undefined;

  constructor(params: ViewParams, uri: string, data?: any) {
    super();
    Layout.append(this.container = el(".user-view"));
    this.render(params.xUsername!, data);
  }

  public changeParams(params: ViewParams, uri: string, data?: any): void {
    this.render(params.xUsername!, data);
  }

  private async render(xUsername: string, previewUser?: PreviewUserPublic) {
    if (previewUser?.display_name) Layout.changeTitle(previewUser.display_name);

    this.container.empty().append(
      this.userDisplay = new UserDisplay(xUsername, previewUser),
    );

    const user = await PalUserService.fetchByXUsername(xUsername);
    if (user?.display_name) Layout.changeTitle(user.display_name);
    this.userDisplay.user = user;
  }
}
