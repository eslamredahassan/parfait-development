const { Client, Intents } = require("discord.js");
const fs = require("fs");
const path = require("path");
Client.setMaxListeners(0);

const config = require("./src/config");
const antiCrash = require("./src/utils/antiCrash");
const deployCommands = require("./src/utils/deployCommands");
const server = require("./src/utils/server");
const logo = require("./src/assest/logo");
const moment = require("moment");

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.MESSAGE_CONTENT,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_INTEGRATIONS,
    Intents.FLAGS.GUILD_INVITES,
    Intents.FLAGS.GUILD_WEBHOOKS,
    Intents.FLAGS.GUILD_BANS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_SCHEDULED_EVENTS,
    Intents.FLAGS.GUILD_PRESENCES,
  ],
  partials: ["CHANNEL", "MESSAGE", "GUILD_MEMBER"],
});

client.on("ready", async () => {
  // Read all files in the directory
  server(client, config);
  antiCrash(client, config);
  deployCommands(client, config);

  // The directory where your select menu files are stored
  const databseDirectory = path.join(__dirname, "src/database");
  // Read all files in the directory
  fs.readdir(databseDirectory, (error, files) => {
    if (error) {
      console.error(
        `\x1b[0m`,
        `\x1b[33m 〢`,
        `\x1b[33m ${moment(Date.now()).format("LT")}`,
        `\x1b[31m Error while reading database directory:`,
        `\x1b[35m$ ${error.message}`,
      );
      return;
    }
    files.forEach((file) => {
      if (file.endsWith(".js")) {
        const databsePath = path.join(databseDirectory, file);
        const databse = require(databsePath);
        databse(client, config);
      }
    });
  });
  // The directory where your select menu files are stored
  const selectMenuDirectory = path.join(__dirname, "src/select menu");
  // Read all files in the directory
  fs.readdir(selectMenuDirectory, (error, files) => {
    if (error) {
      console.error(
        `\x1b[0m`,
        `\x1b[33m 〢`,
        `\x1b[33m ${moment(Date.now()).format("LT")}`,
        `\x1b[31m Error while reading select menu directory:`,
        `\x1b[35m$ ${error.message}`,
      );
      return;
    }
    files.forEach((file) => {
      if (file.endsWith(".js")) {
        const selectMenuPath = path.join(selectMenuDirectory, file);
        const selectMenu = require(selectMenuPath);
        selectMenu(client, config);
      }
    });
  });

  // The directory where your select menu files are stored
  const eventsDirectory = path.join(__dirname, "src/events");
  // Read all files in the directory
  fs.readdir(eventsDirectory, (error, files) => {
    if (error) {
      console.error(
        `\x1b[0m`,
        `\x1b[33m 〢`,
        `\x1b[33m ${moment(Date.now()).format("LT")}`,
        `\x1b[31m Error while reading events directory:`,
        `\x1b[35m$ ${error.message}`,
      );
      return;
    }
    files.forEach((file) => {
      if (file.endsWith(".js")) {
        const eventsPath = path.join(eventsDirectory, file);
        const events = require(eventsPath);
        events(client, config);
      }
    });
  });

  // The directory where your context menu files are stored
  const contextMenuDirectory = path.join(__dirname, "src/context menu");
  // Read all files in the directory
  fs.readdir(contextMenuDirectory, (error, files) => {
    if (error) {
      console.error(
        `\x1b[0m`,
        `\x1b[33m 〢`,
        `\x1b[33m ${moment(Date.now()).format("LT")}`,
        `\x1b[31m Error while reading context menu directory:`,
        `\x1b[35m$ ${error.message}`,
      );
      return;
    }
    files.forEach((file) => {
      if (file.endsWith(".js")) {
        const contextMenuPath = path.join(contextMenuDirectory, file);
        const contextMenu = require(contextMenuPath);
        contextMenu(client, config);
      }
    });
  });
  // ------------ Interactions ------------ //
  const questions = require(`./src/interaction/questions`)(client, config);
  const qna = require(`./src/interaction/qna`)(client, config);
  // -------------------------------------//

  console.log(
    `\x1b[0m`,
    `\x1b[33m 〢`,
    `\x1b[33m ${moment(Date.now()).format("LT")}`,
    `\x1b[31m ${client.user.tag}`,
    `\x1b[32m ONLINE`,
  );
});

client.once("ready", async () => {
  // The directory where your slash command files are stored
  const loadCommands = (directory) => {
    fs.readdirSync(directory).forEach((file) => {
      const fullPath = path.join(directory, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        loadCommands(fullPath); // Recursively load commands in subdirectories
      } else if (file.endsWith(".js")) {
        const command = require(fullPath);
        command(client, config);
      }
    });
  };

  const commandsDirectory = path.join(__dirname, "src/commands");
  loadCommands(commandsDirectory);
  // The directory where your buttons files are stored
  const buttonsDirectory = path.join(__dirname, "src/buttons");
  fs.readdir(buttonsDirectory, (error, files) => {
    if (error) {
      console.error(
        `\x1b[0m`,
        `\x1b[33m 〢`,
        `\x1b[33m ${moment(Date.now()).format("LT")}`,
        `\x1b[31m Error while reading slash commands directory:`,
        `\x1b[35m$ ${error.message}`,
      );
      return;
    }
    files.forEach((file) => {
      if (file.endsWith(".js")) {
        const buttonPath = path.join(buttonsDirectory, file);
        const button = require(buttonPath);
        button(client, config);
      }
    });
  });
  function keepAlive() {
    const startTime = Date.now();

    // Replace 'YOUR_BOT_ENDPOINT' with the actual endpoint of your bot
    fetch("https://rzj7df-3000.csb.app", {
      method: "GET",
    })
      .then((response) => {
        const endTime = Date.now();
        const latency = endTime - startTime;

        console.info(
          `\x1b[0m`,
          `\x1b[33m 〢`,
          `\x1b[33m ${moment(Date.now()).format("LT")}`,
          `\x1b[31m Parfait`,
          `\x1b[32m PINGED`,
          `\x1b[33m ${latency}ms`,
        );
      })
      .catch((error) => {
        console.error(
          `\x1b[0m`,
          `\x1b[33m 〢`,
          `\x1b[33m ${moment(Date.now()).format("LT")}`,
          `\x1b[31m Error while pinging bot:`,
          `\x1b[35m$ ${error.message}`,
        );
      });
  }

  // Ping the bot every 5 minutes (adjust the interval as needed)
  setInterval(keepAlive, 1 * 60 * 1000);
});
client
  .login(config.token)
  .catch((error) =>
    console.error(
      `\x1b[0m`,
      `\x1b[33m 〢`,
      `\x1b[33m ${moment(Date.now()).format("LT")}`,
      `\x1b[31m Error while reading events directory:`,
      `\x1b[35m$ ${error.message}`,
    ),
  );
