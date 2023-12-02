const { MessageEmbed } = require("discord.js");
const counter = require("../../src/database/models/counter");

const banners = require("../assest/banners.js");
const color = require("../assest/color.js");
const emojis = require("../assest/emojis");

module.exports = async (client, config) => {
  let guild = client.guilds.cache.get(config.guildID);
  setInterval(async () => {
    const appCounter = await counter.findOne();
    const counterValue = appCounter ? appCounter.count : 0;
    const applyChannel = client.channels.cache.get(config.applyChannel);
    try {
      applyChannel.messages.fetch({ limit: 2 }).then((messages) => {
        messages.forEach((message) => {
          if (message.embeds.length > 0) {
            const embed = message.embeds[0];

            if (
              embed.title ===
              `${emojis.app} ${guild.name}\n${emojis.threadMark} Recruitments Application System`
            ) {
              const newEmbed = new MessageEmbed(embed);
              newEmbed.setFooter({
                text:
                  "Total applied for Sun Legends " +
                  counterValue +
                  " applications",
                iconURL: client.user.displayAvatarURL({ dynamic: true }),
              }), // Update the footer of the specific embed
                message.edit({ embeds: [newEmbed] });
            }
          }
        });
      });
    } catch (error) {
      console.log(
        `\x1b[0m`,
        `\x1b[33m 〢`,
        `\x1b[33m ${moment(Date.now()).format("LT")}`,
        `\x1b[31m Error updating applications counter:`,
        `\x1b[34m ${error.message}`,
      );
    }
  }, 20 * 1000);
};
