const { MessageEmbed, MessageAttachment } = require("discord.js");
const moment = require("moment");
const fs = require("fs");
const { createCanvas } = require("canvas");

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

        // Fetch the user's level and experience from the database
        const userLevel = userBalance.level || 0;
        const userXP = userBalance.xp || 0;

        // Calculate remaining XP to achieve the next level
        const xpRequiredForNextLevel = 10000; // Change this to your desired XP required for the next level
        const remainingXP =
          xpRequiredForNextLevel - (userXP % xpRequiredForNextLevel);

        // Format the balance and level
        const formattedBalance = userBalance.iceCoins.toLocaleString();

        // Create a canvas for the progress bar
        const canvas = createCanvas(350, 15);
        const ctx = canvas.getContext("2d");

        // Draw blank background
        ctx.fillStyle = "#343541"; // OpenAI Grey color
        ctx.fillRect(0, 0, 350, 15);

        // Draw progress bar
        ctx.fillStyle = "#d9507c";
        const progressBarWidth = (userXP / xpRequiredForNextLevel) * 350; // Assuming 100 XP is the maximum for the bar
        ctx.fillRect(0, 0, progressBarWidth, 15);

        // Add text inside the progress bar
        ctx.fillStyle = "#ffffff"; // White color
        ctx.fillText(`XP: ${userXP} / ${xpRequiredForNextLevel}`, 10, 11);

        // Add text inside the progress bar for remaining XP
        const remainingXPText = `Remaining: ${remainingXP}`;
        const remainingXPTextWidth = ctx.measureText(remainingXPText).width;
        const remainingXPTextX = 350 - remainingXPTextWidth - 10;
        ctx.fillText(remainingXPText, remainingXPTextX, 11);

        // Center the user level on the progress bar
        const levelText = `Level: ${userLevel}`;
        const levelTextWidth = ctx.measureText(levelText).width;
        const levelTextX = (350 - levelTextWidth) / 2;
        ctx.fillText(levelText, levelTextX, 11);

        // Attach the canvas as an image to the embed
        const attachment = new MessageEmbed()
          .setColor(color.gray)
          .setTitle(`${emojis.wallet} Wallet`)
          .setDescription(
            `${emojis.threadMark} Your current balance is: ${emojis.ic} **${formattedBalance} Ice Coins**`,
          )
          .setImage("attachment://progress.png");

        // Send the embed with the canvas
        interaction.editReply({
          embeds: [attachment],
          files: [new MessageAttachment(canvas.toBuffer(), "progress.png")],
          ephemeral: true,
        });
      } catch (error) {
        console.error("Error in wallet command:", error);
        await interaction.editReply({
          embeds: [
            new MessageEmbed()
              .setColor(color.gray)
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
