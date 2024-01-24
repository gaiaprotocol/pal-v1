import { Confirm, DropdownMenu, LoadingSpinner, msg } from "@common-module/app";
import PalPostService from "./PalPostService.js";

export default class PostOwnerMenu extends DropdownMenu {
  constructor(postId: number, options: {
    left: number;
    top: number;
  }) {
    super({
      left: options.left,
      top: options.top,
      items: [{
        title: msg("post-owner-menu-delete-button"),
        click: () => {
          new Confirm({
            title: msg("delete-post-confirm-title"),
            message: msg("delete-post-confirm-message"),
            confirmTitle: msg("delete-post-confirm-delete-button"),
          }, () => PalPostService.deleteMessage(postId));
        },
      }],
    });
  }
}
