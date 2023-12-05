const { codeBlock } = require("@discordjs/builders");
const config = require("../config");
const moment = require("moment");

module.exports = (client) => {
  process.on("unhandledRejection", (reason, p) => {
    console.log("[antiCrash] :: Unhandled Rejection/Catch");
    console.error(reason.message, p);
  });
  process.on("uncaughtException", (error, origin) => {
    console.log("[antiCrash] :: Uncaught Exception/Catch");
    console.error(error.message, origin);
  });
  process.on("uncaughtExceptionMonitor", (error, origin) => {
    console.log(" [antiCrash] :: Uncaught Exception/Catch (MONITOR)");
    console.error(error.mesage, origin);
  });
  process.on("multipleResolves", (type, promise, reason) => {
    console.log("[antiCrash] :: Multiple Resolves");
    console.error(type, promise, reason.message);
  });
  console.log(
    `\x1b[0m`,
    `\x1b[33m 〢`,
    `\x1b[33m ${moment(Date.now()).format("LT")}`,
    `\x1b[31m Anti Crash`,
    `\x1b[32m LOADED`,
  );
};
