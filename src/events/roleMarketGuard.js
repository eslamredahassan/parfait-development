const moment = require("moment");
const fs = require("fs");

const RoleMarket = require("../../src/database/models/roleMarket");

const settings = JSON.parse(fs.readFileSync("./src/assest/settings.json"));
const color = settings.colors;
const emojis = settings.emojis;
const banners = settings.banners;

module.exports = async (client, config) => {
  const checkExpiredRoles = async () => {
    try {
      const currentDate = new Date(); // Use moment to handle the date and timezone
      const expiredRoles = await RoleMarket.find({
        roleExpiresAt: { $lte: currentDate }, // Convert to regular Date object
      });

      for (const expiredRole of expiredRoles) {
        try {
          const guild = await client.guilds.fetch(expiredRole.serverId);
          const member = await guild.members.fetch(expiredRole.userId);
          const roleToRemove = guild.roles.cache.get(expiredRole.roleId);

          if (roleToRemove && member) {
            await member.roles.remove(roleToRemove);
            console.lgo(
              `\x1b[0m`,
              `\x1b[33m 〢`,
              `\x1b[33m ${moment(Date.now()).format("LT")}`,
              `\x1b[31m ${roleToRemove.name} Role`,
              `\x1b[33m REMOVED FROM`,
              `\x1b[34m ${member.user.username}`,
            );
            // Inform the user that their role has expired
            await member.send({
              embeds: [
                {
                  title: `${emojis.time} Unique Role Expiration`,
                  description: `${emojis.threadMark} Your role ${roleToRemove.name} has expired.`,
                  color: color.gray, // Red color
                },
              ],
            });
          } else {
            console.log(
              "Role or member not found. Role ID:",
              expiredRole.roleId,
              "Member ID:",
              expiredRole.userId,
            );
          }

          await RoleMarket.findByIdAndDelete(expiredRole._id);
        } catch (error) {
          console.error(
            "Error processing expired role:",
            expiredRole,
            "Error:",
            error.message,
          );
        }
      }
    } catch (error) {
      console.error(
        "Error checking and removing expired roles:",
        error.message,
      );
    }
  };

  setInterval(checkExpiredRoles, 1 * 1000); // 1 second in milliseconds
};
