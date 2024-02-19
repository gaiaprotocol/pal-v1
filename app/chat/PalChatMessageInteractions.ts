import { el, Router } from "@common-module/app";
import { Author, ChatMessageInteractions } from "@common-module/social";
import ChatMessageSource from "./ChatMessageSource.js";

class PalChatMessageInteractions
  implements ChatMessageInteractions<ChatMessageSource | void> {
  public openAuthorProfile(author: Author) {
    Router.go(`/${author.x_username}`, undefined, author);
  }

  public getSourceLabel(source: ChatMessageSource | void) {
    if (source === ChatMessageSource.Discord) {
      return el(
        ".source",
        "from ",
        el("a", "Discord", {
          href: "https://discord.gg/gaia-protocol-931958830873575474",
          target: "_blank",
        }),
      );
    } else if (source === ChatMessageSource.Telegram) {
      return el(
        ".source",
        "from ",
        el("a", "Telegram", {
          href: "https://t.me/gaiaprotocol/17082",
          target: "_blank",
        }),
      );
    }
    return "";
  }
}

export default new PalChatMessageInteractions();
