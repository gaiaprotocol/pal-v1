import { Bot } from "https://deno.land/x/grammy@v1.8.3/mod.ts";
import { serveWithOptions } from "../_shared/cors.ts";
import supabase from "../_shared/supabase.ts";

const messageBridgeSecureKey = Deno.env.get("MESSAGE_BRIDGE_SECURE_KEY") || "";
const messageSyncerTelegramBotToken =
  Deno.env.get("MESSAGE_SYNCER_TELEGRAM_BOT_TOKEN") ||
  "";
const messageSyncerTelegramChatId =
  Deno.env.get("MESSAGE_SYNCER_TELEGRAM_CHAT_ID") || "";
const messageSyncerTelegramTopic =
  Deno.env.get("MESSAGE_SYNCER_TELEGRAM_TOPIC") ||
  undefined;
const messageSyncerTelegramBot = new Bot(messageSyncerTelegramBotToken);

const discordWebhookUrl = Deno.env.get("MESSAGE_SYNCER_DISCORD_WEBHOOK_URL") ||
  "";

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
  if (!key || !from || !messageId) throw new Error("Invalid request");
  if (key !== messageBridgeSecureKey) throw new Error("Invalid key");

  if (from === "pal") {
    const { data, error } = await supabase.from("general_chat_messages")
      .select(
        "*, author(user_id, display_name, avatar, avatar_thumb, stored_avatar, stored_avatar_thumb, x_username)",
      ).eq("id", messageId);
    if (error) throw error;
    const message = data?.[0];
    if (!message) throw new Error("Message not found");

    const avatar = await selectLoadableImage([
      message.author.avatar_thumb,
      message.author.stored_avatar_thumb,
    ]);

    await messageSyncerTelegramBot.api.sendMessage(
      messageSyncerTelegramChatId,
      `${message.author.display_name} from Pal: ${message.message}`,
      {
        reply_to_message_id: messageSyncerTelegramTopic
          ? parseInt(messageSyncerTelegramTopic)
          : undefined,
      },
    );

    await fetch(discordWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: `${message.author.display_name} from Pal`,
        avatar_url: avatar,
        content: message.message,
      }),
    });
  } else if (from === "discord") {
    const { data, error } = await supabase.from("general_chat_messages").insert(
      {
        source: "discord",
        external_author_id: author.id,
        external_author_name: author.name,
        external_author_avatar: author.avatar,
        external_message_id: messageId,
        message,
        rich,
      },
    ).select();
    if (error) throw error;

    const result = await messageSyncerTelegramBot.api.sendMessage(
      messageSyncerTelegramChatId,
      `${author.name} from Discord: ${message}`,
      {
        reply_to_message_id: messageSyncerTelegramTopic
          ? parseInt(messageSyncerTelegramTopic)
          : undefined,
      },
    );

    await supabase.from("general_chat_messages")
      .update({
        bridged: {
          telegram: {
            chat_id: result.chat.id,
            message_id: result.message_id,
          },
        },
      }).eq("id", data?.[0].id);
  } else if (from === "telegram") {
    const { data, error } = await supabase.from("general_chat_messages").insert(
      {
        source: "telegram",
        external_author_id: author.id,
        external_author_name: author.name,
        external_message_id: messageId,
        message,
        rich,
      },
    ).select();
    if (error) throw error;

    const response = await fetch(discordWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: `${author.name} from Telegram`,
        content: message,
      }),
    });

    const result = await response.json();
    await supabase.from("general_chat_messages")
      .update({
        bridged: {
          discord: {
            message_id: result.id,
          },
        },
      }).eq("id", data?.[0].id);
  }
});
