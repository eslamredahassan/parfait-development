const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");

const moment = require("moment");
const wait = require("util").promisify(setTimeout);
const cooldown = new Set();
require("moment-duration-format");

const TemporaryRole = require("../../../src/database/models/TemporaryRoleModel");

const errors = require("../../../src/assest/errors.js");
const color = require("../../../src/assest/color.js");
const banners = require("../../../src/assest/banners.js");
const emojis = require("../../../src/assest/emojis");

module.exports = async (client, config) => {
  let guild = client.guilds.cache.get(config.guildID);
  let Logo = guild.iconURL({ dynamic: true });

  client.on("interactionCreate", async (interaction) => {
    if (
      interaction.isCommand() &&
      interaction.commandName === "remove_cooldown"
    ) {
      await interaction.deferReply({ ephemeral: true });

      const member = interaction.options.getUser("member");
      const reason = interaction.options.getString("reason");

      const perms = [`${config.devRole}`, `${config.devRoleTest}`];
      let staff = guild.members.cache.get(interaction.user.id);
      if (staff.roles.cache.hasAny(...perms)) {
        // Send Echo Message To Mentioned Room
        const memberTarget = interaction.guild.members.cache.get(member.id);
        try {
          const temporaryRole = await TemporaryRole.findOneAndDelete({
            userId: member.id,
          });
          if (temporaryRole) {
            const role = guild.roles.cache.get(temporaryRole.roleId);
            if (role) {
              await memberTarget.roles.remove(role);

              await memberTarget.send({
                embeds: [
                  new MessageEmbed()
                    .setColor(color.gray)
                    .setTitle(`${emojis.alert} Cooldown Removed`)
                    .setDescription(
                      `Your cooldown has been removed by ${interaction.user}.`,
                    ),
                ],
              });

              await interaction.editReply({
                embeds: [
                  {
                    title: `${emojis.snow} Done!`,
                    description: `Okay ${interaction.user.username} remove ${memberTarget}'s cooldown`,
                    color: color.gray,
                  },
                ],
                ephemeral: true,
              });
            } else {
              await interaction.editReply({
                content:
                  "The temporary role was not found. Please contact an admin.",
                ephemeral: true,
              });
            }
          } else {
            await interaction.editReply({
              embeds: [
                {
                  title: `${emojis.alert} Oops!`,
                  description: `No one freeze ${memberTarget} before ${emojis.tea}`,
                  color: color.gray,
                },
              ],
              ephemeral: true,
            });
          }
        } catch (error) {
          console.error("Error removing temporary role:", error.message);
          await interaction.editReply({
            content: "An error occurred while removing your temporary role.",
            ephemeral: true,
          });
        }
        //// Send message to log channel after freezing member ///
        const log = interaction.guild.channels.cache.get(config.log);
        await log.send({
          embeds: [
            {
              title: `${emojis.log} Frozen Log`,
              description: `${emojis.snow} ${memberTarget}'s cooldown removed by ${interaction.user}`,
              color: color.gray,
              fields: [
                {
                  name: `${emojis.reason} Freeze Reason`,
                  value: reason || `No Reason Found`,
                  inline: false,
                },
              ],
              timestamp: new Date(),
              footer: {
                text: "Frozen in",
                icon_url: banners.parfaitIcon,
              },
            },
          ],
          //this is the important part
          ephemeral: false,
        });
      } else {
        await interaction.editReply({
          embeds: [
            {
              title: `${emojis.alert} Permission denied`,
              description: errors.permsError,
              color: color.gray,
            },
          ],
          //this is the important part
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
  });
};
