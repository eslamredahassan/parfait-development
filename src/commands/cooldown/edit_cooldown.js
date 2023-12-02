const { MessageEmbed } = require("discord.js");
const moment = require("moment");
const TemporaryRole = require("../../../src/database/models/TemporaryRoleModel");
const color = require("../../../src/assest/color.js");
const banners = require("../../../src/assest/banners.js");
const emojis = require("../../../src/assest/emojis");
const errors = require("../../../src/assest/errors.js");

module.exports = async (client, config) => {
  let guild = client.guilds.cache.get(config.guildID);

  client.on("interactionCreate", async (interaction) => {
    if (
      interaction.isCommand() &&
      interaction.commandName === "edit_cooldown"
    ) {
      await interaction.deferReply({ ephemeral: true });

      const member = interaction.options.getUser("member");
      const duration = interaction.options.getInteger("duration");
      const durationType = interaction.options.getString("type");

      const perms = [`${config.devRole}`, `${config.devRoleTest}`];
      let staff = guild.members.cache.get(interaction.user.id);

      if (staff.roles.cache.hasAny(...perms)) {
        const memberTarget = interaction.guild.members.cache.get(member.id);

        try {
          let newExpiryDate = new Date();

          switch (durationType) {
            case "minutes":
              newExpiryDate.setMinutes(newExpiryDate.getMinutes() + duration);
              break;
            case "hours":
              newExpiryDate.setHours(newExpiryDate.getHours() + duration);
              break;
            case "days":
              newExpiryDate.setDate(newExpiryDate.getDate() + duration);
              break;
            case "months":
              newExpiryDate.setMonth(newExpiryDate.getMonth() + duration);
              break;
            default:
              break;
          }

          const updatedRole = await TemporaryRole.findOneAndUpdate({
            userId: member.id,
            expiry: newExpiryDate,
            new: true,
          });

          if (updatedRole) {
            const timestamp = updatedRole.expiry.toLocaleString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            });

            await memberTarget.send({
              embeds: [
                new MessageEmbed()
                  .setColor(color.gray)
                  .setTitle(`${emojis.sad_parfait} Cooldown Updated`)
                  .setDescription(
                    `${emojis.threadMark} Your cooldown has been updated. It will now end on ${timestamp}.`,
                  ),
              ],
            });

            const log = interaction.guild.channels.cache.get(config.log);
            await log.send({
              embeds: [
                {
                  title: `${emojis.log} Cooldown Udate Log`,
                  description: `${emojis.snow} ${interaction.user} updated the cooldown for ${memberTarget}`,
                  color: color.gray,
                  fields: [
                    {
                      name: `${emojis.lastUpdate} New End Date`,
                      value: `${emojis.threadMark} ${timestamp}`,
                      inline: false,
                    },
                  ],
                  timestamp: new Date(),
                  footer: {
                    text: "Updated in",
                    icon_url: banners.parfaitIcon,
                  },
                },
              ],
              //this is the important part
              ephemeral: false,
            });

            await interaction.editReply({
              embeds: [
                {
                  title: `${emojis.snow} Cooldown Update!`,
                  description: `The cooldown duration for ${memberTarget} has been updated. It will now end on ${timestamp}.`,
                  color: color.gray,
                },
              ],
              ephemeral: true,
            });
          } else {
            await interaction.editReply({
              embeds: [
                {
                  title: `${emojis.snow} Cooldown Update!`,
                  description: `${memberTarget} isn't in cooldown period`,
                  color: color.gray,
                },
              ],
              ephemeral: true,
            });
          }
        } catch (error) {
          console.error("Error updating cooldown duration:", error.message);
          await interaction.editReply({
            embeds: [
              {
                title: `${emojis.snow} Oops!`,
                description: `An error occurred while updating the cooldown duration.`,
                color: color.gray,
              },
            ],
            ephemeral: true,
          });
        }
      } else {
        await interaction.editReply({
          content: errors.permsError,
          ephemeral: true,
        });
        console.log("Permission denied");
      }
    }
  });
};
