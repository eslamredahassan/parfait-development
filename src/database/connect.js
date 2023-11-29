const mongoose = require("mongoose");
const moment = require("moment");
const config = require("../config");

module.exports = async () => {
  // Connect to MongoDB
  mongoose
    .connect(config.database, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "ParfaitDatabaseDev",
    })
    .then(() => {
      //const connection = mongoose.connection.useDb("ParfaitDatabaseDev");
      console.log(
        `\x1b[0m`,
        `\x1b[33m 〢`,
        `\x1b[33m ${moment(Date.now()).format("LT")}`,
        `\x1b[31m Database`,
        `\x1b[32m CONNECTED`,
      );
    })
    .catch((error) => {
      console.log(
        `\x1b[0m`,
        `\x1b[33m 〢`,
        `\x1b[33m ${moment(Date.now()).format("LT")}`,
        `\x1b[31m Database`,
        `\x1b[323m ERROR: `,
        error.message,
      );
    });
};
