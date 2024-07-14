import fs from 'fs'
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Logger } from '../CloudWatch/logger.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const connectMongoDB = async (dbName) => {
  const developmentDB = `mongodb://localhost:27017/${dbName}?retryWrites=true&w=majority`;

  mongoose.set("strictQuery", true);
  mongoose
    .connect(`${developmentDB}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((con) => {
      console.log("DB connection Successful to :", dbName);
    })
    .catch((error) => {
      console.log("Mongo Connection failed-", error);
      console.log(error.name, error.message);
    });
};


export const downloadFile = async (req) => {
  try {
  const data = req.body;
  console.log("data:", data);
  console.log("downloadFile");
  //  Get the list of files to include in the zip archive
  const f1 = await fs.promises.readdir("./ReconFiles/Csv/SkuItem");
  const f2 = await fs.promises.readdir("./ReconFiles/Csv/TenderItem");
  const files = [...f1, ...f2];
  console.log("Files array:", files);

  const zip = new admzip();

  // Add each file to the zip archive
  for (const file of files) {
    let filePath;
    if (file.includes("Sale"))
      filePath = path.join(`${process.cwd()}/ReconFiles/Csv/SkuItem`, file);
    else
      filePath = path.join(
        `${process.cwd()}/ReconFiles/Csv/TenderItem`,
        file
      );
    const fileStats = await fs.promises.stat(filePath);
    console.log(filePath);
    if (fileStats.isFile()) {
      zip.addLocalFile(filePath);
    } else if (fileStats.isDirectory()) {
      //archive.directory(filePath, file);
      zip.addLocalFolder(filePath);
    }
  }

  fs.writeFileSync(`${data.outfileName}`, zip.toBuffer());

  // Pipe the zip archive to the response object
  req.set("Content-Type", "application/zip");
  req.set(`Content-Disposition', 'attachment; filename=${data.outfileName}`);

  const src = fs.createReadStream(`${data.outfileName}`);
  req.body = src;

  src.on("end", () => {
    fs.unlinkSync(`${data.outfileName}`, (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log("File deleted successfully.");
      }
    });
  });
  } catch (err) {
    return {
      status : 500,
      body : "Internal Server Error"
    }
  }
};

const deleteFileSync = async (filePath) => {
  fs.unlinkSync(filePath);
};

const createAndSaveSkuLineItemCsvFile = async (
  storeName,
  timeStamp,
  startDate,
  endDate
) => {
  // await tempDbConnect()
  const orderList = await getListOfValidReconData(
    storeName,
    SkuReconModel,
    {},
    startDate,
    endDate
  );
  if (orderList?.length <= 0) {
    console.log(
      `Sku file not created because there is no valid order data before date ${startDate}`
    );

    /*
    NOTE:Avoiding writting logs at DB
    const logsSaved = await AppLogs.create({
        store: storeName,
        ip_address: "cron",
        er_endpoint: "",
        middleware_endpoint: "createSkuFile",
        request_body: JSON.stringify(orderList),
        message: `Sku file not created because there is no valid order data for UTC date ${currentUtcDate} and SingaporeDate ${startOfSingaporeCurrentDate}`,
    })
    */
    return;
  }
  /*
  NOTE:Avoiding writting logs at DB
const logsSaved = await AppLogs.create({
    store: storeName,
    ip_address: "cron",
    er_endpoint: "",
    middleware_endpoint: "createSkuFile",
    request_body: JSON.stringify(orderList),
    message: `Sku file created for order for UTC date ${currentUtcDate} and SingaporeDate ${startOfSingaporeCurrentDate}`,
})
*/

  const orderLineItemsArray = await Promise.all(
    orderList.map((order) => {
      return getSkuLineItemDetails(storeName, order.orderObject[0], order);
    })
  );

  // using this flatMap because the above DS is Array of Array
  const orderLineItems = orderLineItemsArray.flatMap((item) => item);
  Logger("==== orderLineItems", __dirname, orderLineItems);
  if (!orderLineItems[0]) throw new Error("OrderLineItems is null");
  const headerList = [
    "StoreName",
    "StoreCode",
    "BillDate",
    "BillTime",
    "BillNo",
    "SKUID",
    "Quantity",
    "Category",
    "Group",
    "Department",
    "RSP",
    "CustomerName",
    "CustomerMobile",
    "TotalPrice",
    "BilledPrice",
    "MRP",
    "BillPromodiscount",
    "ItemPromoDiscount",
    "LoyaltyDiscount",
    "CouponDiscount",
    "ItemDiscount",
    "TotalDiscount",
    "TaxAmount",
    "CouponCode",
    "Salesperson",
    "LastSettlementDate",
    "MemberID",
    "TerminalID",
    "VoidBill",
    "PrimaryOrderNumber",
    "BillValue",
    "RefBillNo",
    "CashierID",
    "Remark",
    "InvoiceNumber",
    "ShippingCharges",
    "DeliveryStatus",
    "DeliveredDate",
    "ReturnedDate",
    "CancelledDate",
    "IsGuestUser",
  ];
  const csvHeaders = createCsvHeaders(headerList);
  console.log("csvHeaders=== ", csvHeaders);
  const fileName = `ER_BATA_SG_Ecom_Sale_Item_${timeStamp}.csv`;
  console.log("fileName=== ", fileName);

  const filePath = path.join(SKU_RECON_DIRECTORY_PATH, `${fileName}`);
  console.log("filePath=== ", filePath);
  await createCsvFile(filePath, csvHeaders, orderLineItems);
  console.log("File Must be Created");
};

const getListOfValidReconData = async (
  storeName,
  Model,
  query,
  startDate,
  endDate
) => {
  /*
  NOTE: for public we are addin store key in skurecons model but it is no there in any of the private app
  that'why passing the store as a parameter in the below query won't give you the desired results.
  for any private app just comment store:storeName query and change the date according to your need
  or you may use the or query to get the data even if the STORE doesn't exist
  */

  /* 
  EARLIER CODE:
  const data = await Model.find({
    // store: storeName,
    // createdAt: { $gte: new Date("2023-02-01"), $lte: new Date("2023-03-31") },
    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
    ...query,
  }).sort({ createdAt: -1 });
 */

  const data = await Model.find({
    $and: [
      { StoreName: storeName },
      { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } },
    ],
  }).sort({ createdAt: -1 });

  Logger("Data from query:", __dirname, data)

  return data;
};

const createCsvHeaders = (headerList) => {
  return headerList.map((headerName) => {
    return { id: `${headerName}`, title: `${headerName}` };
  });
};


const createAndSaveTenderLineItemCsvFile = async (
  storeName,
  timeStamp,
  startDate,
  endDate
) => {
  // await tempDbConnect()
  const orderList = await getListOfValidReconData(
    storeName,
    SkuReconModel,
    {},
    startDate,
    endDate
  );
  if (orderList?.length <= 0) {
    console.log(
      `Tender file not created because there is no valid order data before date ${startDate}`
    );

    /* 
   // ignoring log saving to avoid db calls
    const logsSaved = await AppLogs.create({
       store: storeName,
       ip_address: "cron",
       er_endpoint: "",
       middleware_endpoint: "createTenderFile",
       request_body: JSON.stringify(orderList),
       message: `Tender file not created because there is no valid order data for UTC date ${currentUtcDate} and SingaporeDate ${startOfSingaporeCurrentDate}`,
     }) 
     
     */
    return;
  }
  /* 
   //ignoring log saving to avoid db calls
   const logsSaved = await AppLogs.create({
     store: storeName,
     ip_address: "cron",
     er_endpoint: "",
     middleware_endpoint: "createTenderFile",
     request_body: JSON.stringify(orderList),
     message: `Tender file created for order for UTC date ${currentUtcDate} and SingaporeDate ${startOfSingaporeCurrentDate}`,
   }) */
  const uniqueOrderIds = [];
  const uniqueOrderList = orderList.filter((order) => {
    const isDuplicate = uniqueOrderIds.includes(order.orderObject[0].id);
    if (!isDuplicate) {
      uniqueOrderIds.push(order.orderObject[0].id);
      return true;
    }
    return false;
  });
  const tenderItems = await Promise.all(
    uniqueOrderList.map((order) => {
      return getTenderDetails(storeName, order.orderObject[0]);
    })
  );
  console.log(tenderItems, "tenderItems tenderItems tenderItems tenderItems");
  // using this flatMap because the above DS is Array of Array
  // const orderLineItems = orderLineItemsArray.flatMap(item => item[0])
  // console.log("====", orderLineItems);
  const headerList = [
    "StoreCode",
    "MemberId",
    "Date",
    "BillId",
    "TenderAmount",
    "TenderCode",
    "TenderID",
    "IsLoyalty",
  ];
  const csvHeaders = createCsvHeaders(headerList);
  console.log("csvHeaders=== ", csvHeaders);
  const fileName = `ER_BATA_SG_Ecom_Tender_${timeStamp}.csv`;
  console.log("fileName=== ", fileName);

  const filePath = path.join(TENDER_RECON_DIRECTORY_PATH, `${fileName}`);
  console.log("filePath=== ", filePath);
  await createCsvFile(filePath, csvHeaders, tenderItems);
  console.log("File Must be Created");
};

export const createSkuAndTenderReconFileForDownload = async (req) => {
  try {
    /// for all
    // const allStores = await Store.find({});
    const currentServerDate = new Date();
    const data = req.body;
    // console.log("Request:", data);

    const uniqueTimeStamp = `${currentServerDate.getFullYear()}${currentServerDate.getMonth() + 1
      }${currentServerDate.getDate()}`; //20230410
    const skuFiles = fs.readdirSync(SKU_RECON_DIRECTORY_PATH);
    if (skuFiles?.length > 0) {
      console.log("DELETING OLD SKU FILES");
      deleteAllfilesInDirectory(SKU_RECON_DIRECTORY_PATH, skuFiles);
    }
    const tenderFiles = fs.readdirSync(TENDER_RECON_DIRECTORY_PATH);
    if (tenderFiles?.length > 0) {
      deleteAllfilesInDirectory(TENDER_RECON_DIRECTORY_PATH, tenderFiles);
    }

    // console.log("Reached Recon- for-" + data.StoreName);

    await connectMongoDB(data.db);

    await createAndSaveSkuLineItemCsvFile(
      data.StoreName,
      `${data.StoreName}-${uniqueTimeStamp}`,
      data.startDate,
      data.endDate
    );

    await createAndSaveTenderLineItemCsvFile(
      data.StoreName,
      `${data.StoreName}-${uniqueTimeStamp}`,
      data.startDate,
      data.endDate
    );
    return { message: "File Created" };
  } catch (error) {
    console.log("GOT ERROR", error);
    return {
      message: error.message || "Something went Wrong",
      code: error.status || 500,
    };
  }
};

const deleteAllfilesInDirectory = (directoryPath, files) => {
  console.log(`Deleting files from Directory ${directoryPath}`);
  files.forEach((file) => {
    const filePath = path.join(directoryPath, `${file}`);
    deleteFileSync(filePath);
  });
};  


