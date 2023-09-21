import { DomNode, el } from "common-dapp-module";
import dayjs from "dayjs";
import SupabaseManager from "../../../SupabaseManager.js";
import UserDetailsCacher from "../../../cacher/UserDetailsCacher.js";
import ChatMessage, { UploadedFile } from "../../../data/ChatMessage.js";
import OpenMoji from "../../../openmoji/OpenMoji.js";
import UserInfoPopup from "../../../popup/user/UserInfoPopup.js";

export default class MessageItem extends DomNode {
  constructor(public message: ChatMessage) {
    super(".message-item");
    this.append(
      el(
        "a.author",
        el("img.profile-image", { src: message.author_avatar_url }),
        el("span.name", message.author_name),
        {
          click: async () => {
            const { data, error } = await SupabaseManager.supabase.from(
              "user_details",
            )
              .select().eq("id", message.author).single();
            if (error) {
              throw error;
            }
            if (data) {
              UserDetailsCacher.set(data);
              new UserInfoPopup(data);
            }
          },
        },
      ),
      !message.message ? undefined : el("span.message", message.message),
      !message.rich ? undefined : this.getRich(message.rich),
      el("span.time", dayjs(message.created_at).fromNow()),
    );
  }

  private getRich(rich: {
    files?: UploadedFile[];
    emojis?: string[];
  }) {
    if (rich.files) {
      return el(
        ".files",
        ...rich.files.map((file) =>
          el(
            ".file",
            el("a", { href: file.url, target: "_blank" }, file.fileName),
            " ",
            el("span.file-size", `(${file.fileSize} bytes)`),
            ...(!file.thumbnailURL ? [] : [
              el(
                ".image-container",
                el(
                  "a",
                  el("img", {
                    src: file.thumbnailURL,
                    load: () => this.fireEvent("uploadImageLoaded"),
                  }),
                  {
                    href: file.url,
                    target: "_blank",
                  },
                ),
              ),
            ]),
          )
        ),
      );
    }
    if (rich.emojis) {
      return el(
        ".emojis",
        ...rich.emojis.map((emoji) =>
          el("img.emoji", {
            src: OpenMoji.getEmojiURL(emoji.substring(emoji.indexOf(":") + 1)),
          })
        ),
      );
    }
    return undefined;
  }

  public wait() {
    this.addClass("wait");
  }

  public done() {
    this.deleteClass("wait");
  }
}
