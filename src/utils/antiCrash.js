const { codeBlock } = require("@discordjs/builders");
const config = require("../config");
const moment = require("moment");

module.exports = (client) => {
  process.on("unhandledRejection", (reason, p) => {
    console.log("[antiCrash] :: Unhandled Rejection/Catch");
    console.error(
      `\x1b[0m`,
      `\x1b[33m 〢`,
      `\x1b[33m ${moment(Date.now()).format("LT")}`,
      `\x1b[31m Error:`,
      `\x1b[35m$ ${reason.message}`,
      `\x1b[35m ${p}`,
    );
  });
  process.on("uncaughtException", (error, origin) => {
    console.log("[antiCrash] :: Uncaught Exception/Catch");
    console.error(
      `\x1b[0m`,
      `\x1b[33m 〢`,
      `\x1b[33m ${moment(Date.now()).format("LT")}`,
      `\x1b[31m Error:`,
      `\x1b[35m$ ${error.message}`,
      `\x1b[35m ${origin}`,
    );
  });
  process.on("uncaughtExceptionMonitor", (error, origin) => {
    console.log(" [antiCrash] :: Uncaught Exception/Catch (MONITOR)");
    console.error(
      `\x1b[0m`,
      `\x1b[33m 〢`,
      `\x1b[33m ${moment(Date.now()).format("LT")}`,
      `\x1b[31m Error:`,
      `\x1b[35m$ ${error.message}`,
      `\x1b[35m ${origin}`,
    );
  });
  process.on("multipleResolves", (type, promise, reason) => {
    console.log("[antiCrash] :: Multiple Resolves");
    console.error(
      `\x1b[0m`,
      `\x1b[33m 〢`,
      `\x1b[33m ${moment(Date.now()).format("LT")}`,
      `\x1b[31m Error:`,
      `\x1b[35m$ ${type}`,
      `\x1b[35m ${promise}`,
      `\x1b[35m ${reason.message}`,
    );
  });
  console.log(
    `\x1b[0m`,
    `\x1b[33m 〢`,
    `\x1b[33m ${moment(Date.now()).format("LT")}`,
    `\x1b[31m Anti Crash`,
    `\x1b[32m LOADED`,
  );
};
