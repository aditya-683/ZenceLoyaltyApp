import "@babel/polyfill";
import dotenv from "dotenv";
import "isomorphic-fetch";
import { Logger } from "../CloudWatch/logger.js";
import { createAddressReconFile } from "./addressRecon.service.js";
import {
  sendTenderFile,
  sendSkuFile,
  sendAddressFile,
} from "./sendReconFiles.service.js";
import { isEmpty } from "../utils/utility.js";
import cron from "node-cron";
import { createSkuAndTenderReconFile } from "./skuAndTenderRecon.service.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

let CronJobsArr = [];
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function scheduleCronJobs(cronExpression, store, ftpSettingsObj) {
  console.log("CronJobsArr", CronJobsArr);
  if (CronJobsArr?.length <= 0) {
    
    //cron Schedul -1
    const createAndSendTenderReconFileTask = cron.schedule(
      cronExpression[0],
      async () => {
        await createSkuAndTenderReconFile(store, ftpSettingsObj);
        Logger(
          "scheduleCronJobs-1",
          {
            msg: "CREATE SKU AND TENDER RECON FILE CRON RAN",
            store: store,
            extraInfo: "CronJonArr Empty",
          },
          __dirname
        );
      },
      {
        scheduled: false,
        runOnInit: false,
        name: `${store}`,
      }
    );

    const createAddressReconFileTask = cron.schedule(
      cronExpression[1],
      async () => {
        await createAddressReconFile(store, ftpSettingsObj);
        Logger(
          "scheduleCronJobs-1",
          {
            msg: "CREATE ADDRESS RECON FILE CRON RAN",
            store: store,
            extraInfo: "CronJonArr Empty",
          },
          __dirname
        );
      },
      {
        scheduled: false,
        runOnInit: false,
        name: `${store}`,
      }
    );

    const sendSkuFileTask = cron.schedule(
      cronExpression[2],
      async () => {
        await sendSkuFile(store, ftpSettingsObj);
        Logger(
          "scheduleCronJobs-1",
          {
            msg: "SEND SKU FILE CRON RAN",
            store: store,
            extraInfo: "CronJonArr Empty",
          },
          __dirname
        );
      },
      {
        scheduled: false,
        runOnInit: false,
        name: `${store}`,
      }
    );

    const sendTenderFileTask = cron.schedule(
      cronExpression[3],
      async () => {
        await sendTenderFile(store, ftpSettingsObj);
        Logger(
          "scheduleCronJobs-1",
          {
            msg: "SEND TENDER FILE CRON RAN",
            store: store,
            extraInfo: "CronJonArr Empty",
          },
          __dirname
        );
      },
      {
        scheduled: false,
        runOnInit: false,
        name: `${store}`,
      }
    );

    const sendAddressFileTask = cron.schedule(
      cronExpression[4],
      async () => {
        await sendAddressFile(store, ftpSettingsObj);
        Logger(
          "scheduleCronJobs-1",
          {
            msg: "SEND ADDRESS FILE CRON RAN",
            store: store,
            extraInfo: "CronJonArr Empty",
          },
          __dirname
        );
      },
      {
        scheduled: false,
        runOnInit: false,
        name: `${store}`,
      }
    );

    CronJobsArr.push({
      id: store,
      ftpSettings: ftpSettingsObj,
      task1: createAndSendTenderReconFileTask,
      task2: createAddressReconFileTask,
      task3: sendSkuFileTask,
      task4: sendTenderFileTask,
      task5: sendAddressFileTask,
    });

    if (CronJobsArr[0].ftpSettings.isReconAllowed) {
      Logger(
        "CronJobsArr[0].ftpSettings.isReconAllowed",
        "Starting all task for first cronjob in array for store=" + store,
        __dirname
      );
      //if the very first job that was entered has true boolean
      CronJobsArr[0].task1.start();
      CronJobsArr[0].task2.start();
      CronJobsArr[0].task3.start();
      CronJobsArr[0].task4.start();
      CronJobsArr[0].task5.start();
    } else {
      //else stop all task
      CronJobsArr[0].task1.stop();
      CronJobsArr[0].task2.stop();
      CronJobsArr[0].task3.stop();
      CronJobsArr[0].task4.stop();
      CronJobsArr[0].task5.stop();
    }
  } else {
    let foundCronjobObj = CronJobsArr.find((item) => item.id == store);

    Logger(
      "scheduleCronJonFunction:",
      {
        msg: "cronJobArr is non empty for store ,now pushing cronjobs for this store",
        store: store,
        foundCronjobObj: foundCronjobObj,
      },
      __dirname
    );

    if (isEmpty(foundCronjobObj)) {
      //if this the new cron job for new store
      //then add this to cronJobArray and start the service
      Logger(
        "scheduleCronJonFunction:",
        {
          msg: "no cron job found for the store",
          store: store,
          foundCronjobObj: foundCronjobObj,
        },
        __dirname
      );
      const createAndSendTenderReconFileTask = cron.schedule(
        cronExpression[0],
        async () => {
          await createSkuAndTenderReconFile(store, ftpSettingsObj);

          Logger(
            "scheduleCronJobs-2",
            {
              msg: "CREATE SKU AND TENDER RECON FILE CRON RAN",
              store: store,
            },

            __dirname
          );
        },
        {
          scheduled: false,
          runOnInit: false,
          name: `${store}`,
        }
      );

      const createAddressReconFileTask = cron.schedule(
        cronExpression[1],
        async () => {
          await createAddressReconFile(store, ftpSettingsObj);
          Logger(
            "scheduleCronJobs-2",
            "CREATE ADDRESS RECON FILE CRON RAN STORE=" + store,
            __dirname
          );
        },
        {
          scheduled: false,
          runOnInit: false,
          name: `${store}`,
        }
      );

      const sendSkuFileTask = cron.schedule(
        cronExpression[2],
        async () => {
          await sendSkuFile(store, ftpSettingsObj);

          Logger(
            "scheduleCronJobs-2",
            "SEND SKU FILE CRON RAN STORE=" + store,
            __dirname
          );
        },
        {
          scheduled: false,
          runOnInit: false,
          name: `${store}`,
        }
      );

      const sendTenderFileTask = cron.schedule(
        cronExpression[3],
        async () => {
          await sendTenderFile(store, ftpSettingsObj);

          Logger(
            "scheduleCronJobs-2",
            "SEND TENDER FILE CRON RAN STORE=" + store,
            __dirname
          );
        },
        {
          scheduled: false,
          runOnInit: false,
          name: `${store}`,
        }
      );

      const sendAddressFileTask = cron.schedule(
        cronExpression[4],
        async () => {
          await sendAddressFile(store, ftpSettingsObj);

          Logger(
            "scheduleCronJobs-2",
            "SEND ADDRESS FILE CRON RAN STORE=" + store,
            __dirname
          );
        },
        {
          scheduled: false,
          runOnInit: false,
          name: `${store}`,
        }
      );

      //pushing a brand new job
      CronJobsArr.push({
        id: store,
        ftpSettings: ftpSettingsObj,
        task1: createAndSendTenderReconFileTask,
        task2: createAddressReconFileTask,
        task3: sendSkuFileTask,
        task4: sendTenderFileTask,
        task5: sendAddressFileTask,
      });

      const newCronJobObj = CronJobsArr.find((item) => item.id == store);

      if (newCronJobObj.ftpSettings.isReconAllowed) {
        //starting the newly pushed job
        newCronJobObj.task1.start();
        newCronJobObj.task2.start();
        newCronJobObj.task3.start();
        newCronJobObj.task4.start();
        newCronJobObj.task5.start();
      } else {
        //stopping the newly pushed job
        newCronJobObj.task1.stop();
        newCronJobObj.task2.stop();
        newCronJobObj.task3.stop();
        newCronJobObj.task4.stop();
        newCronJobObj.task5.stop();
      }
    } else {
      //updating the foundjob timings and settings
      foundCronjobObj.ftpSettings = ftpSettingsObj;

      if (!foundCronjobObj.ftpSettings.isReconAllowed) {
        //if recon is not allowed then we halt the cron jobs for that specified store
        //and then simply returned

        foundCronjobObj.task1.stop();
        foundCronjobObj.task2.stop();
        foundCronjobObj.task3.stop();
        foundCronjobObj.task4.stop();
        foundCronjobObj.task5.stop();

        return;
      }

      //stopping all the previous tasks
      foundCronjobObj.task1.stop();
      foundCronjobObj.task2.stop();
      foundCronjobObj.task3.stop();
      foundCronjobObj.task4.stop();
      foundCronjobObj.task5.stop();

      //updating the tasks with the new cron expression
      Logger("updatingTaskForNewCronExpression:", {
        msg: "updating cron jobd with specified new ftpsettings",
        store: store,
        ftpSettingsObj: ftpSettingsObj,
      });
      foundCronjobObj.task1 = cron.schedule(
        cronExpression[0],
        async () => {
          await createSkuAndTenderReconFile(store, ftpSettingsObj);

          Logger(
            "scheduleCronJobs-3",
            "CREATE SKU AND TENDER RECON FILE CRON RAN STORE=" + store,
            __dirname
          );
        },
        {
          scheduled: false,
          runOnInit: false,
          name: `${store}`,
        }
      );

      foundCronjobObj.task2 = cron.schedule(
        cronExpression[1],
        async () => {
          await createAddressReconFile(store, ftpSettingsObj);
          Logger(
            "scheduleCronJobs-3",
            "CREATE ADDRESS RECON FILE CRON RAN STORE=" + store,
            __dirname
          );
        },
        {
          scheduled: false,
          runOnInit: false,
          name: `${store}`,
        }
      );

      foundCronjobObj.task3 = cron.schedule(
        cronExpression[2],
        async () => {
          await sendSkuFile(store, ftpSettingsObj);
          Logger(
            "scheduleCronJobs-3",
            "SEND SKU FILE CRON RAN STORE=" + store,
            __dirname
          );
        },
        {
          scheduled: false,
          runOnInit: false,
          name: `${store}`,
        }
      );

      foundCronjobObj.task4 = cron.schedule(
        cronExpression[3],
        async () => {
          await sendTenderFile(store, ftpSettingsObj);

          Logger(
            "scheduleCronJobs-3",
            "SEND TENDER FILE CRON RAN STORE=" + store,
            __dirname
          );
        },
        {
          scheduled: false,
          runOnInit: false,
          name: `${store}`,
        }
      );

      foundCronjobObj.task5 = cron.schedule(
        cronExpression[4],
        async () => {
          await sendAddressFile(store, ftpSettingsObj);

          Logger(
            "scheduleCronJobs-3",
            "SEND ADDRESS FILE CRON RAN STORE=" + store,
            __dirname
          );
        },
        {
          scheduled: false,
          runOnInit: false,
          name: `${store}`,
        }
      );

      //starting the task again
      foundCronjobObj.task1.start();
      foundCronjobObj.task2.start();
      foundCronjobObj.task3.start();
      foundCronjobObj.task4.start();
      foundCronjobObj.task5.start();
    }
  }
}
