const moment = require("moment");
const TemporaryRole = require("../../src/database/models/TemporaryRoleModel");

module.exports = async (client, config) => {
  const checkExpiredRoles = async () => {
    try {
      const currentTime = new Date();
      const expiredRoles = await TemporaryRole.find({
        expiry: { $lt: currentTime },
      });

      for (const role of expiredRoles) {
        const guild = client.guilds.cache.get(role.guildId);
        if (!guild) continue;

        let member;
        try {
          member = await guild.members.fetch(role.userId);
        } catch (error) {
          console.error(`Error fetching member: ${error.message}`);
          continue;
        }

        // Role removal logic whether or not the role is present
        try {
          await member.roles.remove(role.roleId);
          console.log(
            `\x1b[0m`,
            `\x1b[31m 🛠`,
            `\x1b[33m ${moment(Date.now()).format("lll")}`,
            `\x1b[34m ${member.user.username}`,
            `\x1b[32m Finished his cooldown period`,
          );

          await member.send({
            embeds: [
              {
                title: `<:log:1156940336501887047> Cooldown Log`,
                description: `<:check:1088116412960219237> Your cooldown period has ended. Feel free to reapply again.`,
                color: `#2b2d31`,
                timestamp: new Date(),
                footer: {
                  text: "Finished in",
                  icon_url: `https://i.imgur.com/NpNsiR1.png`,
                },
              },
            ],
            ephemeral: false,
          });

          const channel = guild.channels.cache.get(config.log);
          if (channel && channel.isText()) {
            await channel.send({
              embeds: [
                {
                  title: `<:log:1156940336501887047> Cooldown Log`,
                  description: `<:check:1088116412960219237> ${member.user} Finished his cooldown period`,
                  color: `#2b2d31`,
                  timestamp: new Date(),
                  footer: {
                    text: "Rejected in",
                    icon_url: `https://i.imgur.com/NpNsiR1.png`,
                  },
                },
              ],
              ephemeral: false,
            });
          }

          await TemporaryRole.deleteOne({ _id: role._id });
          console.log(
            `\x1b[0m`,
            `\x1b[31m 🛠`,
            `\x1b[33m ${moment(Date.now()).format("lll")}`,
            `\x1b[34m Cooldown entry removed from the database`,
          );
        } catch (error) {
          console.error(
            `\x1b[0m`,
            `\x1b[31m 🛠`,
            `\x1b[33m Error removing ${role.name} role or entry:`,
            `\x1b[34m ${error.message}`,
          );
        }
      }
    } catch (error) {
      console.error(
        `\x1b[0m`,
        `\x1b[31m 🛠`,
        `\x1b[33m Error checking expired cooldown entries:`,
        `\x1b[34m ${error.message}`,
      );
    }
  };

  // Run this function every 5 seconds
  setInterval(checkExpiredRoles, 5 * 1000); // 5 seconds
};
