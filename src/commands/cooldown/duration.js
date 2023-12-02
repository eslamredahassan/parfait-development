const moment = require("moment");
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
                title: `${emojis.cooldown} Cooldown period`,
                description: `${emojis.threadMark} You're not in a cooldown period`,
                color: color.gray,
              },
            ],
            ephemeral: true,
            components: [],
          });
          return;
        }

        const roleExpiry = temporaryRole.expiry;
        if (roleExpiry <= 0) {
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
        await interaction.editReply({
          embeds: [
            {
              title: `${emojis.cooldown} Check cooldown period`,
              description: `${
                emojis.threadMark
              } Your cooldown period will end in <t:${Math.floor(
                roleExpiry / 1000,
              )}:R>`,
              color: color.gray,
            },
          ],
          ephemeral: true,
          components: [],
        });
        console.log(
          `\x1b[0m`,
          `\x1b[33m 〢`,
          `\x1b[33m ${moment(Date.now()).format("LT")}`,
          `\x1b[31m ${interaction.user.username}`,
          `\x1b[32m Checked his cooldown period`,
          `\x1b[33m that ends ${moment(roleExpiry).fromNow()}`,
        );
      } catch (error) {
        console.log(
          `\x1b[0m`,
          `\x1b[33m 〢`,
          `\x1b[33m ${moment(Date.now()).format("LT")}`,
          `\x1b[31m Error checking time left for role`,
          `\x1b[34m ${message}`,
        );
        await interaction.editReply({
          embeds: [
            {
              title: `${emojis.warning} Cooldown period`,
              description: `An error occurred while checking the time for your cooldown.`,
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
