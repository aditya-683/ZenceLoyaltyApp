import { startOfDay, endOfDay, parseISO } from "date-fns";
import { zonedTimeToUtc, utcToZonedTime } from "date-fns-tz";
import { subDays } from "date-fns";
import mongoose from "mongoose";
import { AddressReconModel } from "../model/addressRecon.model.js";
import { Store } from "../model/store.model.js";
// const createCsvWriter = require("csv-writer").createObjectCsvWriter;
import { createObjectCsvWriter } from "csv-writer";
import cron from "node-cron";
import path from "path";
import fs from "fs";
import { SkuReconModel } from "../model/skuRecon.model.js";
import { getStartAndEndDate } from "../utils/utility.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ADDRESS_RECON_DIRECTORY_PATH = path.join(
  __dirname,
  `../ReconFiles/Csv/Address`
);

export const saveReconAddress = async (data) => {
  const createAddressRecon = await AddressReconModel.create({
    addressDetails: data,
    memberId: data.MemberId,
  });
  return createAddressRecon;
};

const testReconTime = () => {
  // this is to test time diff fron SG to UTC
  const test = 1234;
  console.log("reached here");
  const utcDate = new Date(Date.UTC(2022, 10, 11, 16, 4, 5));
  const singaporeCurrentDate = utcToZonedTime(utcDate, "Asia/Singapore");
  const dayBeforeUTC = subDays(singaporeCurrentDate, 1);
  console.log("utcDate", utcDate);
  console.log("singaporeCurrentDate", singaporeCurrentDate);
  console.log("dayBeforeUTC", dayBeforeUTC);
  console.log("==================================================");
  const startDateTime = startOfDay(dayBeforeUTC);
  const endDateTime = endOfDay(dayBeforeUTC);
  console.log("startDateTime-----singaporeCurrentDate", startDateTime);
  console.log("endDateTime-----singaporeCurrentDate", endDateTime);
  return 123;
};

const getListOfValidReconData = async (Model, query, store, ftpSettings, storeDetails) => {
  const currentUtcDate = new Date();
  const currZonedDate = utcToZonedTime(currentUtcDate, ftpSettings.timezone);
  /*
    when converting UTC 4:00 pm Friday to singapore time it will become 12:00 am (midnight) Saturday
    subtract 1 day from utc time.
    bacause 12:00 am (midnight) 12th Nov Saturday on singapore is ==  4:00 pm 11th Nov Friday on UTC
  */

  console.log("currentUtcDate", currentUtcDate);
  console.log(`currZonedDate-zone-${ftpSettings.timezone}`, currZonedDate);

  const startDateTime = getStartAndEndDate(currZonedDate)[0];
  const endDateTime = currZonedDate;
  console.log("startDateTime", startDateTime);
  console.log("endDateTime", endDateTime);
  const data = await Model.find({
    $and: [
      { createdAt: { $gte: startDateTime, $lte: endDateTime } },
      { StoreName: store },
    ],
  });


  //testing-->
  /*  const data = await Model.find({
     $and: [
       { createdAt: { $gte: new Date("2023-02-23"), $lte: new Date("2023-09-30") } },
       { StoreName: store },
     ],
   }); */
  console.log("===========", data);
  return data;
};

const createCsvHeaders = (headerList) => {
  return headerList.map((headerName) => {
    return { id: `${headerName}`, title: `${headerName}` };
  });
};

const createCsvFile = async (filePath, headers, data) => {
  //   const csvWriter = createCsvWriter({
  //     path: filePath,
  //     header: headers,
  //   });

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: headers,
  });

  await csvWriter.writeRecords(data);
};

const deleteFileSync = async (filePath) => {
  fs.unlinkSync(filePath);
};

const deleteAllfilesInDirectory = (directoryPath, files) => {
  console.log(`Deleting files from Directory ${directoryPath}`);
  files.forEach((file) => {
    const filePath = path.join(directoryPath, `${file}`);
    deleteFileSync(filePath);
  });
};

const createAndSaveAddressCsvFile = async (
  uniqueTimeStamp,
  store,
  ftpSettings,
  storeDetails
) => {
  const addressList = await getListOfValidReconData(
    AddressReconModel,
    {},
    store,
    ftpSettings,
    storeDetails
  );
  if (addressList.length <= 0) {
    return;
  }
  const preparedAddressList = addressList.map((address) => {
    return {
      StoreName: address.StoreName,
      Date: address.Date,
      BillId: address.BillId,
      MemberId: address.MemberId,
      EmailId: address.EmailId,
      AddressId: address.AddressId,
      Addresstype: address.Addresstype,
      CustomerName: address.CustomerName,
      CountryCode: address.CountryCode,
      Mobile: address.Mobile,
      Pincode: address.Pincode,
      Country: address.Country,
      State: address.State,
      City: address.City,
      Landmark: address.Landmark,
      AddressLine1: address.AddressLine1,
      AddressLine2: address.AddressLine2,
      DefaultAddress: address.DefaultAddress,
    };
  });
  console.log("REACHED HERE addressList", preparedAddressList);
  const headerList = [
    "StoreName",
    "Date",
    "BillId",
    "MemberId",
    "EmailId",
    "AddressId",
    "Addresstype",
    "CustomerName",
    "CountryCode",
    "Mobile",
    "Pincode",
    "Country",
    "State",
    "City",
    "Landmark",
    "AddressLine1",
    "AddressLine2",
    "DefaultAddress",
  ];
  const csvHeaders = createCsvHeaders(headerList);
  const subStoreString = store.split(".myshopify.com")[0].toUpperCase();
  console.log("csvHeaders=== ", csvHeaders);
  const fileName = `ER_${store
    .split(".myshopify.com")[0]
    .toUpperCase()}_Address_${uniqueTimeStamp}.csv`;
  console.log("fileName=== ", fileName);

  const filePath = path.join(
    `${ADDRESS_RECON_DIRECTORY_PATH}/${subStoreString}`,
    `${fileName}`
  );
  console.log("filePath=== ", filePath);
  await createCsvFile(filePath, csvHeaders, preparedAddressList);
  console.log("File Must be Created");
};

const createAddressReconFile = async (store, ftpSettings) => {
  try {
    const currentUtcDate = new Date();
    const storeDetails = Store.findOne({ StoreName: store })
    const currentZonedDateTime = utcToZonedTime(
      currentUtcDate,
      ftpSettings.timezone
    );
    const subStoreString = store.split(".myshopify.com")[0].toUpperCase();
    const uniqueTimeStamp = `${currentZonedDateTime.getFullYear()}${currentZonedDateTime.getMonth() + 1}${currentZonedDateTime.getDate()}`;
    console.log("Reached Recon");
    const directoryPath = path.join(
      `${ADDRESS_RECON_DIRECTORY_PATH}`,
      `${subStoreString}`
    );
    // Check if directory exists
    fs.existsSync(directoryPath) ||
      fs.mkdirSync(directoryPath, { recursive: true });
    const addressFiles = fs.readdirSync(directoryPath);
    if (addressFiles.length > 0) {
      console.log("DELETING OLD ADDRESS FILES");
      deleteAllfilesInDirectory(directoryPath, addressFiles);
    }
    await createAndSaveAddressCsvFile(uniqueTimeStamp, store, ftpSettings, storeDetails);
  } catch (error) {
    console.log("GOT ERROR", error);
  }
};

export {
  createAddressReconFile,
  getListOfValidReconData,
  createCsvHeaders,
  createCsvFile,
  deleteFileSync,
  deleteAllfilesInDirectory,
  testReconTime,
};
