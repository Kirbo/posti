import pc from "picocolors";

export const logger = {
  info: (msg: string) => console.info(pc.blue("info"), msg),
  success: (msg: string) => console.info(pc.green("done"), msg),
  warn: (msg: string) => console.warn(pc.yellow("warn"), msg),
  error: (msg: string) => console.error(pc.red("error"), msg),
};
