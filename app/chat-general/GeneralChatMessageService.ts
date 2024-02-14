import { ErrorAlert, msg, Rich, UploadManager } from "@common-module/app";
import { MessageSelectQuery, MessageService } from "@common-module/social";
import ChatMessage from "@common-module/social/lib/database-interface/ChatMessage.js";
import ChatMessageSource from "../chat/ChatMessageSource.js";
import PalSignedUserManager from "../user/PalSignedUserManager.js";

class GeneralChatMessageService
  extends MessageService<ChatMessage<ChatMessageSource>> {
  constructor() {
    super("general_chat_messages", MessageSelectQuery, 100);
  }

  private async upload(files: File[]): Promise<Rich> {
    const rich: Rich = { files: [] };
    await Promise.all(files.map(async (file) => {
      if (PalSignedUserManager.user) {
        try {
          const url = await UploadManager.uploadAttachment(
            "general_chat_upload_files",
            PalSignedUserManager.user.user_id,
            file,
            60 * 60 * 24 * 30,
          );
          rich.files?.push({
            url,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          });
        } catch (e: any) {
          if (e.error === "Payload too large") {
            new ErrorAlert({
              title: msg("file-too-large-alert-title"),
              message: msg("file-too-large-alert-message", {
                maxFileSize: "1 MB",
              }),
            });
          }
          throw e;
        }
      }
    }));
    return rich;
  }

  public async sendMessage(message: string, files: File[]) {
    const rich = files.length ? await this.upload(files) : undefined;
    return await this.safeInsertAndSelect({
      source: ChatMessageSource.Pal,
      message,
      rich,
    });
  }

  public async fetchMessages() {
    return await this.safeSelect((b) => b.order("id", { ascending: false }));
  }

  public async fetchLastMessage() {
    return await this.safeSelectSingle((b) =>
      b.order("id", { ascending: false })
    );
  }
}

export default new GeneralChatMessageService();
