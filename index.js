import TelegramBot from "node-telegram-bot-api";
import {
  getTorrentList,
  login,
  addTorrents,
  fixURL,
  getByHashTorrent,
} from "./torrent.js";
import fs from "fs";
import { captureRejectionSymbol } from "events";

const bot = new TelegramBot(token, { polling: true });
const filename = "data.json";

bot.setMyCommands([
  { command: "/login", description: "login" },
  { command: "/add", description: "add torrent" },
  { command: "/get", description: "get last 5 torrent" },
]);

const start = () => {
  let isLoginIn = false;
  let userLoginData = {};

  async function itsMeMario() {
    userLoginData = {
      baseURL: "http://192.168.0.200:8080/",
      username: "admin",
      password: "Admin1",
    };
    isLoginIn = true;
  }

  bot.onText("asd", async (msg) => {
    const chatId = msg.chat.id;
    // bot.sendMessage(chatId, 'tu lox');
  });

  bot.on("message", async (msg) => {
    const userId = msg.from.id;
    if (userId === userId) {
      itsMeMario();
    }
    const chatId = msg.chat.id;
    const text = msg.text;
    const date = new Date(msg.date);
    console.log(date)
    
    // bot.sendMessage(chatId, text);
    // if (text === "asd") {
    //   bot.removeListener("message");
    // }
  });


  bot.onText(/\/login/, async (msg) => {
    const chatId = msg.chat.id;

    bot.removeListener("message");
    if (!isLoginIn) {
      let counter = 0;
      bot.sendMessage(chatId, "Send torrent IP");
      bot.on("message", async (msg) => {
        if (msg.chat.id === chatId) {
          if (counter === 0) {
            userLoginData["baseURL"] = await fixURL(msg.text);
            bot.sendMessage(chatId, "Send User name");
          }
          if (counter === 1) {
            userLoginData["username"] = msg.text;
            bot.sendMessage(chatId, "Send Password");
          }
          if (counter === 2) {
            userLoginData["password"] = msg.text;

            const cookie = await login(userLoginData);
            if (cookie) {
              bot.sendMessage(chatId, "Login successful!");
              isLoginIn = true;
            } else {
              bot.sendMessage(chatId, "Can't connect to qBit");
            }
          }
          counter++;
        }
      });
    } else {
      bot.sendMessage(chatId, "You already login in");
    }
  });

  bot.onText(/\/add/, async (msg) => {
    const chatId = msg.chat.id;
    if (isLoginIn) {
      bot.sendMessage(chatId, "Send Torrent link \n Cancel operation: /cancel");
      bot.once("message", async (msg) => {
        const text = msg.text;
        if (text.startsWith("magnet:?") || text.endsWith(".torrent")) {
          const cookie = await login(userLoginData);
          const AddTorr = await addTorrents(userLoginData, text, cookie);
          if (AddTorr) {
            bot.sendMessage(chatId, `Add new Torrent: ${AddTorr[0].name}`, {
              reply_to_message_id: msg.message_id,
            });
          } else {
            bot.sendMessage(chatId, "Something go wrong");
          }
        } else {
          bot.sendMessage(chatId, "This is not a link");
        }
      });
    } else {
      bot.sendMessage(chatId, "You need to /login");
    }
  });

  let rangeLim = 0;
  bot.onText(/\/get/, async (msg) => {
    await getT(msg);
  });

  bot.on("callback_query", async (msg) => {
    const data = msg.data;
    const messageId = msg.message.message_id;
    const chatId = msg.message.chat.id;
    if (data === "prev") {
      rangeLim -= 5;
      bot.deleteMessage(chatId, messageId);
      await getT(msg.message);
    }
    if (data === "next") {
      rangeLim += 5;
      bot.deleteMessage(chatId, messageId);
      await getT(msg.message);
    }
    if(data.length === 40){
      const cookie = await login(userLoginData);
      const dd = await getByHashTorrent(userLoginData, cookie, data)
      const torrent = dd[0]
      const date = new Date(torrent.date).toString();
      bot.sendMessage(chatId, `added_on:${date}\n
      category: ${torrent.category} \n
      content_path: ${torrent.content_path} \n
      name: ${torrent.name}`);
      console.log(dd)
    }
    console.log(data);

    // bot.sendMessage(chatId, "aga");
    // console.log(data);
    // bot.sendMessage(chatId, data);
  });

  async function getT(msg) {
    const chatId = msg.chat.id;
    if (isLoginIn) {
      const cookie = await login(userLoginData);
      const list = await getTorrentList(userLoginData, cookie);
      if (list) {
        const inline_keyboard = [];
        for (const item of list.slice(
          rangeLim,
          Math.min(rangeLim + 5, list.length)
        )) {
          inline_keyboard.push([{ text: item.name, callback_data: item.hash }]);
        }
        if (list.length >= 5) {
          if (rangeLim === 0) {
            inline_keyboard.push([{ text: ">", callback_data: "next" }]);
          } else if (rangeLim + 5 >= list.length) {
            inline_keyboard.push([{ text: "<", callback_data: "prev" }]);
          } else {
            inline_keyboard.push([
              { text: "<", callback_data: "prev" },
              { text: ">", callback_data: "next" },
            ]);
          }
        }
        const replyMark = {
          reply_markup: JSON.stringify({
            inline_keyboard: inline_keyboard,
          }),
        };
        bot.sendMessage(chatId, "Here is last added torrent:", replyMark);
      } else {
        bot.sendMessage(chatId, "aga");
      }
    } else {
      bot.sendMessage(chatId, "You need to /login");
    }
  }
};

start();
