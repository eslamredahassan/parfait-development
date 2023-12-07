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
          name: "test",
          description: `[Dev] Launch setup menu to choose between open, close and developer modes`,
          type: "CHAT_INPUT",
        },
        {
          name: "squad_sun",
          description: `[Dev] A list of Sun members`,
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
          name: "my_cooldown",
          description: `[Dev] Check your application cooldown duration`,
          type: "CHAT_INPUT",
        },
        {
          name: "User info",
          type: 2,
        },
        {
          name: "Application",
          type: 2,
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
          name: "change_cooldown",
          description: `[Dev] change the cooldown period of member that already has a cooldown`,
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
          name: "applications",
          description: `[Dev] Manage recruitment applications`,
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
          description: `[Dev] Add a reminder`,
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
          name: "remove_reminder",
          description: `[Dev] Delete reminders by reminder text`,
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
