
import axios from "axios";
import { AppSetting } from "../model/appSetting.model.js";
import { Store } from "../model/store.model.js";



const axiosRequest = async (url, data, headers) => {
  try {
    const response = await axios({
      method: "POST",
      headers,
      url: url,
      data: data,
    });
    return response.data;
  } catch (err) {
    console.log("Error From Log ", err);
  }
};

export const saveAppSettingsService = async (req) => {
  const data = req.body;
  console.log(
    "inside Controller Data %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%",
    data
  );
  const storeName = data.storeName || data.StoreName || req.query.shop; // because there two keys using in this

  if (!storeName)
    return {
      ReturnCode: 120,
      ReturnMessage: "StoreName Is Required",
    };
  let updateObject = {};

  if (data.useTaxSettingsExclProduct) {
    updateObject.useTaxSettingsExclProduct = data.useTaxSettingsExclProduct;
  } else {
    updateObject.useTaxSettingsExclProduct = false;
  }

  if (data.useOrderCreateHook) {
    updateObject.useOrderCreateHook = data.useOrderCreateHook;
  } else {
    updateObject.useOrderCreateHook = false;
  }

  if (data.useOrderFulfillHook) {
    updateObject.useOrderFulfillHook = data.useOrderFulfillHook;
  } else {
    updateObject.useOrderFulfillHook = false;
  }

  if (data.useOrderCancelHook) {
    updateObject.useOrderCancelHook = data.useOrderCancelHook;
  } else {
    updateObject.useOrderCancelHook = false;
  }

  if (data.useOrderReturnHook) {
    updateObject.useOrderReturnHook = data.useOrderReturnHook;
  } else {
    updateObject.useOrderReturnHook = false;
  }

  if (data.allowGuestRegistrationOnOrderPlace) {
    updateObject.allowGuestRegistrationOnOrderPlace =
      data.allowGuestRegistrationOnOrderPlace;
  } else {
    updateObject.allowGuestRegistrationOnOrderPlace = false;
  }

  if (data.usePhoneFromShippingForRegistration) {
    updateObject.usePhoneFromShippingForRegistration =
      data.usePhoneFromShippingForRegistration;
  } else {
    updateObject.usePhoneFromShippingForRegistration = false;
  }

  if (data.callSaveSkuForGuestOrders) {
    updateObject.callSaveSkuForGuestOrders = data.callSaveSkuForGuestOrders;
  } else {
    updateObject.callSaveSkuForGuestOrders = false;
  }

  if (data.usePointsAsTender) {
    updateObject.usePointsAsTender = data.usePointsAsTender;
  } else {
    updateObject.usePointsAsTender = false;
  }

  if (data.domainName) {
    updateObject.domainName = data.domainName;
  }

  if (data.isAppDisabled) {
    updateObject.isAppDisabled = data.isAppDisabled;
  } else {
    updateObject.isAppDisabled = false;
  }

  if (data.isTestMode) {
    updateObject.isTestMode = data.isTestMode;
  } else {
    updateObject.isTestMode = false;
  }

  if (data.testThemeId) {
    updateObject.testThemeId = data.testThemeId;
  }

  if (data.couponWithoutOtp) {
    updateObject.couponWithoutOtp = data.couponWithoutOtp;
  } else {
    updateObject.couponWithoutOtp = false;
  }
 
  console.log("UPDATE OBJ", updateObject);

  const appSettings = await AppSetting.find({
    StoreName: data.storeName,
    isDeleted: false
  });
  let appSettingsDoc;
  if (appSettings.length > 0) {
    console.log("INSIDE IFFFFFF THAT IS UPDATING");
    appSettingsDoc = await AppSetting.findOneAndUpdate(
      { StoreName: data.storeName, isDeleted: false },
      updateObject,
      { new: true }
    );
    console.log(appSettingsDoc);
  } else {
    console.log("INSIDE ELSEEEE THAT IS CREATE");

    appSettingsDoc = await AppSetting.create({
      StoreName: shop,
      ...updateObject,
    });
    console.log(appSettingsDoc);
  }

  return { ReturnCode: 0, ...appSettingsDoc };

};

export const getAppSettingsService = async (req) => {
  const data = req.body;
  const shop = data.storeName || req.query.shop;
  const appSettings = await AppSetting.findOne({ StoreName: shop, isDeleted: false });
  return appSettings;
};

export const registerUserInEasyReward = async (data, storeDetails) => {
  const EasyId = data.EasyId;
  const ErBaseUrl = storeDetails.ErBaseUrl;

  const securityToken = await wsGenerateSecurityToken(storeDetails);
  console.log("LLLLLLLL", securityToken);
  // if (!securityToken.ReturnCode != "0") return ctx.response.body = "Something Went Wrong Please Try Again"
  const searchUserParams = {
    EasyId: EasyId,
    UserName: storeDetails.UserName2,
    SecurityToken: securityToken.Token,
    CountryCode: storeDetails.CountryCode,
  };
  const address = `${data.customer.default_address.address1} ${data.customer.default_address.address2}, ${data.customer.default_address.city}, ${data.customer.default_address.province},  ${data.customer.default_address.country}, ${data.customer.default_address.zip}`;
  const registrationParams = {
    SecurityToken: securityToken.Token,
    FirstName: data.customer.first_name || data.shipping_address.first_name,
    LastName: data.customer.last_name || data.shipping_address.last_name,
    StoreCode: storeDetails.StoreCode,
    EmailId: data.customer.email || null,
    ChannelCode: "Online", // Need to Confirm,
    CustomerTypeCode: "Loyalty", // Need to Confirm
    MobileNo: EasyId,
    CountryCode: storeDetails.CountryCode,
    MemberShipNumber: EasyId,
    Address1: address,
    UserName: storeDetails.UserName2,
  };
  const isMember = await wsSearchMember(searchUserParams, ErBaseUrl);
  if (!isMember) return { status: 200 };
  if (!isMember.MemberResponse && isMember.ReturnCode == 172) {
    const registeredUser = await wsRegisterEasyAccount(
      registrationParams,
      ErBaseUrl
    );
  }
};

export const getPointAsTenderSaveSkuParams = async (
  data,
  dbCartAttr,
  EasyId,
  countryCode,
  transactionDate,
  storeDetails,
  securityToken,
  appSettings
) => {
  const orderName = data.name;
  const pointsCartAttribute = dbCartAttr.points;
  const pointsCartAttributeValue = pointsCartAttribute
    ? JSON.parse(pointsCartAttribute)
    : null;

  const couponsCartAttribute = dbCartAttr.coupon;
  const couponsCartAttributeValue = couponsCartAttribute
    ? JSON.parse(couponsCartAttribute)
    : null;
  // const isCouponCartAttributeInvalid = couponsCartAttributeValue.isInvalid

  const isEasyRewardsPointsOrder = pointsCartAttributeValue;
  const isEasyRewardsDiscountCouponOrder = couponsCartAttributeValue;

  const giftCardValue = pointsCartAttributeValue
    ? pointsCartAttributeValue.PointValue * 1
    : 0; // 9

  // const discountApplications = data.discount_applications.find(item => item.type == "discount_code")
  const discountApplications = data.discount_codes[0];
  const easyRewardCouponValue = isEasyRewardsPointsOrder
    ? 0
    : discountApplications
      ? discountApplications.amount * 1
      : 0;

  let PointsValueRedeemed = giftCardValue * 1;
  const CouponValueRedeemed = easyRewardCouponValue;
  const PointsRedeemed = pointsCartAttributeValue
    ? pointsCartAttributeValue.PointRedeem
    : "";

  // const discountPrice = data.current_total_discounts/data.line_items.length
  const orderTransactionDetails = await getOrderTransactions(
    data.id,
    storeDetails.AccessToken,
    storeDetails.StoreName
  );
  const giftCardUsed =
    orderTransactionDetails &&
    orderTransactionDetails.transactions.filter(
      (item) => item.gateway == "gift_card"
    );
  const giftCards = giftCardUsed.length > 0 ? giftCardUsed : [];

  // this could be 0
  const totalGiftCardAmount = giftCards
    .map((item) => item.amount * 1)
    .reduce((prev, curr) => prev + curr, 0);

  const getTransactionItems = (valueRedeemed) => {
    /*
 CALCULATION FOR SAVE SKU BILL DETAILS

     totalItemTax = 100
     itemQuantity = 4
     singleUnitTax = 100 / 4 ==>  25
     singleUnitPrice = item.price - singleUnitTax (UNIT PRICE WITHOUT TAX)

     ===========Params to send ITEM LEVEL==============
     itemDiscount: NO CALC. (THIS IS COMMING FROM "discount_allocation" FIELD
     itemTax = itemTax (THIS IS TOTAL TAX OF EACH LINE ITEM)
     totalPrice = item.price * quantity (THIS IS TOTAL PRICE OF EACH LINE ITEM INCLUDING TAX) ===== [TOTAL PRICE SHOULD BE INCL. OF TAX]
     billedPrice = totalPrice - itemDiscount (BILLED PRICE IS FINAL PRICE THAT IS BILLED TO USER AFTER DISCOUNTS ###[ONLY COUPON FOR BATA BD ])

     ===========Params to send GLOBAL LEVEL==============
     totalItemBilledPrice = sum of all item level BilledPrice [Calculated Below]
     BillValue = totalItemBilledPrice + shipping price
*/
    console.log(
      "===============================> valueRedeemed // this was never used",
      valueRedeemed
    );

    return data.line_items.map((item) => {
      const itemTax = item.tax_lines
        .map((tax) => Number(tax.price))
        .reduce((prev, curr) => prev + curr, 0);
      console.log("===============================> itemTax ", itemTax);
      const itemDiscount = isEasyRewardsPointsOrder
        ? 0
        : item.discount_allocations.length > 0
          ? item.discount_allocations[0].amount * 1
          : 0;
      console.log(
        "===============================> itemDiscount ",
        itemDiscount
      );

      const singleLineItemQuantity = item.quantity * 1;
      const singleUnitTax = itemTax > 0 ? itemTax / singleLineItemQuantity : 0;
      const singleUnitPrice = (item.price - singleUnitTax).toFixed(2) * 1;
      //the default value of useTaxSettingsExclProduct is false as most of the times the item tax is included
      const conditionalBasedItemTax = appSettings.useTaxSettingsExclProduct ? 0 : itemTax

      const totalPrice = (item.quantity * item.price + conditionalBasedItemTax).toFixed(2) * 1; // adding or removing item Tax here depending upon the App Dashboard Setting:Default is Inclusive
      console.log("===============================> totalPrice ", totalPrice);

      const billedPrice = (totalPrice - itemDiscount).toFixed(2) * 1; //Item discount.
      console.log("===============================> billedPrice ", billedPrice);

      return {
        ItemType: "s",
        ItemQty: `${item.quantity}`,
        Unit: `${singleUnitPrice}`, // price for Single Item
        ItemDiscount: `${itemDiscount}`, // calculate based on
        ItemTax: `${itemTax}`,
        TotalPrice: `${totalPrice}`,
        BilledPrice: `${billedPrice}`,
        Department: "Shopify",
        Category: "NA",
        Group: "NA",
        ItemId: `${item.sku}`,
        RefBillNo: "",
      };
    });
  };
  const transactionsItems = getTransactionItems(
    PointsValueRedeemed + CouponValueRedeemed
  );

  const totalBilledPrice = transactionsItems
    .map((item) => Number(item.BilledPrice))
    .reduce((prev, curr) => prev + curr, 0);

  const shippingPrice = data.shipping_lines
    .map((item) => Number(item.price))
    .reduce((prev, curr) => prev + curr, 0);

  const totalItemBilledPrice = totalBilledPrice.toFixed(2) * 1;
  console.log(
    "===============================> totalItemBilledPrice ",
    totalItemBilledPrice
  );
  console.log("===============================> shippingPrice ", shippingPrice);

  const RedemptionCode = pointsCartAttributeValue
    ? pointsCartAttributeValue.RedemptionCode
    : 0;
  const RequestID = couponsCartAttributeValue
    ? couponsCartAttributeValue.RequestID
    : 0;

  if (
    pointsCartAttributeValue != null ||
    (isEasyRewardsPointsOrder && RedemptionCode != 0)
  ) {
    data.pointsAttribute = pointsCartAttributeValue;
    const confirmEasyPointsRedemption = await ConfirmEasyPointsRedemption(
      data,
      totalItemBilledPrice + shippingPrice,
      RedemptionCode,
      storeDetails,
      EasyId
    );
  }

  
  if (
    couponsCartAttributeValue != null ||
    (isEasyRewardsDiscountCouponOrder && RequestID != 0)
  ) {
    data.couponAttribute = couponsCartAttributeValue;
    const useCouponResponse = await useCoupon(
      data,
      easyRewardCouponValue,
      RequestID,
      false,
      storeDetails
    );
    console.log("Response useCouponResponse =====>>>>", useCouponResponse);
  }

  const gcTenderAmount =
    totalGiftCardAmount > 0 ? totalGiftCardAmount - PointsValueRedeemed : 0;
  const pgTenderAmount =
    totalItemBilledPrice + shippingPrice - totalGiftCardAmount;
  const pointsTender = PointsValueRedeemed;

  const orderDataParams = {
    SecurityToken: securityToken.Token,
    StoreCode: storeDetails.StoreCode,
    TransactionDate: transactionDate,
    PrimaryOrderNumber: orderName,
    BillNo: orderName,
    EasyId: EasyId,
    UserName: storeDetails.UserName2,
    Channel: "Online",
    ShippingCharge: shippingPrice,
    BillValue: totalItemBilledPrice + shippingPrice, // shipping, // can remove last + item
    PointsRedeemed: isEasyRewardsPointsOrder ? PointsRedeemed : "",
    PointsValueRedeemed: isEasyRewardsPointsOrder
      ? PointsValueRedeemed * 1
      : "",
    AllowPointIssuance: "",
    IssuanceOnRedemption: "",
    SKUOfferCode: "",
    PreDelivery: "true",
    CountryCode: countryCode,
    TransactionItems: {
      TransactionItem: transactionsItems,
    },
    PaymentMode: {
      TenderItem: [
        {
          // PG and COD or GiftCard
          TenderCode: "PG",
          TenderID: "",
          TenderValue: (pgTenderAmount - (pointsTender ? pointsTender.toFixed(2) * 1 : 0)).toFixed(2) * 1,
        },
        {
          TenderCode: "Point",
          TenderID: "",
          TenderValue: pointsTender ? pointsTender.toFixed(2) * 1 : 0,
        },
        {
          TenderCode: "GC",
          TenderID: "",
          TenderValue: gcTenderAmount,
        },
      ],
    },
  };
  return orderDataParams;
};
export const getPointAsDiscountSaveSkuParams = async (
  data,
  dbCartAttr,
  EasyId,
  countryCode,
  transactionDate,
  storeDetails,
  securityToken,
  appSettings
) => {
  const orderName = data.name;

  const pointsCartAttribute = dbCartAttr.points;
  const pointsCartAttributeValue = pointsCartAttribute
    ? JSON.parse(pointsCartAttribute)
    : null;

  const couponsCartAttribute = dbCartAttr.coupon;
  const couponsCartAttributeValue = couponsCartAttribute
    ? JSON.parse(couponsCartAttribute)
    : null;

  const isEasyRewardsPointsOrder = pointsCartAttributeValue;
  const isEasyRewardsDiscountCouponOrder = couponsCartAttributeValue;

  const giftCardValue = pointsCartAttributeValue
    ? pointsCartAttributeValue.PointValue * 1
    : 0; // 9

  // const discountApplications = data.discount_applications.find(item => item.type == "discount_code")
  const discountApplications = data.discount_codes[0];
  const easyRewardCouponValue = isEasyRewardsPointsOrder ?
    0 : discountApplications
      ? discountApplications.amount * 1
      : 0;

  //cause of double points for order -4982503440575 PointsValueRedeemed=50 and PointsRedeemed=50
  let PointsValueRedeemed = giftCardValue * 1;
  const CouponValueRedeemed = easyRewardCouponValue;
  const PointsRedeemed = pointsCartAttributeValue
    ? pointsCartAttributeValue.PointRedeem
    : "";

  // const discountPrice = data.current_total_discounts/data.line_items.length
  const orderTransactionDetails = await getOrderTransactions(
    data.id,
    storeDetails.AccessToken,
    storeDetails.StoreName
  );
  const giftCardUsed =
    orderTransactionDetails &&
    orderTransactionDetails.transactions.filter(
      (item) => item.gateway == "gift_card"
    );
  const giftCards = giftCardUsed.length > 0 ? giftCardUsed : [];

  // this could be 0
  const totalGiftCardAmount = giftCards
    .map((item) => item.amount * 1)
    .reduce((prev, curr) => prev + curr, 0);

  const getTransactionItems = (valueRedeemed) => {
    return data.line_items.map((item) => {
      const itemTax = item.tax_lines
        .map((tax) => Number(tax.price))
        .reduce((prev, curr) => prev + curr, 0);

      Math.round(
        ((item.quantity * item.price) / data.total_line_items_price +
          Number.EPSILON) *
        100
      ) / 100;
      const discountPercentage =
        (item.quantity * item.price) / data.total_line_items_price;
      const discountPercentageRound =
        Math.round((discountPercentage + Number.EPSILON) * 100) / 100;
      const itemDiscount =
        (valueRedeemed * discountPercentageRound).toFixed(2) * 1;
      const itemDiscountDecimalRound =
        Math.round((itemDiscount + Number.EPSILON) * 100) / 100;

      const conditionalBasedItemTax = appSettings.useTaxSettingsExclProduct ? 0 : itemTax
      //the default value of useTaxSettingsExclProduct is false as most of the times the item tax is included

      const totalPrice = (item.quantity * item.price + conditionalBasedItemTax).toFixed(2) * 1; // adding or removing item Tax here depending upon the App Dashboard Setting:Default is Inclusive
      const billedPrice =
        (totalPrice - itemDiscountDecimalRound).toFixed(2) * 1; //Item discount.

      const unitScriptDisc = (item.total_discount * 1) / item.quantity;
      const unitPrice = item.price * 1;

      return {
        ItemType: "s",
        ItemQty: `${item.quantity}`,
        Unit: `${unitPrice}`, // price for Single Item
        ItemDiscount: `${itemDiscount + unitScriptDisc}`, // calculate based on
        ItemTax: `${itemTax}`,
        TotalPrice: `${totalPrice}`,
        BilledPrice: (billedPrice - unitScriptDisc).toFixed(2),
        Department: "Shopify",
        Category: "NA",
        Group: "NA",
        ItemId: `${item.sku}`,
        RefBillNo: "",
      };
    });
  };
  const transactionsItems = getTransactionItems(
    PointsValueRedeemed + CouponValueRedeemed
  );

  const totalBilledPrice = transactionsItems
    .map((item) => Number(item.BilledPrice))
    .reduce((prev, curr) => prev + curr, 0);

  const shippingPrice = data.shipping_lines
    .map((item) => Number(item.price))
    .reduce((prev, curr) => prev + curr, 0);

  const totalItemBilledPrice = totalBilledPrice.toFixed(2) * 1;
  console.log(
    "===============================> totalItemBilledPrice ",
    totalItemBilledPrice
  );
  console.log("===============================> shippingPrice ", shippingPrice);

  const RedemptionCode = pointsCartAttributeValue
    ? pointsCartAttributeValue.RedemptionCode
    : 0;
  const RequestID = couponsCartAttributeValue
    ? couponsCartAttributeValue.RequestID
    : 0;

  if (
    pointsCartAttributeValue != null ||
    (isEasyRewardsPointsOrder && RedemptionCode != 0)
  ) {
    data.pointsAttribute = pointsCartAttributeValue;
    const confirmEasyPointsRedemption = await ConfirmEasyPointsRedemption(
      data,
      totalItemBilledPrice + shippingPrice,
      RedemptionCode,
      storeDetails,
      EasyId
    );
  }
  if (
    couponsCartAttributeValue != null ||
    (isEasyRewardsDiscountCouponOrder && RequestID != 0)
  ) {
    data.couponAttribute = couponsCartAttributeValue;
    const useCouponResponse = await useCoupon(
      data,
      easyRewardCouponValue,
      RequestID,
      PointsValueRedeemed,
      storeDetails
    );
    console.log("Response useCouponResponse =====>>>>", useCouponResponse);
  }

  const orderDataParams = {
    SecurityToken: securityToken.Token,
    StoreCode: storeDetails.StoreCode,
    TransactionDate: transactionDate,
    PrimaryOrderNumber: orderName,
    BillNo: orderName,
    EasyId: EasyId,
    UserName: storeDetails.UserName2,
    Channel: "Online",
    ShippingCharge: shippingPrice,
    BillValue: (totalItemBilledPrice + shippingPrice).toFixed(2) * 1, // shipping, // can remove last + item
    PointsRedeemed: isEasyRewardsPointsOrder ? PointsRedeemed : "",
    PointsValueRedeemed: isEasyRewardsPointsOrder
      ? PointsValueRedeemed * 1
      : "",
    AllowPointIssuance: "",
    IssuanceOnRedemption: "",
    SKUOfferCode: "",
    PreDelivery: "true",
    CountryCode: countryCode,
    TransactionItems: {
      TransactionItem: transactionsItems,
    },
    PaymentMode: {
      TenderItem: [
        {
          // PG and COD or GiftCard
          TenderCode: "PG",
          TenderID: "",
          TenderValue: (totalItemBilledPrice + shippingPrice).toFixed(2) * 1,
        },
      ],
    },
  };
  return orderDataParams;
};

const wsSearchMember = async (data, ErBaseUrl) => {
  try {
    const response = await axiosRequest(`${ErBaseUrl}/api/SearchMember`, data);
    return response;
  } catch (error) {
    return {
      status: "fail",
      message: error,
    };
  }
};

const wsRegisterEasyAccount = async (data, ErBaseUrl) => {
  try {
    const response = await axiosRequest(
      `${ErBaseUrl}/api/RegisterEasyAccount`,
      data
    );
    return response;
  } catch (error) {
    return { ReturnCode: 500 };
  }
};
const wsGenerateSecurityToken = async (storeInfo) => {
  const ErBaseUrl = storeInfo.ErBaseUrl;
  const data = {
    UserName: storeInfo.UserName, // || "IntegrationProd",
    UserPassword: storeInfo.UserPassword, // || "IntegrationProd123",
    DevId: storeInfo.DevId, // || "4b474ea9-e4ce-4fce-a7a1-74461dafed26",
    AppId: storeInfo.AppId, // || "828236dd-badd-4238-b0e8-a69ac653be1c",
    ProgramCode: storeInfo.ProgramCode, // || "IntegrationProd",
  };
  return axiosRequest(`${ErBaseUrl}/api/GenerateSecurityToken`, data);
};
const formatPhoneNumber = (mobileNo, CountryCode) => {
  let EasyId;
  let arr = mobileNo.split("");
  if (arr.includes(" ")) {
    console.log(arr.includes(" "));
    arr = arr.filter((item) => item != " ");
    mobileNo = arr.join("");
    console.log(arr);
  }
  if (arr.includes("-")) {
    console.log(arr.includes("-"));
    arr = arr.filter((item) => item != "-");
    mobileNo = arr.join("");
    console.log(arr);
  }
  EasyId = mobileNo;
  if (mobileNo.includes(`+${CountryCode}`)) {
    EasyId = mobileNo.split(`+${CountryCode}`)[1];
  }
  console.log("arr =>", arr);
  if (arr[0] == "0") {
    EasyId = arr.slice(1).join("");
  }
  return EasyId;
};
const getOrderTransactions = async (orderId, accessToken, storeName) => {
  var config = {
    method: "get",
    url: `https://${storeName}/admin/orders/${orderId}/transactions.json`,
    headers: {
      "x-Shopify-Access-Token": `${accessToken}`,
    },
  };
  console.log("CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCc", config);
  return axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
      return response.data;
    })
    .catch(function (error) {
      console.log(error);
    });
};

const ConfirmEasyPointsRedemption = async (
  orderData,
  netAmount,
  ParamRedemptionCode,
  storeDetails,
  EasyId
) => {
  const data = orderData;
  const orderName = data.name;
  const securityToken = await wsGenerateSecurityToken(storeDetails);
  const RedemptionCode = data.pointsAttribute.RedemptionCode;
  const OldTransactionCode = data.pointsAttribute.OldTransactionCode;
  if (ParamRedemptionCode == 0) return;
  const confirmEasyPointsParams = {
    EasyId: EasyId,
    SecurityToken: securityToken.Token,
    TransactionCode: OldTransactionCode,
    RedemptionCode: RedemptionCode, //"287148", //This will be the OTP
    UserName: storeDetails.UserName2,
    EOSS: "0",
    NONEOSSAmount: "0",
    NetAmount: "0",
    CountryCode: `${storeDetails.CountryCode}`,
    NewTransactionCode: orderName,
  };
  /*  console.log(
     "confirmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmEasyPointsParams",
     confirmEasyPointsParams
   ); */
  const ErBaseUrl = storeDetails.ErBaseUrl;
  const response = await axiosRequest(
    `${ErBaseUrl}/api/ConfirmEasyPointsRedemption`,
    confirmEasyPointsParams
  );
  /*  console.log(
     "RRRRRRREEEEEEEEEEEEESSSSSSSSSSSSSconfirmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmEasyPointsParams",
     response
   );
  */
  return response;
};

const useCoupon = async (
  orderData,
  couponValue,
  ParamRequestID,
  PointsValueRedeemed,
  storeDetails
) => {
  const data = orderData;
  const orderName = data.name;
  const securityToken = await wsGenerateSecurityToken(storeDetails);
  const requestID = data.couponAttribute.RequestID;
  const discountValue = data.couponAttribute.couponValue;
  const userEnteredCouponCode = data.couponAttribute.TempCouponCode;
  const totalPaidAmount = PointsValueRedeemed
    ? (data.total_price - PointsValueRedeemed).toFixed(2) * 1
    : data.total_price;
  console.log(
    "PARAMRequestID %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%",
    ParamRequestID
  );
  if (ParamRequestID == 0) return;
  const useCouponParams = {
    SecurityToken: securityToken.Token,
    RequestID: requestID,
    BillNo: orderName,
    Discount: couponValue,
    OTP: "",
    TotalPaidAmount: totalPaidAmount,
    CouponCode: userEnteredCouponCode,
    UserName: storeDetails.UserName2,
    CountryCode: storeDetails.CountryCode,
  };
  const ErBaseUrl = storeDetails.ErBaseUrl;

  console.log(
    "useCouponParamssssssssssssssssssssssssssssssssss",
    useCouponParams
  );
  const response = await axiosRequest(
    `${ErBaseUrl}/api/UseCoupon`,
    useCouponParams
  );
  console.log(
    "useCouponRRRRRREEEEEEEEEEESSSSSSSSSSSSPPPPPPPOOONSEEEEE",
    response
  );

  return response;
};


// module.exports = {
//   saveAppSettings,
//   getAppSettings,
//   registerUserInEasyReward,
//   getPointAsTenderSaveSkuParams,
//   getPointAsDiscountSaveSkuParams,
// };
