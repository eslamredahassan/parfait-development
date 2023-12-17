const { MessageActionRow, MessageButton, MessageEmbed, MessageAttachment } = require("discord.js");
const fs = require("fs");
const moment = require("moment");
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

const settings = JSON.parse(fs.readFileSync("./src/assest/settings.json"));
const color = settings.colors;
const emojis = settings.emojis;

// Function to parse duration string and convert it to milliseconds
function parseDuration(durationString) {
  const regex = /(\d+)([smhd])/;
  const match = durationString.match(regex);

  if (!match) {
    throw new Error(
      "Invalid duration format. Use a format like '1s', '1m', '1h', '1d'."
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
        "Invalid duration unit. Use 's' for seconds, 'm' for minutes, 'h' for hours, 'd' for days."
      );
  }
}

// Declare votedUsers at a higher scope to retain its state
const votedUsers = new Set();

// Function to generate a vertical bar chart image for given vote counts
async function generateChart(voteCounts) {
    const canvas = new ChartJSNodeCanvas({ width: 400, height: 200 });
  
    const configuration = {
      type: 'bar',
      data: {
        labels: [], // Empty labels array
        datasets: [{
          label: 'Votes',
          data: Object.values(voteCounts),
          backgroundColor: '#d9507c',
        }],
      },
      options: {
        scales: {
          x: {
            display: false, // Hide x-axis
          },
          y: {
            beginAtZero: true,
          },
        },
        plugins: {
          legend: {
            display: false, // Hide legend
          },
        },
      },
    };
  
    const image = await canvas.renderToBuffer(configuration);
    const attachment = new MessageAttachment(image, 'chart.png');
  
    return attachment;
  }
  

module.exports = async (client, config) => {
  const voteCounts = {};
  let votingOptions;
  let pollObject;
  let pollFinalized = false;

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
          pollObject = interaction.options.getString("object");
          votingOptions = interaction.options.getString("vote").split(",");
          const durationString = interaction.options.getString("duration");
          const duration = parseDuration(durationString);
          const channelOption = interaction.options.getChannel("channel");

          votingOptions.forEach((option) => {
            voteCounts[option] = 0;
          });

          const buttons = votingOptions.map((option, index) =>
            new MessageButton()
              .setCustomId(`vote_${index + 1}`)
              .setEmoji(option)
              .setLabel(`${voteCounts[option]}`)
              .setStyle(2)
          );

          const row = new MessageActionRow().addComponents(buttons);

          const targetChannel =
            channelOption || interaction.channel || interaction.user.dmChannel;

          const pollEmbed = new MessageEmbed()
            .setColor(color.gray)
            .setTitle(`${emojis.warning} Poll: ${pollObject}`)
            .setDescription(
              `${emojis.threadMark} Vote by clicking the buttons below.`
            );

          const pollMessage = await targetChannel.send({
            embeds: [pollEmbed],
            components: [row],
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

          setTimeout(async () => {
            try {
              if (!pollFinalized) {
                const results = votingOptions.map((option, index) => {
                  const count = voteCounts[option];
                  return `${option}: ${count} votes`;
                });

                // Generate the vertical bar chart image
                const chartImage = await generateChart(voteCounts);

                const resultsEmbed = new MessageEmbed()
                  .setColor(color.gray)
                  .setTitle(`${emojis.poll} Poll Results: ${pollObject}`)
                  .setDescription(
                    `${emojis.threadMark} Here are the results:\n${results.join(
                      "\n"
                    )}`
                  );

                // Add the chart image to the embed
                resultsEmbed.setImage("attachment://chart.png");

                pollMessage.edit({
                  embeds: [resultsEmbed],
                  components: [],
                  files: [chartImage], // Attach the chart image
                });

                // Set the flag to true to indicate that the poll has been finalized
                pollFinalized = true;
              }
            } catch (error) {
              console.error(
                `\x1b[0m`,
                `\x1b[33m ${moment(Date.now()).format("LT")}`,
                `\x1b[31m Error in poll command:`,
                `\x1b[34m ${error.message}`
              );
              const errorEmbed = new MessageEmbed()
                .setColor(color.gray)
                .setDescription(
                  `${emojis.warning} An error occurred while processing the command.`
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
            `\x1b[34m ${error.message}`
          );
          const errorEmbed = new MessageEmbed()
            .setColor(color.gray)
            .setDescription(
              `${emojis.warning} An error occurred while processing the command.`
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
    if (
      interaction.isButton() &&
      interaction.customId.startsWith("vote_")
    ) {
      await interaction.deferReply({ ephemeral: true });
      const customId = interaction.customId;
      const selectedOption = customId.split("_")[1];

      // Check if the user has already voted
      if (votedUsers.has(interaction.user.id)) {
        // User has already voted
        await interaction.editReply({
          content: `You have already voted`,
          ephemeral: true,
        });
        return;
      }

      // Mark the user as voted
      votedUsers.add(interaction.user.id);

      // Increment the vote count for the selected option
      voteCounts[votingOptions[selectedOption - 1]] += 1;

      // Update the button labels with the new vote counts
      const updatedButtons = votingOptions.map((option, index) =>
        new MessageButton()
          .setCustomId(`vote_${index + 1}`)
          .setEmoji(option)
          .setLabel(`${voteCounts[option]}`)
          .setStyle(2)
      );

      // Generate the vertical bar chart image
      const chartImage = await generateChart(voteCounts);

      // Update the interaction with the new button labels and chart image
      const row = new MessageActionRow().addComponents(updatedButtons);
      const updatedResultsEmbed = new MessageEmbed()
        .setColor(color.gray)
        .setTitle(`${emojis.poll} Poll Results: ${pollObject}`)
        .setDescription(
          `${emojis.threadMark} Here are the results:\n${Object.keys(
            voteCounts
          )
            .map((option) => `${option}: ${voteCounts[option]}`)
            .join("\n")}`
        );

      // Add the chart image to the embed
      updatedResultsEmbed.setImage("attachment://chart.png");

      await interaction.message.edit({
        embeds: [updatedResultsEmbed],
        components: [row],
        files: [chartImage], // Attach the chart image
      });

      // Reply to the user indicating the vote
      await interaction.editReply({
        content: `You voted for ${votingOptions[selectedOption - 1]}.`,
        ephemeral: true,
      });
    }
  });
};
