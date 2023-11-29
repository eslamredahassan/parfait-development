const { MessageEmbed } = require("discord.js");

const os = require("os");
const moment = require("moment");
const mongoose = require("mongoose");
const wait = require("util").promisify(setTimeout);

const packageJSON = require("../../package");
const responses = require("../assest/responses.js");
const interface = require("../assest/interface.js");
const fieldsText = require("../assest/fieldsText.js");
const banners = require("../assest/banners.js");
const errors = require("../assest/errors.js");
const color = require("../assest/color.js");
const emojis = require("../assest/emojis");

module.exports = async (client, config) => {
  let guild = client.guilds.cache.get(config.guildID);
  let Logo = guild.iconURL({ dynamic: true });

  client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand()) {
      switch (interaction.commandName) {
        case "status":
          {
            await interaction.deferReply({ ephemeral: true });

            const connection = mongoose.connection;
            const readyState = connection.readyState;

            let connectionStatus;
            switch (readyState) {
              case 0:
                connectionStatus = "Disconnected";
                break;
              case 1:
                connectionStatus = "Connected";
                break;
              case 2:
                connectionStatus = "Connecting";
                break;
              case 3:
                connectionStatus = "Disconnecting";
                break;
              default:
                connectionStatus = "Unrecognized State";
                break;
            }

            const info = {
              status: connectionStatus,
              database: connection.name,
            };

            function uptimeString(seconds) {
              let days = Math.floor(seconds / (3600 * 24));
              seconds -= days * 3600 * 24;
              let hours = Math.floor(seconds / 3600);
              seconds -= hours * 3600;
              let minutes = Math.floor(seconds / 60);
              seconds -= minutes * 60;

              let uptime = "";

              if (days > 0) {
                uptime += `${days} Day${days !== 1 ? "s" : ""}, `;
              }
              if (hours > 0) {
                uptime += `${hours} Hour${hours !== 1 ? "s" : ""}, `;
              }
              if (minutes > 0) {
                uptime += `${minutes} Minute${minutes !== 1 ? "s" : ""}, `;
              }
              if (seconds > 0 || uptime === "") {
                uptime += `${seconds} Second${seconds !== 1 ? "s" : ""}`;
              }

              return uptime;
            }

            const usedMemory = os.totalmem() - os.freemem(),
              totalMemory = os.totalmem();
            const getpercentage =
              ((usedMemory / totalMemory) * 100).toFixed(2) + "%";
            // in Giga `(usedMemory / Math.pow(1024, 3)).toFixed(2)`

            const discordJSVersion = packageJSON.dependencies["discord.js"];

            await interaction.editReply({
              embeds: [
                new MessageEmbed()
                  .setColor(color.gray)
                  .setTitle(`${emojis.alert} ${client.user.username} status`)
                  .setDescription("")
                  //.setThumbnail(Logo)
                  .setImage(banners.aboutBanner)
                  .addFields(
                    {
                      name: `${emojis.nodejs} Discord.js version`,
                      value: `${emojis.threadMark} ${discordJSVersion}`,
                      inline: true,
                    },
                    {
                      name: `${emojis.cpu} Used memory`,
                      value: `${emojis.threadMark} ${getpercentage}`,
                      inline: true,
                    },
                    {
                      name: `${emojis.db} Database`,
                      value: `${emojis.threadMark} ${info.status}`,
                      inline: true,
                    },
                    {
                      name: `${emojis.time} Uptime`,
                      value: `${emojis.threadMark} ${uptimeString(
                        Math.floor(process.uptime()),
                      )}`,
                      inline: false,
                    },
                  )
                  .setFooter({
                    ///text: `This is for Staff members only, no one else can see it`,
                    text: `Parfait - Advanced Discord Application Manager Bot`,
                    iconURL: banners.parfaitIcon,
                  }),
              ],
              ephemeral: true,
              components: [],
            });
          }
          break;
      }
    }
  });
};
