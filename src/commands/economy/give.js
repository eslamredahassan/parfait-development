const {
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  MessageAttachment,
} = require("discord.js");

const fs = require("fs");
const moment = require("moment");
const wait = require("util").promisify(setTimeout);

const Currency = require("../../../src/database/models/economy");

const settings = JSON.parse(fs.readFileSync("./src/assest/settings.json"));
const color = settings.colors;
const emojis = settings.emojis;
const banners = settings.banners;

module.exports = async (client, config) => {
  let guild = client.guilds.cache.get(config.guildID);

  client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand() && interaction.commandName === "give") {
      await interaction.deferReply({ ephemeral: true });
      const user = interaction.options.getUser("user");
      const iceCoins = interaction.options.getInteger("ice_coins");

      const perms = [`${config.devRole}`];
      let staff = guild.members.cache.get(interaction.user.id);
      if (staff.roles.cache.hasAny(...perms)) {
        // Check if the provided user is valid
        if (!user) {
          return interaction.editReply({
            embeds: [
              new MessageEmbed()
                .setColor(color.gray)
                .setTitle(`${emojis.warning} invalid user!`)
                .setDescription(
                  `${emojis.threadMark} Please mention a valid user..`,
                ),
            ],
            ephemeral: true,
            components: [],
          });
        }

        // Check if the user has the SquadSUN role
        const squadSunRole = guild.roles.cache.get(config.SquadSUN);

        if (
          !squadSunRole ||
          !guild.members.cache.get(user.id).roles.cache.has(squadSunRole.id)
        ) {
          return interaction.editReply({
            embeds: [
              new MessageEmbed()
                .setColor(color.gray)
                .setTitle(`${emojis.warning} Unfortunately!`)
                .setDescription(
                  `${emojis.threadMark} This economy system is exclusive to SUN members only.`,
                ),
            ],
            ephemeral: true,
            components: [],
          });
        }

        // Check if the provided amount is valid
        if (isNaN(iceCoins) || iceCoins <= 0) {
          return interaction.editReply({
            embeds: [
              new MessageEmbed()
                .setColor(color.gray)
                .setTitle(`${emojis.cross} invalid amount!`)
                .setDescription(
                  `${emojis.threadMark} Please provide a valid positive number of Ice Coins.`,
                ),
            ],
            ephemeral: true,
            components: [],
          });
        }

        try {
          // Find the recipient's balance in the database
          let recipientBalance = await Currency.findOne({
            userId: user.id,
          });

          // If the recipient doesn't have a record, create one
          if (!recipientBalance) {
            recipientBalance = new Currency({
              userId: user.id,
              iceCoins: 0,
            });
          }

          // Update recipient's balance
          recipientBalance.iceCoins += iceCoins;
          const formattedBalance = iceCoins.toLocaleString();
          // Save changes to the database
          await recipientBalance.save();
          await user.send({
            embeds: [
              new MessageEmbed()
                .setColor(color.gray)
                .setTitle(`${emojis.email} Knock Knock!`)
                .setDescription(
                  `${emojis.threadMark} ${interaction.user} Gave you ${emojis.ic} **${formattedBalance} Ice Coins**`,
                ),
            ],
          });
          await interaction.editReply({
            embeds: [
              new MessageEmbed()
                .setColor(color.gray)
                .setTitle(`${emojis.check} Ice Coins given!`)
                .setDescription(
                  `${emojis.threadMark} The ${emojis.ic} **${formattedBalance} Ice Coins** has been given to ${user} successfully!`,
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
            `\x1b[36m gave`,
            `\x1b[33m ${iceCoins} Ice Coins`,
            `\x1b[36m To`,
            `\x1b[35m ${user.username}`,
          );
        } catch (error) {
          console.error(
            `\x1b[0m`,
            `\x1b[33m 〢`,
            `\x1b[33m ${moment(Date.now()).format("LT")}`,
            `\x1b[31m Error in give command:`,
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
      } else {
        interaction.editReply({
          embeds: [
            new MessageEmbed()
              .setColor(color.gray)
              .setTitle(`${emojis.cross} Permission denied`)
              .setDescription(
                `${emojis.threadMark} You don't have permission to use this command.`,
              ),
          ],
          ephemeral: true,
          components: [],
        });
      }
    }
  });
};
