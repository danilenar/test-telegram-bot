// File: /api/telegram-webhook.ts
import type { NextApiRequest } from "next";

export async function POST(req: NextApiRequest) {
  (async () => {
    try {
      // Parse the incoming Telegram update from the webhook
      const update = req.body;
      // Check if the update contains a message with a chat id
      if (update && update.message && update.message.chat) {
        console.log("Update contains a message with a chat id");
        const chatId = update.message.chat.id;

        // Prepare the reply message text
        const replyText = "Hello from the background task!";

        // Get your bot token from environment variables
        const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        if (!BOT_TOKEN) {
          throw new Error("BOT_TOKEN is not set in environment variables.");
        }

        // Construct the URL for the Telegram sendMessage API
        const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

        // Call the Telegram API to send a message asynchronously
        await fetch(telegramUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: replyText,
          }),
        });
      }
    } catch (error) {
      // Log the error; since this is background, it won't affect the response
      console.error("Error in background processing:", error);
    }
  })();

  // Immediately return a 204 No Content response to acknowledge the webhook
  return new Response(null, { status: 204 });
}
