const moment = require("moment");
const TemporaryRole = require("../../src/database/models/TemporaryRoleModel");

module.exports = async (client, config) => {
  // Function to reapply temporary roles for rejoining members
  const reapplyTemporaryRoles = async () => {
    try {
      const currentTime = new Date();
      const guild = client.guilds.cache.get(config.guildID);
      if (!guild) return;

      const allMembers = await guild.members.fetch();

      for (const [memberId, member] of allMembers) {
        const existingRoles = await TemporaryRole.find({
          userId: memberId,
          expiry: { $gt: currentTime },
        });

        for (const role of existingRoles) {
          const roleId = role.roleId;
          const roleData = await guild.roles.fetch(roleId);

          if (member && member.manageable && member.roles) {
            if (!member.roles.cache.has(roleId)) {
              try {
                await member.roles.add(roleId);
                console.log(
                  `\x1b[0m`,
                  `\x1b[31m 🛠`,
                  `\x1b[33m ${moment(Date.now()).format("lll")}`,
                  `\x1b[34m ${roleData.name} role`,
                  `\x1b[32m Reassigned to ${member.user.username}`,
                );
              } catch (error) {
                console.error(
                  `Error reassigning ${roleData.name} role:`,
                  error.message,
                );
              }
            }
          }
        }
      }
    } catch (error) {
      console.error(
        `\x1b[0m`,
        `\x1b[31m 🛠`,
        `\x1b[33m Error reapplying temporary roles:`,
        `\x1b[34m ${error.message}`,
      );
    }
  };

  // Run the function every hour (adjust as needed)
  setInterval(reapplyTemporaryRoles, 5 * 1000); // 60 minutes

  // Other code
};
