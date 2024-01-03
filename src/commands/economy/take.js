const { MessageEmbed } = require("discord.js");
const moment = require("moment");
const fs = require("fs");
const wait = require("util").promisify(setTimeout);

const settings = JSON.parse(fs.readFileSync("./src/assest/settings.json"));
const color = settings.colors;
const emojis = settings.emojis;
const banners = settings.banners;

const Currency = require("../../../src/database/models/economy");

module.exports = async (client, config) => {
  client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand() && interaction.commandName === "take") {
      await interaction.deferReply({ ephemeral: true });
      const perms = [`${config.devRole}`];
      const staff = interaction.guild.members.cache.get(interaction.user.id);

      // Check if the user has the required permissions
      if (!staff.roles.cache.hasAny(...perms)) {
        return interaction.editReply({
          embeds: [
            new MessageEmbed()
              .setColor(color.gray)
              .setTitle(`${emojis.warning} Permission Denied`)
              .setDescription(
                `${emojis.threadMark} You don't have permission to use this command.`,
              ),
          ],
          ephemeral: true,
        });
      }

      // Get the mentioned user and the amount to take from the command options
      const user = interaction.options.getUser("user");
      const iceCoinsToTake = interaction.options.getInteger("amount");

      if (!user) {
        return interaction.editReply({
          embeds: [
            new MessageEmbed()
              .setColor(color.gray)
              .setTitle("Invalid User")
              .setDescription("Please mention a valid user."),
          ],
          ephemeral: true,
        });
      }

      // Check if the provided amount is valid
      if (isNaN(iceCoinsToTake) || iceCoinsToTake <= 0) {
        return interaction.editReply({
          embeds: [
            new MessageEmbed()
              .setColor(color.gray)
              .setTitle(`${emojis.warning} Invalid Amount`)
              .setDescription(
                `${emojis.threadMark} Please provide a valid positive number of Ice Coins to take.`,
              ),
          ],
          ephemeral: true,
        });
      }

      // Find the user's balance in the database
      const userBalance = await Currency.findOne({
        userId: user.id,
      });

      // If the user doesn't have a record, create one
      if (!userBalance) {
        await Currency.create({
          userId: user.id,
          iceCoins: 0,
        });
      }

      // Ensure the user has enough balance
      if (userBalance.iceCoins < iceCoinsToTake) {
        return interaction.editReply({
          embeds: [
            new MessageEmbed()
              .setColor(color.gray)
              .setTitle(`${emojis.warning} Insufficient Balance`)
              .setDescription(
                `${emojis.threadMark} ${user} doesn't have enough Ice Coins to take.`,
              ),
          ],
          ephemeral: true,
        });
      }

      try {
        // Update user's balance
        userBalance.iceCoins -= iceCoinsToTake;

        // Save changes to the database
        await userBalance.save();

        interaction.editReply({
          embeds: [
            new MessageEmbed()
              .setColor(color.gray)
              .setTitle(`${emojis.check} Ice Coins Taken`)
              .setDescription(
                `Took ${emojis.ic} ${iceCoinsToTake} Ice Coins from ${user}.`,
              ),
          ],
          ephemeral: true,
        });
        console.log(
          `\x1b[0m`,
          `\x1b[33m 〢`,
          `\x1b[33m ${moment(Date.now()).format("LT")}`,
          `\x1b[31m ${interaction.user.username}`,
          `\x1b[31m Took`,
          `\x1b[33m ${iceCoinsToTake} Ice Coins`,
          `\x1b[31m From`,
          `\x1b[34m ${user.username}`,
        );
      } catch (error) {
        console.error(
          `\x1b[0m`,
          `\x1b[33m 〢`,
          `\x1b[33m ${moment(Date.now()).format("LT")}`,
          `\x1b[31m Error in take command`,
          `\x1b[31m ${error.message}`,
        );
        interaction.editReply({
          embeds: [
            new MessageEmbed()
              .setColor(color.gray)
              .setTitle("Error")
              .setDescription(
                "Something went wrong while updating the user's balance. Please try again later.",
              ),
          ],
          ephemeral: true,
        });
      }
      // Auto-dismiss after 10 seconds
      setTimeout(async () => {
        try {
          await interaction.deleteReply();
        } catch (error) {
          console.error("Error in auto-dismiss:", error);
        }
      }, 10 * 1000); // 10000 milliseconds = 10 seconds
    }
  });
};
