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
      interaction.commandName === "change_cooldown"
    ) {
      await interaction.deferReply({ ephemeral: true });

      const member = interaction.options.getUser("member");
      const duration = interaction.options.getInteger("duration");
      const durationType = interaction.options.getString("type");
      const reason = interaction.options.getString("reason");

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
            await memberTarget.send({
              embeds: [
                new MessageEmbed()
                  .setColor(color.gray)
                  .setTitle(`${emojis.cooldown} Cooldown Changed`)
                  .setDescription(
                    `${
                      emojis.threadMark
                    } Your cooldown has been changed. It will now ends <t:${Math.floor(
                      newExpiryDate / 1000,
                    )}:R>`,
                  )
                  .addFields({
                    name: `${emojis.warning} Reason`,
                    value: `${emojis.threadMark} ${reason}`,
                    inline: false,
                  }),
              ],
            });

            const log = interaction.guild.channels.cache.get(config.log);
            await log.send({
              embeds: [
                {
                  title: `${emojis.log} Cooldown Changes Log`,
                  description: `${emojis.snow} ${interaction.user} changed the cooldown for ${memberTarget}`,
                  color: color.gray,
                  fields: [
                    {
                      name: `${emojis.lastUpdate} New End Date`,
                      value: `${emojis.threadMark} <t:${Math.floor(
                        newExpiryDate / 1000,
                      )}:R> ${emojis.pinkDot} <t:${Math.floor(
                        newExpiryDate / 1000,
                      )}:F>`,
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
                  title: `${emojis.check} Cooldown Changes!`,
                  description: `${
                    emojis.threadMarkmid
                  } The cooldown duration for ${memberTarget} has been changed\n${
                    emojis.threadMark
                  } Now it will ends <t:${Math.floor(newExpiryDate / 1000)}:R>`,
                  color: color.gray,
                },
              ],
              ephemeral: true,
            });
            console.log(
              `\x1b[0m`,
              `\x1b[33m 〢`,
              `\x1b[33m ${moment(Date.now()).format("LT")}`,
              `\x1b[31m ${interaction.user.username}`,
              `\x1b[32m changed the cooldown of`,
              `\x1b[35m ${memberTarget.user.username}`,
              `\x1b[33m for ${moment(newExpiryDate).fromNow()}`,
            );
          } else {
            await interaction.editReply({
              embeds: [
                {
                  title: `${emojis.cooldown} Cooldown Changes!`,
                  description: `${emojis.threadMark} ${memberTarget} isn't in cooldown period`,
                  color: color.gray,
                },
              ],
              ephemeral: true,
            });
          }
        } catch (error) {
          console.log(
            `\x1b[0m`,
            `\x1b[33m 〢`,
            `\x1b[33m ${moment(Date.now()).format("LT")}`,
            `\x1b[31m Error changing ${memberTarget} cooldown duration`,
            `\x1b[34m ${error.message}`,
          );
          await interaction.editReply({
            embeds: [
              {
                title: `${emojis.warning} Oops!`,
                description: `${emojis.threadMark} An error occurred while updating ${memberTarget}'s cooldown duration`,
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
        console.log(
          `\x1b[0m`,
          `\x1b[33m 〢`,
          `\x1b[33m ${moment(Date.now()).format("LT")}`,
          `\x1b[31m Permission denied`,
        );
      }
    }
  });
};
