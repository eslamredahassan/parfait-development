const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");

const moment = require("moment");
const wait = require("util").promisify(setTimeout);
const cooldown = new Set();
require("moment-duration-format");

const banners = require("../assest/banners.js");
const errors = require("../../src/assest/errors.js");
const color = require("../../src/assest/color.js");
const emojis = require("../../src/assest/emojis");

module.exports = async (client, config) => {
  let guild = client.guilds.cache.get(config.guildID);
  let Logo = guild.iconURL({ dynamic: true });

  client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand() && interaction.commandName === "echo") {
      const channel = interaction.options.getChannel("channel").id;
      const echoMessage = interaction.options.getString("message");
      let echoChannel = interaction.guild.channels.cache.get(channel);

      const perms = [`${config.devRole}`, `${config.STAFF}`];
      let staff = guild.members.cache.get(interaction.user.id);
      if (staff.roles.cache.hasAny(...perms)) {
        try {
          // Send Echo Message To Mentioned Room
          await echoChannel.send(echoMessage);
          await interaction.reply({
            embeds: [
              {
                title: `${emojis.check} Echo Message Sent`,
                description: `Okay ${interaction.user} I sent your message in ${echoChannel}`,
                color: color.gray,
                fields: [
                  {
                    name: `Your message`,
                    value: `${echoMessage}`,
                    inline: false,
                  },
                ],
              },
            ],
            ephemeral: true,
          });
        } catch (error) {
          await interaction.reply({
            embeds: [
              {
                title: `${emojis.alert} Oops!`,
                description: `${emojis.threadMark} I don't have access to ${echoChannel} channel`,
                color: color.gray,
              },
            ],
            //this is the important part
            ephemeral: true,
          });
        }
      } else {
        await interaction.reply({
          embeds: [
            {
              title: `${emojis.alert} Permission denied`,
              description: errors.permsError,
              color: color.gray,
            },
          ],
          //this is the important part
          ephemeral: true,
        });
        console.log(
          `\x1b[0m`,
          `\x1b[31m 🛠`,
          `\x1b[33m ${moment(Date.now()).format("lll")}`,
          `\x1b[31m Permission denied`,
        );
      }
    }
  });
};
