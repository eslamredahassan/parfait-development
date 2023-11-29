const Reminder = require("../../src/database/models/reminder");

module.exports = async (client, config) => {
  setInterval(async () => {
    const currentTime = new Date();
    const reminders = await Reminder.find({ time: { $lte: currentTime } });

    reminders.forEach(async (reminder) => {
      try {
        // Fetch user and send the reminder message (in this case, via DM)
        const user = await client.users.fetch(reminder.userId);
        user.send({
          embeds: [
            {
              title: `<:lastupdate:1147320601590104084> Reminder`,
              description: `<:check:1088116412960219237> Hi you asked me to remind you of \`\`${reminder.message}\`\``,
              color: `#2b2d31`,
              timestamp: new Date(),
              footer: {
                text: "Reminded in",
                icon_url: `https://i.imgur.com/NpNsiR1.png`,
              },
            },
          ],
          // this is the important part
          ephemeral: false,
        });

        // Once the reminder is sent, remove it from the database
        await Reminder.findByIdAndDelete(reminder._id);
      } catch (error) {
        console.error("Error sending reminder:", error.message);
      }
    });
  }, 5 * 1000); // Check every minute
};
