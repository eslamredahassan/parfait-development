const config = require("../config");
const moment = require("moment");

module.exports = async (client, config) => {
  let guild = client.guilds.cache.get(config.guildID);
  if (guild) {
    try {
      await guild.commands.set([
        {
          name: "setup",
          description: `🧪︱ 💼 Launch setup menu to choose between open, close and developer modes`,
          type: "CHAT_INPUT",
        },
        {
          name: "test",
          description: `🧪︱ Launch setup menu to choose between open, close and developer modes`,
          type: "CHAT_INPUT",
        },
        {
          name: "squad_sun",
          description: `🧪︱ A list of Sun members`,
          type: "CHAT_INPUT",
        },
        {
          name: "about",
          description: `🧪︱ ❓ Learn more about Parfait bot`,
          type: "CHAT_INPUT",
        },
        {
          name: "feedback",
          description: `🧪︱ 📬 Send your feedback about Parfait to her developer`,
          type: "CHAT_INPUT",
        },
        {
          name: "report_bug",
          description: `🧪︱ 🐞 Report a bug to the developer`,
          type: "CHAT_INPUT",
        },
        {
          name: "contact_dev",
          description: `🧪︱ 📤 Send a message to parfait developer`,
          type: "CHAT_INPUT",
        },
        {
          name: "status",
          description: `🧪︱ 📊 Check Parfait Uptime`,
          type: "CHAT_INPUT",
        },
        {
          name: "ping",
          description: `🧪︱ 🏓 Check Parfait latency`,
          type: "CHAT_INPUT",
        },
        {
          name: "server",
          description: `🧪︱ 📑 List of server that Parfait joined`,
          type: "CHAT_INPUT",
        },
        {
          name: "my_cooldown",
          description: `🧪︱ ⏱ Check your application cooldown duration`,
          type: "CHAT_INPUT",
        },
        {
          name: "leave",
          description: `🧪︱ ➖ Leave a server that Parfait joined before`,
          type: "CHAT_INPUT",
          options: [
            {
              name: "server_id",
              description: "Choose server you want to leave",
              type: 3, // CHANNEL
              required: true,
            },
          ],
        },
        {
          name: "buy",
          description: "🛒 Buy items using Ice coins",
          type: "CHAT_INPUT",
          options: [
            {
              name: "item",
              description: "📦 🛒 Buy items using Ice coins",
              type: 3, // STRING
              required: true,
              choices: [
                {
                  name: "Uniqe Role",
                  value: "#roles",
                },
                {
                  name: "existing_role",
                  value: "existing_role",
                },
              ],
            },
          ],
        },
        {
          name: "wallet",
          description: `🧪︱ 👜 Open your ice coins wallet`,
          type: "CHAT_INPUT",
        },
        {
          name: "give",
          description: "🧪︱ 💸 Give ice coin to sun member",
          type: "CHAT_INPUT",
          options: [
            {
              name: "user",
              description: "👤 Choose the user you want to give",
              type: 6, // USER
              required: true,
            },
            {
              name: "ice_coins",
              description: "❄ Type the amount of ice coins you want to give",
              type: 4, // Integer
              required: true,
            },
          ],
        },
        {
          name: "take",
          description: "🧪︱ ✂ Take the ice coin from sun member",
          type: "CHAT_INPUT",
          options: [
            {
              name: "user",
              description: "Choose the user you want to take the coins from",
              type: 6, // USER
              required: true,
            },
            {
              name: "amount",
              description: "Type the amount of ice coins you want to take",
              type: 4, // Integer
              required: true,
            },
          ],
        },
        {
          name: "generate_code",
          description: "🧪︱ 🎁 Generate an ice coin gift code",
          type: "CHAT_INPUT",
          options: [
            {
              name: "code_type",
              description: "⚙ Select the cooldown duration type",
              required: true,
              type: 3, // STRING
              choices: [
                {
                  name: "ice coins",
                  value: "ice",
                  description: "Set cooldown in minutes",
                },
                {
                  name: "xp",
                  value: "xp",
                  description: "Set cooldown in hours",
                },
              ],
            },
            {
              name: "amount",
              description: "🧮 The amount of ice coins you want to generate",
              type: 4, // USER
              required: true,
            },
            {
              name: "duration",
              description: "⏱ The duration of the gift code",
              type: 4, // Integer
              required: true,
            },
            {
              name: "duration_type",
              description: "⚙ Select the cooldown duration type",
              required: true,
              type: 3, // STRING
              choices: [
                {
                  name: "minutes",
                  value: "minute",
                  description: "Set cooldown in minutes",
                },
                {
                  name: "hours",
                  value: "hour",
                  description: "Set cooldown in hours",
                },
                {
                  name: "days",
                  value: "day",
                  description: "Set cooldown in days",
                },
                {
                  name: "weeks",
                  value: "week",
                  description: "Set cooldown in days",
                },
                {
                  name: "months",
                  value: "month",
                  description: "Set cooldown in months",
                },
                {
                  name: "years",
                  value: "year",
                  description: "Set cooldown in months",
                },
              ],
            },
          ],
        },
        {
          name: "balance",
          description:
            "🧪︱ 🕵️ See the ice coins balance and levels for sun member",
          type: "CHAT_INPUT",
          options: [
            {
              name: "user",
              description:
                "👤 Choose the user you want to see his balance and level",
              type: 6, // USER
              required: true,
            },
          ],
        },
        {
          name: "steal",
          description: "🧪︱ 🥷 See the ice coins balance for sun member",
          type: "CHAT_INPUT",
          options: [
            {
              name: "target",
              description: "🎯 Choose the user you want to see his balance",
              type: 6, // USER
              required: true,
            },
          ],
        },
        {
          name: "increase",
          description: "🧪︱ ➕ increase sun member's level",
          type: "CHAT_INPUT",
          options: [
            {
              name: "user",
              description: "👤 Choose the user you want to increase his level",
              type: 6, // USER
              required: true,
            },
            {
              name: "level",
              description: "🧮 Type the amount of level you want to increase",
              type: 4, // USER
              required: true,
            },
          ],
        },
        {
          name: "decrease",
          description: "🧪︱ ➖ decrease sun member's level",
          type: "CHAT_INPUT",
          options: [
            {
              name: "user",
              description: "👤 Choose the user you want to decrease his level",
              type: 6, // USER
              required: true,
            },
            {
              name: "level",
              description: "🧮 Type the amount of level you want to decrease",
              type: 4, // USER
              required: true,
            },
          ],
        },
        {
          name: "redeem",
          description: `🧪︱ 🧧 Redeem Ice coin code`,
          options: [
            {
              name: "code",
              description: "💳 Enter the code here",
              type: 3, // STRING
              required: true,
              min_length: 2,
              max_length: 1000,
            },
          ],
        },
        {
          name: "Info",
          type: 2,
        },
        {
          name: "Application",
          type: 2,
        },
        {
          name: "Report",
          type: 2,
        },
        {
          name: "Translate",
          type: 3,
        },
        {
          name: "Voters List",
          type: 3,
        },
        {
          name: "echo",
          description: `🧪︱ 📢 Parfait will send your message`,
          options: [
            {
              name: "channel",
              description: "Choose channel you want to send your message in",
              type: 7, // CHANNEL
              required: true,
            },
            {
              name: "message",
              description: "Type your echo message",
              type: 3, // STRING
              required: true,
              min_length: 2,
              max_length: 1000,
            },
          ],
        },
        {
          name: "add_cooldown",
          description: `🧪︱ ⌛ add cooldown a member to stop him from applying to SUN`,
          options: [
            {
              name: "member",
              description:
                "Mention the member you want to add a cooldown to him",
              type: 6, // MEMBER
              required: true,
            },
            {
              name: "type",
              description: "Select the cooldown duration type",
              required: true,
              type: 3, // STRING
              choices: [
                {
                  name: "minutes",
                  value: "minutes",
                  description: "Set cooldown in minutes",
                },
                {
                  name: "hours",
                  value: "hours",
                  description: "Set cooldown in hours",
                },
                {
                  name: "days",
                  value: "days",
                  description: "Set cooldown in days",
                },
                {
                  name: "months",
                  value: "months",
                  description: "Set cooldown in months",
                },
              ],
            },
            {
              name: "duration",
              description: "Set the freeze durations in days",
              type: 4, // MEMBER
              required: true,
              min_length: 1,
              max_length: 3,
            },
            {
              name: "reason",
              description: "Type your freeze reason",
              type: 3, // STRING
              required: true,
              min_length: 2,
              max_length: 1000,
            },
          ],
        },
        {
          name: "change_cooldown",
          description: `🧪︱ change the cooldown period of member that already has a cooldown`,
          options: [
            {
              name: "member",
              description:
                "Mention the member you want to change his cooldown period",
              type: 6, // MEMBER
              required: true,
            },
            {
              name: "type",
              description: "Select the cooldown duration type",
              required: true,
              type: 3, // STRING
              choices: [
                {
                  name: "minutes",
                  value: "minutes",
                  description: "Set cooldown in minutes",
                },
                {
                  name: "hours",
                  value: "hours",
                  description: "Set cooldown in hours",
                },
                {
                  name: "days",
                  value: "days",
                  description: "Set cooldown in days",
                },
                {
                  name: "months",
                  value: "months",
                  description: "Set cooldown in months",
                },
              ],
            },
            {
              name: "duration",
              description: "Set the freeze durations in days",
              type: 4, // MEMBER
              required: true,
              min_length: 1,
              max_length: 3,
            },
            {
              name: "reason",
              description: "Type your unfreeze reason",
              type: 3, // STRING
              required: true,
              min_length: 2,
              max_length: 1000,
            },
          ],
        },
        {
          name: "check_cooldown",
          description: `🧪︱ ⌚ Check the cooldown period of member`,
          options: [
            {
              name: "member",
              description: "Mention the member you want to his cooldown period",
              type: 6, // MEMBER
              required: true,
            },
          ],
        },
        {
          name: "remove_cooldown",
          description: `🧪︱ 🔨 remove the cooldown from the member to allow him to applying to SUN again`,
          options: [
            {
              name: "member",
              description: "Mention the member you want to break his snow",
              type: 6, // MEMBER
              required: true,
            },
            {
              name: "reason",
              description: "Type your unfreeze reason",
              type: 3, // STRING
              required: true,
              min_length: 2,
              max_length: 1000,
            },
          ],
        },
        {
          name: "applications",
          description: `🧪︱ 📋 Find members recruitment applications`,
          required: true,
          options: [
            {
              name: "search",
              description:
                "Search for recruitment application by username, user id, smash code, or application id",
              type: 3, // STRING
              required: true,
              min_length: 2,
              max_length: 1000,
            },
          ],
        },
        {
          name: "add_reminder",
          description: `🧪︱ 📌 Add a reminder`,
          options: [
            {
              name: "text",
              description: "The reminder text",
              type: 3, // STRING
              required: true,
              min_length: 2,
              max_length: 1000,
            },
            {
              name: "time",
              description: "The duration of the reminder (in numbers only)",
              type: 3, // STRING
              required: true,
            },
            {
              name: "type",
              description: "Select the duration type",
              required: true,
              type: 3, // STRING
              choices: [
                {
                  name: "minutes",
                  value: "minutes",
                  description: "In minutes",
                },
                {
                  name: "hours",
                  value: "hours",
                  description: "In hours",
                },
                {
                  name: "days",
                  value: "days",
                  description: "In days",
                },
                {
                  name: "months",
                  value: "months",
                  description: "In months",
                },
              ],
            },
          ],
        },
        {
          name: "poll",
          description: `🧪︱ 📌 Add a reminder`,
          options: [
            {
              name: "channel",
              description: " Choose channel you want to send your message in",
              type: 7, // CHANNEL
              required: true,
            },
            {
              name: "object",
              description: "The reminder text",
              type: 3, // STRING
              required: true,
              min_length: 2,
              max_length: 1000,
            },
            {
              name: "vote",
              description: "The duration of the reminder (in numbers only)",
              type: 3, // STRING
              required: true,
            },
            {
              name: "duration",
              description: "Select the duration type",
              required: true,
              type: 3, // STRING
            },
          ],
        },
        {
          name: "timestamp",
          description: "🧪︱ ⏱ Discord timestamp generator",
          type: "CHAT_INPUT",
          options: [
            {
              name: "type",
              description: "Select the timestamp type to generate",
              type: 3, // INTEGER
              required: true,
              choices: [
                {
                  name: "hh:mm AM/PM (eg: 12:00 AM)",
                  value: "t",
                },
                {
                  name: "hh:mm:ss AM/PM (eg: 12:00:00 AM)",
                  value: "T",
                },
                {
                  name: "mm/dd/yyyy (eg: 12/17/2022)",
                  value: "d",
                },
                {
                  name: "mmm, dd/yyyy (eg: Dec, 17/2022)",
                  value: "D",
                },
                {
                  name: "mmm, dd/yyyy 00:00AM/PM (eg: Dec, 17/2022)",
                  value: "f",
                },
                {
                  name: "ddd, mmm dd, yyyy hh:mm:AM/PM (eg: Wed, Dec 17, 2022 12:00 AM)",
                  value: "F",
                },
                {
                  name: "Active timer",
                  value: "R",
                },
              ],
            },
            {
              name: "year",
              description: "Type the number of years (eg: 2022)",
              type: 4, // INTEGER
              required: false,
              min_value: 0,
              max_value: 3024,
            },
            {
              name: "month",
              description: "Type the number of months (eg: 12)",
              type: 4, // INTEGER
              required: false,
              min_value: 0,
              max_value: 12,
            },
            {
              name: "day",
              description: "Type the number of days (eg: 17)",
              type: 4, // INTEGER
              required: false,
              min_value: 0,
              max_value: 31,
            },
            {
              name: "hour",
              description: "Type the number of hours in 24h format (eg: 14)",
              type: 4, // INTEGER
              required: false,
              min_value: 0,
              max_value: 23,
            },
            {
              name: "minute",
              description: "Type the number of minutes (eg: 30)",
              type: 4, // INTEGER
              required: false,
              min_value: 0,
              max_value: 59,
            },
            {
              name: "second",
              description: "Type the number of seconds (eg: 30)",
              type: 4, // INTEGER
              required: false,
              min_value: 0,
              max_value: 59,
            },
          ],
        },
        {
          name: "remove_reminder",
          description: `🧪︱ ❌ Delete reminders by reminder text`,
          type: "CHAT_INPUT",
          options: [
            {
              name: "text",
              description: "Type the reminder text you want to remove",
              type: 3, // STRING
              required: true,
              min_length: 2,
              max_length: 1000,
            },
          ],
        },
        {
          name: "ask",
          description: `🧪︱ 💭 Ask Parfait questions`,
          options: [
            {
              name: "question",
              description: "Type your question",
              type: 3, // STRING
              required: true,
              min_length: 2,
              max_length: 365,
            },
          ],
        },
      ]);
      console.log(
        `\x1b[0m`,
        `\x1b[33m 〢`,
        `\x1b[33m ${moment(Date.now()).format("LT")}`,
        `\x1b[31m Slash Commands`,
        `\x1b[32m LOADED`,
      );
    } catch (error) {
      console.log(
        `\x1b[0m`,
        `\x1b[33m 〢`,
        `\x1b[33m ${moment(Date.now()).format("LT")}`,
        `\x1b[31m Slash Commands`,
        `\x1b[323m ERROR: ${error.message}`,
      );
    }
  }
};
