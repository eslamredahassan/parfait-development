const {
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  MessageAttachment,
} = require("discord.js");
const fs = require("fs");
const moment = require("moment");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");

const settings = JSON.parse(fs.readFileSync("./src/assest/settings.json"));
const color = settings.colors;
const emojis = settings.emojis;

// Function to parse duration string and convert it to milliseconds
function parseDuration(durationString) {
  const regex = /(\d+)([smhd])/;
  const match = durationString.match(regex);

  if (!match) {
    throw new Error(
      "Invalid duration format. Use a format like '1s', '1m', '1h', '1d'.",
    );
  }

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value * 1000; // seconds to milliseconds
    case "m":
      return value * 60 * 1000; // minutes to milliseconds
    case "h":
      return value * 60 * 60 * 1000; // hours to milliseconds
    case "d":
      return value * 24 * 60 * 60 * 1000; // days to milliseconds
    default:
      throw new Error(
        "Invalid duration unit. Use 's' for seconds, 'm' for minutes, 'h' for hours, 'd' for days.",
      );
  }
}

// Function to generate a vertical bar chart image for given vote counts and custom text
async function generateChart(voteCounts, customText, duration, user) {
  const canvas = new ChartJSNodeCanvas({ width: 400, height: 200 });
  const optionColors = ["#d9507c", "#4a90e2", "#00cc99", "#ffcc00"]; // Add more colors as needed

  const configuration = {
    type: "bar",
    data: {
      labels: Object.keys(voteCounts),
      datasets: [
        {
          label: "Votes",
          data: Object.values(voteCounts),
          backgroundColor: optionColors,
          categoryPercentage: 1, // Hide category (x-axis) labels
          barPercentage: 1, // Hide bar labels
          barThickness: 20, // Adjust bar width
          maxBarThickness: 25, // Maximum bar width
          minBarLength: 2, // Minimum bar height
        },
      ],
    },
    options: {
      scales: {
        x: {
          type: "category",
          position: "bottom",
          display: false,
        },
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        annotation: {
          annotations: [
            {
              type: "line",
              mode: "horizontal",
              scaleID: "y",
              value: 0,
              borderColor: "rgb(75, 192, 192)",
              borderWidth: 2,
            },
          ],
        },
      },
    },
  };

  const image = await canvas.renderToBuffer(configuration);
  const attachment = new MessageAttachment(image, "chart.png");
  const liveDuration = `<t:${Math.floor((Date.now() + duration) / 1000)}:R>`; // Format duration using Discord timestamp
  const embed = new MessageEmbed()
    .setColor(color.gray)
    .setTitle(customText)
    .setDescription(`${emojis.threadMark} Here is the chart:`)
    .setImage("attachment://chart.png")
    .addFields(
      {
        name: `${emojis.time} Poll ends`,
        value: `${emojis.threadMark} ${liveDuration}`,
        inline: true,
      },
      {
        name: `${emojis.id} Poll created by`,
        value: `${emojis.threadMark} ${user}`,
        inline: true,
      },
    );

  return { embed, attachment };
}

module.exports = async (client, config) => {
  const polls = new Map(); // Use a Map to store information about each poll

  client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand() && interaction.commandName === "poll") {
      await interaction.deferReply({ ephemeral: true });

      const perms = [
        `${config.devRole}`,
        `${config.STAFF}`,
        `${config.staffSun}`,
        `${config.SquadSUN}`,
        `${config.SunTest}`,
        `${config.TeamSun}`,
      ];
      const user = interaction.guild.members.cache.get(interaction.user.id);

      if (user.roles.cache.hasAny(...perms)) {
        try {
          const pollObject = interaction.options.getString("object");
          const votingOptions = interaction.options
            .getString("vote")
            .split(",");
          const durationString = interaction.options.getString("duration");
          const duration = parseDuration(durationString);

          const channelOption = interaction.options.getChannel("channel");

          const votedUsers = new Set(); // Use a separate set for each poll
          const voteCounts = {};

          votingOptions.forEach((option) => {
            voteCounts[option] = 0;
          });

          const buttons = votingOptions.map((option, index) =>
            new MessageButton()
              .setCustomId(`vote_${index + 1}`)
              .setEmoji(option)
              .setLabel(`${voteCounts[option]}`)
              .setStyle(2),
          );

          const row = new MessageActionRow().addComponents(buttons);

          const targetChannel =
            channelOption || interaction.channel || interaction.user.dmChannel;

          const chartText = `${emojis.poll} Poll: ${pollObject}`;
          const { embed, attachment } = await generateChart(
            voteCounts,
            chartText,
            duration,
            interaction.user,
          );

          const pollMessage = await targetChannel.send({
            embeds: [embed],
            components: [row],
            files: [attachment], // Attach the chart image
          });

          await interaction.editReply({
            embeds: [
              {
                title: `${emojis.success} Poll created`,
                description: `${emojis.threadMark} The poll has been created in ${targetChannel}.`,
                color: color.gray,
              },
            ],
            ephemeral: true,
          });

          polls.set(pollMessage.id, {
            voteCounts,
            votedUsers,
            votingOptions,
            pollObject,
            duration,
            pollFinalized: false,
          });

          setTimeout(async () => {
            try {
              const pollData = polls.get(pollMessage.id);

              if (!pollData.pollFinalized) {
                const results = pollData.votingOptions.map((option) => {
                  const count = pollData.voteCounts[option];
                  return `${option}: ${count} votes`;
                });

                // Generate the vertical bar chart image
                const { embed: resultsEmbed, attachment: chartImage } =
                  await generateChart(
                    pollData.voteCounts,
                    `${emojis.poll} Poll Results: ${pollData.pollObject}`,
                    pollData.duration,
                    interaction.user,
                  );

                pollMessage.edit({
                  embeds: [resultsEmbed],
                  components: [],
                  files: [chartImage], // Attach the chart image
                });

                // Set the flag to true to indicate that the poll has been finalized
                polls.get(pollMessage.id).pollFinalized = true;
              }
            } catch (error) {
              console.error(
                `\x1b[0m`,
                `\x1b[33m ${moment(Date.now()).format("LT")}`,
                `\x1b[31m Error in poll command:`,
                `\x1b[34m ${error.message}`,
              );
              const errorEmbed = new MessageEmbed()
                .setColor(color.gray)
                .setDescription(
                  `${emojis.warning} An error occurred while processing the command.`,
                );
              await interaction.editReply({
                embeds: [errorEmbed],
                ephemeral: true,
              });
            }
          }, duration);
        } catch (error) {
          console.error(
            `\x1b[0m`,
            `\x1b[33m ${moment(Date.now()).format("LT")}`,
            `\x1b[31m Error in poll command:`,
            `\x1b[34m ${error.message}`,
          );
          const errorEmbed = new MessageEmbed()
            .setColor(color.gray)
            .setDescription(
              `${emojis.warning} An error occurred while processing the command.`,
            );
          await interaction.editReply({
            embeds: [errorEmbed],
            ephemeral: true,
          });
        }
      } else {
        await interaction.editReply({
          embeds: [
            {
              title: `${emojis.alert} Permission denied`,
              description: `${emojis.threadMark} You don't have permission to use /poll command.`,
              color: color.gray,
            },
          ],
          ephemeral: true,
        });
      }
    }
  });

  client.on("interactionCreate", async (interaction) => {
    if (interaction.isButton() && interaction.customId.startsWith("vote_")) {
      await interaction.deferReply({ ephemeral: true });
      const customId = interaction.customId;
      const selectedOption = customId.split("_")[1];

      const pollData = polls.get(interaction.message.id);

      if (!pollData) {
        // Poll data not found, possibly expired
        await interaction.editReply({
          content: `This poll has either expired or does not exist.`,
          ephemeral: true,
        });
        return;
      }

      // Check if the user has already voted
      if (pollData.votedUsers.has(interaction.user.id)) {
        // User has already voted
        await interaction.editReply({
          content: `You have already voted`,
          ephemeral: true,
        });
        return;
      }

      // Mark the user as voted
      pollData.votedUsers.add(interaction.user.id);

      // Increment the vote count for the selected option
      pollData.voteCounts[pollData.votingOptions[selectedOption - 1]] += 1;

      // Update the button labels with the new vote counts
      const updatedButtons = pollData.votingOptions.map((option, index) =>
        new MessageButton()
          .setCustomId(`vote_${index + 1}`)
          .setEmoji(option)
          .setLabel(`${pollData.voteCounts[option]}`)
          .setStyle(2),
      );

      // Generate the vertical bar chart image
      const { embed: updatedResultsEmbed, attachment: chartImage } =
        await generateChart(
          pollData.voteCounts,
          `${emojis.poll} Poll Results: ${pollData.pollObject}`,
          pollData.duration,
          interaction.user,
        );

      // Update the interaction with the new button labels and chart image
      const row = new MessageActionRow().addComponents(updatedButtons);
      await interaction.message.edit({
        embeds: [updatedResultsEmbed],
        components: [row],
        files: [chartImage], // Attach the chart image
      });

      // Reply to the user indicating the vote
      await interaction.editReply({
        content: `You voted for ${pollData.votingOptions[selectedOption - 1]}.`,
        ephemeral: true,
      });
    }
  });
};
