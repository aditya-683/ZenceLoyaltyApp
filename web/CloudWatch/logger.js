
import 'dotenv/config'
import winston from "winston";
import CircularJSON from "circular-json";
import dotenv from "dotenv";
dotenv.config();
import AWS from "aws-sdk";
import WinstonCloudWatch from "winston-cloudwatch"
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set up AWS credentials and region
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_S3_REGION,
});

// Create an instance of the AWS CloudWatch Logs client
const cloudwatchlogs = new AWS.CloudWatchLogs();

const sts = new AWS.STS();

sts.getCallerIdentity({}, (err, data) => {
  if (err) {
    console.error(err);
  } else {
    const arn = data.Arn;
    const parts = arn.split(":");
    const username = parts[5];
    console.log(`AWS Account Name: ${data.Account}`);
    console.log(`IAM Username: ${username}`);
  }
});

//Create a new instance of the Winston logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    // Log to console
    // new winston.transports.Console(),
    // Log to CloudWatch Logs
    new WinstonCloudWatch({
      logGroupName: "zenceLoyalityER-log-group",
      logStreamName: "zenceLoyalityER-log-stream",
      cloudWatchLogs: cloudwatchlogs,
      jsonMessage: true,
      messageFormatter: (logObject) => JSON.stringify(logObject),
      formatLog: (info) => {
        // Handle circular objects by converting them to JSON
        const logObject = CircularJSON.stringify(info, null, 2);
        return `${logObject}`;
      },
      timestamp: () =>
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    }),
    // Log error stack traces to separate log group
    new WinstonCloudWatch({
      logGroupName: "zenceLoyalityER-error-log-group",
      logStreamName: "zenceLoyalityER-error-log-stream",
      cloudWatchLogs: cloudwatchlogs,
      jsonMessage: true,
      messageFormatter: (logObject) => JSON.stringify(logObject),
      formatLog: (info) => {
        // Handle circular objects by converting them to JSON
        const logObject = CircularJSON.stringify(info, null, 2);
        return `${logObject}\n${info.stack}`;
      },
      timestamp: () =>
        new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      level: "error",
    }),
  ],
});

// Function to log messages to CloudWatch Logs
export function Logger(
  key = "default key",
  value = "default value",
  fileName = "default file Name",
  error,
  isHttplog = false,
) {
  try {
    //key ,value and fileName is compulsory but if you have an error object
    //like in try catch then you can pass it also
    const date = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
    const timestamp = `${date}`;

    if (isHttplog) {
      logger.transports[0].logStreamName = "zenceLoyalityER-http-log-stream";
    } else {
      logger.transports[0].logStreamName = "zenceLoyalityER-log-stream";
    }
    if (error) {
      logger.error({
        timestamp: timestamp,
        fileName,
        key,
        value,
        errorMessage: error.message || "Something went wrong",
        stack: error.stack,
      });
    } else {
      // Log general messages to default log group
      logger.info({ timestamp: timestamp, fileName, key, value, isHttplog });
    }
  } catch (error) {
    console.log(__dirname, ":====>Error in logger :", error);
  }
}

