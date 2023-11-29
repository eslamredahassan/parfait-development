const {
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  Modal,
  TextInputComponent,
} = require("discord.js");

const moment = require("moment");
const wait = require("util").promisify(setTimeout);

const Counter = require("../../src/database/models/counter");
const Application = require("../../src/database/models/application");
const messages = require("../assest/messages.js");
const banners = require("../assest/banners.js");
const color = require("../assest/color.js");
const emojis = require("../assest/emojis");

module.exports = async (client, config) => {
  let guild = client.guilds.cache.get(config.guildID);

  client.on("interactionCreate", async (interaction) => {
    if (interaction.isButton()) {
      switch (interaction.customId) {
        case "#ap_apply":
          {
            try {
              console.log(
                `\x1b[0m`,
                `\x1b[31m 〢`,
                `\x1b[33m ${moment(Date.now()).format("lll")}`,
                `\x1b[34m ${interaction.user.username} USED`,
                `\x1b[35m Apply Button`,
              );
              //// Modal application code ///
              let application_modal = new Modal()
                .setTitle(`📝 Sun Legend Application`)
                .setCustomId(`application_modal`);

              const user_code = new TextInputComponent()
                .setCustomId("ap_usercode")
                .setLabel(`Smash Code`.substring(0, 45))
                .setMinLength(9)
                .setMaxLength(9)
                .setValue("jzso84o0q")
                .setRequired(true)
                .setPlaceholder(`Example: jzso84o0q`)
                .setStyle(1);

              const user_age = new TextInputComponent()
                .setCustomId("ap_userage")
                .setLabel(`How old are You`.substring(0, 45))
                .setMinLength(1)
                .setMaxLength(2)
                .setValue("27")
                .setRequired(true)
                .setPlaceholder(`Example: 18`)
                .setStyle(1);

              const user_ct = new TextInputComponent()
                .setCustomId("ap_userct")
                .setLabel(
                  `Do you want to join competitions/trainings ?`.substring(
                    0,
                    45,
                  ),
                )
                .setMinLength(2)
                .setMaxLength(3)
                .setValue("Yes")
                .setRequired(true)
                .setPlaceholder(`Answer with Yes or No`)
                .setStyle(1);

              const user_legends = new TextInputComponent()
                .setCustomId("ap_userlegends")
                .setLabel(`What are your favorite legends ?`.substring(0, 45))
                .setMinLength(4)
                .setMaxLength(100)
                .setValue("Peter, Ravi, Alice, Zeppetta")
                .setRequired(true)
                .setPlaceholder(`Example: Peter, Robin, Cindy, Victor`)
                .setStyle(2);

              const user_why = new TextInputComponent()
                .setCustomId("ap_userwhy")
                .setLabel(`What can you bring to SUN ?`.substring(0, 45))
                .setMinLength(4)
                .setMaxLength(100)
                .setValue("Developing Parfait bot")
                .setRequired(true)
                .setPlaceholder(`Answer here`)
                .setStyle(2);

              let row_usercode = new MessageActionRow().addComponents(
                user_code,
              );
              let row_userage = new MessageActionRow().addComponents(user_age);
              let row_userct = new MessageActionRow().addComponents(user_ct);
              let row_userlegends = new MessageActionRow().addComponents(
                user_legends,
              );
              let row_userwhy = new MessageActionRow().addComponents(user_why);
              application_modal.addComponents(
                row_usercode,
                row_userage,
                row_userct,
                row_userlegends,
                row_userwhy,
              );

              await interaction.showModal(application_modal);
            } catch (error) {}
          }
          break;
        default:
          break;
      }
    }
    //// Send application results in review room ////
    if (interaction.customId === "application_modal") {
      let user_code = interaction.fields.getTextInputValue("ap_usercode");
      let user_age = interaction.fields.getTextInputValue("ap_userage");
      let user_ct = interaction.fields.getTextInputValue("ap_userct");
      let user_legends = interaction.fields.getTextInputValue("ap_userlegends");
      let user_why = interaction.fields.getTextInputValue("ap_userwhy");
      if (isNaN(user_age)) {
        return interaction.reply({
          embeds: [
            {
              title: `${emojis.cross} Incorrect Age  Format`,
              description: `${emojis.whiteDot} Your age must be a number, please resend the application`,
              color: color.gray,
            },
          ],
          ephemeral: true,
        });
      }
      let finishChannel = interaction.guild.channels.cache.get(
        config.finishChannel,
      );
      if (!finishChannel) return;

      const firstRow = new MessageActionRow().addComponents([
        new MessageButton()
          .setStyle(5) //-->> Link Style
          .setLabel(` `)
          .setURL(`https://smashlegends.gg/en/user/${user_code}`)
          .setEmoji(emojis.slg),
        new MessageButton()
          .setStyle(3) //-->> Green Color
          .setCustomId("#ap_approve")
          .setLabel(`Aprove ${interaction.user.username}`)
          .setEmoji(emojis.accept),
        new MessageButton()
          .setStyle(1) //-->> Blurple Color
          .setCustomId("#ap_decline")
          .setLabel("Decline")
          .setEmoji(emojis.reject),
        new MessageButton()
          .setStyle(2) //-->> Grey Color
          .setCustomId("#ap_reply")
          .setLabel(``)
          .setEmoji(emojis.dm),
      ]);

      const secondRow = new MessageActionRow().addComponents([
        new MessageButton()
          .setStyle(2)
          .setCustomId("#silent_accept")
          .setLabel(`Approve Silently`)
          .setEmoji(emojis.s_accept),
        new MessageButton()
          .setStyle(2)
          .setCustomId("#silent_reject")
          .setLabel("Decline Silently")
          .setEmoji(emojis.s_reject),
        new MessageButton()
          .setStyle(4) //-->> Red Color
          .setCustomId("#ap_freeze")
          .setLabel(`Freeze⠀`)
          .setEmoji(emojis.freeze),
      ]);

      const dev = new MessageActionRow().addComponents([
        new MessageButton()
          .setStyle(2)
          .setCustomId("#profile")
          .setLabel(`Dev`)
          .setEmoji(emojis.dev),
      ]);

      /// Embed of data in review room ///
      const application = new MessageEmbed()
        .setColor(color.gray)
        .setTitle(`${emojis.app} Requests to join SUN`)
        .setAuthor({
          name: interaction.user.username,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setDescription(` `)
        .setThumbnail(banners.appResultIcon)
        .setImage(banners.appResultBanner)
        .addFields([
          {
            name: `${emojis.discord} Discord Profile`,
            value: `${emojis.threadMark} ${interaction.user}`,
            inline: true,
          },
          {
            name: `${emojis.id} Smash Code`,
            value: `${emojis.threadMark} ||\`\`${user_code}\`\`||`,
            inline: true,
          },
          {
            name: `${emojis.competition} Competitions/Trainings`,
            value: `${emojis.threadMark} \`\`${user_ct}\`\``,
            inline: false,
          },
          {
            name: `${emojis.age} Age`,
            value: `${emojis.threadMark} ||\`\`${user_age}\`\`|| Years old`,
            inline: false,
          },
          {
            name: `${emojis.favorites} Favorite Legends`,
            value: `${emojis.threadMark} \`\`${user_legends}\`\``,
            inline: false,
          },
          {
            name: `${emojis.question} What can you bring to SUN ?`,
            value: `${emojis.threadMark} \`\`${user_why}\`\``,
            inline: false,
          },
          {
            name: `${emojis.time} Requested Since`,
            value: `${emojis.threadMark} <t:${Math.floor(
              Date.now() / 1000,
            )}:R>`,
            inline: false,
          },
        ])
        .setTimestamp()
        .setFooter({
          text: interaction.user.id,
          iconURL: banners.parfaitIcon,
        });

      //// Console Log Data ///
      console.log(
        `\x1b[0m`,
        `\x1b[32m ├`,
        `\x1b[33m Smash Code:`,
        `\x1b[35m${user_code}`,
      ),
        console.log(`\x1b[32m  ├`, `\x1b[33m Age:`, `\x1b[35m${user_age}`),
        console.log(
          `\x1b[0m`,
          `\x1b[32m ├`,
          `\x1b[33m Competitions/Trainings:`,
          `\x1b[35m${user_ct}`,
        ),
        console.log(
          `\x1b[0m`,
          `\x1b[32m ├`,
          `\x1b[33m Favorite Legends:`,
          `\x1b[35m${user_legends}`,
        ),
        console.log(
          `\x1b[0m`,
          `\x1b[32m ├`,
          `\x1b[33m What can you bring to SUN:`,
          `\x1b[35m${user_why}`,
        );

      //// Create Thread ///
      let applyChannel = interaction.guild.channels.cache.get(
        config.applyChannel,
      );
      if (!applyChannel) return;

      const user = interaction.user;
      const userName = user.username;

      const thread = await applyChannel.threads.create({
        name: "🧤︱" + userName + " Tryout",
        autoArchiveDuration: 10080,
        type: "GUILD_PRIVATE_THREAD",
        reason: `${emojis.app} ${user} Requests to join SUN`,
      });

      const threads = applyChannel.threads.cache.find(
        (x) => x.name === "🧤︱" + userName + " Tryout",
      );

      await threads.members
        .add(user)
        .catch(() => console.log("Error Line 3385"));

      //// Send reply messge after applying ///
      await interaction.update({
        embeds: [
          {
            title: `${emojis.check} Your basic application has been sent for review`,
            description: `- Thank you ${interaction.user} ${messages.appSentmessage} in ${threads} channel`,
            color: color.gray,
            ///thumbnail: { url: 'https://i.imgur.com/FiSTCop.png', },
            image: { url: banners.appSentbanner },
          },
        ],
        //this is the important part
        ephemeral: true,
        components: [],
      });
      //// Send message in thread ///
      let controller = new MessageActionRow().addComponents([
        new MessageButton()
          .setStyle(2)
          .setDisabled(false)
          .setCustomId("#thread_start")
          .setLabel(`Continue`)
          .setEmoji(emojis.next),
      ]);

      await thread.sendTyping();
      await wait(5000);

      await thread.send({
        content: `${emojis.pinkDot} Hi ${user} We need to complete some information in your application\n${emojis.threadMarkmid} Press continue to start see the questions\n${emojis.threadMarkmid} Answer each question separately after using the reply button\n${emojis.threadMarkmid} Skipping the questions or spamming the button causes your application to be rejected\n${emojis.threadMark} Your answers most be in **English**`,
        components: [controller],
      });

      console.log(
        `\x1b[0m`,
        `\x1b[31m ├`,
        `\x1b[33m ${moment(Date.now()).format("lll")}`,
        `\x1b[32m Created thread`,
        `\x1b[35m ${thread.name}`,
      );

      if (finishChannel.id) {
        const app = await finishChannel
          .send({ embeds: [application], components: [firstRow, secondRow] })
          .then((msg) => msg.pin());
        await app.startThread({
          name: `${interaction.user.username}'s Application`,
          autoArchiveDuration: 10080,
          type: "GUILD_PRIVATE_THREAD",
          reason: `${emojis.app} ${interaction.user.username} Requests to join SUN`,
        });
        const existingApplication = await Application.findOne({
          userId: interaction.user.id,
        });

        try {
          if (existingApplication) {
            // Member already has an application, update the existing one
            console.log(
              `\x1b[0m`,
              `\x1b[32m ├`,
              `\x1b[33m ${moment(Date.now()).format("lll")}`,
              `\x1b[32m ${interaction.user.username} Already has an application`,
              `\x1b[35m Updating...`,
            );

            existingApplication.username = interaction.user.username;
            existingApplication.user_code = user_code;
            existingApplication.user_ct = user_ct;
            existingApplication.user_legends = user_legends;
            existingApplication.user_why = user_why;
            existingApplication.status = "Waitlist";
            existingApplication.application = app.id; // This should be the interaction ID; store it if needed
            existingApplication.thread = thread.id;
            //existingApplication.date = new Date();
            //existingApplication.new = true;

            // Save the updated application
            await existingApplication.save();
            console.log(
              `\x1b[0m`,
              `\x1b[32m ├`,
              `\x1b[33m ${moment(Date.now()).format("lll")}`,
              `\x1b[35m Existing application has been updated`,
            );
          } else {
            // No existing application found, create a new one
            const newApplication = new Application({
              userId: interaction.user.id,
              username: interaction.user.username,
              user_code,
              user_ct,
              user_ct,
              user_legends,
              user_why,
              //status: "Waitlist",
              application: app.id, // This should be the interaction ID; store it if needed
              thread: thread.id,
              //updatedIn: new Date(),
              //new: true,
            });

            // Save the new application
            await newApplication.save();
            console.log(
              `\x1b[0m`,
              `\x1b[32m ├`,
              `\x1b[33m ${moment(Date.now()).format("lll")}`,
              `\x1b[32m Application saved to`,
              `\x1b[35m database`,
            );
          }
        } catch (error) {
          console.error(
            `\x1b[0m`,
            `\x1b[32m ├`,
            `\x1b[33m  Error while creating/updating application:`,
            `\x1b[35m$ ${error.message}`,
          );
          // Handle the error or log as required
        }

        const counter = await Counter.findOne();

        if (counter) {
          // If a counter entry exists, update the count
          counter.count++;
          await counter.save();
        } else {
          // If no counter entry exists, create one and set the count to 1
          await Counter.create({ count: 1 });
        }
      }

      ////----------------------------////

      //// Add Waitlist Role ///
      await interaction.member.roles
        .add(config.waitRole)
        .catch(() => console.log("Error Line 3478"));
      const waitRole = interaction.guild.roles.cache.get(config.waitRole);
      console.log(
        `\x1b[0m`,
        `\x1b[31m └`,
        `\x1b[33m ${moment(Date.now()).format("lll")}`,
        `\x1b[34m Added ${waitRole.name} To`,
        `\x1b[34m ${interaction.user.username}`,
      );
      ////----------------------------////
    }
  });
};
