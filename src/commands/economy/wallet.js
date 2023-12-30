const { MessageEmbed } = require("discord.js");
const fs = require("fs");

const settings = JSON.parse(fs.readFileSync("./src/assest/settings.json"));
const color = settings.colors;
const emojis = settings.emojis;
const banners = settings.banners;

const Currency = require("../../../src/database/models/economy");

module.exports = async (client, config) => {
  client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand() && interaction.commandName === "wallet") {
      try {
        await interaction.deferReply({ ephemeral: true });
        // Find the user's balance in the database
        const userBalance = await Currency.findOne({
          userId: interaction.user.id,
        });

        // If the user doesn't have a record, create one
        if (!userBalance) {
          await Currency.create({
            userId: interaction.user.id,
            iceCoins: 0,
          });
        }

        const formattedBalance = userBalance.iceCoins.toLocaleString();

        await interaction.editReply({
          embeds: [
            new MessageEmbed()
              .setColor(color.gray) // You can customize the color
              .setDescription(
                `### ${emojis.wallet} Wallet\n${emojis.threadMark} Your current balance is: ${emojis.ic} **${formattedBalance} Ice Coins**`,
              ),
          ],
          ephemeral: true,
        });
      } catch (error) {
        console.error("Error in wallet command:", error);
        await interaction.editReply({
          embeds: [
            new MessageEmbed()
              .setColor(color.gray) // You can customize the color
              .setTitle(`${emojis.warning} Oops!`)
              .setDescription(
                "Something went wrong while fetching your balance. Please try again later.",
              ),
          ],
          ephemeral: true,
        });
      }
    }
  });
};
