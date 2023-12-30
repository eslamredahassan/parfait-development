const { MessageEmbed } = require("discord.js");
const moment = require("moment");
const fs = require("fs");

const settings = JSON.parse(fs.readFileSync("./src/assest/settings.json"));
const color = settings.colors;
const emojis = settings.emojis;
const banners = settings.banners;

const GeneratedCode = require("../../../src/database/models/generated_codes");

module.exports = async (client, config) => {
  client.on("interactionCreate", async (interaction) => {
    if (
      interaction.isCommand() &&
      interaction.commandName === "generate_code"
    ) {
      await interaction.deferReply({ ephemeral: true });
      // Check if the user has the required permissions
      const perms = [`${config.devRole}`];
      const staff = interaction.guild.members.cache.get(interaction.user.id);

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

      // Get options from the command
      const amount = interaction.options.getInteger("amount");
      const duration = interaction.options.getInteger("duration");
      const durationType = interaction.options.getString("duration_type");

      // Validate options
      if (isNaN(amount) || isNaN(duration) || amount <= 0 || duration <= 0) {
        return interaction.editReply({
          embeds: [
            new MessageEmbed()
              .setColor(color.gray)
              .setTitle(`${emojis.cross} Invalid Options`)
              .setDescription(
                `${emojis.threadMark} Please provide valid positive numbers for amount and duration.`,
              ),
          ],
          ephemeral: true,
        });
      }

      // Validate duration type
      const validDurationTypes = [
        "minute",
        "hour",
        "day",
        "week",
        "month",
        "year",
      ];
      if (!validDurationTypes.includes(durationType)) {
        return interaction.editReply({
          embeds: [
            new MessageEmbed()
              .setColor(color.gray)
              .setTitle(`${emojis.cross} Invalid Duration Type`)
              .Description(
                `${
                  emojis.threadMark
                } Please provide a valid duration type: ${validDurationTypes.join(
                  ", ",
                )}.`,
              ),
          ],
          ephemeral: true,
        });
      }

      // Calculate duration in seconds based on the specified type
      let durationInSeconds;
      switch (durationType) {
        case "minute":
          durationInSeconds = duration * 60;
          break;
        case "hour":
          durationInSeconds = duration * 60 * 60;
          break;
        case "day":
          durationInSeconds = duration * 60 * 60 * 24;
          break;
        case "week":
          durationInSeconds = duration * 60 * 60 * 24 * 7;
          break;
        case "month":
          durationInSeconds = duration * 60 * 60 * 24 * 30; // Approximate to 30 days
          break;
        case "year":
          durationInSeconds = duration * 60 * 60 * 24 * 365;
          break;
        default:
          durationInSeconds = 0;
      }

      // Generate a random code with a length of 9 characters starting with "pic-"
      const code = "PiC-" + Math.random().toString(36).substring(2, 11);

      try {
        // Create an instance of the GeneratedCode model
        const generatedCodeModel = new GeneratedCode({
          code,
          amount,
          duration: durationInSeconds,
          expiration: new Date(Date.now() + durationInSeconds * 1000),
        });

        // Save the code details to the database
        await generatedCodeModel.save();
        const formattedBalance = amount.toLocaleString();
        // Calculate the expiration time in milliseconds
        const expirationTime = Date.now() + durationInSeconds * 1000;
        // Send a response to the user
        interaction.editReply({
          embeds: [
            new MessageEmbed()
              .setColor(color.gray)
              .setTitle(`${emojis.check} Code Successfully Generated`)
              .setDescription(
                `${
                  emojis.threadMarkmid
                } The generated code is \`${code}\` that will give ${
                  emojis.ic
                } ${formattedBalance} Ice Coins\n${
                  emojis.threadMark
                } The code will expire <t:${Math.floor(
                  expirationTime / 1000,
                )}:R>`,
              ),
          ],
          ephemeral: true,
        });
        console.log(
          `\x1b[0m`,
          `\x1b[33m 〢`,
          `\x1b[33m ${moment(Date.now()).format("LT")}`,
          `\x1b[31m ${interaction.user.username}`,
          `\x1b[33m Created`,
          `\x1b[34m ${code}`,
          `\x1b[33m ${formattedBalance}IC`,
          `\x1b[31m ends`,
          `\x1b[33m ${moment(expirationTime).fromNow()}`,
        );
      } catch (error) {
        console.error(
          `\x1b[0m`,
          `\x1b[33m 〢`,
          `\x1b[33m ${moment(Date.now()).format("LT")}`,
          `\x1b[31m Error while generating code:`,
          `\x1b[33m ${error.message}`,
        );
        interaction.editReply({
          embeds: [
            new MessageEmbed()
              .setColor(color.gray)
              .setTitle(`${emojis.cross} Error Generating Code`)
              .setDescription(
                `${emojis.threadMark} Something went wrong while generating the code. Please try again later.`,
              ),
          ],
          ephemeral: true,
        });
      }
    }
  });
};
