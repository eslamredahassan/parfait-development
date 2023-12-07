const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
const moment = require("moment");
const fs = require("fs");

const settings = JSON.parse(fs.readFileSync("./src/assest/settings.json"));
const color = settings.colors;
const emojis = settings.emojis;

const Application = require("../../src/database/models/application");

module.exports = async (client, config) => {
  client.on("interactionCreate", async (interaction) => {
    if (
      interaction.isContextMenu() &&
      interaction.commandName === "User info"
    ) {
      try {
        await interaction.deferReply({ ephemeral: true });
        const targetUser = await client.users.fetch(interaction.targetId);

        if (!targetUser) {
          throw new Error("Unknown User");
        }

        const member = await interaction.guild.members.fetch(targetUser.id);

        // Fetch user presence information
        await targetUser.fetch();

        // Check if the user has an application in the database
        const userApplication = await Application.findOne({
          userId: targetUser.id,
        });

        // Ensure that username, ID, and application ID are non-empty strings
        const username = targetUser.username || "N/A";
        const userID = targetUser.id || "N/A";
        const hasApplication = userApplication !== null; // Check if the user has an application
        const userAge = hasApplication ? userApplication.user_age : "N/A";
        const applicationID = hasApplication
          ? userApplication.application
          : "N/A";
        const threadID = hasApplication ? userApplication.thread : "N/A";

        // Filter out the @everyone role and mention the rest
        const roles = member.roles.cache
          .filter((role) => role.id !== interaction.guild.id)
          .map((role) => role);

        const lastRoleIndex = roles.length - 1;
        const mentionedRoles = roles
          .map((role, index) => {
            const emoji =
              index === lastRoleIndex
                ? emojis.threadMark
                : emojis.threadMarkmid;
            return `${emoji} <@&${role.id}>`;
          })
          .join("\n");

        let statusEmoji;
        switch (member.presence?.status) {
          case "online":
            statusEmoji = "🟢 Online";
            break;
          case "idle":
            statusEmoji = "🌙 Idle";
            break;
          case "dnd":
            statusEmoji = "🔴 DND";
            break;
          case "offline":
            statusEmoji = "⚫ Offline";
            break;
          default:
            statusEmoji = "⚫ Offline";
        }
        const userBanner = targetUser.banner;
        const userBannerURL = userBanner
          ? targetUser.bannerURL({ format: "png", size: 4096 })
          : null;
        // Create the embed
        const embed = new MessageEmbed()
          .setColor(color.gray)
          .setTitle("User Information")
          .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
          .setImage(userBannerURL || "")
          .addFields(
            {
              name: "Username",
              value: username,
              inline: true,
            },
            {
              name: "Age",
              value: hasApplication ? `${userAge}` : "N/A",
              inline: true,
            },
            {
              name: "Status",
              value: statusEmoji,
              inline: true,
            },
            {
              name: "Roles",
              value: mentionedRoles || "No roles",
              inline: false,
            },
            {
              name: "Account Created",
              value: `<t:${Math.floor(targetUser.createdAt / 1000)}:R>`,
              inline: false,
            },
            {
              name: `Joined ${interaction.guild.name}`,
              value: `<t:${Math.floor(member.joinedAt / 1000)}:F>`,
              inline: false,
            },
            {
              name: "Has Application",
              value: hasApplication ? "Yes" : "No",
              inline: false,
            },
            // Conditionally add these fields based on whether the user has an application
            ...(hasApplication
              ? [
                  {
                    name: "User Application",
                    value: `https://discord.com/channels/${config.guildID}/${config.finishChannel}/${applicationID}`,
                    inline: true,
                  },
                  {
                    name: "Tryout thread",
                    value: `<#${threadID}>`,
                    inline: true,
                  },
                ]
              : []),
            ...(userBannerURL
              ? [
                  {
                    name: "\u200B",
                    value: "**User Banner**", // Adding a zero-width space to ensure the field has some content
                    inline: true,
                  },
                ]
              : []),
          )
          .setFooter({
            text: `ID: ${userID}`,
            iconURL: banners.parfaitIcon,
          });

        // Create the row with buttons
        const row = new MessageActionRow().addComponents(
          new MessageButton()
            .setStyle("LINK")
            .setLabel("View Profile")
            .setURL(`https://discord.com/users/${targetUser.id}`),
          new MessageButton()
            .setStyle("LINK")
            .setLabel("View Profile Image")
            .setURL(
              targetUser.displayAvatarURL({
                format: "png",
                dynamic: true,
                size: 1024,
              }),
            ),
        );
        if (userBannerURL) {
          row.addComponents(
            new MessageButton()
              .setStyle("LINK")
              .setLabel("View Banner")
              .setURL(userBannerURL),
          );
        }

        // Edit the initial reply with the final embed and row
        interaction.editReply({
          embeds: [embed],
          components: [row],
          ephemeral: true,
        });
      } catch (error) {
        console.error("Error fetching user information:", error.message);
        interaction.editReply({
          content: "Unable to fetch user information.",
          ephemeral: true,
        });
      }
    }
  });
};
