import morgan from "morgan";
import logger from "./winston.logger.js";

const stream = {
  // Use the http severity
  write: (message) => {
    const parts = message.trim().split(" ");
    // console.log(parts);
    const logObject = {
      remoteAddr: parts[0],
      method: parts[1],
      url: parts[2],
      status: parts[3],
      responseTime: parts[4],
    };
    logger.info(JSON.stringify(logObject));
  },
};

const skip = () => {
  const env = process.env.NODE_ENV || "development";
  return !["development", "staging"].includes(env);
};
const morganFormat = ":remote-addr :method :url :status :response-time";

const morganMiddleware = morgan(morganFormat, { stream, skip });

export default morganMiddleware;
