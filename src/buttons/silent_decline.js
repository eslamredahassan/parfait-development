const { MessageEmbed } = require("discord.js");

const moment = require("moment");
const wait = require("util").promisify(setTimeout);

const banners = require("../assest/banners.js");
const errors = require("../assest/errors.js");
const color = require("../assest/color.js");
const emojis = require("../assest/emojis");

module.exports = async (client, config) => {
  let guild = client.guilds.cache.get(config.guildID);
  let Logo = guild.iconURL({ dynamic: true });

  client.on("interactionCreate", async (interaction) => {
    if (interaction.isButton()) {
      switch (interaction.customId) {
        case "#silent_reject":
          try {
            await interaction.deferReply({ ephemeral: true });
            //// Check the permissions ///
            const perms = [`${config.devRole}`, `${config.STAFF}`];
            let staff = guild.members.cache.get(interaction.user.id);
            if (staff.roles.cache.hasAny(...perms)) {
              let embed = new MessageEmbed(interaction.message.embeds[0])
                .setTitle(
                  `${emojis.alert} Rejected by ${interaction.user.username}`,
                )
                .setColor(color.gray)
                .setImage(banners.silentRejectbanner)
                .setThumbnail(banners.rejectIcon)
                .setTimestamp();
              /// Edit Review Embed ///
              await interaction.message
                .edit({
                  embeds: [embed],
                  components: [],
                })
                .then((msg) => msg.unpin());
              //// Get user id from the footer ///
              const ID = interaction.message.embeds[0].footer.text;
              const ap_user = await interaction.guild.members.fetch(ID);
              //// Send message to log channel after rejecting member ///
              const log = interaction.guild.channels.cache.get(config.log);
              await log.send({
                embeds: [
                  {
                    title: `${emojis.log} Rejection Log`,
                    description: `${emojis.cross} ${ap_user.user} have been rejected silently by ${interaction.user}`,
                    color: color.gray,
                    timestamp: new Date(),
                    footer: {
                      text: "Rejected in",
                      icon_url: banners.parfaitIcon,
                    },
                  },
                ],
                //this is the important part
                ephemeral: false,
              });

              await ap_user.roles
                .remove(config.waitRole)
                .catch(() => console.log("Error Line 77"));
              console.log(
                `\x1b[0m`,
                `\x1b[31m 🛠`,
                `\x1b[33m ${moment(Date.now()).format("lll")}`,
                `\x1b[35m Sun wannabe role`,
                `\x1b[32m REMOVED`,
              );
              //// Get channel id from the server and find the thread name ///
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
              await threadName.setName("🧤︱" + `${userName}` + " Rejected");
              /// Lock the thread ///
              await wait(5000); // ** cooldown 10 seconds ** \\
              await threadName.setLocked(true);
              /// Archive the thread ///
              await wait(8000); // ** cooldown 10 seconds ** \\
              await threadName.setArchived(true);
              /// Console Action ///
              console.log(
                `\x1b[0m`,
                `\x1b[31m 〢`,
                `\x1b[33m ${moment(Date.now()).format("lll")}`,
                `\x1b[34m ${ap_user.user.username}`,
                `\x1b[32m REJECTED BY ${interaction.user.username}`,
              );
              const applicationStatus = await Application.findOneAndUpdate({
                userId: ap_user.id,
                $set: { status: "Declined Silently" }, // Change "status" to the field you want to update
                new: true,
              });
              //// Send reply message after rejecting member ///
              await interaction
                .editReply({
                  embeds: [
                    {
                      title: `${emojis.cross} Rejection Alert`,
                      description: `${emojis.threadMarkmid} You rejected ${user} from joining **${interaction.guild.name}** silently\n${emojis.threadMarkmid} Removed his application from pin list\n${emojis.threadMark} His thread will be automatically archived in \`\`20 Seconds\`\``,
                      color: color.gray,
                    },
                  ],
                  //this is the important part
                  ephemeral: true,
                })
                .catch(() => console.log("Error Line 58"));
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
                .catch(() => console.log("Error Line 2713"));
              console.log(
                `\x1b[0m`,
                `\x1b[31m 🛠`,
                `\x1b[33m  ${moment(Date.now()).format("lll")}`,
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
