import path, { join } from "path";
import fs, { readFileSync } from "fs";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import serveStatic from "serve-static";
import shopify from "./shopify.js";
import GDPRWebhookHandlers from "./gdpr.js";
import redeemCouponRouter from "./route/redeemCoupon.router.js";
import unblockCouponRouter from "./route/unblockCoupon.router.js";
import confirmCouponOtpRouter from "./route/confirmCouponOtp.router.js";
import resendCouponOtpRouter from "./route/resendCouponOtp.router.js";
import getEasyCustomerDetailsRouter from "./route/easyCustomerDetails.router.js";
import createSkuAndTenderReconFileRouter from "./route/reconFile.router.js";
import userRegistrationRouter from "./route/userRegistration.router.js";
import userLoginRouter from "./route/userLogin.router.js";
import generateOTPRouter from "./route/generateOTP.router.js";
import validateOTPRouter from "./route/validateOTP.router.js";
import forgetPasswordRouter from "./route/forgotPassword.router.js";
import updatePasswordRouter from "./route/updatePassword.router.js";
import getAvailableCouponsRouter from "./route/getAvailableCoupons.router.js";
import getCustomerTransactionDetailsRouter from "./route/getCustomerTransactionDetails.router.js";
import memberAddressDetailRouter from "./route/memberAddressDetail.router.js";
import getAddressDetailsRouter from "./route/getAddressDetails.router.js";
import customerProfileRouter from "./route/customerProfile.router.js";
import lookupRouter from "./route/lookup.router.js";
import updateMemberProfileRouter from "./route/updateMemberProfile.router.js";
import wsCustomerAvailablePointsRouter from "./route/wsCustomerAvailablePoints.router.js";
import wsCheckForEasyPointsRedemptionRouter from "./route/wsCheckForEasyPointsRedemption.router.js";
import wsConfirmOTPRouter from "./route/wsConfirmOTP.router.js";
import wsResendOTPRouter from "./route/wsResendOTP.router.js";
import wsReleaseRedemptionPointsRouter from "./route/wsReleaseRedemptionPoints.router.js";
import cartRouter from "./route/cartAttribute.router.js";
import ftpSettingRouter from "./route/ftpSettings.router.js";
import getFeedBackLinkRouter from "./route/getFeedbackLink.router.js";
import settingsRouter from "./route/settings.route.js";
import orderRouter from "./route/order.router.js";
import { rateLimit } from "express-rate-limit";
import {
  AssignShopInReqFromToken,
} from "./middleware/middleware.js";
import {
  isEmpty,
  getCronExpression,
  appDefaultSettings,
  checkShopisPlusOrNonPlus,
} from "./utils/utility.js";
import { FtpSettings } from "./model/ftpSettings.modal.js";
import getLogsRouter from "./route/logs.router.js";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Logger } from "./CloudWatch/logger.js";
import cron from "node-cron";
import { createSkuAndTenderReconFile } from "./service/skuAndTenderRecon.service.js";
import { createAddressReconFile } from "./service/addressRecon.service.js";
import {
  sendAddressFile,
  sendSkuFile,
  sendTenderFile,
} from "./service/sendReconFiles.service.js";
import themeRouter from "./route/shopifyTheme.router.js";
import generateTokenRouter from "./route/generateToken.router.js";
import faqRouter from "./route/faq.router.js";
import { verifyAWSEvent } from "./middleware/webHooksMiddleware.js";
import checkStoreRouter from "./route/checkStore.router.js";
import { createGiftCardService } from "./service/createGiftCard.service.js";
import isCustomerRouter from "./route/isCustomer.router.js";
import verify from "./middleware/proxyVerifyMiddleware.js";
import sftpRouter from "./route/sftp.router.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const PORT =
  process.env.NODE_ENV == "production"
    ? Number(process.env.CUSTOM_PORT)
    : parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);
console.log("PORT in Starting =====>===", PORT);

let isScriptMiddleWareCalled = false;

const developmentDB = process.env.MONGODB_URI;
let globalCronJobObj;
const productionDB =
  process.env.NODE_ENV == "production"
    ? process.env.MONGODB_URI
    : developmentDB;

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();
app.use(express.static("static"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: "Too Many Request ",
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // store: ... , // Use an external store for more precise rate limiting
});

app.get("/api/test", limiter, async (req, res) => {
  console.log("body", req.body);
  console.log("headers", req.headers);
  console.log("body type", typeof req.body);

  res.send(`Working for ${process.env.SHOP}`);
});
app.post(
  "/api/webhook-test",
  express.json(),
  verifyAWSEvent,
  async (req, res) => {
    console.log("body", req.body.detail.payload);
    console.log("headers", req.body.detail.metadata);

    res.send(`Working for ${process.env.SHOP}`);
  }
);

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);

app.get("/api/okay", AssignShopInReqFromToken, async (req, res, next) => {
  console.log("hello");
  res.send({ status: 200, shop: req.query.shop })
});



app.use(express.json());
/* app.use(registerShopifySctipTags); //checking if script tags is register or not; */

//Testing Route
app.get("/api/test", async (_req, res) => {
  console.log("hello ");
  res.status(200).send("helooooooooooooooo");
});


app.use(
  cors({
    origin: "*",
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
  })
);

app.get("/api/test2", async (_req, res) => {
  console.log("hello ");
  res.status(200).send("hel22222222222222ooooooooooooooo");
});

/*scheduling cronjobs dynamically using axios calls*/

app.post("/api/scheduleCronJobs", async (req, res, next) => {
  try {
    const data = req.body;
    const store = data.StoreName;
    const ftpSettingsObj = await FtpSettings.findOne({
      StoreName: store,
      isDeleted: false
    });

    if (isEmpty(ftpSettingsObj)) {
      Logger(
        "scheduleCronJobs",
        {
          message: "Can not Find Any Store to schedule a job",
          requestBody: data,
          ftpSettingsObj: ftpSettingsObj,
        },
        __filename
      );

      // ctx.status = 200;
      return res.status(200).send({
        message: "Can not Find Any Store to schedule a job",
        requestBody: data,
      });
    } else {
      /* we are checking if it is not empty then we need to look if recon is allowed or not
      because an empty object can also with recon value to be false
      */
      if (!ftpSettingsObj?.isReconAllowed) {
        return res.send({
          message: "Recon not Allowed ",
          requestBody: ftpSettingsObj,
          error: null,
        });
      }

      await globalCronJobObj(ftpSettingsObj);

      res.status(200).send({
        message: "Have Scheduled the Cron Jobs",
        requestBody: data,
      });
    }
  } catch (error) {
    Logger(
      "scheduleCronJobs",
      "scheduleCronJobs Route Error Catched",
      __filename,
      error
    );
    const status = error.status || 500;
    res.status(status).send({
      message: `Error in ScheduleCronJobs: ${error.message || "Something Went Wrong"
        }`,
      requestBody: req.body,
      error: error,
    });
  }
});

/*https://www.freeconvert.com/time/ist-to-utc
 
  06:30 pm UTC =12:00 am IST (midnight)-12 hours format
  18:30 UTC = 00:00 IST -24 hours format
  getting ftpSettings stored in Db and scheduling jobs
  */
// // 0 16 * * *
// // 10 17 * * *
// // 15 17 * * *

app.get("/api/123", async (req, res, next) => {
  console.log("Hello");
  res.send("Working");
});

app.get("/api/456", async (req, res, next) => {
  console.log("Hello");
  res.send("Working");
});


//for old repo
app.get("/easyrewardz-script", verify, function (req, res) {
  console.log(
    "%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%",
    path.join(__dirname, "static", "easyrewardzScript.html")
  );
  console.log(
    "%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%",
    path.join(__dirname, "easyrewardzScript.html")
  );
  const filePath = path.join(__dirname, "static", "easyrewardzScript.html");

  res.type("html");
  fs.createReadStream(filePath).pipe(res);
});


app.get("/api/easyrewardz-script", verify, function (req, res) {
  console.log(
    "%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%",
    path.join(__dirname, "static", "easyrewardzScript.html")
  );
  console.log(
    "%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%",
    path.join(__dirname, "easyrewardzScript.html")
  );
  const filePath = path.join(__dirname, "static", "easyrewardzScript.html");

  res.type("html");
  fs.createReadStream(filePath).pipe(res);
});

app.use(themeRouter);
app.use(generateTokenRouter);
app.use(faqRouter);
app.use(getLogsRouter);

//sftp Router to check sftp details
app.use(sftpRouter)

//Routing
app.use(cartRouter); // all four route
// /api/SaveCartAttr getAllCartAttributes getACartAttribute /UpdateCartAttr

//FTP settings
app.use(ftpSettingRouter); //all three route is here
// saveFtpSettings updateFtpSettings getFtpSettings

// order
app.use(orderRouter);

//Plus and non-Plus combined
app.use(checkStoreRouter);

//Recon file download and creation
app.use(createSkuAndTenderReconFileRouter);

//appsettings
app.use(settingsRouter);

app.use(getFeedBackLinkRouter);

app.use(unblockCouponRouter);
app.use(redeemCouponRouter);
app.use(confirmCouponOtpRouter);
app.use(resendCouponOtpRouter);

app.post("/api/createGiftCard", createGiftCardService);

// // get easyRewards Customer Details
app.use(getEasyCustomerDetailsRouter);

// //plus routes
app.use(userRegistrationRouter);
app.use(userLoginRouter);

app.use(isCustomerRouter);
app.use(generateOTPRouter);

app.use(validateOTPRouter);
app.use(forgetPasswordRouter);
app.use(updatePasswordRouter);
app.use(confirmCouponOtpRouter);

app.use(getAvailableCouponsRouter);
app.use(getCustomerTransactionDetailsRouter);
app.use(memberAddressDetailRouter);
app.use(getAddressDetailsRouter);

app.use(customerProfileRouter);
app.use(lookupRouter);
app.use(updateMemberProfileRouter);

//pending confirmation

//pending confirmation

// plus routes ends
app.use(wsCustomerAvailablePointsRouter); // used In Plus with no change
app.use(wsCheckForEasyPointsRedemptionRouter);
app.use(wsConfirmOTPRouter);
app.use(wsResendOTPRouter);
app.use(wsReleaseRedemptionPointsRouter);
app.use(shopify.cspHeaders());

app.use(serveStatic(STATIC_PATH, { index: false }));
app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.use(express.urlencoded({ extended: true }));

console.log("PORT above app.listen");

const startCronJobs = async (ftpSettings) => {
  //for single application this will always be a single document
  const ftpSettingsObj = !isEmpty(ftpSettings) ? ftpSettings : await FtpSettings.findOne({ isDeleted: false });
  if (isEmpty(ftpSettingsObj)) {
    console.log("No ftp settings found in the db.");
    return
  };
  if (
    ftpSettingsObj.isReconAllowed == true &&
    !isEmpty(ftpSettingsObj.timezone) &&
    !isEmpty(ftpSettingsObj.cronTime)
  ) {
    const [hh, mm, ss] = ftpSettingsObj.cronTime.split(":");
    cron.schedule(
      `${mm} ${hh} * * *`,
      async () => {
        console.log(
          "ftpSettingsObj.StoreName, ftpSettingsObj",
          ftpSettingsObj.StoreName,
          ftpSettingsObj
        );
        await createSkuAndTenderReconFile(
          ftpSettingsObj.StoreName,
          ftpSettingsObj
        );
        Logger(
          "scheduleCronJobs-1",
          {
            msg: "CREATE SKU AND TENDER RECON FILE CRON RAN",
            store: ftpSettingsObj.StoreName,
            extraInfo: "CronJonArr Empty",
          },
          __dirname
        );
      },
      {
        scheduled: true,
        timezone: ftpSettingsObj.timezone,
      }
    );

    cron.schedule(
      `${getCronExpression(mm, hh, "5")}`,
      async () => {
        console.log("createAddressReconFile");
        await createAddressReconFile(ftpSettingsObj.StoreName, ftpSettingsObj);
        Logger(
          "scheduleCronJobs-1",
          {
            msg: "CREATE ADDRESS RECON FILE CRON RAN",
            store: ftpSettingsObj.StoreName,
            extraInfo: "CronJonArr Empty",
          },
          __dirname
        );
      },
      {
        scheduled: true,
        timezone: ftpSettingsObj.timezone,
      }
    );

    cron.schedule(
      `${getCronExpression(mm, hh, "10")}`,
      async () => {
        console.log("sendSkuFile");
        await sendSkuFile(ftpSettingsObj.StoreName, ftpSettingsObj);
        Logger(
          "scheduleCronJobs-1",
          {
            msg: "SEND SKU FILE CRON RAN",
            store: ftpSettingsObj.StoreName,
            extraInfo: "CronJonArr Empty",
          },
          __dirname
        );
      },
      {
        scheduled: true,
        timezone: ftpSettingsObj.timezone,
      }
    );

    cron.schedule(
      `${getCronExpression(mm, hh, "15")}`,
      async () => {
        await sendTenderFile(ftpSettingsObj.StoreName, ftpSettingsObj);
        Logger(
          "scheduleCronJobs-1",
          {
            msg: "SEND TENDER FILE CRON RAN",
            store: ftpSettingsObj.StoreName,
            extraInfo: "CronJonArr Empty",
          },
          __dirname
        );

        console.log("sendTenderFile");
      },
      {
        scheduled: true,
        timezone: ftpSettingsObj.timezone,
      }
    );

    cron.schedule(
      `${getCronExpression(mm, hh, "20")}`,
      async () => {
        await sendAddressFile(ftpSettingsObj.StoreName, ftpSettingsObj);
        Logger(
          "scheduleCronJobs-1",
          {
            msg: "SEND ADDRESS FILE CRON RAN",
            store: ftpSettingsObj.StoreName,
            extraInfo: "CronJonArr Empty",
          },
          __dirname
        );

        console.log("sendAddressFile");
      },
      {
        scheduled: true,
        timezone: ftpSettingsObj.timezone,
      }
    );
  }
};

// app.use("/api/*", shopify.validateAuthenticatedSession());

app.get("/api/getAuthRoute", async (req, resp) => {
  console.log("/api/getAuthRoute");
  console.log(req);
  console.log(resp.locals.shopify);
  resp.send("true")
})


app.listen(PORT, async () => {
  console.log(`> Ready on http://localhost:${PORT}`);
  console.log("Corrected String of the mongodb ", productionDB.replace("/?", "/" + process.env.MONGODB_DATABASE_NAME + "?"));

  // .connect(process.env.LOCAL_MONGODB_URL, {
  await mongoose
    .connect(`${productionDB}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((con) => {
      console.log("DB connection Successful");
      globalCronJobObj = startCronJobs;
      globalCronJobObj();
    })
    .catch((error) => {
      console.log("Db Conect Error ***************");
      console.log(error?.name, error?.message);
    });
});
