import { DomNode } from "common-app-module";

export default class RoomDashboard extends DomNode {
  constructor() {
    super(".room-dashboard");
  }

  public active(): void {
    this.addClass("active");
  }

  public inactive(): void {
    this.deleteClass("active");
  }
}
