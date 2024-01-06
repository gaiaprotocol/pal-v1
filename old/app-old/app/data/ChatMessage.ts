export enum MessageType {
  MESSAGE,
  FILE_UPLOAD,
  EMOJI,
}

type Emoji = string;

export interface UploadedFile {
  url: string;
  thumbnailURL?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

export default interface ChatMessage {
  id: number;
  token_address: string;
  author: string;
  author_name?: string;
  author_avatar_url?: string;
  message_type: MessageType;
  message?: string;
  rich?: {
    files?: UploadedFile[];
    emojis?: Emoji[];
  };
  created_at: string;
}
