const { MessageEmbed } = require("discord.js");
const counter = require("../../src/database/models/counter");

module.exports = async (client, config) => {
  let guild = client.guilds.cache.get(config.guildID);
  setInterval(async () => {
    const appCounter = await counter.findOne();
    const counterValue = appCounter ? appCounter.count : 0;
    const applyChannel = client.channels.cache.get(config.applyChannel);

    applyChannel.messages
      .fetch({ limit: 2 })
      .then((messages) => {
        messages.forEach((message) => {
          if (message.embeds.length > 0) {
            const embed = message.embeds[0];

            if (
              embed.title ===
              `<:app:1088098339905609839> ${guild.name}\n<:thread_mark:1131480432530165821>Recruitments Application System`
            ) {
              const newEmbed = new MessageEmbed(embed);
              newEmbed.setFooter({
                text:
                  "Total applied for Sun Legends " +
                  counterValue +
                  " applications",
                iconURL: "https://i.imgur.com/NpNsiR1.png",
              }), // Update the footer of the specific embed
                message.edit({ embeds: [newEmbed] });
            }
          }
        });
      })
      .catch(console.error);
  }, 20 * 1000);
};
