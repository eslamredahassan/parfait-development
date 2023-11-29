const { MessageAttachment } = require("discord.js");
const { createCanvas, loadImage } = require("canvas");

module.exports = async (client, config) => {
  client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand()) {
      switch (interaction.commandName) {
        case "dev_test": {
          await interaction.deferReply({ ephemeral: true });
          try {
            const canvas = createCanvas(800, 400);
            const ctx = canvas.getContext("2d");

            // Load the custom background image
            const bg = await loadImage(
              "https://miro.medium.com/v2/resize:fit:720/format:webp/0*cjzqkJt1XGKyYk2A.png",
            );
            ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

            // Continue with other drawing operations...
            ctx.fillStyle = "#000000";
            ctx.font = "36px Arial";
            ctx.fillText("Welcome to the Server!", 50, 50);

            // Other elements, like user name and avatar, go below the background
            const username = interaction.user.username;
            ctx.font = "24px Arial";
            ctx.fillText(`Welcome, ${username}!`, 50, 100);

            const avatarURL = interaction.user.displayAvatarURL({
              format: "jpg",
            });
            const avatar = await loadImage(avatarURL);
            ctx.drawImage(avatar, 50, 120, 100, 100);

            // Create an attachment and send the image in the interaction reply
            const attachment = new MessageAttachment(
              canvas.toBuffer(),
              "welcome-image.png",
            );
            await interaction.editReply({ files: [attachment] });
          } catch (error) {
            console.error(error.message);
          }
        }
      }
    }
  });
};
