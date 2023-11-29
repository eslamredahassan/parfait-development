const config = require("../config");
const moment = require("moment");

module.exports = async (client, config) => {
  let guild = client.guilds.cache.get(config.guildID);
  if (guild) {
    try {
      await guild.commands.set([
        {
          name: "setup",
          description: `[Dev] Launch setup menu to choose between open, close and developer modes`,
          type: "CHAT_INPUT",
        },
        {
          name: "about",
          description: `[Dev] Learn more about Parfait bot`,
          type: "CHAT_INPUT",
        },
        {
          name: "feedback",
          description: `[Dev] Send your feedback about Parfait to her developer`,
          type: "CHAT_INPUT",
        },
        {
          name: "report_bug",
          description: `[Dev] Report a bug to the developer`,
          type: "CHAT_INPUT",
        },
        {
          name: "contact_dev",
          description: `[Dev] Send a message to parfait developer`,
          type: "CHAT_INPUT",
        },
        {
          name: "status",
          description: `[Dev] Check Parfait Uptime`,
          type: "CHAT_INPUT",
        },
        {
          name: "ping",
          description: `[Dev] Check Parfait latency`,
          type: "CHAT_INPUT",
        },
        {
          name: "duration",
          description: `[Dev] Check you frozen time left`,
          type: "CHAT_INPUT",
        },
        {
          name: "dev_test",
          description: `[Dev] Test`,
          type: "CHAT_INPUT",
        },
        {
          name: "echo",
          description: `[Dev] Parfait will send your message`,
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
          description: `[Dev] add cooldown a member to stop him from applying to SUN`,
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
          name: "edit_cooldown",
          description: `[Dev] edit cooldown of member that already has a cooldown`,
          options: [
            {
              name: "member",
              description:
                "Mention the member you want to edit his cooldown period",
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
          ],
        },
        {
          name: "check_cooldown",
          description: `[Dev] remove the cooldown from the member to allow him to applying to SUN again`,
          options: [
            {
              name: "member",
              description: "Mention the member you want to break his snow",
              type: 6, // MEMBER
              required: true,
            },
          ],
        },
        {
          name: "remove_cooldown",
          description: `[Dev] remove the cooldown from the member to allow him to applying to SUN again`,
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
          name: "reminder",
          description: `[Dev] Set a reminder`,
          options: [
            {
              name: "message",
              description: "The reminder message",
              type: 3, // STRING
              required: true,
              min_length: 2,
              max_length: 1000,
            },
            {
              name: "duration",
              description:
                "The duration of the reminder (e.g. 10s, 5m, 2h, 1d, 1mo)",
              type: 3, // STRING
              required: true,
            },
          ],
        },
        {
          name: "ask",
          description: `[Dev] Ask Parfait questions`,
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
        {
          name: "end_poll",
          description: `[Dev] Test`,
          type: "CHAT_INPUT",
        },
        {
          name: "parfait",
          description: `[Dev] Parfait Options And Settings`,
          options: [
            {
              name: "mode",
              description: "Mention the member you want to break his snow",
              required: true,
              type: 3, // STRING
              choices: [
                {
                  name: "opned",
                  value: "_opened",
                  description: "Type your unfreeze reason",
                },
                {
                  name: "closed",
                  value: "_closed",
                  description: "Type your unfreeze reason",
                },
              ],
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
