import { Button, DomNode, el } from "common-app-module";
import { ethers } from "ethers";
import { v4 as uuidv4 } from "uuid";
import SupabaseManager from "../../../SupabaseManager.js";
import TokenInfoCacher from "../../../cacher/TokenInfoCacher.js";
import UserDetailsCacher from "../../../cacher/UserDetailsCacher.js";
import { MessageType, UploadedFile } from "../../../data/ChatMessage.js";
import SelectEmojiPopup from "../../../popup/SelectEmojiPopup.js";
import BuyTokenPopup from "../../../popup/token/BuyTokenPopup.js";
import UserManager from "../../../user/UserManager.js";
import WalletManager from "../../../user/WalletManager.js";
import Icon from "../../Icon.js";
import MessageList from "./MessageList.js";

export default class MessageForm extends DomNode {
  private emojiButton: DomNode<HTMLButtonElement>;
  private uploadInput: DomNode<HTMLInputElement>;
  private uploadButton: DomNode<HTMLButtonElement>;
  private messageInput: DomNode<HTMLInputElement>;
  private hidingMessage: DomNode;

  constructor(private list: MessageList) {
    super(".message-form");

    this.append(
      this.uploadInput = el("input.upload-input", {
        type: "file",
        accept: "image/*",
        change: (event) => {
          const file = event.target.files?.[0];
          if (file) {
            this.upload(file);
          }
        },
      }),
      this.emojiButton = el("a.emoji-button", new Icon("mood"), {
        click: () =>
          new SelectEmojiPopup((selectedEmoji) =>
            this.sendEmoji(selectedEmoji)
          ),
      }),
      this.uploadButton = el(
        "a.upload-button",
        new Icon("upload"),
        { click: () => this.uploadInput.domElement.click() },
      ),
      el(
        "form",
        this.messageInput = el("input"),
        new Button({
          title: "Send",
        }),
        {
          submit: (event) => {
            event.preventDefault();
            this.sendMessage();
          },
        },
      ),
      this.hidingMessage = el(
        "p.hiding-message",
      ),
    );
  }

  private async upload(file: File) {
    this.uploadButton.domElement.disabled = true;
    this.uploadButton.empty().addClass("loading");

    if (UserManager.user && file) {
      const { data: uploadData, error: uploadError } = await SupabaseManager
        .supabase
        .storage
        .from("upload_files")
        .upload(
          `${UserManager.user.id}/${uuidv4()}_${file.name}`,
          file,
        );
      if (uploadError) {
        console.error(uploadError);
      }
      if (uploadData) {
        const { data: getURLData, error: getURLError } = await SupabaseManager
          .supabase
          .storage
          .from("upload_files")
          .createSignedUrl(uploadData.path, 60 * 60 * 24 * 30); // 30 days

        if (getURLError) {
          console.error(getURLError);
        }
        if (getURLData) {
          const fileInfo: UploadedFile = {
            url: getURLData.signedUrl,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          };

          const { data: getThumbnailData, error: getThumbnailError } =
            await SupabaseManager.supabase
              .storage
              .from("upload_files")
              .createSignedUrl(uploadData.path, 60 * 60 * 24 * 30, {
                transform: {
                  width: 32,
                  height: 32,
                },
              }); // 7 days
          if (getThumbnailError) {
            console.error(getThumbnailError);
          }

          if (getThumbnailData) {
            fileInfo.thumbnailURL = getThumbnailData.signedUrl;
          }

          await this.sendFile(fileInfo);
        }
      }
    }

    this.uploadInput.domElement.value = "";
    this.uploadButton.domElement.disabled = false;
    this.uploadButton.deleteClass("loading");
    this.uploadButton.empty().append(new Icon("upload"));
  }

  private async sendFile(file: UploadedFile) {
    if (UserManager.user) {
      const item = this.list.add({
        id: -1,
        token_address: this.list.tokenAddress,
        message_type: MessageType.FILE_UPLOAD,
        rich: {
          files: [file],
        },
        author: UserManager.user.id,
        author_name: UserManager.user.user_metadata.full_name,
        author_avatar_url: UserManager.user.user_metadata.avatar_url,
        created_at: new Date().toISOString(),
      });
      item.wait();

      const { data, error } = await SupabaseManager.supabase.from(
        "token_chat_messages",
      )
        .insert({
          token_address: this.list.tokenAddress,
          message_type: MessageType.FILE_UPLOAD,
          rich: {
            files: [file],
          },
          author_name: UserManager.user.user_metadata.full_name,
          author_avatar_url: UserManager.user.user_metadata.avatar_url,
        }).select();

      if (error) {
        console.error(error);
      }

      if (data?.[0]) {
        const id = data[0].id;
        this.list.findItem(id)?.delete();
        item.message.id = id;
        item.done();
      }
    }
  }

  private async sendEmoji(emoji: string) {
    this.emojiButton.domElement.disabled = true;
    this.emojiButton.empty().addClass("loading");

    if (UserManager.user) {
      const item = this.list.add({
        id: -1,
        token_address: this.list.tokenAddress,
        message_type: MessageType.EMOJI,
        rich: {
          emojis: [`openmoji:${emoji}`],
        },
        author: UserManager.user.id,
        author_name: UserManager.user.user_metadata.full_name,
        author_avatar_url: UserManager.user.user_metadata.avatar_url,
        created_at: new Date().toISOString(),
      });
      item.wait();

      const { data, error } = await SupabaseManager.supabase.from(
        "token_chat_messages",
      )
        .insert({
          token_address: this.list.tokenAddress,
          message_type: MessageType.EMOJI,
          rich: {
            emojis: [`openmoji:${emoji}`],
          },
          author_name: UserManager.user.user_metadata.full_name,
          author_avatar_url: UserManager.user.user_metadata.avatar_url,
        }).select();

      if (error) {
        console.error(error);
      }

      if (data?.[0]) {
        const id = data[0].id;
        this.list.findItem(id)?.delete();
        item.message.id = id;
        item.done();
      }
    }

    this.emojiButton.domElement.disabled = false;
    this.emojiButton.deleteClass("loading");
    this.emojiButton.empty().append(new Icon("mood"));
  }

  private async sendMessage() {
    const message = this.messageInput.domElement.value;
    if (!message) {
      return;
    }
    this.messageInput.domElement.value = "";
    if (UserManager.user) {
      const item = this.list.add({
        id: -1,
        token_address: this.list.tokenAddress,
        message,
        message_type: MessageType.MESSAGE,
        author: UserManager.user.id,
        author_name: UserManager.user.user_metadata.full_name,
        author_avatar_url: UserManager.user.user_metadata.avatar_url,
        created_at: new Date().toISOString(),
      });
      item.wait();

      const { data, error } = await SupabaseManager.supabase.from(
        "token_chat_messages",
      )
        .insert({
          token_address: this.list.tokenAddress,
          message,
          message_type: MessageType.MESSAGE,
          author_name: UserManager.user.user_metadata.full_name,
          author_avatar_url: UserManager.user.user_metadata.avatar_url,
        }).select();

      if (error) {
        console.error(error);
      }

      if (data?.[0]) {
        const id = data[0].id;
        this.list.findItem(id)?.delete();
        item.message.id = id;
        item.done();
      }
    }
  }

  public focus(): void {
    this.messageInput.domElement.focus();
  }

  public async hide() {
    this.addClass("hidden");

    const tokenInfo = await TokenInfoCacher.get(this.list.tokenAddress);
    if (tokenInfo) {
      const tokenOwner = await UserDetailsCacher.get(tokenInfo.owner);
      this.hidingMessage.empty().append(
        el(
          "p",
          "Hold at least ",
          el("b", ethers.formatEther(tokenInfo.write_token_required)),
          ` ${tokenInfo.symbol} to send messages. This was set by ${tokenOwner?.display_name}.`,
        ),
        new Button({
          title: "Buy",
          click: async () => {
            if (!WalletManager.connected) {
              await WalletManager.connect();
            }
            const popup = new BuyTokenPopup(this.list.tokenAddress);
            popup.on("buyToken", () => this.fireEvent("buyToken"));
          },
        }),
      );
    }
  }

  public show(): void {
    console.log("show");
    this.deleteClass("hidden");
  }
}
