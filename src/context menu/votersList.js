const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
const fs = require("fs");
const Poll = require("../../src/database/models/poll");

const settings = JSON.parse(fs.readFileSync("./src/assest/settings.json"));
const color = settings.colors;
const emojis = settings.emojis;
const banners = settings.banners;

module.exports = async (client, config) => {
  client.on("interactionCreate", async (interaction) => {
    if (
      interaction.isContextMenu() &&
      interaction.commandName === "Voters List"
    ) {
      await interaction.deferReply({ ephemeral: true });

      const messageId = interaction.targetId;
      const pollData = polls.get(messageId);

      if (!pollData) {
        // Poll data not found, possibly expired
        await interaction.editReply({
          embeds: [
            {
              //title: `${emojis.alert} Poll expired`,
              description: `${emojis.warning} This poll has either expired or does not exist.`,
              color: color.gray,
            },
          ],
          ephemeral: true,
        });
        return;
      }

      const voterNames = Array.from(pollData.votedUsers).map((userId) => {
        const member = interaction.guild.members.cache.get(userId);
        return member ? member.displayName : "Unknown User";
      });

      const embed = new MessageEmbed()
        .setColor(color.gray)
        .setTitle(`${emojis.poll} Voters List`)
        .setDescription(voterNames.join("\n"))
        .setFooter({
          text: `Total votes: ${voterNames.length}`,
          iconURL: banners.parfaitIcon,
        });

      await interaction.editReply({ embeds: [embed], ephemeral: true });
    }
  });
};
