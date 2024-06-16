import morgan from "morgan";
import logger from "./winston.logger.js";

const stream = {
  // Use the http severity
  write: (message) => {
    const logObject = {
      remoteAddr: message.trim().split(" ")[0],
      method: message.trim().split(" ")[1],
      url: message.trim().split(" ")[2],
      status: message.trim().split(" ")[3],
      responseTime: message.trim().split(" ")[4],
    };
    logger.info(JSON.stringify(logObject));
  },
};

const skip = () => {
  const env = process.env.NODE_ENV || "development";
  return env !== "development";
};
const morganFormat = ":remote-addr :method :url :status - :response-time ms";
const morganMiddleware = morgan(morganFormat, { stream });

export default morganMiddleware;
