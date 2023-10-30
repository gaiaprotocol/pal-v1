import { I18NText } from "common-app-module";

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
  author: string;
  author_name: string;
  author_avatar_url?: string;
  message_type: MessageType;
  message?: string;
  translated?: I18NText;
  rich?: {
    files?: UploadedFile[];
    emojis?: Emoji[];
  };
  created_at: string;
}
