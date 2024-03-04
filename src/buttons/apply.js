const {
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  Modal,
  TextInputComponent,
} = require("discord.js");

const moment = require("moment");
const wait = require("util").promisify(setTimeout);

const Filter = require("bad-words");
const filter = new Filter();

const Counter = require("../../src/database/models/counter");
const Application = require("../../src/database/models/application");
const messages = require("../assest/messages.js");
const banners = require("../assest/banners.js");
const color = require("../assest/color.js");
const emojis = require("../assest/emojis");

module.exports = async (client, config) => {
  let guild = client.guilds.cache.get(config.guildID);
  client.on("interactionCreate", async (interaction) => {
    if (interaction.isButton() && interaction.customId === "#ap_apply") {
      try {
        console.log(
          `\x1b[0m`,
          `\x1b[33m 〢`,
          `\x1b[33m ${moment(Date.now()).format("LT")}`,
          `\x1b[31m ${interaction.user.username} USED`,
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
            `Do you want to join competitions/trainings ?`.substring(0, 45),
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

        let row_usercode = new MessageActionRow().addComponents(user_code);
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
      } catch (error) {
        console.error("Error in application script:", error.message);
      }
    }

    //// Send application results in review room ////
    if (
      interaction.isModalSubmit() &&
      interaction.customId === "application_modal"
    ) {
      await interaction.deferUpdate({ ephemeral: true });
      let user_code = interaction.fields.getTextInputValue("ap_usercode");
      let user_age = interaction.fields.getTextInputValue("ap_userage");
      let user_ct = interaction.fields.getTextInputValue("ap_userct");
      let user_legends = interaction.fields.getTextInputValue("ap_userlegends");
      let user_why = interaction.fields.getTextInputValue("ap_userwhy");
      // Check if user_code contains any spaces
      if (/[\s~`!@#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?()\._]/g.test(user_code)) {
        return interaction.editReply({
          embeds: [
            {
              title: `${emojis.cross} Invalid Smash Code`,
              description: `${emojis.whiteDot} Your smash code cannot contain spaces or special characters`,
              color: color.gray,
            },
          ],
          ephemeral: true,
          components: [],
        });
      }
      // Check if the user's age is a valid number
      if (isNaN(user_age)) {
        return interaction.editReply({
          embeds: [
            {
              title: `${emojis.cross} Incorrect Age  Format`,
              description: `${emojis.whiteDot} Your age must be a number, please resend the application`,
              color: color.gray,
            },
          ],
          ephemeral: true,
          components: [],
        });
      }
      // Check if the user's age is above 16
      if (parseInt(user_age) < 14) {
        return interaction.editReply({
          embeds: [
            {
              title: `${emojis.cross} Age Requirement Not Met`,
              description: `${emojis.whiteDot} You must be at least 14 years old to apply`,
              color: color.gray,
            },
          ],
          ephemeral: true,
          components: [],
        });
      }
      // Check if competitions/trainings question "yes", "yeah", "no", "nah"
      if (!["yes", "yeah", "no", "nah"].includes(user_ct.toLowerCase())) {
        return interaction.editReply({
          embeds: [
            {
              title: `${emojis.cross} Invalid Answer for Competitions/Trainings Question`,
              description: `${emojis.whiteDot} Please answer the competitions/trainings question with either \`\`Yes\`\` or \`\`No\`\``,
              color: color.gray,
            },
          ],
          ephemeral: true,
          components: [],
        });
      }
      // Check if the answers contain abusive or obscene words
      if (filter.isProfane(user_legends) || filter.isProfane(user_why)) {
        return interaction.editReply({
          embeds: [
            {
              title: `${emojis.cross} Inappropriate Content Detected`,
              description: `${emojis.whiteDot} Your application contains inappropriate content. Please ensure that your answers are respectful and do not include abusive or obscene language.`,
              color: color.gray,
            },
          ],
          ephemeral: true,
          components: [],
        });
      }
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
        .catch((error) =>
          console.log("Error in added member to his thread", error.message),
        );

      console.log(
        `\x1b[0m`,
        `\x1b[33m 〢`,
        `\x1b[33m ${moment(Date.now()).format("LT")}`,
        `\x1b[31m Created thread`,
        `\x1b[35m ${thread.name}`,
      );

      let finishChannel = interaction.guild.channels.cache.get(
        config.finishChannel,
      );
      if (!finishChannel) return;

      const firstRow = new MessageActionRow().addComponents([
        new MessageButton()
          .setStyle(3) //-->> Green Color
          .setCustomId("#ap_approve")
          .setLabel(`Aprove ${interaction.user.username}`)
          .setEmoji(emojis.accept),
        new MessageButton()
          .setStyle(3)
          .setCustomId("#silent_approve")
          .setLabel(``)
          .setEmoji(emojis.s_accept),
        new MessageButton()
          .setStyle(1) //-->> Blurple Color
          .setCustomId("#ap_decline")
          .setLabel("Decline")
          .setEmoji(emojis.reject),
        new MessageButton()
          .setStyle(1)
          .setCustomId("#silent_decline")
          .setLabel("")
          .setEmoji(emojis.s_reject),
      ]);

      const secondRow = new MessageActionRow().addComponents([
        new MessageButton()
          .setStyle(4) //-->> Red Color
          .setCustomId("#ap_freeze")
          .setLabel(`Freeze ${interaction.user.username}`)
          .setEmoji(emojis.freeze),
        new MessageButton()
          .setStyle(2) //-->> Grey Color
          .setCustomId("#ap_reply")
          .setLabel(`Message`)
          .setEmoji(emojis.dm),
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
            name: `${emojis.thread} Tryout thread`,
            value: `${emojis.threadMark} ${thread}` || "``N/A``",
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
        `\x1b[33m 〢`,
        `\x1b[33m ${moment(Date.now()).format("LT")}`,
        `\x1b[31m ${interaction.user.username}`,
        `\x1b[35m applyed`,
      ),
        //// Add Waitlist Role ///
        await interaction.member.roles.add(config.waitRole);
      const waitRole = interaction.guild.roles.cache.get(config.waitRole);
      console.log(
        `\x1b[0m`,
        `\x1b[33m 〢`,
        `\x1b[33m ${moment(Date.now()).format("LT")}`,
        `\x1b[31m Added ${waitRole.name} To`,
        `\x1b[35m ${interaction.user.username}`,
      );

      //// Send reply messge after applying ///
      await interaction.editReply({
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
          .setCustomId("#ap_questions")
          .setLabel(`Continue`)
          .setEmoji(emojis.next),
      ]);

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
              `\x1b[33m 〢`,
              `\x1b[33m ${moment(Date.now()).format("LT")}`,
              `\x1b[31m ${interaction.user.username} Already has an application`,
              `\x1b[35m UPDATING`,
            );

            existingApplication.username = interaction.user.username;
            existingApplication.user_code = user_code;
            existingApplication.user_age = user_age;
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
              `\x1b[33m 〢`,
              `\x1b[33m ${moment(Date.now()).format("LT")}`,
              `\x1b[31m ${interaction.user.username}`,
              `\x1b[35m application has been updated`,
            );
          } else {
            // No existing application found, create a new one
            const newApplication = new Application({
              userId: interaction.user.id,
              username: interaction.user.username,
              user_age,
              user_code,
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
              `\x1b[33m 〢`,
              `\x1b[33m ${moment(Date.now()).format("LT")}`,
              `\x1b[31m Application saved to database`,
            );
          }
        } catch (error) {
          console.error(
            `\x1b[0m`,
            `\x1b[33m 〢`,
            `\x1b[33m ${moment(Date.now()).format("LT")}`,
            `\x1b[31m Error while creating/updating application:`,
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

      await thread.sendTyping();
      await wait(5000);

      // Ask the questions directly after a short delay
      const questions = {
        q0: `Hi ${interaction.user} We need to complete some information in your application, are you ready?`,
        q1: "Please send a screenshot from your in-game profile here",
        q2: "When you are available for a tryout by our staff",
        q3: "What are your usual days of play and hours?",
        q4: "Have you joined any clan before?",
        q5: "What is the highest rank you have obtained?",
        q6: "Where are you from?",
        q7: "When did you start playing Smash Legends?",
        q8: "Have you read the requirements?",
      };

      let askedAdditionalQuestion = false; // Variable to track if the additional question has been asked

      for (const [questionKey, question] of Object.entries(questions)) {
        // Ask each question in sequence
        await thread.sendTyping();
        await wait(5000);
        await thread.send({
          content: `${question}`,
        });

        // Wait for the user's response (adjust the timeout if needed)
        try {
          const collected = await thread.awaitMessages({
            filter: (response) => response.author.id === interaction.user.id,
            time: 86400000, // 24 hour timeout
            max: 1,
            errors: ["time"],
          });

          const userResponse = collected.first().content.toLowerCase();

          // Process the user's response as needed
          switch (questionKey) {
            case "q0": // Hi ${interaction.user} We need to complete some information in your application, are you ready?
              const positiveResponses = [
                "yes",
                "yeah",
                "yup",
                "let's go",
                "alright",
              ];
              const negativeResponses = [
                "no",
                "nah",
                "not now",
                "i'm not ready",
                "later",
              ];

              if (positiveResponses.includes(userResponse)) {
                // User is ready, continue asking other questions
              } else if (negativeResponses.includes(userResponse)) {
                // User is not ready, set a timeout for 15 minutes and ask again
                await thread.send(
                  `Okay, I'll check back in 15 minutes. If you're ready sooner, just let me know!`,
                );
                await wait(15 * 1000); // 15 minutes timeout

                // Continue asking the user until they are ready
                let userReady = false;
                while (!userReady) {
                  await thread.sendTyping();
                  await wait(5000);
                  await thread.send(
                    `Hi ${interaction.user} Are you ready now?`,
                  );

                  // Wait for the user's response
                  try {
                    const collectedReady = await thread.awaitMessages({
                      filter: (response) =>
                        response.author.id === interaction.user.id,
                      time: 86400000, // 24 hour timeout
                      max: 1,
                      errors: ["time"],
                    });

                    const userReadyResponse = collectedReady
                      .first()
                      .content.toLowerCase();

                    // Process the user's response to being ready
                    if (positiveResponses.includes(userReadyResponse)) {
                      // User is ready, set the flag to true and exit the loop
                      userReady = true;
                    } else {
                      // User is not ready, set a timeout for 15 minutes and repeat the process
                      await thread.send(
                        `Okay, I'll check back in 15 minutes. If you're ready sooner, just let me know!`,
                      );
                      await wait(15 * 1000); // 15 minutes timeout
                    }
                  } catch (error) {
                    await thread.send(`Time is Over for being ready`);
                    return; // Stop the processing for now
                  }
                }
              } else {
                // Handle invalid responses
                await thread.sendTyping();
                await wait(5000);
                await thread.send(
                  "I'm sorry, I didn't understand your response. Please answer with yes or no.",
                );
                try {
                  // Wait for the user to respond with valid answers
                  const collectedValidResponse = await thread.awaitMessages({
                    filter: (response) =>
                      response.author.id === interaction.user.id &&
                      [...positiveResponses, ...negativeResponses].includes(
                        response.content.toLowerCase(),
                      ),
                    time: 86400000, // 24 hour timeout
                    max: 1,
                    errors: ["time"],
                  });

                  const userValidResponse = collectedValidResponse
                    .first()
                    .content.toLowerCase();
                  if (positiveResponses.includes(userValidResponse)) {
                    // User is ready, continue asking other questions
                  } else if (negativeResponses.includes(userValidResponse)) {
                    // User is not ready, set a timeout for 15 minutes and ask again
                    await thread.send(
                      `Okay, I'll check back in 15 minutes. If you're ready sooner, just let me know!`,
                    );
                    await wait(15 * 1000); // 15 minutes timeout

                    // Continue asking the user until they are ready
                    let userReady = false;
                    while (!userReady) {
                      await thread.sendTyping();
                      await wait(5000);
                      await thread.send(
                        `Hi ${interaction.user} Are you ready now?`,
                      );

                      // Wait for the user's response
                      try {
                        const collectedReady = await thread.awaitMessages({
                          filter: (response) =>
                            response.author.id === interaction.user.id,
                          time: 86400000, // 24 hour timeout
                          max: 1,
                          errors: ["time"],
                        });

                        const userReadyResponse = collectedReady
                          .first()
                          .content.toLowerCase();

                        // Process the user's response to being ready
                        if (positiveResponses.includes(userReadyResponse)) {
                          // User is ready, set the flag to true and exit the loop
                          userReady = true;
                        } else {
                          // User is not ready, set a timeout for 15 minutes and repeat the process
                          await thread.send(
                            `Okay, I'll check back in 15 minutes. If you're ready sooner, just let me know!`,
                          );
                          await wait(15 * 60 * 1000); // 15 minutes timeout
                        }
                      } catch (error) {
                        await thread.send(`Time is Over for being ready`);
                        return; // Stop the processing for now
                      }
                    }
                  }
                } catch (error) {
                  await thread.send(`Time is Over for valid response`);
                  return; // Stop the processing for now
                }
              }
              break;

            case "q1": // Please send a screenshot from your in-game profile here
              if (collected.first().attachments.size > 0) {
                // Check if the user sent a media file (image/screenshot)
                const attachment = collected.first().attachments.first();
                if (attachment.contentType.startsWith("image/")) {
                  // User sent a valid image file, continue asking other questions
                  // Additional logic for handling image can be added here if needed
                } else {
                  // User sent an unsupported file format, inform and wait for a valid image file
                  await thread.send(
                    `Unsupported file format. Please send a screenshot/image file.`,
                  );
                  try {
                    // Wait for the user to send a valid image file
                    const collectedImage = await thread.awaitMessages({
                      filter: (response) =>
                        response.author.id === interaction.user.id &&
                        response.attachments.size > 0 &&
                        response.attachments
                          .first()
                          .contentType.startsWith("image/"),
                      time: 86400000, // 24 hour timeout
                      max: 1,
                      errors: ["time"],
                    });

                    // Process the user's response (valid image file)
                    // You can handle the valid image file here if needed
                  } catch (error) {
                    await thread.send(
                      `Time is Over for sending a valid image file`,
                    );
                    return; // Stop the processing for now
                  }
                }
              } else {
                // User did not send any attachments, handle accordingly
                await thread.send(
                  `You didn't send a screenshot. Please send a screenshot/image file.`,
                );
                try {
                  // Wait for the user to send a valid image file
                  const collectedImage = await thread.awaitMessages({
                    filter: (response) =>
                      response.author.id === interaction.user.id &&
                      response.attachments.size > 0 &&
                      response.attachments
                        .first()
                        .contentType.startsWith("image/"),
                    time: 86400000, // 24 hour timeout
                    max: 1,
                    errors: ["time"],
                  });

                  // Process the user's response (valid image file)
                  // You can handle the valid image file here if needed
                } catch (error) {
                  await thread.send(
                    `Time is Over for sending a valid image file`,
                  );
                  return; // Stop the processing for now
                }
              }
              break;

            case "q4": // Have you joined any clan before?
              if (["yes", "yeah", "yup", "yay"].includes(userResponse)) {
                if (askedAdditionalQuestion) {
                  // If the bot has already asked the additional question, proceed to the next question
                  break;
                }
                // If the user answers "yes", ask the additional question
                await thread.sendTyping();
                await wait(5000);
                await thread.send("What is the name of your previous clan?");
                askedAdditionalQuestion = true; // Mark that the additional question has been asked
                try {
                  // Wait for the user's response to the additional question
                  const collectedClan = await thread.awaitMessages({
                    filter: (response) =>
                      response.author.id === interaction.user.id,
                    time: 86400000, // 24 hour timeout
                    max: 1,
                    errors: ["time"],
                  });

                  const previousClan = collectedClan.first().content;
                  // Process the user's response to the additional question
                  // You can handle the user's response to the additional question here
                } catch (error) {
                  await thread.send(`Time is Over for additional question`);
                  return; // Stop the processing for now
                }
              } else if (
                ["no", "nah", "na", "i didn'"].includes(userResponse)
              ) {
                // Continue asking other questions
              } else {
                // Handle invalid responses to q4
                await thread.sendTyping();
                await wait(5000);
                await thread.send(
                  "I'm sorry, I didn't understand your response. Please answer with yes or no.",
                );
                try {
                  // Wait for the user to respond with valid answers
                  const collectedValidResponse = await thread.awaitMessages({
                    filter: (response) =>
                      response.author.id === interaction.user.id &&
                      [
                        "yes",
                        "yeah",
                        "yup",
                        "yay",
                        "no",
                        "nah",
                        "na",
                        "i didn'",
                      ].includes(response.content.toLowerCase()),
                    time: 86400000, // 24 hour timeout
                    max: 1,
                    errors: ["time"],
                  });

                  const userValidResponse = collectedValidResponse
                    .first()
                    .content.toLowerCase();
                  if (
                    ["yes", "yeah", "yup", "yay"].includes(userValidResponse)
                  ) {
                    // If the user provides a valid response after the clarification, ask the additional question
                    await thread.sendTyping();
                    await wait(5000);
                    await thread.send(
                      "What is the name of your previous clan?",
                    );
                    askedAdditionalQuestion = true; // Mark that the additional question has been asked
                    try {
                      // Wait for the user's response to the additional question
                      const collectedClan = await thread.awaitMessages({
                        filter: (response) =>
                          response.author.id === interaction.user.id,
                        time: 86400000, // 24 hour timeout
                        max: 1,
                        errors: ["time"],
                      });

                      const previousClan = collectedClan.first().content;
                      // Process the user's response to the additional question
                      // You can handle the user's response to the additional question here
                    } catch (error) {
                      await thread.send(`Time is Over for additional question`);
                      return; // Stop the processing for now
                    }
                  }
                } catch (error) {
                  await thread.send(`Time is Over for valid response`);
                  return; // Stop the processing for now
                }
              }
              break;

            // Add additional cases for other questions if needed

            default:
              // Continue asking other questions for the remaining cases
              break;
          }
        } catch (error) {
          await thread.send(`Time is Over for ${questionKey}`);
        }
      }

      // Send a thanks message after all questions are answered
      await thread.send({
        content: `Thank you ${interaction.user} for providing your responses <@&${config.staffSun}> will review your application soon.`,
      });

      ////----------------------------////
    }
  });
};
