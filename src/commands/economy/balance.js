const { MessageEmbed } = require("discord.js");
const moment = require("moment");
const fs = require("fs");

const settings = JSON.parse(fs.readFileSync("./src/assest/settings.json"));
const color = settings.colors;
const emojis = settings.emojis;
const banners = settings.banners;

const Currency = require("../../../src/database/models/economy");

module.exports = async (client, config) => {
  client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand() && interaction.commandName === "balance") {
      const perms = [`${config.devRole}`];
      const staff = interaction.guild.members.cache.get(interaction.user.id);

      // Check if the user has the required permissions
      if (!staff.roles.cache.hasAny(...perms)) {
        return interaction.reply({
          embeds: [
            new MessageEmbed()
              .setColor(color.gray)
              .setTitle(`"${emojis.warning} Permission Denied`)
              .setDescription(
                `${emojis.threadMark} You don't have permission to use this command.`,
              ),
          ],
          ephemeral: true,
        });
      }

      // Get the mentioned user from the command options
      const user = interaction.options.getUser("user");

      if (!user) {
        return interaction.reply({
          embeds: [
            new MessageEmbed()
              .setColor(color.gray)
              .setTitle(`${emojis.cross} Invalid User`)
              .setDescription(
                `${emojis.threadMark} Please mention a valid user.`,
              ),
          ],
          ephemeral: true,
        });
      }

      if (!staff.roles.cache.has(config.SquadSUN)) {
        return interaction.reply({
          embeds: [
            new MessageEmbed()
              .setColor(color.gray)
              .setTitle(`${emojis.warning} Invalid User`)
              .setDescription(
                `${emojis.threadMark} ${user} is not part of the <@&${config.SquadSUN}>.`,
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
      const formattedBalance = userBalance.iceCoins.toLocaleString();

      interaction.reply({
        embeds: [
          new MessageEmbed()
            .setColor(color.gray)
            //.setTitle(`${emojis.wallet} Ice Coin Balance`)
            .setDescription(
              `### ${emojis.wallet} Ice Coin Balance\n${emojis.threadMark} ${user}'s current balance is: ${emojis.ic} ${formattedBalance}`,
            ),
        ],
        ephemeral: true,
      });
    }
  });
};
