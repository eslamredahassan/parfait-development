const { MessageSelectMenu, MessageActionRow } = require("discord.js");

const moment = require("moment");
const wait = require("util").promisify(setTimeout);
const cooldown = new Set();
require("moment-duration-format");

const messages = require("../assest/messages.js");
const fieldsText = require("../assest/fieldsText.js");
const banners = require("../assest/banners.js");
const color = require("../assest/color.js");
const emojis = require("../assest/emojis");

module.exports = async (client) => {
  client.on("interactionCreate", async (interaction) => {
    if (interaction.isButton()) {
      switch (interaction.customId) {
        case "#faq":
          {
            console.log(
              `\x1b[31m  〢`,
              `\x1b[33m ${moment(Date.now()).format("lll")}`,
              `\x1b[34m ${interaction.user.username} USED`,
              `\x1b[35m FAQ Button`,
            );

            const faqmenu = new MessageActionRow().addComponents(
              new MessageSelectMenu()
                .setCustomId("faq-menu")
                .setPlaceholder("Press here to select the category")
                .addOptions([
                  {
                    label: "Applying to Sun Lengeds",
                    description:
                      "Questions related to applying and the application process",
                    value: "applying",
                    emoji: emojis.faq,
                  },
                  {
                    label: "Accepted Applications",
                    description:
                      "Questions related to the accepted application plus the following process",
                    value: "Accepting",
                    emoji: emojis.faq,
                  },
                  {
                    label: "Rejected Applications",
                    description: "Questions related to the applications",
                    value: "Rejecting",
                    emoji: emojis.faq,
                  },
                  {
                    label: "Tryout Process",
                    description: "Questions related to the tryout process",
                    value: "tryout",
                    emoji: emojis.faq,
                  },
                  {
                    label: "Parfait Bot and General Questions",
                    description:
                      "Questions related to Parfait and other questions",
                    value: "parfaitbot",
                    emoji: emojis.faq,
                  },
                ]),
            ); // End of .addComponents()
            await interaction.reply({
              embeds: [
                {
                  title: `${emojis.faq} Frequently Asked Question Menu`,
                  description: `${emojis.pinkDot} Hi <@${interaction.user.id}> ${messages.faqMenuMainMessage}`,
                  image: { url: banners.faqBanner },
                  color: color.gray,
                  fields: [
                    {
                      name: `${emojis.warning} Notice`,
                      value: fieldsText.Notice,
                      inline: false,
                    },
                    {
                      name: `${emojis.questions} Number of questions`,
                      value: fieldsText.noq,
                      inline: true,
                    },
                    {
                      name: `${emojis.lastUpdate} Last update`,
                      value: fieldsText.lastUpdate,
                      inline: true,
                    },
                  ],
                },
              ],
              //this is the important part
              ephemeral: true,
              components: [faqmenu],
            });
          }
          client.on("interactionCreate", async (interaction) => {
            if (interaction.isSelectMenu()) {
              let choice = interaction.values[0];
              if (choice == "applying") {
                const faqmenu = new MessageActionRow().addComponents(
                  new MessageSelectMenu()
                    .setCustomId("faq-menu")
                    .setPlaceholder("Press here to select the category")
                    .addOptions([
                      {
                        label: "Applying to Sun Lengeds",
                        description:
                          "Questions related to applying and the application process",
                        value: "applying",
                        default: true,
                        emoji: emojis.faq,
                      },
                      {
                        label: "Accepted Applications",
                        description:
                          "Questions related to the accepted application plus the following process",
                        value: "Accepting",
                        emoji: emojis.faq,
                      },
                      {
                        label: "Rejected Applications",
                        description: "Questions related to the applications",
                        value: "Rejecting",
                        emoji: emojis.faq,
                      },
                      {
                        label: "Tryout Process",
                        description: "Questions related to the tryout process",
                        value: "tryout",
                        emoji: emojis.faq,
                      },
                      {
                        label: "Parfait Bot and General Questions",
                        description:
                          "Questions related to Parfait and other questions",
                        value: "parfaitbot",
                        emoji: emojis.faq,
                      },
                    ]),
                ); // End of .addComponents()

                console.log(
                  `\x1b[31m  〢`,
                  `\x1b[33m ${moment(Date.now()).format("lll")}`,
                  `\x1b[34m ${interaction.user.username} WATCH`,
                  `\x1b[35m Appyling Category`,
                );

                return await interaction.update({
                  embeds: [
                    {
                      title: `FAQ Related To Applying To SUN`,
                      description: ` `,
                      image: { url: banners.faqBanner },
                      color: color.gray,
                      fields: [
                        {
                          name: `How to apply?`,
                          value: fieldsText.howToApply,
                          inline: false,
                        },
                        {
                          name: `What is the minimum age?`,
                          value: fieldsText.age,
                          inline: false,
                        },
                        {
                          name: `What will happen if I didn't complete the second part of the application?`,
                          value: fieldsText.secondPart,
                          inline: false,
                        },
                        {
                          name: `Can I apply while I'm in the cooldown period?`,
                          value: fieldsText.applyInCooldown,
                          inline: false,
                        },
                        {
                          name: `Can I join Sun Legends clan without applying?`,
                          value: fieldsText.withoutApply,
                          inline: false,
                        },
                        {
                          name: `Can I join Sun Legends in-game clan with multiple accounts?`,
                          value: fieldsText.multipleAcconts,
                          inline: false,
                        },
                        {
                          name: `Can I join other in-game clans with my alt accounts?`,
                          value: fieldsText.joinAnotherClan,
                          inline: false,
                        },
                      ],
                    },
                  ],
                  //this is the important part
                  ephemeral: true,
                  components: [faqmenu],
                });
              } else if (choice == "Accepting") {
                const faqmenu = new MessageActionRow().addComponents(
                  new MessageSelectMenu()
                    .setCustomId("faq-menu")
                    .setPlaceholder("Press here to select the category")
                    .addOptions([
                      {
                        label: "Applying to Sun Lengeds",
                        description:
                          "Questions related to applying and the application process",
                        value: "applying",
                        emoji: emojis.faq,
                      },
                      {
                        label: "Accepted Applications",
                        description:
                          "Questions related to the accepted application plus the following process",
                        value: "Accepting",
                        default: true,
                        emoji: emojis.faq,
                      },
                      {
                        label: "Rejected Applications",
                        description: "Questions related to the applications",
                        value: "Rejecting",
                        emoji: emojis.faq,
                      },
                      {
                        label: "Tryout Process",
                        description: "Questions related to the tryout process",
                        value: "tryout",
                        emoji: emojis.faq,
                      },
                      {
                        label: "Parfait Bot and General Questions",
                        description:
                          "Questions related to Parfait and other questions",
                        value: "parfaitbot",
                        emoji: emojis.faq,
                      },
                    ]),
                ); // End of .addComponents()

                console.log(
                  `\x1b[31m  〢`,
                  `\x1b[33m ${moment(Date.now()).format("lll")}`,
                  `\x1b[34m ${interaction.user.username} WATCH`,
                  `\x1b[35m Accepted Applications Category`,
                );

                return await interaction.update({
                  embeds: [
                    {
                      title: `FAQ Related To Accepted Applications`,
                      description: ` `,
                      image: { url: banners.faqBanner },
                      color: color.gray,
                      fields: [
                        {
                          name: `What will happen when my application gets accepted?`,
                          value: fieldsText.inPeriodTrial,
                          inline: false,
                        },
                        {
                          name: `What is the trial period?`,
                          value: fieldsText.periodTrial,
                          inline: false,
                        },
                        {
                          name: `What should I do in the trial period?`,
                          value: fieldsText.doInPeriod,
                          inline: false,
                        },
                        {
                          name: `What will happen after I finish my trial period?`,
                          value: fieldsText.finishPeriod,
                          inline: false,
                        },
                      ],
                    },
                  ],
                  //this is the important part
                  ephemeral: true,
                  components: [faqmenu],
                });
              } else if (choice == "Rejecting") {
                const faqmenu = new MessageActionRow().addComponents(
                  new MessageSelectMenu()
                    .setCustomId("faq-menu")
                    .setPlaceholder("Press here to select the category")
                    .addOptions([
                      {
                        label: "Applying to Sun Lengeds",
                        description:
                          "Questions related to applying and the application process",
                        value: "applying",
                        emoji: emojis.faq,
                      },
                      {
                        label: "Accepted Applications",
                        description:
                          "Questions related to the accepted application plus the following process",
                        value: "Accepting",
                        emoji: emojis.faq,
                      },
                      {
                        label: "Rejected Applications",
                        description: "Questions related to the applications",
                        value: "Rejecting",
                        default: true,
                        emoji: emojis.faq,
                      },
                      {
                        label: "Tryout Process",
                        description: "Questions related to the tryout process",
                        value: "tryout",
                        emoji: emojis.faq,
                      },
                      {
                        label: "Parfait Bot and General Questions",
                        description:
                          "Questions related to Parfait and other questions",
                        value: "parfaitbot",
                        emoji: emojis.faq,
                      },
                    ]),
                ); // End of .addComponents()

                console.log(
                  `\x1b[31m  〢`,
                  `\x1b[33m ${moment(Date.now()).format("lll")}`,
                  `\x1b[34m ${interaction.user.username} WATCH`,
                  `\x1b[35m Rejected Applications Category`,
                );

                return await interaction.update({
                  embeds: [
                    {
                      title: `FAQ Related To Rejected Applications`,
                      description: ` `,
                      image: { url: banners.faqBanner },
                      color: color.gray,
                      fields: [
                        {
                          name: `What will happen when my application gets rejected?`,
                          value: fieldsText.inPeriodTrial,
                          inline: false,
                        },
                        {
                          name: `Can I apply while I'm in the cooldown period?`,
                          value: fieldsText.inCooldownPeriod,
                          inline: false,
                        },
                        {
                          name: `Can i know or ask about my rejection reason?`,
                          value: fieldsText.askRejection,
                          inline: false,
                        },
                      ],
                    },
                  ],
                  //this is the important part
                  ephemeral: true,
                  components: [faqmenu],
                });
              } else if (choice == "tryout") {
                const faqmenu = new MessageActionRow().addComponents(
                  new MessageSelectMenu()
                    .setCustomId("faq-menu")
                    .setPlaceholder("Press here to select the category")
                    .addOptions([
                      {
                        label: "Applying to Sun Lengeds",
                        description:
                          "Questions related to applying and the application process",
                        value: "applying",
                        emoji: emojis.faq,
                      },
                      {
                        label: "Accepted Applications",
                        description:
                          "Questions related to the accepted application plus the following process",
                        value: "Accepting",
                        emoji: emojis.faq,
                      },
                      {
                        label: "Rejected Applications",
                        description: "Questions related to the applications",
                        value: "Rejecting",
                        emoji: emojis.faq,
                      },
                      {
                        label: "Tryout Process",
                        description: "Questions related to the tryout process",
                        value: "tryout",
                        default: true,
                        emoji: emojis.faq,
                      },
                      {
                        label: "Parfait Bot and General Questions",
                        description:
                          "Questions related to Parfait and other questions",
                        value: "parfaitbot",
                        emoji: emojis.faq,
                      },
                    ]),
                ); // End of .addComponents()

                console.log(
                  `\x1b[31m  〢`,
                  `\x1b[33m ${moment(Date.now()).format("lll")}`,
                  `\x1b[34m ${interaction.user.username} WATCH`,
                  `\x1b[35m Tryout Process Category`,
                );

                return await interaction.update({
                  embeds: [
                    {
                      title: `FAQ Related To Tryout Process`,
                      description: ` `,
                      image: { url: banners.faqBanner },
                      color: color.gray,
                      fields: [
                        {
                          name: `What is the tryout?`,
                          value: fieldsText.theTryout,
                          inline: false,
                        },
                        {
                          name: `Why should I do the tryout?`,
                          value: fieldsText.whyTryout,
                          inline: false,
                        },
                        {
                          name: `Can I invite my friend to help me with the tryout?`,
                          value: fieldsText.inviteFriend,
                          inline: false,
                        },
                        {
                          name: `How much time the tryout takes?`,
                          value: fieldsText.tryoutTime,
                          inline: false,
                        },
                        {
                          name: `Can I send a video of my gameplay instead of the tryout?`,
                          value: fieldsText.sendVideo,
                          inline: false,
                        },
                        {
                          name: `Can I record or stream the tryout?`,
                          value: fieldsText.recordTryout,
                          inline: false,
                        },
                      ],
                    },
                  ],
                  //this is the important part
                  ephemeral: true,
                  components: [faqmenu],
                });
              } else if (choice == "parfaitbot") {
                const faqmenu = new MessageActionRow().addComponents(
                  new MessageSelectMenu()
                    .setCustomId("faq-menu")
                    .setPlaceholder("Press here to select the category")
                    .addOptions([
                      {
                        label: "Applying to Sun Lengeds",
                        description:
                          "Questions related to applying and the application process",
                        value: "applying",
                        emoji: emojis.faq,
                      },
                      {
                        label: "Accepted Applications",
                        description:
                          "Questions related to the accepted application plus the following process",
                        value: "Accepting",
                        emoji: emojis.faq,
                      },
                      {
                        label: "Rejected Applications",
                        description: "Questions related to the applications",
                        value: "Rejecting",
                        emoji: emojis.faq,
                      },
                      {
                        label: "Tryout Process",
                        description: "Questions related to the tryout process",
                        value: "tryout",
                        emoji: emojis.faq,
                      },
                      {
                        label: "Parfait Bot and General Questions",
                        description:
                          "Questions related to Parfait and other questions",
                        value: "parfaitbot",
                        default: true,
                        emoji: emojis.faq,
                      },
                    ]),
                ); // End of .addComponents()

                console.log(
                  `\x1b[31m  〢`,
                  `\x1b[33m ${moment(Date.now()).format("lll")}`,
                  `\x1b[34m ${interaction.user.username} WATCH`,
                  `\x1b[35m Parfait Bot Category`,
                );

                return await interaction.update({
                  embeds: [
                    {
                      title: `FAQ Related To Parfait Bot and General`,
                      description: ` `,
                      image: { url: banners.faqBanner },
                      color: color.gray,
                      fields: [
                        {
                          name: `Can I apply while the recruitments is closed?`,
                          value: fieldsText.applyWhileClosed,
                          inline: false,
                        },
                        {
                          name: `Why the recruitments closing from time to time?`,
                          value: fieldsText.whyClose,
                          inline: false,
                        },
                        {
                          name: `What happens to my information?`,
                          value: fieldsText.happensToInfo,
                          inline: false,
                        },
                        {
                          name: `Can I choose a specific staff member to do my tryout?`,
                          value: fieldsText.chooseStaff,
                          inline: false,
                        },
                        {
                          name: `Can I send a feedback about application process?`,
                          value: fieldsText.feedbackAppProcess,
                          inline: false,
                        },
                        {
                          name: `How I can send feedback about Parfait bot?`,
                          value: fieldsText.feedbackParfait,
                          inline: false,
                        },
                      ],
                    },
                  ],
                  //this is the important part
                  ephemeral: true,
                  components: [faqmenu],
                });
              }
            }
          });
          break;
      }
    }
  });
};
