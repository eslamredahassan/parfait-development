const {
  MessageActionRow,
  MessageSelectMenu,
  MessageEmbed,
  MessageButton,
} = require("discord.js");
const moment = require("moment");
const fs = require("fs");

const settings = JSON.parse(fs.readFileSync("./src/assest/settings.json"));
const color = settings.colors;
const emojis = settings.emojis;
const banners = settings.banners;

// Import necessary database models
const Currency = require("../../../src/database/models/economy");
const RoleMarket = require("../../../src/database/models/roleMarket");

// Function to fetch role based on its ID
function getRoleById(guild, roleId) {
  return guild.roles.cache.find((role) => role.id === roleId);
}

// Function to determine iceCoinsRequired based on selectedValue
function determineIceCoinsRequired(selectedValue) {
  switch (selectedValue) {
    case "#r1":
      return 15099;
    case "#r2":
      return 1875;
    case "#r3":
      return 20999;
    case "#r4":
      return 2287;
    case "#r7":
      return 2854;
    default:
      return 0;
  }
}

module.exports = async (client, config) => {
  let selectedValue; // Declare selectedValue outside the if block

  client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand() && interaction.commandName === "buy") {
      await interaction.deferReply({ ephemeral: true });
      const guild = interaction.guild;
      const selectedRole = interaction.options.getString("item");

      const perms = [
        `${config.devRole}`,
        `${config.SquadSUN}`,
        `${config.TeamSun}`,
      ];
      let staff = guild.members.cache.get(interaction.user.id);
      if (!staff.roles.cache.hasAny(...perms)) {
        return interaction.editReply({
          embeds: [
            new MessageEmbed()
              .setColor(color.gray)
              .setTitle(`${emojis.warning} Permission Denied`)
              .setDescription(
                `${emojis.threadMark} Only member who has <@&${config.SquadSUN}> role can use this command`,
              ),
          ],
          ephemeral: true,
        });
      }
      if (selectedRole === "#roles") {
        const roles = new MessageActionRow().addComponents(
          new MessageSelectMenu()
            .setCustomId("#roles")
            .setPlaceholder("Select a unique role")
            .addOptions([
              {
                label: guild.roles.cache.get(config.marketRole1).name,
                value: "#r1",
                description: "Description",
                emoji: emojis.aboutSun,
              },
              {
                label: guild.roles.cache.get(config.marketRole2).name,
                value: "#r2",
                description: "Description",
                emoji: emojis.otherAchv,
              },
              {
                label: guild.roles.cache.get(config.marketRole3).name,
                value: "#r3",
                description: "Description",
                emoji: emojis.leader,
              },
              {
                label: guild.roles.cache.get(config.marketRole4).name,
                value: "#r4",
                description: "Description",
                emoji: emojis.staff,
              },
              {
                label: guild.roles.cache.get(config.marketRole5).name,
                value: "#r5",
                description: "Description",
                emoji: emojis.partner,
              },
              {
                label: guild.roles.cache.get(config.marketRole6).name,
                value: "#r6",
                description: "Description",
                emoji: emojis.partner,
              },
              {
                label: guild.roles.cache.get(config.marketRole7).name,
                value: "#r7",
                description: "Description",
                emoji: emojis.partner,
              },
              {
                label: guild.roles.cache.get(config.marketRole8).name,
                value: "#r8",
                description: "Description",
                emoji: emojis.partner,
              },
            ]),
        );

        // Fetch user's ice coins
        const user = interaction.user;
        const currencyData = await Currency.findOne({ userId: user.id });
        const iceCoins = currencyData ? currencyData.iceCoins : 0;
        const formattedBalance = iceCoins.toLocaleString();
        await interaction.editReply({
          embeds: [
            {
              description: `### ${emojis.market} Parfait Market\n${emojis.threadMark} Use your ${emojis.ic} **${formattedBalance}** ice coins to purchase a unique role`,
              image: { url: banners.aboutSunBanner },
              color: color.gray,
            },
          ],
          ephemeral: true,
          components: [roles],
        });
      }
    } else if (
      interaction.isSelectMenu() &&
      interaction.customId === "#roles"
    ) {
      await interaction.deferUpdate({ ephemeral: true });
      selectedValue = interaction.values[0];

      const roleIdMap = {
        "#r1": config.marketRole1,
        "#r2": config.marketRole2,
        "#r3": config.marketRole3,
        "#r4": config.marketRole4,
        "#r5": config.marketRole5,
        "#r6": config.marketRole6,
        "#r7": config.marketRole7,
        "#r8": config.marketRole8,
      };

      if (selectedValue in roleIdMap) {
        const roleId = roleIdMap[selectedValue];

        const iceCoinsRequired = determineIceCoinsRequired(selectedValue);
        const formattediceCoinsRequired = iceCoinsRequired.toLocaleString();
        const guild = interaction.guild;

        // Check if the user already has a market role
        const user = interaction.user;
        const existingMarketRole = await RoleMarket.findOne({
          userId: user.id,
        });

        if (existingMarketRole) {
          await interaction.editReply({
            embeds: [
              {
                title: `${emojis.warning} Unable to Purchase Role`,
                description: `${
                  emojis.threadMarkmid
                } You already have ${guild.roles.cache.get(
                  existingMarketRole.roleId,
                )} role that expires <t:${Math.floor(
                  existingMarketRole.roleExpiresAt / 1000,
                )}:R>\n${
                  emojis.threadMark
                } You can only purchase one unique role at a time.`,
                color: color.gray,
              },
            ],
            ephemeral: true,
            components: [],
          });
          return;
        }

        const confirmationEmbed = new MessageEmbed()
          .setTitle(`${emojis.warning} Confirm Purchase`)
          .setDescription(
            `${emojis.threadMark} Are you sure you want to buy <@&${roleId}> for ${emojis.ic} ${formattediceCoinsRequired} ice coins?`,
          )
          .setColor(color.gray);

        const confirmButton = new MessageButton()
          .setCustomId("confirmButton")
          .setLabel(
            `Yeah, I want to buy ${guild.roles.cache.get(roleId).name} role`,
          )
          .setStyle(2)
          .setEmoji(emojis.check);

        const denyButton = new MessageButton()
          .setCustomId("denyButton")
          .setLabel(`Not now`)
          .setStyle(2)
          .setEmoji(emojis.cross);

        const row = new MessageActionRow().addComponents(
          confirmButton,
          denyButton,
        );

        await interaction.editReply({
          embeds: [confirmationEmbed],
          components: [row],
        });
      }
    } else if (
      (interaction.isButton() && interaction.customId === "confirmButton") ||
      interaction.customId === "denyButton"
    ) {
      await interaction.deferUpdate({ ephemeral: true });

      const buttonId = interaction.customId;

      if (buttonId === "confirmButton") {
        const user = interaction.user;
        const guild = interaction.guild;
        const member = guild.members.cache.get(user.id);

        let roleToAssign;
        let iceCoinsRequired;

        switch (selectedValue) {
          case "#r1":
            roleToAssign = getRoleById(guild, config.marketRole1);
            iceCoinsRequired = determineIceCoinsRequired(selectedValue);
            break;
          case "#r2":
            roleToAssign = getRoleById(guild, config.marketRole2);
            iceCoinsRequired = determineIceCoinsRequired(selectedValue);
            break;
          case "#r3":
            roleToAssign = getRoleById(guild, config.marketRole3);
            iceCoinsRequired = determineIceCoinsRequired(selectedValue);
            break;
          case "#r4":
            roleToAssign = getRoleById(guild, config.marketRole4);
            iceCoinsRequired = determineIceCoinsRequired(selectedValue);
            break;
          case "#r5":
            roleToAssign = getRoleById(guild, config.marketRole5);
            iceCoinsRequired = determineIceCoinsRequired(selectedValue);
            break;
          case "#r6":
            roleToAssign = getRoleById(guild, config.marketRole6);
            iceCoinsRequired = determineIceCoinsRequired(selectedValue);
            break;
          case "#r7":
            roleToAssign = getRoleById(guild, config.marketRole5);
            iceCoinsRequired = determineIceCoinsRequired(selectedValue);
            break;
          case "#r8":
            roleToAssign = getRoleById(guild, config.marketRole8);
            iceCoinsRequired = determineIceCoinsRequired(selectedValue);
            break;
          default:
            break;
        }

        const currencyData = await Currency.findOne({ userId: user.id });
        if (
          !currencyData ||
          isNaN(currencyData.iceCoins) ||
          currencyData.iceCoins < iceCoinsRequired
        ) {
          await interaction.editReply({
            embeds: [
              {
                description: `${emojis.cross} You do not have enough ice coins for this purchase.`,
                color: color.gray,
              },
            ],
            ephemeral: true,
            components: [],
          });
          return;
        }

        const updatedCurrencyData = await Currency.findOneAndUpdate(
          { userId: user.id },
          { $inc: { iceCoins: -iceCoinsRequired } },
          { upsert: true, new: true },
        );

        const expiryInDays = 15;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + expiryInDays);

        const newRoleMarketData = new RoleMarket({
          userId: user.id,
          username: user.username,
          serverId: guild.id,
          roleExpiresAt: expiryDate,
          roleId: roleToAssign.id,
        });

        await newRoleMarketData.save();

        await member.roles.add(roleToAssign);

        await interaction.editReply({
          embeds: [
            {
              description: `${emojis.check} You have successfully purchased ${roleToAssign} for 15 days`,
              color: color.gray,
            },
          ],
          ephemeral: true,
          components: [],
        });
      } else if (buttonId === "denyButton") {
        await interaction.editReply({
          embeds: [
            {
              description: `${emojis.cross} Purchase canceled.`,
              color: color.gray,
            },
          ],
          ephemeral: true,
          components: [],
        });
      }
    }
  });
};
