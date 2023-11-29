const { MessageEmbed } = require("discord.js");
const TemporaryRole = require("../../../src/database/models/TemporaryRoleModel");
const color = require("../../../src/assest/color.js");
const emojis = require("../../../src/assest/emojis");

module.exports = async (client, config) => {
  let guild = client.guilds.cache.get(config.guildID);

  client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand()) {
      switch (interaction.commandName) {
        case "check_cooldown": {
          const member = interaction.options.getUser("member");
          const memberTarget = interaction.guild.members.cache.get(member.id);

          await interaction.deferReply({ ephemeral: true });

          const perms = [config.devRole, config.devRoleTest];
          const staff = guild.members.cache.get(interaction.user.id);

          if (staff.roles.cache.hasAny(...perms)) {
            try {
              const temporaryRole = await TemporaryRole.findOne({
                userId: member.id,
              });

              if (temporaryRole) {
                const expiryDate = temporaryRole.expiry;
                const timestamp = expiryDate.toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                });

                await interaction.editReply({
                  embeds: [
                    new MessageEmbed()
                      .setColor(color.gray)
                      .setTitle(
                        `Cooldown Duration for ${memberTarget.user.username}`,
                      )
                      .setDescription(`The cooldown will end on ${timestamp}`),
                  ],
                  ephemeral: true,
                });
              } else {
                await interaction.editReply({
                  content: `${memberTarget} does not have any cooldown.`,
                  ephemeral: true,
                });
              }
            } catch (error) {
              console.error("Error checking cooldown duration:", error.message);
              await interaction.editReply({
                content:
                  "An error occurred while checking the cooldown duration.",
                ephemeral: true,
              });
            }
          } else {
            await interaction.editReply({
              content:
                "You don't have the required permissions to check cooldowns.",
              ephemeral: true,
            });
            console.log(
              `\x1b[0m`,
              `\x1b[31m 🛠`,
              `\x1b[33m ${moment(Date.now()).format("lll")}`,
              `\x1b[31m Permission denied`,
            );
          }
        }
      }
    }
  });
};
