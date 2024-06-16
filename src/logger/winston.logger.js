import { addColors, createLogger, format, transports } from "winston";
const { combine, timestamp, json, colorize } = format;
// Define your severity levels.
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// This method set the current severity based on
// the current NODE_ENV: show all the log levels
// if the server was run in development mode; otherwise,
// if it was run in production, show only warn and error messages.
const level = () => {
  const env = process.env.NODE_ENV || "development";
  const isDevelopment = env === "development";
  return isDevelopment ? "debug" : "warn";
};

// Define different colors for each level.
// Colors make the log message more visible,
// adding the ability to focus or ignore messages.
const colors = {
  error: "red",
  warn: "yellow",
  info: "blue",
  http: "magenta",
  debug: "white",
};

// Tell winston that you want to link the colors
// defined above to the severity levels.
addColors(colors);

// Chose the aspect of your log customizing the log format.
const logFormat = format.combine(
  // Add the message timestamp with the preferred format
  format.timestamp({ format: "DD MMM, YYYY - HH:mm:ss:ms" }),
  // Tell Winston that the logs must be colored
  format.colorize({ all: true }),
  // Define the format of the message showing the timestamp, the level and the message
  format.printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
);

// Define which transports the logger must use to print out messages.
// In this example, we are using three different transports
const winstonTransports = [
  // Allow the use the console to print the messages
  new transports.Console({
    format: logFormat,
  }),
  new transports.File({ filename: "public/logs/app.log" }),
];

// Create the logger instance that has to be exported
// and used to log messages.
const logger = createLogger({
  level: level(),
  levels,
  format: combine(colorize(), timestamp(), json()),
  transports: winstonTransports,
});

export default logger;
