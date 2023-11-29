const wait = require("util").promisify(setTimeout);
const cooldown = new Set();
require("moment-duration-format");

const responses = require("../assest/responses.js");
const color = require("../assest/color.js");
const emojis = require("../assest/emojis");
const moment = require("moment");

module.exports = async (client, config) => {
  let guild = client.guilds.cache.get(config.guildID);
  let Logo = guild.iconURL({ dynamic: true });

  client.on("interactionCreate", async (interaction) => {
    if (interaction.isButton()) {
      switch (interaction.customId) {
        case "#answer_no": {
          const noResponse = [
            `${responses.wdyt}`,
            `${responses.really}`,
            `${responses.itycr}`,
            `${responses.ycawr}`,
          ];
          const answerNo =
            noResponse[Math.floor(Math.random() * noResponse.length)];

          console.log(
            `\x1b[0m`,
            `\x1b[31m 〢`,
            `\x1b[33m ${moment(Date.now()).format("lll")}`,
            `\x1b[34m ${interaction.user.username} Answered`,
            `\x1b[35m No for Requirements`,
          );

          return await interaction.update({
            embeds: [
              {
                title: `${emojis.alert} The requirements are important`,
                description: answerNo,
                //thumbnail: { url: `${banners.importantIcon}` },
                color: color.gray,
              },
            ],
            components: [],
            ephemeral: true,
          });
        }
        default:
      }
    }
  });
};
