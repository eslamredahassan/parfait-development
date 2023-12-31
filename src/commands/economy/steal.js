const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

const fs = require("fs");
const moment = require("moment");
const wait = require("util").promisify(setTimeout);

const Currency = require("../../../src/database/models/economy");

const settings = JSON.parse(fs.readFileSync("./src/assest/settings.json"));
const color = settings.colors;
const emojis = settings.emojis;

module.exports = async (client, config) => {
  client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand() && interaction.commandName === "steal") {
      await interaction.deferReply({ ephemeral: true });
      const targetUser = interaction.options.getUser("target");

      // Check if a valid target user is mentioned
      if (
        !targetUser ||
        targetUser.bot ||
        targetUser.id === interaction.user.id
      ) {
        return interaction.editReply({
          embeds: [
            new MessageEmbed()
              .setColor(color.gray)
              .setTitle(`${emojis.warning} Invalid target!`)
              .setDescription(
                `${emojis.threadMark} Please mention a valid user (not a bot and not yourself).`,
              ),
          ],
          ephemeral: true,
          components: [],
        });
      }

      try {
        // Check if the target has IceShieldLv1 role
        const targetMember = interaction.guild.members.cache.get(targetUser.id);
        const hasIceShieldLv1 = targetMember.roles.cache.has(
          config.iceShieldLv1,
        );

        if (hasIceShieldLv1) {
          // If the target has IceShieldLv1, show a confirmation embed with buttons
          const confirmationEmbed = new MessageEmbed()
            .setColor(color.gray)
            .setTitle(`${emojis.warning} Ice Shield Lv1 Detected!`)
            .setDescription(
              `${emojis.threadMark} ${targetUser} has Ice Shield Lv1, Do you still want to attempt stealing?`,
            );

          const confirmButton = new MessageButton()
            .setCustomId("#confirm_steal")
            .setLabel("Yes")
            .setStyle(2);

          const cancelButton = new MessageButton()
            .setCustomId("#cancel_steal")
            .setLabel("No")
            .setStyle(2);

          const row = new MessageActionRow().addComponents(
            confirmButton,
            cancelButton,
          );

          await interaction.editReply({
            embeds: [confirmationEmbed],
            components: [row],
          });

          // Listen for button interactions
          const filter = (i) =>
            i.customId.startsWith("#confirm_steal") ||
            i.customId.startsWith("#cancel_steal");
          const collector = interaction.channel.createMessageComponentCollector(
            {
              filter,
              time: 1 * 60 * 1000, // 1 minute
              max: 1,
            },
          );

          collector.on("collect", async (buttonInteraction) => {
            if (buttonInteraction.customId === "#confirm_steal") {
              // Proceed with stealing
              await handleSteal(interaction, targetUser);
            } else {
              // Cancel stealing
              await interaction.editReply({
                embeds: [
                  new MessageEmbed()
                    .setColor(color.gray)
                    .setTitle(`${emojis.cross} Stealing Canceled!`)
                    .setDescription(
                      `${emojis.threadMark} You canceled the attempt to steal from ${targetUser}.`,
                    ),
                ],
                ephemeral: true,
                components: [],
              });
            }
          });

          collector.on("end", (collected, reason) => {
            if (reason === "time") {
              // If the collector times out, remove the buttons
              interaction.editReply({
                embeds: [confirmationEmbed],
                components: [],
              });
            }
          });
        } else {
          // If the target does not have IceShieldLv1, proceed with stealing
          await handleSteal(interaction, targetUser);
        }
      } catch (error) {
        console.error(
          `\x1b[0m`,
          `\x1b[33m 〢`,
          `\x1b[33m ${moment(Date.now()).format("LT")}`,
          `\x1b[31m Error in steal command:`,
          `\x1b[32m ${error.message}`,
        );
        return interaction.editReply({
          embeds: [
            new MessageEmbed()
              .setColor(color.gray)
              .setTitle(`${emojis.cross} Oops!`)
              .setDescription(
                `${emojis.threadMark} Something went wrong. Please try again later.`,
              ),
          ],
          ephemeral: true,
          components: [],
        });
      }
    }
  });
  // Function to handle the stealing logic
  async function handleSteal(interaction, targetUser) {
    try {
      // Find the user's balance in the database
      let userBalance = await Currency.findOne({
        userId: interaction.user.id,
      });

      // If the user doesn't have a record, create one
      if (!userBalance) {
        userBalance = new Currency({
          userId: interaction.user.id,
          iceCoins: 0,
        });
      }

      // Check if the user has enough coins to attempt stealing
      if (userBalance.iceCoins <= 0) {
        return interaction.editReply({
          embeds: [
            new MessageEmbed()
              .setColor(color.gray)
              .setTitle(`${emojis.cross} Insufficient Ice Coins!`)
              .setDescription(
                `${emojis.threadMark} You don't have enough Ice Coins to attempt stealing.`,
              ),
          ],
          ephemeral: true,
          components: [],
        });
      }

      // Check if the target has IceShieldLv1 role
      const targetMember = interaction.guild.members.cache.get(targetUser.id);
      const hasIceShieldLv1 = targetMember.roles.cache.has(config.IceShieldLv1);

      // Adjust stealing chance based on the presence of IceShieldLv1 role
      const stealChance = hasIceShieldLv1 ? 0.0025 : 0.5; // 0.5 (50%) is the default chance

      // Simulate stealing with adjusted chance
      const successfulSteal = Math.random() < stealChance;

      if (successfulSteal) {
        // Calculate a random amount to steal (up to half of the target's balance)
        const stolenAmount =
          Math.floor(Math.random() * (userBalance.iceCoins / 2)) + 1;

        // Find the target's balance in the database
        let targetBalance = await Currency.findOne({
          userId: targetUser.id,
        });

        // If the target doesn't have a record, create one
        if (!targetBalance) {
          targetBalance = new Currency({
            userId: targetUser.id,
            iceCoins: 0,
          });
        }

        // Update target's balance
        targetBalance.iceCoins -= stolenAmount;

        // Update user's balance
        userBalance.iceCoins += stolenAmount;

        // Save changes to the database
        await targetBalance.save();
        await userBalance.save();

        // Send success message to the thief
        await interaction.editReply({
          embeds: [
            new MessageEmbed()
              .setColor(color.gray)
              .setTitle(`${emojis.check} Successful steal!`)
              .setDescription(
                `${emojis.threadMark} You successfully stole ${
                  emojis.ic
                } **${stolenAmount.toLocaleString()} Ice Coins** from ${targetUser}!`,
              ),
          ],
          ephemeral: true,
          components: [],
        });

        // Send success message to the target
        await targetUser.send({
          embeds: [
            new MessageEmbed()
              .setColor(color.gray)
              .setTitle(`${emojis.warning} Attempted Theft Alert!`)
              .setDescription(
                `${emojis.threadMark} ${interaction.user} successfully stole ${
                  emojis.ic
                } **${stolenAmount.toLocaleString()} Ice Coins** from you!`,
              ),
          ],
        });

        console.log(
          `\x1b[0m`,
          `\x1b[33m 〢`,
          `\x1b[33m ${moment(Date.now()).format("LT")}`,
          `\x1b[31m ${interaction.user.username}`,
          `\x1b[33m Stole`,
          `\x1b[31m ${stolenAmount} Ice Coins`,
          `\x1b[36m from`,
          `\x1b[35m ${targetUser.username}`,
        );
      } else {
        // Failed stealing attempt
        await interaction.editReply({
          embeds: [
            new MessageEmbed()
              .setColor(color.gray)
              .setTitle(`${emojis.cross} Failed steal!`)
              .setDescription(
                `${emojis.threadMark} Your attempt to steal from ${targetUser} was unsuccessful.`,
              ),
          ],
          ephemeral: true,
          components: [],
        });

        // Send failure message to the target
        await targetUser.send({
          embeds: [
            new MessageEmbed()
              .setColor(color.gray)
              .setTitle(`${emojis.warning} Theft Alert!`)
              .setDescription(
                `${emojis.threadMark} ${interaction.user} attempted to steal your Ice Coins, but failed.`,
              ),
          ],
        });
      }
    } catch (error) {
      console.error(
        `\x1b[0m`,
        `\x1b[33m 〢`,
        `\x1b[33m ${moment(Date.now()).format("LT")}`,
        `\x1b[31m Error in steal command:`,
        `\x1b[32m ${error.message}`,
      );
      return interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setColor(color.gray)
            .setTitle(`${emojis.cross} Oops!`)
            .setDescription(
              `${emojis.threadMark} Something went wrong. Please try again later.`,
            ),
        ],
        ephemeral: true,
        components: [],
      });
    }
  }
};
