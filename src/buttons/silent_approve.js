const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");

const moment = require("moment");
const wait = require("util").promisify(setTimeout);

const banners = require("../assest/banners.js");
const errors = require("../assest/errors.js");
const color = require("../assest/color.js");
const emojis = require("../assest/emojis");

module.exports = async (client, config) => {
  let guild = client.guilds.cache.get(config.guildID);

  client.on("interactionCreate", async (interaction) => {
    if (interaction.isButton()) {
      switch (interaction.customId) {
        case "#silent_accept":
          try {
            await interaction.deferReply({ ephemeral: true });

            const perms = [`${config.devRole}`, `${config.STAFF}`];
            let staff = guild.members.cache.get(interaction.user.id);
            if (staff.roles.cache.hasAny(...perms)) {
              const ID = interaction.message.embeds[0].footer.text;
              const ap_user = await interaction.guild.members.fetch(ID);

              let promote = new MessageActionRow().addComponents([
                new MessageButton()
                  .setStyle("SECONDARY")
                  .setDisabled(false)
                  .setCustomId("#ap_promote")
                  .setLabel(`Promote ${ap_user.user.username}`)
                  .setEmoji(emojis.promote),
                new MessageButton()
                  .setStyle("SECONDARY")
                  .setDisabled(false)
                  .setCustomId("#ap_apologize")
                  .setLabel(`Apologize`)
                  .setEmoji(emojis.apologize),
                new MessageButton()
                  .setStyle("SECONDARY")
                  .setDisabled(false)
                  .setCustomId("#ap_reply")
                  .setLabel(` `)
                  .setEmoji(emojis.dm),
              ]);

              let embed = new MessageEmbed(interaction.message.embeds[0])
                .setTitle(
                  `${emojis.alert} Accepted by ${interaction.user.username}`,
                )
                .setColor(color.gray)
                .setImage(banners.silentAcceptbanner)
                .setThumbnail(banners.acceptIcon)
                .setTimestamp();

              interaction.message.edit({
                embeds: [embed],
                components: [promote],
              });

              console.log(
                `\x1b[0m`,
                `\x1b[33m 〢`,
                `\x1b[33m ${moment(Date.now()).format("lll")}`,
                `\x1b[34m ${ap_user.user.username}`,
                `\x1b[32m ACCEPTED BY ${interaction.user.username}`,
              );

              //// Send message to log channel after accepting member ///
              const log = interaction.guild.channels.cache.get(config.log);
              await log.send({
                embeds: [
                  {
                    title: `${emojis.log} Accept Log`,
                    description: `${emojis.check} ${ap_user.user} have been accepted silently by ${interaction.user}`,
                    color: color.gray,
                    timestamp: new Date(),
                    footer: {
                      text: "Accepted in",
                      icon_url: banners.parfaitIcon,
                    },
                  },
                ],
                //this is the important part
                ephemeral: false,
              });
              //// Interactions roles ///
              await ap_user.roles
                .add([config.SunTest, config.SquadSUN])
                .catch(() => console.log("Error Line 2298"));
              console.log(
                `\x1b[0m`,
                `\x1b[31m 🛠`,
                `\x1b[33m ${moment(Date.now()).format("lll")}`,
                `\x1b[35m Sun Roles`,
                `\x1b[32m ADDED`,
              );

              await ap_user.roles
                .remove(config.waitRole)
                .catch(() => console.log("Error Line 2312"));
              console.log(
                `\x1b[0m`,
                `\x1b[31m 🛠`,
                `\x1b[33m ${moment(Date.now()).format("lll")}`,
                `\x1b[35m Wannabe Role`,
                `\x1b[32m REMOVED`,
              );

              let applyChannel = interaction.guild.channels.cache.get(
                config.applyChannel,
              );
              if (!applyChannel) return;

              const user = ap_user.user;
              const userName = user.username;

              const threadName = applyChannel.threads.cache.find(
                (x) => x.name === `${"🧤︱" + userName + " Tryout"}`,
              );
              /// Rename The Thread ///
              await threadName.setName("🧤︱" + `${userName}` + " Accepted");
              /// Lock the thread ///
              await wait(5000); // ** cooldown 10 seconds ** \\
              await threadName.setLocked(true);
              /// Archive the thread ///
              await wait(8000); // ** cooldown 10 seconds ** \\
              await threadName.setArchived(true);

              const applicationStatus = await Application.findOneAndUpdate({
                userId: ap_user.id,
                $set: { status: "Approved Silently" }, // Change "status" to the field you want to update
                new: true,
              });
              //// Send message to accepted member ///
              await interaction
                .editReply({
                  embeds: [
                    {
                      title: `${emojis.check} Acceptance Alert`,
                      description: `${emojis.threadMarkmid} You accepted ${user} in **${interaction.guild.name}** silently\n${emojis.threadMark} His thread will be automatically archived in \`\`20 Seconds\`\``,
                      color: color.gray,
                    },
                  ],
                  //this is the important part
                  ephemeral: true,
                })
                .catch((error) => console.log(error.message));
            } else {
              await interaction
                .editReply({
                  embeds: [
                    {
                      title: `${emojis.alert} Permission denied`,
                      description: errors.permsError,
                      color: color.gray,
                    },
                  ],
                  //this is the important part
                  ephemeral: true,
                })
                .catch((error) => console.log(error.message));
              console.log(
                `\x1b[0m`,
                `\x1b[31m 🛠`,
                `\x1b[33m ${moment(Date.now()).format("lll")}`,
                `\x1b[33m Permission denied`,
              );
            }
          } catch (error) {
            console.error("Error occurred:", error.message);
            await interaction.editReply({
              content: "Oops! There was an error processing your request.",
              ephemeral: true,
            });
          }
          break;
        default:
      }
    }
  });
};
