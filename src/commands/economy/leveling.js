const { MessageEmbed } = require("discord.js");

const fs = require("fs");
const moment = require("moment");
const wait = require("util").promisify(setTimeout);

const Currency = require("../../../src/database/models/economy");

const settings = JSON.parse(fs.readFileSync("./src/assest/settings.json"));
const color = settings.colors;
const emojis = settings.emojis;
const banners = settings.banners;

module.exports = async (client, config) => {
  let guild = client.guilds.cache.get(config.guildID);

  const allowedChannels = ["1081224928440893571"];
  const allowedVoiceChannels = ["1191498921197965332"]; // Use the channel ID, not an array

  // Function to handle XP addition for voice state updates
  const handleVoiceXP = async (userId) => {
    // Generate random XP between 15 and 25 for each event
    const xpToAdd = Math.floor(Math.random() * (25 - 15 + 1) + 15);

    // Find or create the user in the database
    const user = await Currency.findOneAndUpdate(
      { userId: userId },
      { $inc: { xp: xpToAdd } },
      { upsert: true, new: true },
    );

    // Check for level up
    const xpRequiredForNextLevel = 1000; // Change this to your desired XP required for the next level
    if (user.xp >= xpRequiredForNextLevel) {
      // Calculate the number of levels gained
      const levelsGained = Math.floor(user.xp / xpRequiredForNextLevel);

      // Level up the user
      user.level += levelsGained;
      user.xp %= xpRequiredForNextLevel; // Remaining XP after leveling up

      // Add 100 ice coins for each level achieved
      user.iceCoins += levelsGained * 100;

      // Save the changes to the database
      await user.save();

      // Fetch the Discord.js User object
      const discordUser = client.users.cache.get(user.userId);

      // Send a level-up message to the user without showing the total amount of ice coins
      if (discordUser) {
        discordUser.send({
          embeds: [
            new MessageEmbed()
              .setColor(color.gray)
              .setTitle(`${emojis.levelUp} Level up ${user.level}!`)
              .setDescription(
                `${emojis.threadMark} Congratulations! You reached level **${
                  user.level
                }** and received ${emojis.ic} **${
                  levelsGained * 100
                }** ice coins!`,
              ),
          ],
          ephemeral: true,
          components: [],
        });
      }
    }
  };

  // Listen for message events
  client.on("messageCreate", async (message) => {
    // Check if the message author is a bot
    if (message.author.bot) {
      return; // Ignore messages from bots
    }

    // Check if the message author has the SquadSUN role and is in an allowed channel
    if (
      message.member &&
      message.member.roles.cache.has(config.SquadSUN) &&
      allowedChannels.includes(message.channel.id)
    ) {
      // Generate random XP between 15 and 25 for each message
      const xpToAdd = Math.floor(Math.random() * (25 - 15 + 1) + 15);

      // Find or create the user in the database
      const user = await Currency.findOneAndUpdate(
        { userId: message.author.id },
        { $inc: { xp: xpToAdd } },
        { upsert: true, new: true },
      );

      // Check for level up
      const xpRequiredForNextLevel = 1000; // Change this to your desired XP required for the next level
      if (user.xp >= xpRequiredForNextLevel) {
        // Calculate the number of levels gained
        const levelsGained = Math.floor(user.xp / xpRequiredForNextLevel);

        // Level up the user
        user.level += levelsGained;
        user.xp %= xpRequiredForNextLevel; // Remaining XP after leveling up

        // Add 100 ice coins for each level achieved
        user.iceCoins += levelsGained * 100;

        // Save the changes to the database
        await user.save();

        // Fetch the Discord.js User object
        const discordUser = client.users.cache.get(user.userId);

        // Send a level-up message to the user without showing the total amount of ice coins
        if (discordUser) {
          discordUser.send({
            embeds: [
              new MessageEmbed()
                .setColor(color.gray)
                .setTitle(`${emojis.levelUp} Level up ${user.level}!`)
                .setDescription(
                  `${emojis.threadMark} Congratulations! You reached level **${
                    user.level
                  }** and received ${emojis.ic} **${
                    levelsGained * 100
                  }** ice coins!`,
                ),
            ],
            ephemeral: true,
            components: [],
          });
        }
      }
    }
  });

  // Listen for voice state updates
  client.on("voiceStateUpdate", async (oldState, newState) => {
    // Check if the user is in the allowed voice channel
    if (
      newState.member &&
      newState.member.roles.cache.has(config.SquadSUN) &&
      newState.channelId === allowedVoiceChannels
    ) {
      // Call the common function to handle XP addition
      await handleVoiceXP(newState.member.id);
    }
  });

  // Set up interval to grant XP every minute while in the voice channel
  setInterval(async () => {
    const voiceChannel = guild.channels.cache.get(allowedVoiceChannels);
    if (!voiceChannel) return;

    // Iterate through members in the voice channel
    voiceChannel.members.forEach(async (member) => {
      // Check if the user is in the allowed voice channel and has the SquadSUN role
      if (
        member.roles.cache.has(config.SquadSUN) &&
        member.voice.channelId === allowedVoiceChannels
      ) {
        // Call the common function to handle XP addition
        await handleVoiceXP(member.id);
      }
    });
  }, 60000); // Grant XP every minute
};
