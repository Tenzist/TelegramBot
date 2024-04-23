import TelegramBot from "node-telegram-bot-api";
import { main } from "./torrent.js";

const token = "6505788806:AAEWAISgAd7rY3M08mBzqjjhQ2b08R9c2Ig";
const bot = new TelegramBot(token, { polling: true });

const start = () => {
  bot.on("message", async (msg) => {
    if(msg.from.id === 452648868){
        try {
            const text = msg.text;
            const chatId = msg.chat.id;
            const messageId = msg.message_id
            if (text.endsWith(".torrent")) {
              const torrentName = await main(text);
              bot.sendMessage(chatId, `Start downloading: ${torrentName.toString()}`, {reply_to_message_id: messageId})
            }
          } catch (error) {
            console.error("Error occurred:", error);
          }
    }
  });
};

start();
