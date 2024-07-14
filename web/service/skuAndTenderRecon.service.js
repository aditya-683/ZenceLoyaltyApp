import {
  getListOfValidReconData,
  createCsvHeaders,
  createCsvFile,
  deleteAllfilesInDirectory,
} from "./addressRecon.service.js"
import path from "path";
import fs from "fs";
import cron from "node-cron";
import { SkuReconModel } from "../model/skuRecon.model.js";
import { CartAttr } from "../model/attribute.model.js";
import mongoose from "mongoose";
import { AppLogs } from "../model/appLogs.model.js";
import { zonedTimeToUtc, utcToZonedTime } from "date-fns-tz";
import { startOfDay, endOfDay, parseISO } from "date-fns";
import { Logger } from "../CloudWatch/logger.js";
import {
  isEmpty,
  getStartAndEndDate,
  isPrefixedWithHash,
} from "../utils/utility.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Store } from "../model/store.model.js";

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
const getTransactionItems = (data, dbCartAttr, store, storeDetails) => {
  const PointValueRedeemed = dbCartAttr.points
    ? JSON.parse(dbCartAttr.points).PointsValue * 1
    : 0;
  const discountApplications = data.discount_codes[0];
  const easyRewardCouponValue = discountApplications
    ? discountApplications.amount * 1
    : 0;
  const CouponValueRedeemed = easyRewardCouponValue;

  const shippingPrice = data.shipping_lines
    .map((item) => Number(item.price))
    .reduce((prev, curr) => prev + curr, 0);

  return data.line_items.map((item) => {
    const itemTax = item.tax_lines
      .map((tax) => Number(tax.price))
      .reduce((prev, curr) => prev + curr, 0);

    const valueRedeemed = PointValueRedeemed + CouponValueRedeemed;
    console.log(
      "############################## PointValueRedeemed",
      PointValueRedeemed
    );
    console.log(
      "############################## CouponValueRedeemed",
      CouponValueRedeemed
    );
    console.log("############################## valueRedeemed", valueRedeemed);

    const discountPercentage =
      (item.quantity * item.price) / data.total_line_items_price;
    const discountPercentageRound =
      Math.round((discountPercentage + Number.EPSILON) * 100) / 100;
    const itemDiscount =
      (valueRedeemed * discountPercentageRound).toFixed(2) * 1;
    const itemDiscountDecimalRound =
      Math.round((itemDiscount + Number.EPSILON) * 100) / 100;
    const totalPrice = (item.quantity * item.price).toFixed(2) * 1;
    console.log("############################## item.quantity", item.quantity);
    console.log("############################## item.price", item.price);
    console.log(
      "############################## discountPercentage",
      discountPercentage
    );
    console.log(
      "############################## discountPercentageRound",
      discountPercentageRound
    );
    console.log("############################## itemDiscount", itemDiscount);
    console.log(
      "############################## itemDiscountDecimalRound",
      itemDiscountDecimalRound
    );
    console.log("############################## totalPrice", totalPrice);
    const unitScriptDisc = item.total_discount * 1;
    const unitPrice = item.price * 1;
    const totalDiscount = itemDiscount * 1 + unitScriptDisc;
    const billedPrice = (totalPrice - totalDiscount).toFixed(2) * 1; //Item discount.

    /*
      Terms:
      unitScript Disc (Treat as ITEMDISCOUNT (By STORE))
      itemDiscount = (Discount by Point + Coupon)
      pointDiscount = PointRedeemValue
      couponDisc = couponredeemvalue
 
      EASYREWARDS RECON CALC:
      --------------------------------------
      ItemDiscount = unitScriptDisc
      LoyaltyDiscount = PointValueRedeemed
      CouponDiscount = CouponValueRedeemed
      TotalDiscount = itemDiscount + unitScriptDisc
      BillPrice = totalPrice - TotalDiscount
      BillValue = sumOfAll BillPrice of an order
      TenderAmount = BillValue (USED IN TENDER ITEM)
    */

    return {
      StoreName: isEmpty(store) ? "N/A" : store,
      StoreCode: storeDetails.StoreCode || "Website",
      TotalPrice: totalPrice,
      BilledPrice: billedPrice,
    };
  });
};

const getTotalBilledPrice = (data, dbCartAttr, store, storeDetails) => {
  const transactionsItems = getTransactionItems(data, dbCartAttr, store, storeDetails);
  const billValue = transactionsItems
    .map((item) => Number(item.BilledPrice))
    .reduce((prev, curr) => prev + curr, 0);
  return billValue.toFixed(2) * 1;
};

const getShiping = (data) => {
  return (shippingPrice = data.shipping_lines
    .map((item) => Number(item.price))
    .reduce((prev, curr) => prev + curr, 0));
};

const getPointRedeemed = (data) => {
  return {
    PointsRedeemed: PointsRedeemed,
    PointsValueRedeemed: PointsValueRedeemed,
  };
};

const getErDate = (date) => {
  const monthMap = {
    "01": "Jan",
    "02": "Feb",
    "03": "Mar",
    "04": "Apr",
    "05": "May",
    "06": "Jun",
    "07": "Jul",
    "08": "Aug",
    "09": "Sep",
    10: "Oct",
    11: "Nov",
    12: "Dec",
  };
  const dateArrayFromProcessed = date.split("T")[0].split("-"); // Output Array ["2022", "07", "18"]
  const dateNumber = dateArrayFromProcessed[2];
  const monthNumber = dateArrayFromProcessed[1];
  const monthInErFormat = monthMap[monthNumber];
  const yearNumber = dateArrayFromProcessed[0].substring(2, 4);
  return `${dateNumber}-${monthInErFormat}-${yearNumber}`;
};
const getErTime = (createdAtDate) => {
  const timeMap = {
    13: "01",
    14: "02",
    15: "03",
    16: "04",
    17: "05",
    18: "06",
    19: "07",
    20: "08",
    21: "09",
    22: "10",
    23: "11",
    24: "12",
    "00": "12",
  };
  const timeArray = createdAtDate.split("T")[1].split("+")[0].split(":");
  const hour = timeArray[0];
  const min = timeArray[1];
  const sec = timeArray[2];
  const amOrPm = hour * 1 > 12 ? "PM" : "AM";
  const actualHour = hour * 1 > 12 || hour * 1 == "00" ? timeMap[hour] : hour;
  return `${actualHour}:${min}:${sec} ${amOrPm}`;
};


const getSkuLineItemDetails = async (data, store, storeDetails) => {
  const dbCartAttr = await CartAttr.findOne({
    $and: [{ checkoutToken: data.checkout_token }, { StoreName: store }],
  });
  if (!dbCartAttr) return;
  const EasyId = dbCartAttr?.phone?.includes(",") ? dbCartAttr.phone.split(",")[0] : `${dbCartAttr.phone}`;//take from notes-order obj
  console.log("############################## dbCartAttr", dbCartAttr);
  console.log(
    "############################## dbCartAttr.points",
    dbCartAttr.points
  );

  const PointValueRedeemed = dbCartAttr.points
    ? JSON.parse(dbCartAttr.points).PointsValue * 1
    : 0;
  const discountApplications = data.discount_codes[0];
  const easyRewardCouponValue = discountApplications
    ? discountApplications.amount * 1
    : 0;
  const CouponValueRedeemed = easyRewardCouponValue;

  const shippingPrice = data.shipping_lines
    .map((item) => Number(item.price))
    .reduce((prev, curr) => prev + curr, 0);

  const isFulfillement = data.fulfillments.length > 0;

  return data.line_items.map((item) => {
    const itemTax = item.tax_lines
      .map((tax) => Number(tax.price))
      .reduce((prev, curr) => prev + curr, 0);

    const valueRedeemed = PointValueRedeemed + CouponValueRedeemed;
    // console.log("############################## PointValueRedeemed", PointValueRedeemed);
    // console.log("############################## CouponValueRedeemed", CouponValueRedeemed);
    // console.log("############################## valueRedeemed", valueRedeemed);

    const discountPercentage =
      (item.quantity * item.price) / data.total_line_items_price;
    const discountPercentageRound =
      Math.round((discountPercentage + Number.EPSILON) * 100) / 100;
    const itemDiscount =
      (valueRedeemed * discountPercentageRound).toFixed(2) * 1;
    const itemDiscountDecimalRound =
      Math.round((itemDiscount + Number.EPSILON) * 100) / 100;
    const totalPrice = (item.quantity * item.price).toFixed(2) * 1;
    // console.log("############################## item.quantity", item.quantity);
    // console.log("############################## item.price", item.price);
    // console.log("############################## discountPercentage", discountPercentage);
    // console.log("############################## discountPercentageRound", discountPercentageRound);
    // console.log("############################## itemDiscount", itemDiscount);
    // console.log("############################## itemDiscountDecimalRound", itemDiscountDecimalRound);
    // console.log("############################## totalPrice", totalPrice);
    const unitScriptDisc = item.total_discount * 1;
    const unitPrice = item.price * 1;
    const totalDiscount = itemDiscount * 1 + unitScriptDisc;
    const billedPrice = (totalPrice - totalDiscount).toFixed(2) * 1; //Item discount.
    const billValue = getTotalBilledPrice(data, dbCartAttr, store, storeDetails); // Sum of billedPrice is bill value
    const couponDiscountPerLineItem =
      CouponValueRedeemed > 0
        ? (CouponValueRedeemed * discountPercentageRound).toFixed(2) * 1
        : CouponValueRedeemed;
    const pointDiscountPerLineItem =
      PointValueRedeemed > 0
        ? (PointValueRedeemed * discountPercentageRound).toFixed(2) * 1
        : PointValueRedeemed;

    const customerNameFromCustomerObj =
      data.customer.first_name || data.customer.last_name
        ? `${data.customer.first_name} ${data.customer.last_name}`
        : false;

    const customerNameFromBillingObj =
      data.billing_address.first_name || data.billing_address.last_name
        ? `${data.billing_address.first_name} ${data.billing_address.last_name}`
        : false;

    const CustomerName = customerNameFromCustomerObj
      ? customerNameFromCustomerObj
      : customerNameFromBillingObj
        ? customerNameFromBillingObj
        : "";
    /*
      Terms:
      unitScript Disc (Treat as ITEMDISCOUNT (By STORE))
      itemDiscount = (Discount by Point + Coupon) per item
      pointDiscount = PointRedeemValue
      couponDisc = couponredeemvalue
 
      EASYREWARDS RECON CALC:
      --------------------------------------
      ItemDiscount = unitScriptDisc
      LoyaltyDiscount = PointValueRedeemed
      CouponDiscount = CouponValueRedeemed
      TotalDiscount = itemDiscount + unitScriptDisc
      BillPrice = totalPrice - TotalDiscount
      BillValue = sumOfAll BillPrice of an order
      TenderAmount = BillValue (USED IN TENDER ITEM)
 
    */
    let DeliveryStatus = "InProcess";
    let CancelledDate;
    let DeliveredDate;
    if (isFulfillement) {
      const fullFilledItem = data.fulfillments[0].line_items.find(
        (fulfilledItem) => {
          return fulfilledItem.sku == item.sku;
        }
      );
      console.log(
        "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
      );
      console.log(
        "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        fullFilledItem
      );
      if (fullFilledItem) {
        console.log("INSIDDDDDDDDDDDDDEEEEEEEEEEEE   IFFFFFFFF");
        console.log("INSIDDDDDDDDDDDDDEEEEEEEEEEEE   IFFFFFFFF");
        console.log("INSIDDDDDDDDDDDDDEEEEEEEEEEEE   IFFFFFFFF");
        const status = data.fulfillments[0]?.status;
        console.log(
          "INSIDDDDDDDDDDDDDEEEEEEEEEEEE   status status status",
          status
        );
        DeliveryStatus =
          status == "success"
            ? "Delivered"
            : status == "cancelled"
              ? "Cancelled"
              : "InProcess";
        DeliveredDate =
          DeliveryStatus == "Delivered"
            ? getErDate(data.fulfillments[0]?.created_at)
            : "";
        CancelledDate =
          DeliveryStatus == "Cancelled"
            ? getErDate(data.fulfillments[0]?.created_at)
            : "";
      } else {
        console.log(
          "INSIDDDDDDDDDDDDDEEEEEEEEEEEE  ELSSSSEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE IFFFFFFFF"
        );
        DeliveryStatus = "InProcess";
        DeliveredDate = "";
        CancelledDate = "";
      }
    } else {
      console.log(
        "INSIDDDDDDDDDDDDDEEEEEEEEEEEE  ELSSSSEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE"
      );
      DeliveryStatus = "InProcess";
      DeliveredDate = "";
      CancelledDate = "";
    }
    return {
      StoreName: store,
      StoreCode: storeDetails.StoreCode || "Website",
      BillDate: getErDate(data.created_at),
      BillTime: getErTime(data.created_at),
      BillNo: data.name,
      SKUID: item.sku ?? "N/A",
      Quantity: item.quantity,
      Category: "NA",
      Group: "NA",
      Department: "Shopify",
      RSP: unitPrice,
      CustomerName: CustomerName,
      CustomerMobile: EasyId,
      TotalPrice: totalPrice,
      BilledPrice: billedPrice,
      MRP: totalPrice,
      BillPromodiscount: 0,
      ItemPromoDiscount: 0,
      LoyaltyDiscount: pointDiscountPerLineItem, //PointValueRedeemed
      CouponDiscount: CouponValueRedeemed, //CouponValueRedeemed
      ItemDiscount: unitScriptDisc,
      TotalDiscount: (
        couponDiscountPerLineItem +
        pointDiscountPerLineItem +
        unitScriptDisc
      ).toFixed(2), //check
      TaxAmount: itemTax,
      CouponCode: data.discount_applications[0]?.code ?? "0",
      Salesperson: "N/A",
      LastSettlementDate: "N/A",
      MemberID: EasyId,
      TerminalID: "N/A",
      VoidBill: "N/A",
      PrimaryOrderNumber: data.name,
      BillValue: billValue,
      RefBillNo: "N/A",
      CashierID: "N/A",
      Remark: "N/A",
      InvoiceNumber: DeliveryStatus == 'InProcess' ? "" : `invoice_${item.id}`, //item.sku,
      ShippingCharges: shippingPrice,
      DeliveryStatus: DeliveryStatus,
      DeliveredDate: DeliveredDate,
      ReturnedDate: "N/A",
      CancelledDate: CancelledDate,
      IsGuestUser: "0",
    };
  });
};


const getTenderDetails = async (data, store, storeDetails) => {
  const dbCartAttr = await CartAttr.findOne({
    $and: [{ checkoutToken: data.checkout_token }, { StoreName: store }],
  });
  if (!dbCartAttr) return;
  const EasyId = dbCartAttr?.phone?.includes(",") ? dbCartAttr.phone.split(",")[0] : `${dbCartAttr.phone}`;

  const totalBilledPrice = getTotalBilledPrice(data, dbCartAttr, store, storeDetails);

  const shippingPrice = data.shipping_lines
    .map((item) => Number(item.price))
    .reduce((prev, curr) => prev + curr, 0);

  const pgTenderAmount = totalBilledPrice + shippingPrice;

  return {
    // PG and COD or GiftCard
    StoreCode: storeDetails.StoreCode || "Website",
    MemberId: EasyId,
    Date: getErDate(data.created_at),
    BillId: data.name,
    TenderAmount: pgTenderAmount.toFixed(2) * 1,
    TenderCode: "PG",
    TenderID: "",
    IsLoyalty: 0,
  };
};

//checking
const createAndSaveSkuLineItemCsvFile = async (
  timeStamp,
  store,
  ftpSettings,
  storeDetails
) => {
  const currentUtcDate = new Date();
  const startOfTheCurrentZonedDateTime = getStartAndEndDate(currentUtcDate)[0];
  const currZonedTime = utcToZonedTime(currentUtcDate, ftpSettings.timezone);

  const orderList = await getListOfValidReconData(
    SkuReconModel,
    {},
    store,
    ftpSettings,
    storeDetails
  );
  if (orderList?.length <= 0) {
    console.log(
      `Sku file not created because there is no valid order data before date ${startOfTheCurrentZonedDateTime}`
    );

    const logsSaved = await AppLogs.create({
      StoreName: isEmpty(store) ? "" : store,
      ip_address: "cron",
      er_endpoint: "",
      middleware_endpoint: "createSkuFile",
      request_body: JSON.stringify(orderList),
      message: `Sku file not created because there is no valid order data for UTC date ${currZonedTime} and SingaporeDate ${startOfTheCurrentZonedDateTime}`,
    });
    return;
  }
  const logsSaved = await AppLogs.create({
    StoreName: isEmpty(store) ? "" : store,
    ip_address: "cron",
    er_endpoint: "",
    middleware_endpoint: "createSkuFile",
    request_body: JSON.stringify(orderList),
    message: `Sku file created for order for UTC date ${currZonedTime} and SingaporeDate ${startOfTheCurrentZonedDateTime}`,
  });
  const orderLineItemsArray = await Promise.all(
    orderList.map((order) => {
      return getSkuLineItemDetails(order.orderObject[0], store, storeDetails);
    })
  );
  // using this flatMap because the above DS is Array of Array
  const orderLineItems = orderLineItemsArray.flatMap((item) => item);
  console.log("====", orderLineItems);
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
  const subStoreString = store.split(".myshopify.com")[0].toUpperCase();
  const fileName = `ER_${subStoreString}_Sale_Item_${timeStamp}.csv`;
  console.log("fileName=== ", fileName);

  const filePath = path.join(
    `${SKU_RECON_DIRECTORY_PATH}/${subStoreString}`,
    `${fileName}`
  );
  console.log("filePath=== ", filePath);
  await createCsvFile(filePath, csvHeaders, orderLineItems);
  console.log("File Must be Created");
};


const createAndSaveTenderLineItemCsvFile = async (
  timeStamp,
  store,
  ftpSettings,
  storeDetails
) => {
  const currentUtcDate = new Date();
  const startOfTheCurrentZonedDateTime = getStartAndEndDate(currentUtcDate)[0];
  const currZonedTime = utcToZonedTime(currentUtcDate, ftpSettings.timezone);

  const orderList = await getListOfValidReconData(
    SkuReconModel,
    {},
    store,
    ftpSettings,
    storeDetails
  );
  if (orderList?.length <= 0) {
    console.log(
      `Tender file not created because there is no valid order data before date ${startOfTheCurrentZonedDateTime}`
    );

    const logsSaved = await AppLogs.create({
      StoreName: isEmpty(store) ? "" : store,
      ip_address: "cron",
      er_endpoint: "",
      middleware_endpoint: "createTenderFile",
      request_body: JSON.stringify(orderList),
      message: `Tender file not created because there is no valid order data for UTC date ${currZonedTime} and SingaporeDate ${startOfTheCurrentZonedDateTime}`,
    });
    return;
  }
  const logsSaved = await AppLogs.create({
    StoreName: isEmpty(store) ? "" : store,
    ip_address: "cron",
    er_endpoint: "",
    middleware_endpoint: "createTenderFile",
    request_body: JSON.stringify(orderList),
    message: `Tender file created for order for UTC date ${currZonedTime} and SingaporeDate ${startOfTheCurrentZonedDateTime}`,
  });
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
      return getTenderDetails(order.orderObject[0], store, storeDetails);
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
  const fileName = `ER_${store
    .split(".myshopify.com")[0]
    .toUpperCase()}_Tender_${timeStamp}.csv`;
  console.log("fileName=== ", fileName);
  const subStoreString = store.split(".myshopify.com")[0].toUpperCase();

  const filePath = path.join(
    `${TENDER_RECON_DIRECTORY_PATH}/${subStoreString}`,
    `${fileName}`
  );
  console.log("filePath=== ", filePath);
  await createCsvFile(filePath, csvHeaders, tenderItems);
  console.log("File Must be Created");
};

//checking this
export const createSkuAndTenderReconFile = async (store, ftpSettings) => {
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
      `${SKU_RECON_DIRECTORY_PATH}`,
      `${subStoreString}`
    );
    // Check if directory exists
    fs.existsSync(directoryPath) ||
      fs.mkdirSync(directoryPath, { recursive: true });
    const skuFiles = fs.readdirSync(directoryPath);
    if (skuFiles.length > 0) {
      console.log("DELETING OLD SKU FILES");
      deleteAllfilesInDirectory(directoryPath, skuFiles);
    }
    await createAndSaveSkuLineItemCsvFile(uniqueTimeStamp, store, ftpSettings, storeDetails);

    const tenderDirectoryPath = path.join(
      `${TENDER_RECON_DIRECTORY_PATH}`,
      `${subStoreString}`
    );
    // Check if directory exists
    fs.existsSync(tenderDirectoryPath) ||
      fs.mkdirSync(tenderDirectoryPath, { recursive: true });

    const tenderFiles = fs.readdirSync(tenderDirectoryPath);
    if (tenderFiles.length > 0) {
      deleteAllfilesInDirectory(tenderDirectoryPath, tenderFiles);
    }
    await createAndSaveTenderLineItemCsvFile(
      uniqueTimeStamp,
      store,
      ftpSettings,
      storeDetails
    );
  } catch (error) {
    console.log("GOT ERROR", error);
    Logger(
      "createSkuAndTenderReconFile",
      {
        msg: "createSkuAndTenderReconFile-error-catched",
        store: store,
      },
      __dirname,
      error
    );
  }
};
