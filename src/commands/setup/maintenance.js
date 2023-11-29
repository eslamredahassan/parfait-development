const {
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  Modal,
  TextInputComponent,
} = require("discord.js");

const moment = require("moment");
require("moment-duration-format");

const fieldsText = require("../../assest/fieldsText.js");
const interface = require("../../assest/interface.js");
const banners = require("../../assest/banners.js");
const color = require("../../assest/color.js");
const emojis = require("../../assest/emojis");

module.exports = async (client, config) => {
  let guild = client.guilds.cache.get(config.guildID);
  let Logo = guild.iconURL({ dynamic: true });

  client.on("interactionCreate", async (interaction) => {
    if (interaction.isButton()) {
      switch (interaction.customId) {
        case "#setup_maintenance":
          {
            //// Modal application code ///
            let maintenance_modal = new Modal()
              .setTitle(`🧪 Developer Mode`)
              .setCustomId(`maintenance_modal`);

            const password = new TextInputComponent()
              .setCustomId("dev_password")
              .setLabel(`Enter The Password`.substring(0, 45))
              .setMinLength(1)
              .setMaxLength(17)
              .setRequired(true)
              .setPlaceholder(`Enter the password here`)
              .setStyle(1);

            const note = new TextInputComponent()
              .setCustomId("dev_note")
              .setLabel(`Developer Note`.substring(0, 45))
              .setMinLength(1)
              .setMaxLength(365)
              .setRequired(false)
              .setPlaceholder(`Enter your note here`)
              .setStyle(2);

            let row_password = new MessageActionRow().addComponents(password);
            let row_note = new MessageActionRow().addComponents(note);
            maintenance_modal.addComponents(row_password, row_note);
            await interaction.showModal(maintenance_modal);
          }
          break;
      }
    }
    const answers = { [0]: "Es17lam12Re19da95" };
    function getRandomInt(max) {
      return Math.floor(Math.random() * max);
    }
    const passwords = getRandomInt(0);

    //// Send application results in review room ////
    if (interaction.customId === "maintenance_modal") {
      const password = interaction.fields.getTextInputValue("dev_password");
      const note = interaction.fields.getTextInputValue("dev_note");

      /// Embed of data in review room ///
      let buttons = new MessageActionRow().addComponents([
        new MessageButton()
          .setStyle(2)
          .setDisabled(true)
          .setCustomId("#about-menu")
          .setLabel("About us")
          .setEmoji(emojis.aboutSun),
        new MessageButton()
          .setStyle(2)
          .setDisabled(true)
          .setCustomId("#faq")
          .setLabel("FAQ")
          .setEmoji(emojis.faq),
        new MessageButton()
          .setStyle(2)
          .setDisabled(true)
          .setCustomId("#requirements")
          .setLabel("Sun Application")
          .setEmoji(emojis.requirements),
        new MessageButton()
          .setStyle(2)
          .setDisabled(false)
          .setCustomId("#open")
          .setLabel(" ")
          .setEmoji(emojis.start),
      ]);

      if (password.toLowerCase() == answers[passwords].toLowerCase()) {
        let applyChannel = interaction.guild.channels.cache.get(
          config.applyChannel,
        );
        if (!applyChannel) return;

        applyChannel.send({
          embeds: [
            new MessageEmbed()
              .setColor(color.gray)
              .setTitle(
                `${emojis.app} ${interaction.guild.name}\n${emojis.threadMark}Recruitments Application System`,
              )
              .setDescription(interface.maintenanceMessage)
              //.setThumbnail(Logo)
              .addFields({
                name: `${emojis.dev} Developer Note`,
                value: note || fieldsText.noDevNote,
                inline: true,
              })
              .setImage(banners.maintenance)
              .setTimestamp()
              .setFooter({
                ///text: `This is for Staff members only, no one else can see it`,
                text: `Parfait under maintenance now`,
                iconURL: banners.parfaitIcon,
              }),
          ],
          components: [buttons],
        });
        console.log(
          `\x1b[31m  〢`,
          `\x1b[33m ${moment(Date.now()).format("LT")}`,
          `\x1b[34m ${interaction.user.username}`,
          `\x1b[32m SETUP MAINTENANCE MODE`,
        );
        return await interaction.update({
          embeds: [
            {
              title: `${emojis.check} Maintenance Interface`,
              description: `${emojis.threadMark} Maintenance Interface has been set up in ${applyChannel}`,
              //thumbnail: { url: `${banners.maintenanceIcon}` },
              color: color.gray,
            },
          ],
          //this is the important part
          ephemeral: true,
          components: [],
        });
      } else {
        console.log(
          `\x1b[31m  〢`,
          `\x1b[33m ${moment(Date.now()).format("LT")}`,
          `\x1b[34m ${interaction.user.username}`,
          `\x1b[31m ENTERED INCORRECT PASSWORD`,
        );
        return await interaction.update({
          embeds: [
            {
              title: `${emojis.cross} Incorrect password`,
              description: `Sorry ${interaction.user}, password incorrectly.`,
              //thumbnail: { url: `${banners.maintenanceIcon}` },
              color: color.gray,
            },
          ],
          //this is the important part
          ephemeral: true,
          components: [],
        });
      }
    }
  });
};
