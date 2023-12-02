const TemporaryRole = require("../../../src/database/models/TemporaryRoleModel");

const banners = require("../../assest/banners.js");
const errors = require("../../assest/errors.js");
const color = require("../../assest/color.js");
const emojis = require("../../assest/emojis");

module.exports = async (client, config) => {
  let guild = client.guilds.cache.get(config.guildID);

  client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand() && interaction.commandName === "duration") {
      const guild = interaction.guild;
      const member = guild.members.cache.get(interaction.user.id);

      await interaction.deferReply({ ephemeral: true });

      try {
        const temporaryRole = await TemporaryRole.findOne({
          userId: member.id,
        });
        if (!temporaryRole) {
          await interaction.editReply({
            embeds: [
              {
                title: `Cooldown period`,
                description: `You're not in a cooldown period`,
                color: color.gray,
              },
            ],
            ephemeral: true,
            components: [],
          });
          return;
        }

        const roleExpiry = temporaryRole.expiry;
        const currentTime = new Date();
        const timeDifference = roleExpiry.getTime() - currentTime.getTime();

        if (timeDifference <= 0) {
          await interaction.editReply({
            embeds: [
              {
                title: `Cooldown period`,
                description: `- Your cooldown period has finished.`,
                color: color.gray,
              },
            ],
            ephemeral: true,
            components: [],
          });
          return;
        }

        const daysLeft = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const hoursLeft = Math.floor(
          (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutesLeft = Math.floor(
          (timeDifference % (1000 * 60 * 60)) / (1000 * 60),
        );
        const secondsLeft = Math.floor((timeDifference % (1000 * 60)) / 1000);

        let timeLeftString = "";

        if (daysLeft > 0) {
          timeLeftString += `${daysLeft} days, `;
        }
        if (hoursLeft > 0 || daysLeft > 0) {
          timeLeftString += `${hoursLeft} hours, `;
        }
        if (minutesLeft > 0 || hoursLeft > 0 || daysLeft > 0) {
          timeLeftString += `${minutesLeft} minutes, `;
        }
        timeLeftString += `${secondsLeft} seconds`;

        await interaction.editReply({
          embeds: [
            {
              title: `Check cooldown period`,
              description: `Your cooldown period will end in **${timeLeftString}**`,
              color: color.gray,
            },
          ],
          ephemeral: true,
          components: [],
        });
      } catch (error) {
        console.error("Error checking time left for role:", error.message);
        await interaction.editReply({
          embeds: [
            {
              title: `Cooldown period`,
              description: `An error occurred while checking the time for your role.`,
              color: color.gray,
            },
          ],
          ephemeral: true,
          components: [],
        });
      }
    }
  });
};
