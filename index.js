import TelegramBot from "node-telegram-bot-api";
import { getTorrents, login, addTorrents } from "./torrent.js";
import fs from "fs";

const token = "6505788806:AAEWAISgAd7rY3M08mBzqjjhQ2b08R9c2Ig";
const bot = new TelegramBot(token, { polling: true });
const filename = "data.json";

bot.setMyCommands([
  { command: "/login", description: "login" },
  { command: "/add", description: "add torrent" },
  { command: "/get", description: "get last 5 torrent" },
]);

const start = () => {

  let isLoginIn = false;
  let cookie = "";
  let userLoginData = {};

  bot.on("message", async (msg) => {
    const userId = msg.from.id;
    
    if(userId === 452648868){
      itsMeMario()
     }
 
  });


  bot.onText(/\/login/, async (msg) => {
    const chatId = msg.chat.id;

    if (!isLoginIn) {
      let counter = 0;
      let data = "baseURL";
      bot.sendMessage(chatId, "Send torrent IP");
      bot.on("message", async (msg) => {
        if (msg.chat.id === chatId) {
          userLoginData[data] = msg.text;
          counter++;
          if (counter === 1) {
            data = "username";
            bot.sendMessage(chatId, "Send User name");
          }
          if (counter === 2) {
            data = "password";
            bot.sendMessage(chatId, "Send Password");
          }
          if (counter === 3) {
            bot.removeListener("message", this);

            cookie = await login(userLoginData);
            if (cookie) {
              bot.sendMessage(chatId, "Login successful!");
              isLoginIn = true;
            } else {
              bot.sendMessage(chatId, "Something go wrong, try again");
            }
          }
        }
      });
    } else {
      bot.sendMessage(chatId, "You already login in");
    }
  });

  bot.onText(/\/add/, async (msg) => {
    const chatId = msg.chat.id;
    if (isLoginIn) {
      bot.sendMessage(chatId, "Send Torrent link");
      bot.once("message", async (msg) => {
        const text = msg.text;
        if (text.startsWith("magnet:?") || text.endsWith(".torrent")) {
          const AddTorr = await addTorrents(userLoginData, text, cookie);
          if (AddTorr) {
            bot.sendMessage(chatId, `Add new Torrent: ${AddTorr}`, {
              reply_to_message_id: msg.message_id,
            });
          } else {
            bot.sendMessage(chatId, "Something go wrong");
          }
        }
      });
    } else {
      bot.sendMessage(chatId, "You need to login");
    }
  });

  bot.onText(/\/get/, async (msg) => {
    const chatId = msg.chat.id;
    if (isLoginIn) {
      const list = await getTorrents(userLoginData, cookie);
      console.log(list);
      bot.sendMessage(chatId, "Here is last 5 added torrent:");
      for (const names of list) {
        console.log(names);
        await bot.sendMessage(chatId, names);
      }
    } else {
      bot.sendMessage(chatId, "You need to login");
    }
  });
  
  async function itsMeMario(){
    userLoginData = {
      baseURL: "http://192.168.0.200:8080/",
      username: "admin",
      password: "Admin1",
    };
    cookie = await login(userLoginData);
    isLoginIn = true 
  }
  
};





// async function saveToJSON(filename, data) {
//   const jsonData = JSON.stringify(data);
//   fs.writeFile(filename, jsonData, "utf8", (err) => {
//     if (err) {
//       console.error("Error writing to file:", err);
//       return;
//     }
//     console.log("Data has been saved");
//   });
// }

// async function loadFromJSON(filename) {
//   try {
//     const data = fs.readFileSync(filename, "utf8");
//     return JSON.parse(data);
//   } catch (err) {
//     console.error("Error reading users file:", err);
//     return [];
//   }
// }

// async function addToJSON(filename, newData) {
//   let data = await loadFromJSON(filename);

//   for (let item in data) {
//     console.log(data[item]);
//     if (!data[item].id.toString() === newData.id) {

//       data[item + 1] = newData;
//     } else {
//       data[item] = newData;
//     }

//   }
//   console.log(data);
// const index = (data.id === newData.id);
// console.log(index)
// if (index !== -1) {
//   data[index] = newData;
// } else {
//   data.push(newData);
// }

// const jsonData = JSON.stringify(data, null, 2);
// fs.writeFile(filename, jsonData, 'utf8', (err) => {
//   if (err) {
//     console.error("Error writing to file:", err);
//     return;
//   }
//   console.log("Data has been saved");
// });
// }

// const fakeData = {
//   id: "452648868",
//   baseURL: "http:",
//   username: "ad",
//   password: "A",
// };

// addToJSON(filename, fakeData);
// console.log(loadFromJSON("data.json"));

start();
