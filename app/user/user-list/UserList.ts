import { DomNode, ListLoadingBar, Store } from "@common-module/app";
import { SocialUserPublic } from "@common-module/social";
import UserListItem from "./UserListItem.js";

export interface UserListOptions {
  storeName?: string;
  emptyMessage: string;
}

export default abstract class UserList extends DomNode {
  private store: Store | undefined;
  private refreshed = false;

  constructor(tag: string, options: UserListOptions) {
    super(tag + ".user-list");
    this.store = options.storeName ? new Store(options.storeName) : undefined;
    this.domElement.setAttribute("data-empty-message", options.emptyMessage);

    if (this.store) {
      const cached = this.store.get<SocialUserPublic[]>("cached-users");
      if (cached) {
        for (const user of cached) {
          this.addUserItem(user);
        }
      }
    }
  }

  protected abstract fetchUsers(): Promise<SocialUserPublic[]>;

  protected addUserItem(user: SocialUserPublic) {
    new UserListItem(user).appendTo(this);
  }

  protected async refresh() {
    this.append(new ListLoadingBar());

    const users = await this.fetchUsers();
    this.store?.set("cached-users", users, true);

    if (!this.deleted) {
      this.empty();
      for (const user of users) {
        this.addUserItem(user);
      }
      this.refreshed = true;
    }
  }

  public show() {
    this.deleteClass("hidden");
    if (!this.refreshed) this.refresh();
  }

  public hide() {
    this.addClass("hidden");
  }
}
