const moment = require("moment");
const GeneratedCode = require("../../src/database/models/generated_codes");

module.exports = async (client, config) => {
  // Function to check and update the status of expired and disabled codes
  const checkAndUpdateCodes = async () => {
    try {
      const expiredCodes = await GeneratedCode.find({
        expiration: { $lte: new Date() }, // Expired codes
        disabled: false, // Not disabled
      });

      // Update the status of expired codes to disabled
      await Promise.all(
        expiredCodes.map(async (code) => {
          code.disabled = true;
          await code.save();
        }),
      );

      if (expiredCodes.length > 0) {
        console.log(
          `\x1b[0m`,
          `\x1b[33m 〢`,
          `\x1b[33m ${moment(Date.now()).format("LT")}`,
          `\x1b[31m ${expiredCodes.length} codes`,
          `\x1b[34m expired`,
        );
      }
    } catch (error) {
      console.error(
        `\x1b[0m`,
        `\x1b[33m 〢`,
        `\x1b[33m ${moment(Date.now()).format("LT")}`,
        `\x1b[31m Error updating expired codes:`,
        `\x1b[34m ${error.message}`,
      );
    }
  };

  // Set up an interval to run the function every minute (adjust as needed)
  setInterval(checkAndUpdateCodes, 60 * 1000);
};
