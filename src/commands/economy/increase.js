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
    if (interaction.isCommand() && interaction.commandName == "increase") {
      await interaction.deferReply({ ephemeral: true });
      try {
        const perms = [`${config.devRole}`];
        const staff = interaction.guild.members.cache.get(interaction.user.id);

        // Check if the user has the required permissions
        if (!interaction.member.roles.cache.hasAny(...perms)) {
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

        // Retrieve the mentioned user and levels from the command options
        const targetUser = interaction.options.getUser("user");
        const levelsToAdd = interaction.options.getInteger("level");

        // Check if the target user is a bot
        if (targetUser.bot) {
          return interaction.editReply({
            embeds: [
              new MessageEmbed()
                .setColor(color.gray)
                .setTitle(`${emojis.warning} Invalid User`)
                .setDescription(
                  `${emojis.threadMark} Bots cannot be assigned levels.`,
                ),
            ],
            ephemeral: true,
          });
        }

        // Check if the target user has the SquadSUN role
        const targetMember = interaction.guild.members.cache.get(targetUser.id);
        if (!targetMember.roles.cache.has(config.SquadSUN)) {
          return interaction.editReply({
            embeds: [
              new MessageEmbed()
                .setColor(color.gray)
                .setTitle(`${emojis.warning} Invalid Member`)
                .setDescription(
                  `${emojis.threadMark} ${targetUser} isn't in <@&${config.SquadSUN}>.`,
                ),
            ],
            ephemeral: true,
          });
        }

        // Fetch the user's balance in the database
        let userBalance = await Currency.findOne({
          userId: targetUser.id,
        });

        // If the user doesn't have a record, create one
        if (!userBalance) {
          userBalance = await Currency.create({
            userId: targetUser.id,
            iceCoins: 0,
          });
        }

        // Add levels to the user
        userBalance.level += levelsToAdd;

        // Add ice coins based on the number of levels added (100 ice coins per level)
        userBalance.iceCoins += levelsToAdd * 100;

        // Save the changes to the database
        await userBalance.save();
        const formattedBalance = userBalance.iceCoins.toLocaleString();
        await targetUser.send({
          embeds: [
            new MessageEmbed()
              .setColor(color.gray)
              .setTitle(`${emojis.levelUp} Level Up ${userBalance.level}!`)
              .setDescription(
                `${emojis.threadMarkmid} ${interaction.user} increased your level with ${levelsToAdd} levels your new level is **LV${userBalance.level}**\n${emojis.threadMark} Your new balance is ${emojis.ic} **${formattedBalance} Ice Coins**`,
              ),
          ],
        });
        // Respond to the interaction
        await interaction.editReply({
          embeds: [
            new MessageEmbed()
              .setColor(color.gray)
              .setTitle(`${emojis.check} Levels increased Successfully!`)
              .setDescription(
                `${emojis.threadMarkmid} increased ${targetUser}'s level with **${levelsToAdd}** levels, his new level is **Lv${userBalance.level}**\n${emojis.threadMark} And his new balance is: ${emojis.ic} **${formattedBalance} Ice Coins**`,
              ),
          ],
        });
        console.log(
          `\x1b[0m`,
          `\x1b[33m 〢`,
          `\x1b[33m ${moment(Date.now()).format("LT")}`,
          `\x1b[31m ${interaction.user.username}`,
          `\x1b[32m Increased`,
          `\x1b[33m ${targetMember.user.username}'s level`,
          `\x1b[31m with`,
          `\x1b[35m ${levelsToAdd} levels`,
        );
      } catch (error) {
        console.error(
          `\x1b[0m`,
          `\x1b[33m 〢`,
          `\x1b[33m ${moment(Date.now()).format("LT")}`,
          `\x1b[31m Error in increasing level:`,
          `\x1b[32m ${error.message}`,
        );
        return interaction.editReply({
          embeds: [
            new MessageEmbed()
              .setColor(color.gray)
              .setTitle(`${emojis.cross} Oops!`)
              .setDescription(
                `${emojis.threadMark} Something went wrong while increasing ${targetUser}'s level. Please try again later.`,
              ),
          ],
          ephemeral: true,
          components: [],
        });
      }
    }
  });
};
