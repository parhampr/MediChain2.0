import chalk from "chalk";
import { NextFunction, Request, Response } from "express";

const formatTime = () => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now
    .getSeconds()
    .toString()
    .padStart(2, "0")}.${now.getMilliseconds().toString().padStart(3, "0")}`;
};

export const LogAllIncomingRoutes = (req: Request, res: Response, next: NextFunction) => {
  const start = new Date().getTime();
  console.log(
    chalk.bold(
      chalk.bgBlue(` REQUEST  `),
      chalk.gray(`[${formatTime()}] ::`),
      chalk.bgYellow(` ${req.protocol.toUpperCase()} ${req.method} `),
      chalk.blueBright(req.path),
    ),
  );

  res.on("finish", () => {
    const duration = new Date().getTime() - start;
    const endStr =
      chalk.gray(req.originalUrl) +
      " - " +
      chalk.cyanBright(`Returned: ${duration}ms |`) +
      chalk.blueBright(` Status: ${res.statusCode}`);
    const startStr = chalk.bgMagenta(` RESPONSE `) + chalk.gray(` [${formatTime()}] ::`);

    switch (res.statusCode) {
      case 200:
      case 201:
      case 204:
      case 304:
        console.log(chalk.bold(startStr, chalk.bgCyan(" ✔ SUCCESS "), endStr));
        break;
      case 400:
        console.log(chalk.bold(startStr, chalk.bgYellow(" ⚠ INVALID "), endStr));
        break;
      case 401:
        console.log(chalk.bold(startStr, chalk.bgRed(" ❗ UNAUTHORIZED "), endStr));
        break;
      case 403:
        console.log(chalk.bold(startStr, chalk.bgRed(" 🚫 FORBIDDEN "), endStr));
        break;
      case 404:
        console.log(chalk.bold(startStr, chalk.bgMagenta.white(" 💀 NOT FOUND "), endStr));
        break;
      default:
        if (res.statusCode > 200 && res.statusCode < 300) {
          console.log(chalk.bold(startStr, chalk.bgCyan(" ⓘ INFO "), endStr));
        } else {
          console.log(chalk.bold(startStr, chalk.bgRed(" ✘ ERROR "), endStr));
        }
    }
  });

  next();
};
// export const LogAllIncomingRoutes = (req: Request, res: Response, next: NextFunction) => {
//   const start = new Date().getTime();
//   console.log(
//     chalk.bold(
//       chalk.bgMagenta(` REQUEST  `),
//       "::",
//       chalk.bgYellowBright.black(` ${req.protocol.toLocaleUpperCase()} ${req.method} `),
//       chalk.yellow(req.path),
//     ),
//   );

//   res.on("finish", () => {
//     const duration = new Date().getTime() - start;
//     const endStr =
//       chalk.cyan(req.originalUrl) +
//       " - " +
//       chalk.magenta(`Returned: ${duration}ms |`) +
//       chalk.blue(` Status: ${res.statusCode}`);
//     const startStr = chalk.bgBlack(` RESPONSE `) + " ::";
//     if (res.statusCode === 200 || res.statusCode === 201 || res.statusCode === 304)
//       console.log(chalk.bold(startStr, chalk.bgGreenBright(" ✔ SUCCESS "), endStr));
//     else if (res.statusCode > 200 && res.statusCode < 300)
//       console.log(chalk.bold(startStr, chalk.bgGreenBright(" ⓘ SUCCESS "), endStr));
//     else if (res.statusCode === 400) console.log(chalk.bold(startStr, chalk.bgYellowBright(" ⚠ INVALID "), endStr));
//     else if (res.statusCode === 401) console.log(chalk.bold(startStr, chalk.bgRedBright(" ❗ NOT AUTHORIZED "), endStr));
//     else if (res.statusCode === 403) console.log(chalk.bold(startStr, chalk.bgRedBright(" 🚫 FORBIDDEN "), endStr));
//     else if (res.statusCode === 404) console.log(chalk.bold(startStr, chalk.bgRedBright(" 💀 NOT FOUND "), endStr));
//     else console.log(chalk.bold(startStr, chalk.bgRed(" ✘ FAILED "), endStr));
//   });

//   next();
// };
