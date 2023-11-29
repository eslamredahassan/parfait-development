const { Client, ActivityType } = require("discord.js");
const { codeBlock } = require("@discordjs/builders");
const config = require("../config");
const moment = require("moment");

const Counter = require("../../src/database/models/counter");
//// Application Sun ///

module.exports = async (client, config) => {
  const counter = await Counter.findOne();
  const counterValue = counter ? counter.count : 0;

  let membersCount = client.guilds.cache
    .map((guild) => guild.memberCount)
    .reduce((a, b) => a + b, 0);
  const statusArray = [
    {
      type: "PLAYING",
      content: `with ${membersCount} Smashers`,
      status: "idle",
    },
    {
      type: "WATCHING",
      content: `${counterValue} applications`,
      status: "idle",
    },
  ];
  async function pickPresence() {
    const option = Math.floor(Math.random() * statusArray.length);
    try {
      await client.user.setPresence({
        activities: [
          {
            name: statusArray[option].content,
            type: statusArray[option].type,
            url: statusArray[option].url,
          },
        ],
        status: statusArray[option].status,
      });
    } catch (error) {
      console.error(error);
    }
  }
  setInterval(pickPresence, 50000);
  console.log(
    `\x1b[0m`,
    `\x1b[33m 〢`,
    `\x1b[33m ${moment(Date.now()).format("LT")}`,
    `\x1b[31m Parfait Activity`,
    `\x1b[32m UPDATED`,
  );
};
