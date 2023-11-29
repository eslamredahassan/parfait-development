const {
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  Modal,
  TextInputComponent,
} = require("discord.js");

const moment = require("moment");
const wait = require("util").promisify(setTimeout);
const emojis = require("../assest/emojis");

module.exports = async (client, config) => {
  let guild = client.guilds.cache.get(config.guildID);

  client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand()) {
      switch (interaction.commandName) {
        case "ping":
          {
            const sent = await interaction.reply({
              content: `${emojis.thinking} Thinking...`,
              fetchReply: true,
              ephemeral: true,
            });
            await wait(3000);
            interaction.editReply({
              content: `- Parfait Latency is \`\`${
                sent.createdTimestamp - interaction.createdTimestamp
              }\`\` ms and API Latency is \`\`${Math.round(
                client.ws.ping,
              )}\`\` ms`,
              ephemeral: true,
            });
            console.log(
              `\x1b[0m`,
              `\x1b[31m 〢`,
              `\x1b[33m ${moment(Date.now()).format("lll")}`,
              `\x1b[34m ${interaction.user.username} USED`,
              `\x1b[35m Ping Command`,
              `\x1b[36m ${
                sent.createdTimestamp - interaction.createdTimestamp
              } ms `,
              `\x1b[35m ${Math.round(client.ws.ping)} ms`,
            );
          }
          break;
      }
    }
  });
};
