const { MessageEmbed } = require("discord.js");

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

        // Simulate stealing (30% chance)
        const successfulSteal = Math.random() < 0.3;

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

          console.log(
            `\x1b[0m`,
            `\x1b[33m 〢`,
            `\x1b[33m ${moment(Date.now()).format("LT")}`,
            `\x1b[31m ${interaction.user.username}`,
            `\x1b[33m successfully stole`,
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
};
