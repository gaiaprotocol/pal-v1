import { ErrorAlert, msg, Rich, UploadManager } from "@common-module/app";
import { MessageSelectQuery, MessageService } from "@common-module/social";
import BlockchainType from "../blockchain/BlockchainType.js";
import TokenChatMessage from "../database-interface/TokenChatMessage.js";
import PalSignedUserManager from "../user/PalSignedUserManager.js";

class TokenChatMessageService extends MessageService<TokenChatMessage> {
  constructor() {
    super("token_chat_messages", MessageSelectQuery, 100);
  }

  private async upload(files: File[]): Promise<Rich> {
    const rich: Rich = { files: [] };
    await Promise.all(files.map(async (file) => {
      if (PalSignedUserManager.user) {
        try {
          const url = await UploadManager.uploadAttachment(
            "token_chat_upload_files",
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

  public async sendMessage(
    chain: BlockchainType,
    tokenAddress: string,
    message: string,
    files: File[],
  ) {
    const rich = files.length ? await this.upload(files) : undefined;
    return await this.safeInsertAndSelect({
      chain,
      token_address: tokenAddress,
      message,
      rich,
    });
  }

  public async fetchMessages(chain: BlockchainType, tokenAddress: string) {
    return await this.safeSelect((b) =>
      b.eq("chain", chain).eq("token_address", tokenAddress).order("id", {
        ascending: false,
      })
    );
  }
}

export default new TokenChatMessageService();
