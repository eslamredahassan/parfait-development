const {
  MessageActionRow,
  MessageEmbed,
  Modal,
  TextInputComponent,
} = require("discord.js");

const moment = require("moment");

const messages = require("../assest/messages.js");
const banners = require("../assest/banners.js");
const errors = require("../assest/errors.js");
const color = require("../assest/color.js");
const emojis = require("../assest/emojis");

// Database Schemas
const Application = require("../../src/database/models/application");
const TemporaryRole = require("../../src/database/models/TemporaryRoleModel");

module.exports = async (client, config) => {
  let guild = client.guilds.cache.get(config.guildID);
  let Logo = guild.iconURL({ dynamic: true });

  client.on("interactionCreate", async (interaction) => {
    try {
      if (interaction.isButton() && interaction.customId === "#ap_apologize") {
        const ID = interaction.message.embeds[0].footer.text;
        const user = await interaction.guild.members.fetch(ID);

        //// Modal application code ///
        let reply_modal = new Modal()
          .setTitle(`Apologize reason of ${user.user.username}`)
          .setCustomId(`ap_apologize`);

        const ap_reason = new TextInputComponent()
          .setCustomId("ap_reason")
          .setLabel(`Direct Messaging box`.substring(0, 45))
          .setMinLength(1)
          .setMaxLength(365)
          .setRequired(false)
          .setPlaceholder(`Type your message here`)
          .setStyle(2);

        let row_reply = new MessageActionRow().addComponents(ap_reason);
        reply_modal.addComponents(row_reply);

        const perms = [`${config.devRole}`, `${config.devRoleTest}`];
        let staff = guild.members.cache.get(interaction.user.id);
        if (staff.roles.cache.hasAny(...perms)) {
          await interaction.showModal(reply_modal);
        } else {
          await interaction.editReply({
            embeds: [
              {
                title: `${emojis.alert} Permission denied`,
                description: `${errors.permsError}`,
                color: `${color.gray}`,
              },
            ],
            ephemeral: true,
          });
          console.error("Permission denied.");
        }
      }
      //// Send application results in review room ////
      if (interaction.customId === "ap_apologize") {
        await interaction.deferReply({ ephemeral: true });
        let reason = interaction.fields.getTextInputValue("ap_reason");

        /// Embed of data in review room ///
        const ID = interaction.message.embeds[0].footer.text;
        const ap_user = await interaction.guild.members.fetch(ID);

        let embed = new MessageEmbed(interaction.message.embeds[0])
          .setTitle(
            `${emojis.alert} Apologized by ${interaction.user.username}`,
          )
          .setColor(color.gray)
          .setImage(banners.apologizeBanner)
          .setThumbnail(banners.apologizeIcon)
          .setTimestamp();

        await interaction.message
          .edit({
            embeds: [embed],
            components: [],
          })
          .then((msg) => msg.unpin());

        console.log(
          `\x1b[0m`,
          `\x1b[33m 〢`,
          `\x1b[33m ${moment(Date.now()).format("lll")}`,
          `\x1b[34m ${ap_user.user.username}`,
          `\x1b[32m APOLOGIZED BY ${interaction.user.username}`,
        );

        const expiryInDays = 30; // Example: role expires in 2 days

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + expiryInDays);

        const temporaryRole = new TemporaryRole({
          userId: ap_user.id,
          guildId: guild.id,
          roleId: config.coolDown,
          expiry: expiryDate,
        });

        try {
          await temporaryRole.save(); // Save the temporary role data to the database

          // Assign the role to the member
          await ap_user.roles.add(config.coolDown);
          await ap_user.roles.remove(config.waitRole);
        } catch (err) {
          console.error(
            `Error assigning ${config.coolDown.name} role:`,
            err.message,
          );
        }

        try {
          const temporaryRole = await TemporaryRole.findOne({
            userId: ap_user.id,
          });

          //// Send message to accepted member ///
          await ap_user.send({
            embeds: [
              new MessageEmbed()
                .setColor(color.gray)
                .setTitle(`${emojis.sad_parfait} We Apologize`)
                .setImage(banners.dmApologizeBanner)
                .setDescription(reason || messages.apologize)
                .addFields({
                  name: "You can apply again after",
                  value: temporaryRole.expiry.toDateString(""),
                }),
            ],
          });
        } catch (e) {
          return await interaction.editReply({
            content: `The ${user} Dms Were Closed.`,
            ephemeral: true,
          });
        }

        const log = interaction.guild.channels.cache.get(config.log);
        await log.send({
          embeds: [
            {
              title: `${emojis.log} Accept Log`,
              description: `${emojis.check} ${ap_user.user} have been apologized by ${interaction.user}`,
              color: color.gray,
              fields: [
                {
                  name: `${emojis.reason} Rejection Reason`,
                  value: reason || `No Reason Found`,
                  inline: false,
                },
              ],
              timestamp: new Date(),
              footer: {
                text: "Apologized in",
                icon_url: banners.parfaitIcon,
              },
            },
          ],
          //this is the important part
          ephemeral: false,
        });

        const applicationStatus = await Application.findOneAndUpdate({
          userId: ap_user.id,
          $set: { status: "Apologized" }, // Change "status" to the field you want to update
          new: true,
        });
        //// Interactions roles ///
        await ap_user.roles
          .remove([config.SunTest, config.SquadSUN])
          .catch(() => console.log("Error Line 2498"));
        console.log(
          `\x1b[0m`,
          `\x1b[33m 🛠`,
          `\x1b[33m ${moment(Date.now()).format("lll")}`,
          `\x1b[33m Sun Roles REMOVED`,
        );

        //// Send message after accepting member ///
        await interaction.editReply({
          embeds: [
            {
              title: `${emojis.check} Apologize Alert`,
              description: `${emojis.threadMarkmid} You apologized to ${ap_user} for not being in **${interaction.guild.name}**\n${emojis.threadMark} Removed his application from pin list`,
              color: color.gray,
            },
          ],
          //this is the important part
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error("Error occurred:", error.message);
      await interaction.editReply({
        content: "Oops! There was an error processing your request.",
        ephemeral: true,
      });
    }
  });
};
