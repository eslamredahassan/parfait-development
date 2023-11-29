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
    if (interaction.isCommand()) {
      switch (interaction.commandName) {
        case "add_cooldown": {
          const member = interaction.options.getUser("member");
          const reason = interaction.options.getString("reason");
          const duration = interaction.options.getInteger("duration");
          const durationType = interaction.options.getString("type"); // Minutes, Hours, Days

          await interaction.deferReply({ ephemeral: true });

          const perms = [`${config.devRole}`, `${config.devRoleTest}`];
          let staff = guild.members.cache.get(interaction.user.id);

          if (staff.roles.cache.hasAny(...perms)) {
            const memberTarget = interaction.guild.members.cache.get(member.id);

            if (
              memberTarget &&
              !memberTarget.roles.cache.hasAny(config.coolDown)
            ) {
              try {
                const expiryDate = new Date();
                switch (durationType) {
                  case "minutes":
                    expiryDate.setMinutes(expiryDate.getMinutes() + duration);
                    break;
                  case "hours":
                    expiryDate.setHours(expiryDate.getHours() + duration);
                    break;
                  case "days":
                    expiryDate.setDate(expiryDate.getDate() + duration);
                    break;
                  case "months":
                    expiryDate.setMonth(expiryDate.getMonth() + duration);
                    break;
                  default:
                    break;
                }

                const existingRole = await TemporaryRole.findOne({
                  userId: member.id,
                });

                if (!existingRole) {
                  await memberTarget.roles.add(config.coolDown);

                  await TemporaryRole.create({
                    userId: memberTarget.id,
                    guildId: guild.id,
                    roleId: config.coolDown,
                    expiry: expiryDate,
                  });

                  const timestamp = expiryDate.toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true, // Display in AM/PM format
                  });

                  // Send a DM to the user with the cooldown's end date
                  await memberTarget.send({
                    embeds: [
                      new MessageEmbed()
                        .setColor(color.gray)
                        .setTitle(`${emojis.sad_parfait} Warning!`)
                        .setDescription(
                          `Staff member added a cooldown to you for ${reason}.`,
                        )
                        .addFields(
                          {
                            name: `${emojis.time} Cooldown Duration`,
                            value: `${emojis.threadMark} ${duration} ${durationType}`,
                            inline: true,
                          },
                          {
                            name: `${emojis.lastUpdate} Ends on`,
                            value: `${emojis.threadMark} ${timestamp}`,
                            inline: true,
                          },
                        ),
                    ],
                  });
                  const log = interaction.guild.channels.cache.get(config.log);
                  await log.send({
                    embeds: [
                      {
                        title: `${emojis.log} Cooldown Add Log`,
                        description: `${emojis.snow} ${interaction.user} added cooldown to ${memberTarget} for ${duration} ${durationType}`,
                        color: color.gray,
                        fields: [
                          {
                            name: `${emojis.reason} Cooldown Reason`,
                            value: `${emojis.threadMark} ${reason}`,
                            inline: false,
                          },
                          {
                            name: `${emojis.lastUpdate} End Date`,
                            value: `${emojis.threadMark} ${timestamp}`,
                            inline: false,
                          },
                        ],
                        timestamp: new Date(),
                        footer: {
                          text: "Cooldown aaded in",
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
                        title: `${emojis.check} Cooldown Added!`,
                        description: `Okay ${interaction.user.username} you added cooldown to ${memberTarget} for ${duration} ${durationType}`,
                        color: color.gray,
                      },
                    ],
                    ephemeral: true,
                  });
                } else {
                  await interaction.editReply({
                    embeds: [
                      {
                        title: `${emojis.snow} Oops!`,
                        description: `${memberTarget} is already in cooldown period.`,
                        color: color.gray,
                      },
                    ],
                    ephemeral: true,
                  });
                }
              } catch (error) {
                console.error("Error giving temporary role:", error.message);
                await interaction.editReply({
                  content: "An error occurred while giving the temporary role.",
                  ephemeral: true,
                });
              }
            } else {
              await interaction.editReply({
                embeds: [
                  {
                    title: `${emojis.snow} Oops!`,
                    description: `${memberTarget} is already in cooldown period.`,
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
