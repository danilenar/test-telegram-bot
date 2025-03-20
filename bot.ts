import { Telegraf } from "telegraf";
import * as dotenv from "dotenv";
import { message } from "telegraf/filters";
// Load environment variables from .env file
dotenv.config();

// Get the bot token from environment variables
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!BOT_TOKEN) {
  throw new Error("BOT_TOKEN must be provided in .env file!");
}

const bot = new Telegraf(BOT_TOKEN);

// Add this near the top of your file
interface UserSession {
  awaitingPhoto: boolean;
  lastCommand?: string;
}

// User sessions to track state
const userSessions: Record<number, UserSession> = {};

// Start command: Greets the user
bot.start((ctx) => {
  ctx.reply("Welcome to Calories.fun! Type /help to see available commands.");
});

// Help command: Lists available commands
bot.help((ctx) => {
  ctx.reply(
    "Available commands:\n" +
      "/start - Start the bot\n" +
      "/help - Show this help message\n" +
      "/wallet - Link your wallet\n" +
      "/submit - Submit a meal photo\n" +
      "/referral - Get your referral link"
  );
});

// Wallet command: Initiates wallet linking process
bot.command("wallet", async (ctx) => {
  ctx.reply("Please provide your wallet address (e.g., starting with 0x):");
});

// Updated submit command with session tracking
bot.command("submit", async (ctx) => {
  try {
    const userId = ctx.from?.id;
    if (!userId) {
      return ctx.reply("Sorry, couldn't identify your user account.");
    }

    // Set user state to awaiting photo
    userSessions[userId] = {
      awaitingPhoto: true,
      lastCommand: "submit",
    };

    ctx.reply(
      "Please send a photo of your meal for calorie evaluation.\n\n" +
        "Make sure to:\n" +
        "- Send it as a photo, not as a file\n" +
        "- Send only one clear image of your meal"
    );
  } catch (error) {
    console.error("Error in submit command:", error);
    ctx.reply(
      "Sorry, there was an error processing your command. Please try again later."
    );
  }
});

// Referral command: Generates a referral link based on the user's Telegram ID
bot.command("referral", async (ctx) => {
  const userId = ctx.from?.id;
  const referralLink = `https://t.me/your_bot_username?start=${userId}`;
  ctx.reply(`Share this referral link with your friends: ${referralLink}`);
});

// Listen for text messages (used here to simulate wallet address linking)
bot.on(message("text"), async (ctx) => {
  const text = ctx.message.text;
  // Simple check: if text starts with "0x" and has the length of a typical Ethereum address (42 characters)
  if (text.startsWith("0x") && text.length === 42) {
    // Here you would implement the actual wallet linking logic
    ctx.reply(`Wallet address ${text} linked successfully!`);
  } else {
    ctx.reply(`You said: ${text}`);
  }
});

// Enhanced photo handler with session awareness
bot.on(message("photo"), async (ctx) => {
  // Check if the message contains a photo
  if ("photo" in ctx.message) {
    try {
      const userId = ctx.from?.id;
      if (!userId) {
        return ctx.reply("Sorry, couldn't identify your user account.");
      }

      console.log("Received photo from user:", userId);

      // Check if we were expecting a photo from this user
      const session = userSessions[userId];
      if (!session || !session.awaitingPhoto) {
        return ctx.reply(
          "To analyze a meal photo, please use the /submit command first."
        );
      }

      // Reset user state
      userSessions[userId].awaitingPhoto = false;

      // Rest of your photo handling code
      const photoArray = ctx.message.photo;
      if (!photoArray || photoArray.length === 0) {
        return ctx.reply(
          "Sorry, we couldn't process your photo. Please try again with /submit."
        );
      }

      // Pick the photo with the highest resolution
      const photo = photoArray[photoArray.length - 1];

      // Acknowledge receipt immediately
      await ctx.reply("Photo received! Analyzing your meal...");

      // Simulate calorie evaluation (in a real scenario, integrate with an AI service)
      const calorieCount = simulateCalorieAnalysis(photo.file_id);

      // Send the result after "analysis"
      ctx.reply(
        `Our AI estimates that your meal has about ${calorieCount} calories. Tokens will be rewarded accordingly!`
      );
    } catch (error) {
      console.error("Error processing photo:", error);
      ctx.reply(
        "Sorry, we encountered an error while analyzing your photo. Please try again with /submit."
      );
    }
  }
});

// A stub function to simulate calorie analysis
function simulateCalorieAnalysis(fileId: string): number {
  // In a real implementation, you would process the image with an AI model.
  // Here we return a random value between 200 and 800 for demonstration.
  return Math.floor(Math.random() * (800 - 200 + 1)) + 200;
}

// Launch the bot
bot.launch().then(() => {
  console.log("Calories.fun bot is up and running...");
});

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
