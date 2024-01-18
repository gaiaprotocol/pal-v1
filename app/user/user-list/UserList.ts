import { DomNode, ListLoadingBar, Store } from "@common-module/app";
import PalUserPublic from "../../database-interface/PalUserPublic.js";

export interface UserListOptions {
  storeName?: string;
  emptyMessage: string;
}

export default abstract class UserList<UT extends PalUserPublic>
  extends DomNode {
  private store: Store | undefined;
  private refreshed = false;

  constructor(tag: string, options: UserListOptions) {
    super(tag + ".user-list");
    this.store = options.storeName ? new Store(options.storeName) : undefined;
    this.domElement.setAttribute("data-empty-message", options.emptyMessage);

    if (this.store) {
      const cached = this.store.get<UT[]>("cached-users");
      if (cached) {
        for (const user of cached) {
          this.addUserItem(user);
        }
      }
    }
  }

  protected abstract fetchUsers(): Promise<UT[]>;
  protected abstract addUserItem(user: UT): void;

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
