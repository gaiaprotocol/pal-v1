import { Bot } from "https://deno.land/x/grammy@v1.8.3/mod.ts";
import { serveWithOptions } from "../_shared/cors.ts";
import supabase from "../_shared/supabase.ts";

const botToken = Deno.env.get("MESSAGE_SYNCER_TELEGRAM_BOT_TOKEN") || "";
const telegramChatId = Deno.env.get("MESSAGE_SYNCER_TELEGRAM_CHAT_ID") || "";
const telegramTopic = Deno.env.get("MESSAGE_SYNCER_TELEGRAM_TOPIC") ||
  undefined;
const bot = new Bot(botToken);

async function selectLoadableImage(images: (string | undefined)[]) {
  for (const image of images) {
    if (image) {
      try {
        const response = await fetch(image, { method: "HEAD" });
        if (response.ok) {
          return image;
        }
      } catch (error) {
        // Ignore
      }
    }
  }
}

serveWithOptions(async (req) => {
  const { key, from, author, messageId, message, rich } = await req.json();
  if (!key || !from || !messageId) {
    throw new Error("Invalid request");
  }
  if (from === "app") {
    const { data, error } = await supabase.from("general_chat_messages")
      .select(
        "*, author(user_id, display_name, avatar, avatar_thumb, stored_avatar, stored_avatar_thumb, x_username)",
      ).eq("id", messageId);
    if (error) throw error;
    const message = data?.[0];
    if (!message) {
      throw new Error("Message not found");
    }
    const avatar = await selectLoadableImage([
      message.author.avatar_thumb,
      message.author.stored_avatar_thumb,
    ]);
    console.log("Avatar:", avatar);

    await bot.api.sendMessage(
      telegramChatId,
      `${message.author.display_name} from Pal: ${message.message}`,
      {
        reply_to_message_id: telegramTopic
          ? parseInt(telegramTopic)
          : undefined,
      },
    );
  }
});
