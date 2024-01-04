const {
  MessageActionRow,
  MessageSelectMenu,
  MessageEmbed,
} = require("discord.js");
const moment = require("moment");
const fs = require("fs");

const settings = JSON.parse(fs.readFileSync("./src/assest/settings.json"));
const color = settings.colors;
const emojis = settings.emojis;
const banners = settings.banners;

// Import necessary database models
const Currency = require("../../../src/database/models/economy");

module.exports = async (client, config) => {
  client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand() && interaction.commandName === "buy") {
      await interaction.deferReply({ ephemeral: true });

      const selectedRole = interaction.options.getString("item");
      if (selectedRole === "#roles") {
        const roles = new MessageActionRow().addComponents(
          new MessageSelectMenu()
            .setCustomId("#roles")
            .setPlaceholder("Press here to select the category")
            .addOptions([
              {
                label: "About Sun Community",
                value: "#about_sun",
                emoji: emojis.aboutSun,
              },
              {
                label: "Hall of fame for tourney wins",
                value: "#hall_of_fame",
                emoji: emojis.otherAchv,
              },
              {
                label: "Sun Leaders",
                value: "#sun_leaders",
                emoji: emojis.leader,
              },
              {
                label: "Staff Members",
                value: "#sun_staff_members",
                emoji: emojis.staff,
              },
              {
                label: "Our Partners",
                value: "#our_partners",
                emoji: emojis.partner,
              },
            ]),
        );

        await interaction.editReply({
          embeds: [
            {
              title: `${emojis.aboutSun} About ${interaction.guild.name}`,
              description: `**We're glad that you are interested in knowing more about us**`,
              image: { url: banners.aboutSunBanner },
              color: color.gray,
              fields: [
                {
                  name: `${emojis.warning} Notice`,
                  value: `${emojis.threadMark} The this menu will be updated from time to time`,
                  inline: false,
                },
                {
                  name: `${emojis.lastUpdate} Last update`,
                  value: `${emojis.threadMark} <t:1693612080:D>`,
                  inline: true,
                },
              ],
            },
          ],
          ephemeral: true,
          components: [roles],
        });
      }
    }
  });
};

// Define a function to get the price based on the role
function getRolePrice(roleName) {
  // Implement your logic to determine the price based on the role
  // You can use a switch statement, if-else, or fetch prices from a settings/database
  // For now, let's assume a simple fixed price of 100 Ice Coins for all roles
  return 100;
}
