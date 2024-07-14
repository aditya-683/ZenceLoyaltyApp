import cron from "node-cron";
import path from "path";
import fs from "fs";
import SftpUpload from "sftp-upload";
import { Logger } from "../CloudWatch/logger.js";
import { isEmpty } from "../utils/utility.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { AppLogs } from "../model/appLogs.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SKU_RECON_DIRECTORY_PATH = path.join(
  __dirname,
  `../ReconFiles/Csv/SkuItem`
);
const TENDER_RECON_DIRECTORY_PATH = path.join(
  __dirname,
  `../ReconFiles/Csv/TenderItem`
);
const ADDRESS_RECON_DIRECTORY_PATH = path.join(
  __dirname,
  `../ReconFiles/Csv/Address`
);

//new

export const sendSkuFile = async (store, ftpSettings) => {
  try {
    const subStoreString = store.split(".myshopify.com")[0].toUpperCase();
    const logsSaved = await AppLogs.create({
      StoreName: isEmpty(store) ? "" : store,
      er_endpoint: "",
      middleware_endpoint: "sendSkuFile",
      message: `ran for ${SKU_RECON_DIRECTORY_PATH}/${subStoreString}`,
    });

    const directoryPath = path.join(
      `${SKU_RECON_DIRECTORY_PATH}`,
      `${subStoreString}`
    );

    const skuFileName = fs.readdirSync(directoryPath);
    const options = {
      host: `${ftpSettings.host}`, //"batainternationalftp.ercx.co",
      username: `${ftpSettings.username}`, //"BataSingapore",
      port: `${ftpSettings.port}`, //"2222",
      password: `${ftpSettings.password}`, //"Mqaj4h2zWpNY",
      path: `${SKU_RECON_DIRECTORY_PATH}/${subStoreString}/${skuFileName}`,
      remoteDir: `${ftpSettings.remoteDir}`, // "//ECOM",
      // excludedFolders: ['**/.git', 'node_modules'],
      // exclude: ['.gitignore', '.vscode/tasks.json'],
      // privateKey: fs.readFileSync('privateKey_rsa'),
      // passphrase: fs.readFileSync('privateKey_rsa.passphrase'),
      // dryRun: false,
    };

    console.log("sendReconFile options=", options);

    const sftp = new SftpUpload(options);

    sftp
      .on("error", function (err) {
        Logger(
          "sendSkuFile:",
          {
            msg: `${err.message || "Error Thrown"}`,
            store: store
          },
          __dirname,
          err
        );
        throw err;
      })
      .on("uploading", function (progress) {
        console.log("Uploading", progress.file);
        console.log(progress.percent + "% completed");
      })
      .on("completed", function () {
        console.log("Upload Completed");
        Logger("sendSkuFile:", {

          msg: `Upload Compledeted`,
          store: store
        }, __dirname);
      })
      .upload();
  } catch (error) {
    console.log("GOT ERROR", error);
    Logger("sendSkuFile:", {
      msg: "sendSkuFile-Error-catched",
      store: store
    }, __dirname, error);
  }
};


export const sendTenderFile = async (store, ftpSettings) => {
  try {
    const subStoreString = store.split(".myshopify.com")[0].toUpperCase();
    const logsSaved = await AppLogs.create({
      StoreName: isEmpty(store) ? "" : store,
      er_endpoint: "",
      middleware_endpoint: "sendtenderFile",
      message: `ran for ${TENDER_RECON_DIRECTORY_PATH}/${subStoreString}`,
    });

    const directoryPath = path.join(
      `${TENDER_RECON_DIRECTORY_PATH}`,
      `${subStoreString}`
    );

    const tenderFileName = fs.readdirSync(directoryPath);
    console.log("ttttttttttttttttt", tenderFileName);
    const options = {
      host: `${ftpSettings.host}`, //"batainternationalftp.ercx.co",
      username: `${ftpSettings.username}`, //"BataSingapore",
      port: `${ftpSettings.port}`, //"2222",
      password: `${ftpSettings.password}`, //"Mqaj4h2zWpNY",
      path: `${TENDER_RECON_DIRECTORY_PATH}/${subStoreString}/${tenderFileName}`,
      remoteDir: `${ftpSettings.remoteDir}`, //"//ECOM",
      // excludedFolders: ['**/.git', 'node_modules'],
      // exclude: ['.gitignore', '.vscode/tasks.json'],
      // privateKey: fs.readFileSync('privateKey_rsa'),
      // passphrase: fs.readFileSync('privateKey_rsa.passphrase'),
      // dryRun: false,
    };
    console.log("sendTenderFile FTPOptions=", options);
    const sftp = new SftpUpload(options);

    sftp
      .on("error", function (err) {
        Logger(
          "sendTenderFile:",
          {
            msg: `${err.message || "Error Thrown"}`,
            store: store
          },
          __dirname,
          err
        );

        throw err;
      })
      .on("uploading", function (progress) {
        console.log("Uploading", progress.file);
        console.log(progress.percent + "% completed");
      })
      .on("completed", function () {
        console.log("Upload Completed");
        Logger("sendTenderFile:", {

          msg: `Upload Completed`,
          store: store
        }, __dirname);
      })
      .upload();
  } catch (error) {
    console.log("GOT ERROR", error);
    Logger(
      "sendTenderFile:",
      {
        msg: "sendTenderFile-Error-catched",
        store: store
      },
      __dirname,
      error
    );
  }
};

export const sendAddressFile = async (store, ftpSettings) => {
  try {
    const subStoreString = store.split(".myshopify.com")[0].toUpperCase();
    const logsSaved = await AppLogs.create({
      StoreName: isEmpty(store) ? "" : store,
      er_endpoint: "",
      middleware_endpoint: "sendAddressFile",
      message: `ran for ${ADDRESS_RECON_DIRECTORY_PATH}/${subStoreString}`,
    });

    const directoryPath = path.join(
      `${ADDRESS_RECON_DIRECTORY_PATH}`,
      `${subStoreString}`
    );

    const addressFileName = fs.readdirSync(directoryPath);
    if (addressFileName.length <= 0) {
      return;
    }
    console.log("ttttttttttttttttt", addressFileName);
    const options = {
      host: `${ftpSettings.host}`, //"batainternationalftp.ercx.co",
      username: `${ftpSettings.username}`, //"BataSingapore",
      port: `${ftpSettings.port}`, //"2222",
      password: `${ftpSettings.password}`, //"Mqaj4h2zWpNY",
      path: `${ADDRESS_RECON_DIRECTORY_PATH}/${subStoreString}/${addressFileName}`,
      remoteDir: `${ftpSettings.remoteDir}`, //"//ECOM",
    };

    console.log("sendTenderFile FTPOptions=", options);

    const sftp = new SftpUpload(options);

    sftp
      .on("error", function (err) {
        Logger(
          "sendAddressFile:",
          {
            msg: `${err.message || "Error Thrown"}`,
            store: store

          },
          __dirname,
          err
        );
        throw err;
      })
      .on("uploading", function (progress) {
        console.log("Uploading", progress.file);
        console.log(progress.percent + "% completed");
      })
      .on("completed", function () {
        console.log("Upload Completed");
        Logger("sendAddressFile:", `Upload Completed`, __dirname);
      })
      .upload();
  } catch (error) {
    console.log("GOT ERROR", error);
    Logger(
      "sendAddressFile:",
      {
        msg: "sendAddressFile-Error-catched",
        store: store
      },
      __dirname,
      error
    );
  }
};