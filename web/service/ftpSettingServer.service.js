import { FtpSettings } from "../model/ftpSettings.modal.js";
import {
  convertToDateTimeObject,
  getCronExpression,
  isEmpty,
} from "../utils/utility.js";
import { scheduleCronJobs } from "./cornJobs.service.js";
const { zonedTimeToUtc } = require("date-fns-tz");


/*
06:30 pm UTC =12:00 am IST (midnight)-12 hours format
18:30 UTC = 00:00 IST -24 hours format
getting ftpSettings stored in Db and scheduling jobs
*/
// // 0 16 * * *
// // 10 17 * * *
// // 15 17 * * *

const ftpSettingsObj = await FtpSettings.find({ isDeleted: false });

ftpSettingsObj.forEach((item) => {
  if (
    item.isReconAllowed == true &&
    !isEmpty(item.timezone) &&
    !isEmpty(item.cronTime)
  ) {
    const utcTime = zonedTimeToUtc(
      convertToDateTimeObject(item.cronTime),
      item.timezone
    );
    let HH = utcTime.getUTCHours();
    let MM = utcTime.getUTCMinutes();

    const cronExpression = [];
    cronExpression.push(`${MM} ${HH} * * *`);
    cronExpression.push(`${getCronExpression(MM, HH, "10")}`);
    cronExpression.push(`${getCronExpression(MM, HH, "20")}`);
    cronExpression.push(`${getCronExpression(MM, HH, "30")}`);
    cronExpression.push(`${getCronExpression(MM, HH, "40")}`);
    cronExpression.push(`${getCronExpression(MM, HH, "50")}`);
    scheduleCronJobs(cronExpression, item.StoreName, ftpSettingsObj);
  }
});
