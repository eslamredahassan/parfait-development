const { MessageEmbed } = require("discord.js");
const moment = require("moment");

const banners = require("../assest/banners.js");
const color = require("../assest/color.js");
const emojis = require("../assest/emojis");

// Database Schemas
const Application = require("../../src/database/models/application");

module.exports = async (client, config) => {
  let guild = client.guilds.cache.get(config.guildID);
  let Logo = guild.iconURL({ dynamic: true });

  client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand() && interaction.commandName === "squad_sun") {
      await interaction.deferReply({ ephemeral: true });

      try {
        console.log(
          `\x1b[0m`,
          `\x1b[31m 〢`,
          `\x1b[33m ${moment(Date.now()).format("lll")}`,
          `\x1b[34m ${interaction.user.username}`,
          `\x1b[35m Squad Sun`,
        );
        const squad = interaction.guild.roles.cache.get(config.SquadSUN);

        if (!squad) {
          console.log;
          return interaction.reply("The specified role was not found.");
        }

        const membersWithRole = squad.members.map(async (member) => {
          const applicationData = await Application.findOne({
            userId: member.id,
          });

          const userCode = applicationData ? applicationData.user_code : "N/A";
          const emoji =
            member === squad.members.last()
              ? emojis.threadMark
              : emojis.threadMarkmid;

          return `${emoji} ${member.user} ${emojis.pinkDot} Smash Code: \`\`${userCode}\`\``;
        });

        const embed = new MessageEmbed()
          .setTitle(``)
          .setDescription(
            `### ${emojis.sunL} Squad SUN\n` +
              (await Promise.all(membersWithRole)).join("\n"),
          )
          //.setThumbnail(Logo)
          .setColor(color.gray)
          .setImage(banners.list)
          .setFooter({
            text: "Total Sun Members: " + `${squad.members.size} Members`,
            iconURL: banners.parfaitIcon,
          });

        interaction.editReply({ embeds: [embed], ephemeral: true });
      } catch (error) {
        console.error(error.message);
        return interaction.editReply({
          content: `There was an error processing your request\nError: \`\`${error.message}\`\``,
          ephemeral: true,
        });
      }
    }
  });
};
