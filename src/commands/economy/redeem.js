const { MessageEmbed } = require("discord.js");
const moment = require("moment");
const fs = require("fs");

const settings = JSON.parse(fs.readFileSync("./src/assest/settings.json"));
const color = settings.colors;
const emojis = settings.emojis;
const banners = settings.banners;

const GeneratedCode = require("../../../src/database/models/generated_codes");
const Currency = require("../../../src/database/models/economy");

module.exports = async (client, config) => {
  client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand() && interaction.commandName === "redeem") {
      await interaction.deferReply({ ephemeral: true });

      // Get the code option from the command
      const code = interaction.options.getString("code");

      // Check if the code is provided
      if (!code) {
        return interaction.editReply({
          embeds: [
            new MessageEmbed()
              .setColor(color.gray)
              .setTitle("Error")
              .setDescription("Please provide a valid redemption code."),
          ],
          ephemeral: true,
        });
      }

      try {
        // Find the code in the database
        const foundCode = await GeneratedCode.findOne({ code });

        // Check if the code exists
        if (foundCode) {
          // Check if the code is disabled
          if (foundCode.disabled) {
            return interaction.editReply({
              embeds: [
                new MessageEmbed()
                  .setColor(color.gray)
                  .setTitle(`${emojis.cross} Invalid Code`)
                  .setDescription(
                    `${emojis.threadMark} This code has been expired.`,
                  ),
              ],
              ephemeral: true,
            });
          }

          // Check if the code has already been redeemed by the user
          if (foundCode.redeemed.includes(interaction.user.id)) {
            return interaction.editReply({
              embeds: [
                new MessageEmbed()
                  .setColor(color.gray)
                  .setTitle(`${emojis.cross} Invalid Code`)
                  .setDescription(
                    `${emojis.threadMark} You have already redeemed this code."`,
                  ),
              ],
              ephemeral: true,
            });
          }

          // Fetch the user's current balance
          const userBalance = await Currency.findOne({
            userId: interaction.user.id,
          });

          // Determine the type of the code (ice or xp)
          const codeType = foundCode.type;

          // Add the redeemed amount to the user's balance based on the code type
          if (userBalance) {
            if (codeType === "ice") {
              userBalance.iceCoins += foundCode.amount;
            } else if (codeType === "xp") {
              userBalance.xp += foundCode.amount;
            }

            await userBalance.save();
          } else {
            // If the user doesn't have a record, create one
            const balanceData = {
              userId: interaction.user.id,
            };

            // Set the balance based on the code type
            balanceData[`${codeType}Coins`] = foundCode.amount;

            await Currency.create(balanceData);
          }

          // Update the code status to include the user ID in the redeemed array
          foundCode.redeemed.push(interaction.user.id);
          await foundCode.save();

          // Fetch the updated balance
          const updatedBalance = await Currency.findOne({
            userId: interaction.user.id,
          });

          const formattedBalance = updatedBalance
            ? updatedBalance[`${codeType}Coins`]?.toLocaleString() || 0
            : 0;

          // Customize the reply message based on the code type
          let title = "";
          let description = "";
          let embedColor = color.gray;

          if (codeType === "ice") {
            embedColor = color.gray; // Change to the color you desire for ice codes
            title = `${emojis.check} Code Redeemed Successfully`;
            description = `${emojis.threadMark} You've received ${
              emojis.ic
            } ${foundCode.amount.toLocaleString()} Ice Coins, and your balance is now ${formattedBalance}`;
          } else if (codeType === "xp") {
            embedColor = color.gray; // Change to the color you desire for xp codes
            title = `${emojis.check} Code Redeemed Successfully`;
            description = `${emojis.threadMark} You've received ${
              emojis.levelUp
            } ${foundCode.amount.toLocaleString()} XP Points, and your total XP is now ${userBalance.xp.toLocaleString()} XP`;
          }

          return interaction.editReply({
            embeds: [
              new MessageEmbed()
                .setColor(embedColor)
                .setTitle(title)
                .setDescription(description),
            ],
            ephemeral: true,
          });
        } else {
          return interaction.editReply({
            embeds: [
              new MessageEmbed()
                .setColor(color.gray)
                .setTitle("Error")
                .setDescription("Invalid code."),
            ],
            ephemeral: true,
          });
        }
      } catch (error) {
        console.error("Error redeeming code:", error);
        return interaction.editReply({
          embeds: [
            new MessageEmbed()
              .setColor(color.gray)
              .setTitle("Error")
              .setDescription(
                "Something went wrong while redeeming the code. Please try again later.",
              ),
          ],
          ephemeral: true,
        });
      }
    }
  });
};
