import axios from "axios";
import { Store } from "../model/store.model.js";
import { AppSetting } from "../model/appSetting.model.js";
import events from "events";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Logger } from "../CloudWatch/logger.js";
import { isEmpty } from "../utils/utility.js";

dotenv.config();

let api_key = process.env.API_VERSION;
const emitter = new events.EventEmitter();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function convertArrayToObject(arr) {
  const result = {};
  for (let i = 0; i < arr.length; i++) {
    const { name, value } = arr[i];
    result[name] = value;
  }
  return result;
}

function removeEventListner(
  storeNameFromWebhook,
  eventId,
  returnReason,
  returnFunnctionName
) {
  try {
    console.log(
      `${returnFunnctionName} returned due to ${returnReason} and removed listener :${eventId}`
    );
    Logger(
      "removeEventListner",
      {
        msg: `${returnFunnctionName} returned due to ${returnReason} and removed listener :${eventId}`,
        store: storeNameFromWebhook,
      },
      __dirname
    );
    emitter.removeAllListeners(eventId);
  } catch (error) {
    Logger(
      "removeEventListner",
      {
        msg: `removeEventListner Error Catched for listener:${eventId}`,
        store: storeNameFromWebhook,
      },
      __dirname,
      error
    );
  }
}

function registerEventListener(store, eventId, ctx, next, cb) {
  try {
    emitter.on(eventId, () => {
      console.log(
        cb.name ? cb.name : "annonymous func",
        `${eventId}-Listener Registered`
      );

      Logger(
        cb.name ? cb.name : "annonymous func",
        {
          msg: `${eventId}-Listener Registered`,
          store: store,
        },
        __dirname
      );

      setTimeout(() => {
        //ading delay so that shopify could get the immediate 200 reponse from us
        cb(req, res, next);
      }, 2000);
    });
  } catch (error) {
    Logger(
      "registerEventListener",
      {
        msg: "registerEventListener Error Catched",
        store: store,
      },
      __dirname,
      error
    );
  }
}

const wsGenerateSecurityToken = async (storeInfo) => {
  const data = {
    UserName: storeInfo.UserName, // || "IntegrationProd",
    UserPassword: storeInfo.UserPassword, // || "IntegrationProd123",
    DevId: storeInfo.DevId, // || "4b474ea9-e4ce-4fce-a7a1-74461dafed26",
    AppId: storeInfo.AppId, // || "828236dd-badd-4238-b0e8-a69ac653be1c",
    ProgramCode: storeInfo.ProgramCode, // || "IntegrationProd",
  };
  return axiosRequest(`${storeInfo.ErBaseUrl}/api/GenerateSecurityToken`, data);
};

export const GetStoreDetails = async (req, res, next) => {
  const data = req.body;
  // console.log("******************-======>>>>>", req);
  // console.log("******************-======>>>>>", req.body);
  const shopNameFromFrontend = data.url;
  // const shopNameFromFrontend = 'dawn201.myshopify.com'
  // console.log("++++++++++++++++++++++++",shopNameFromFrontend);
  // const storeName = dashboardUrl != undefined ? dashboardUrl : (data.split('&').filter(item => item.includes("shop")))[0].split('=')[1]
  console.log(
    "/////////////++++++++++++++++++++++++ storeName==",
    shopNameFromFrontend
  );

  let storeDetails = await Store.findOne({
    StoreName: shopNameFromFrontend,
  });
  let appSettings = await AppSetting.findOne({
    StoreName: shopNameFromFrontend,
    isDeleted: false
  });

  if (!storeDetails) {
    console.log("storeDetails Not Providede");
    return;
  }
  const isActive = await wsGenerateSecurityToken(storeDetails);
  console.log("::::::::::: isActive", isActive);
  // if(isActive.ReturnCode != "0") {
  const storeDetailWithStatus = { ...storeDetails, Status: "InActive" };
  if (isActive?.ReturnCode != "0") {
    storeDetails.Status = "InActive";
    console.log(
      "##########################storeDetails*************",
      storeDetails.Status
    );
    // return ctx.response.body = storeDetailWithStatus
  } else {
    storeDetails.Status = "Active";
  }
  console.log(storeDetails, "storeDetails:::::::::::::::::::::");
  console.log(appSettings, "appSettings:::::::::::::::::::::");
  console.log(
    appSettings?.isAppDisabled,
    "appSettings?.isAppDisabled:::::::::::::::::::::"
  );
  console.log(data, "data:::::::::::::::::::::");
  let response = storeDetails;
  if (data.tag == "fe") {
    response = {
      Modal1: storeDetails.Modal1,
      Modal2: storeDetails.Modal2,
      Modal3: storeDetails.Modal3,
      ModalB: storeDetails.ModalB,
      RedeemButton: storeDetails.RedeemButton,
      Status: storeDetails.Status,
      StoreName: storeDetails.StoreName,
      domainName: storeDetails.domainName,
      CustomCss: storeDetails.CustomCss,
      isAppDisabled: appSettings?.isAppDisabled,
    };
  }
  return res.send(response);
};

export const CheckApiStatus = async (req, res, next) => {
  console.log("CHECK STATUSSSSSSSSSSSSSSSS", req.body);
  // const data = JSON.parse(ctx.request.body)
  const data = req.body;
  console.log(req.body);
  const storeName = data.Shop.split("&")
    .filter((item) => item.includes("shop"))[0]
    .split("=")[1];
  const isActive = await wsGenerateSecurityToken(data);
  console.log(isActive);
  if (isActive?.ReturnCode != "0") {
    console.log("IIIIIIIIIIIIFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF");
    const updateStatus = await Store.findOneAndUpdate(
      { StoreName: storeName },
      { $set: { Status: "InActive" } },
      { new: true }
    );
    return res.status({
      status: 400,
      message: "Incorrect Api Details",
    });
  }
  console.log("____+++++++______++++++++++++ STATUS", data.Status);
  console.log("____+++++++______++++++++++++ storeName", storeName);
  const updatedStoreDetails = await Store.findOneAndUpdate(
    { StoreName: storeName },
    {
      $set: {
        UserName: data.UserName,
        UserPassword: data.UserPassword,
        DevId: data.DevId,
        AppId: data.AppId,
        ProgramCode: data.ProgramCode,
        StoreCode: data.StoreCode,
        ActivityCode: data.ActivityCode,
        UserName2: data.UserName2,
        CountryCode: data.CountryCode,
        DomainName: data.DomainName,
        MultiPassSecret: data.MultiPassSecret,
        ErBaseUrl: data.ErBaseUrl,
        Status: isActive.ReturnCode == "0" ? "Active" : "InActive",
      },
    },
    { new: true }
  );
  console.log(
    "************************** updatedStoreDetails ===>>>",
    updatedStoreDetails
  );
  // ctx.response.body = updatedStoreDetails;
  res.send(updatedStoreDetails);
};

const formatPhoneNumber = (mobileNo, countryCode) => {
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
  if (mobileNo.includes(`+${countryCode}`)) {
    EasyId = mobileNo.split(`+${countryCode}`)[1];
  }
  console.log("arr =>", arr);
  if (arr[0] == "0") {
    EasyId = arr.slice(1).join("");
  }
  return EasyId;
};

export const getAvailableCoupons = async (req) => {
  const data = req.body;
  const storeDetails = await Store.findOne({
    StoreName: data.StoreName,
  });
  if (!storeDetails) {
    return {
      ReturnCode: 500,
      ReturnMessage: "Something Went Wrong!",
    };
  }
  const securityToken = await wsGenerateSecurityToken(storeDetails);
  const availablePointsParams = {
    MobileNumber: data.MobileNumber,
    SecurityToken: securityToken.Token,
    ActivityCode: storeDetails.ActivityCode,
    //StoreCode: storeDetails.StoreCode,
    CouponStatus: data?.CouponStatus || "2",
    UserName: storeDetails.UserName2,
    CountryCode: storeDetails.CountryCode,
  };
  const ErBaseUrl = storeDetails.ErBaseUrl;

  const response = await axiosRequest(
    `${ErBaseUrl}/api/GetAvailableCoupons`,
    availablePointsParams
  );
  //return response
  return response;
};

export const RedeemCoupon = async (req, res, next) => {
  const data = req.body;
  const date = new Date().toString().slice(4, -40).split(" ");
  const currentDate = `${date[1]} ${date[0]} ${date[2]}`;
  const storeDetails = await Store.findOne({
    StoreName: data.StoreName, //from Frontend
  });
  if (!storeDetails) {
    return {
      ReturnCode: 500,
      ReturnMessage: "Something Went Wrong!",
    };
  }
  const securityToken = await wsGenerateSecurityToken(storeDetails);


  console.log("securityToken ", securityToken);

  console.log("data -> ", data);

  const redeemCouponParams = {
    SecurityToken: securityToken.Token,
    MemberID: data.EasyId, // from FrontEnd
    Date: data.Date,
    CouponCode: data.EasyDiscountCoupon, // from Frontend
    StoreCode: storeDetails.StoreCode,
    UserName: storeDetails.UserName2,
    CountryCode: storeDetails.CountryCode,
  };
  console.log(
    "********************************** redeemParams",
    redeemCouponParams
  );
  const ErBaseUrl = storeDetails.ErBaseUrl;

  const response = await axiosRequest(
    `${ErBaseUrl}/api/RedeemCoupon`,
    redeemCouponParams
  );
  console.log(
    "**********************************response redeemParams",
    response
  );

  Logger(
    "RedeemCoupon",
    {
      store: storeDetails.StoreName,
      redeemCouponParams: redeemCouponParams,
      response: response,
    },
    __filename
  );

  return response;
};

export const DiscountConfirmOTP = async (req, res, next) => {
  console.log(
    "CCCCCCOOOOOOOOOONNNNNNNNFFFFFFFFIIIIIIIIIRRRRRMMMMMMMM OOOOOOOOTTTTTTTTTPPPPPPP"
  );
  const data = req.body;
  const date = new Date().toString().slice(4, -40).split(" ");
  const transactionDate = `${date[1]} ${date[0]} ${date[2]}`;
  const storeDetails = await Store.findOne({
    StoreName: data.StoreName,
  });
  const securityToken = await wsGenerateSecurityToken(storeDetails);

  const confirmOtpParams = {
    SecurityToken: securityToken.Token,
    RequestID: data.RequestID,
    MemberID: data.EasyId,
    OTP: data.couponOtp,
    UserName: storeDetails.UserName2,
    CountryCode: storeDetails.CountryCode,
  };

  const ErBaseUrl = storeDetails.ErBaseUrl;

  const response = await axiosRequest(
    `${ErBaseUrl}/api/CouponOTP`,
    confirmOtpParams
  );

  Logger(
    "CouponOTP",
    {
      store: storeDetails.StoreName,
      confirmOtpParams: confirmOtpParams,
      response: response,
    },
    __filename
  );

  const couponData = {
    amount: data.EasyPoints * data.PointRate || 0.5,
    couponCode: data.TransactionCode,
    accessToken: storeDetails.AccessToken,
    EasyPoints: data.EasyPoints,
    PointRate: data.PointRate,
    PointsRedeem: data.PointRedeem,
    accessToken: storeDetails.AccessToken,
    storeName: storeDetails.StoreName,
  };

  // const releseRedemptionData = {...data, SecurityToken: securityToken.Token}
  if (response.ReturnCode == "0") {
    const coupon = await createDiscountCoupon(couponData);
    if (!coupon) {
      return res.send({
        ReturnCode: 400,
        ReturnMessage: "Something Went Wrong !",
      });
    }

    Logger(
      "createDiscountCoupon:If Coupon Exist",
      {
        store: storeDetails.StoreName,
        coupon: coupon,
      },
      __filename
    );

    res.send({
      ReturnCode: "0",
      status: "success",
      code: coupon,
    });
  } else {
    const released = await axiosRequest(
      `${ErBaseUrl}/api/ReleaseRedemptionPoints`,
      releseRedemptionData
    );

    Logger(
      "ReleaseRedemptionPoints",
      {
        store: storeDetails.StoreName,
        releseRedemptionData: releseRedemptionData,
        released: released,
      },
      __filename
    );
    res.send(response);
  }

  Logger(
    "DiscountConfirmOTP",
    {
      store: storeDetails.StoreName,
      couponData: couponData,
      response: response,
    },
    __filename
  );

  return res.send(response);
};
//discount-code

export const wsCustomerAvailablePoints = async (req) => {
  const data = req.body;
  const storeDetails = await Store.findOne({
    StoreName: data.StoreName,
  });
  if (!storeDetails) {
    return {
      ReturnCode: 500,
      ReturnMessage: "Something Went Wrong!",
    };
  }
  console.log("storeDetails ===>>>", storeDetails);
  const securityToken = await wsGenerateSecurityToken(storeDetails);
  const availablePointsParams = {
    EasyId: data.EasyId,
    SecurityToken: securityToken?.Token,
    ActivityCode: storeDetails?.ActivityCode,
    StoreCode: storeDetails?.StoreCode,
    CountryCode: storeDetails?.CountryCode,
  };
  const ErBaseUrl = storeDetails.ErBaseUrl;

  console.log("check customer avaliable Points");
  const response = await axiosRequest(
    `${ErBaseUrl}/api/CustomerAvailablePoints`,
    availablePointsParams
  );
  // ctx.response.body = response;
  return response;
};

export const wsCheckForEasyPointsRedemption = async (req) => {
  console.log(
    "RREEEEEEEEEEEAAAAAAAAAACCCCCCCCCCHHHHHHHHHHHHEEEEEEEEDDDDDDDDDD     hHHHHHHHHHHEEEEEEERRRRREEEEEE"
  );
  const data = req.body;
  const date = new Date().toString().slice(4, -40).split(" ");
  const amount = data.Amount * 1;
  const storeDetails = await Store.findOne({
    StoreName: data.StoreName,
  });
  const securityToken = await wsGenerateSecurityToken(storeDetails);
  if (!storeDetails) {
    return {
      ReturnCode: 500,
      ReturnMessage: "Something Went Wrong!",
    };
  }
  if (amount < data.EasyPoints * data.PointRate) {
    return {
      ReturnCode: 400,
      ReturnMessage: "Point Value Should be Less than Bill Value",
    };
  }
  const checkforRedemptionParams = {
    EasyId: data.EasyId,
    SecurityToken: securityToken.Token,
    TransactionCode: data.TransactionCode, //needs To Replace With Dynamic value,
    RedemptionDate: data.RedemptionDate, // need To Replace with CurrentDate
    Amount: amount, // getting from cart.js
    RedemptionType: "PD", //will always be PD in Our Case
    StoreCode: storeDetails.StoreCode,
    EasyPoints: data.EasyPoints,
    ActivityCode: storeDetails.ActivityCode,
    TransactionDescription: "",
    Activities: "",
    UserName: storeDetails.UserName2,
    CountryCode: storeDetails.CountryCode,
  };
  console.log(
    data,
    "checkforRedemptionParams checkforRedemptionParamscheckforRedemptionParams *(*(*(*(*(*(*(",
    checkforRedemptionParams
  );
  const ErBaseUrl = storeDetails.ErBaseUrl;

  const response = await axiosRequest(
    `${ErBaseUrl}/api/CheckForEasyPointsRedemption`,
    checkforRedemptionParams
  );
  // ctx.response.body = response;
  return response;
};

export const confirmCouponOtp = async (req) => {
  const data = req.body;
  const storeDetails = await Store.findOne({
    StoreName: data.StoreName,
  });
  const securityToken = await wsGenerateSecurityToken(storeDetails);
  const otpData = {
    MemberID: data.EasyId,
    SecurityToken: securityToken.Token,
    StoreCode: storeDetails.StoreCode,
    RequestID: data.RequestID,
    OTP: data.couponOtp,
    UserName: storeDetails.UserName2,
    CountryCode: storeDetails.CountryCode,
  };
  console.log("easyRewardsq1nb0uc6o2 ===>", otpData);
  const ErBaseUrl = storeDetails.ErBaseUrl;

  const response = await axiosRequest(`${ErBaseUrl}/api/CouponOTP`, otpData);

  // const releseRedemptionData = {...data, SecurityToken: securityToken.Token}
  if (response.ReturnCode == "0") {
    console.log("Response", response);
    return {
      ReturnCode: "0",
      ReturnMessage: "success",
      code: response.POSPromo,
    };
  } else {
    // Yet To Implement
    // ctx.response.body = response;
    return response;
  }
};

export const resendCouponOTP = async (req) => {
  const data = req.body;
  console.log("RESEND OTP", data);
  const date = new Date().toString().slice(4, -40).split(" ");
  const transactionDate = `${date[1]} ${date[0]} ${date[2]}`;
  const storeDetails = await Store.findOne({
    StoreName: data.StoreName,
  });
  if (!storeDetails) {
    return {
      ReturnCode: 500,
      ReturnMessage: "Something Went Wrong!",
    };
  }
  const securityToken = await wsGenerateSecurityToken(storeDetails);

  const resendOtpParams = {
    MemberId: data.EasyId,
    SecurityToken: securityToken.Token,
    StoreCode: storeDetails.StoreCode,
    TransactionCode: data.TransactionCode,
    UserName: storeDetails.UserName2 || "vaibhav@easyrewardz.com",
    BillDate: data.BillDate,
    CountryCode: storeDetails.CountryCode,
  };
  console.log(resendOtpParams, "resendOtpParams");
  const ErBaseUrl = storeDetails.ErBaseUrl;

  const response = await axiosRequest(
    `${ErBaseUrl}/api/ResendCouponOTP`,
    resendOtpParams
  );
  console.log(
    "OOOOOOOOOOOTTTTTTTTTTTTPPPPPPPPPP RRRRRRREEEEEEESSSSSS resendOtpParams",
    resendOtpParams
  );
  console.log(
    "OOOOOOOOOOOTTTTTTTTTTTTPPPPPPPPPP RRRRRRREEEEEEESSSSSS",
    response
  );

  return response;
};

export const wsConfirmOTP = async (req) => {
  console.log(
    "CCCCCCOOOOOOOOOONNNNNNNNFFFFFFFFIIIIIIIIIRRRRRMMMMMMMM OOOOOOOOTTTTTTTTTPPPPPPP"
  );
  const data = req.body;
  const date = new Date().toString().slice(4, -40).split(" ");
  const transactionDate = `${date[1]} ${date[0]} ${date[2]}`;
  const storeDetails = await Store.findOne({
    StoreName: data.StoreName,
  });
  const securityToken = await wsGenerateSecurityToken(storeDetails);
  const otpData = {
    EasyId: data.EasyId,
    SecurityToken: securityToken.Token,
    StoreCode: storeDetails.StoreCode,
    TransactionCode: data.TransactionCode,
    SmsCode: data.SmsCode,
    UserName: storeDetails.UserName2,
    TransactionDate: transactionDate,
    CountryCode: storeDetails.CountryCode,
  };
  const ErBaseUrl = storeDetails.ErBaseUrl;

  const response = await axiosRequest(`${ErBaseUrl}/api/ConfirmOTP`, otpData);
  console.log("OTP RESPONSE");
  const couponData = {
    amount: data.PointValue || data.EasyPoints * 1 * (data.PointRate * 1),
    couponCode: data.TransactionCode,
    accessToken: storeDetails.AccessToken,
    EasyPoints: data.EasyPoints,
    PointRate: data.PointRate,
    PointsRedeem: data.PointRedeem,
    accessToken: storeDetails.AccessToken,
    storeName: storeDetails.StoreName,
  };
  console.log("data,", data);
  console.log("couponData,", couponData);
  console.log("StoreDetails", storeDetails);
  // const releseRedemptionData = {...data, SecurityToken: securityToken.Token}
  if (response.ReturnCode == "0") {
    const coupon = await createDiscountCoupon(couponData);
    if (!coupon) {
      return {
        ReturnCode: 400,
        ReturnMessage: "Something Went Wrong !",
      };
    }
    return {
      ReturnCode: "0",
      status: "success",
      code: coupon,
    };
  } else {
    // const released = await axiosRequest(
    //   "https://lpaaswebapi.easyrewardz.com/api/ReleaseRedemptionPoints",
    //   releseRedemptionData
    // );
    // ctx.response.body = response;
    return response;
  }
};

//combinedApp
export const wsConfirmOTPService = async (req) => {
  console.log(
    "CCCCCCOOOOOOOOOONNNNNNNNFFFFFFFFIIIIIIIIIRRRRRMMMMMMMM OOOOOOOOTTTTTTTTTPPPPPPP"
  );
  const data = req.body;
  const date = new Date().toString().slice(4, -40).split(" ");
  const transactionDate = `${date[1]} ${date[0]} ${date[2]}`;

  const storeDetails = await Store.findOne({
    StoreName: data.StoreName,
  });

  if (isEmpty(storeDetails)) {
    return {
      ReturnCode: 400,
      ReturnMessage: "No Store found",
    };
  }

  const isPlusStore = storeDetails?.isPlusStore;
  const isUser = storeDetails?.isUser;

  const securityToken = await wsGenerateSecurityToken(storeDetails);

  const otpData = {
    EasyId: data.EasyId,
    SecurityToken: securityToken.Token,
    StoreCode: storeDetails.StoreCode,
    TransactionCode: data.TransactionCode,
    SmsCode: data.SmsCode,
    UserName: storeDetails.UserName2,
    TransactionDate: data.TransactionDate,
    CountryCode: storeDetails.CountryCode,
  };
  const ErBaseUrl = storeDetails.ErBaseUrl;

  const appSettingsDetail = await AppSetting.findOne({
    StoreName: data?.StoreName,
  });

  if (isEmpty(appSettingsDetail)) {
    return {
      ReturnCode: 400,
      ReturnMessage: "No Store in App Settings",
    };
  }

  const response = await axiosRequest(`${ErBaseUrl}/api/ConfirmOTP`, otpData);
  console.log("OTP RESPONSE");

  // Check The User
  if (appSettingsDetail?.usePointsAsTender) {
    //Plus User
    //check for gift card access token
    if (isEmpty(storeDetails?.AccessToken)) {
      return {
        ReturnCode: 400,
        ReturnMessage: "Invaild gift_card Token",
      };
    }
    const giftCardData = {
      amount: data.EasyPoints * data.PointRate,
      couponCode: data.TransactionCode,
      accessToken: storeDetails.AccessToken,
      EasyPoints: data.EasyPoints,
      PointRate: data.PointRate,
      PointsRedeem: data.PointRedeem,
      storeName: storeDetails.StoreName,
      appAccessToken: storeDetails.AccessToken,
    };
    console.log("data,", data);
    console.log("giftCardData,", giftCardData);
    console.log("StoreDetails", storeDetails);
    // const releseRedemptionData = {...data, SecurityToken: securityToken.Token}
    if (response.ReturnCode == "0") {
      const giftCardResponse = await createGiftCard(giftCardData);
      console.log(
        "CONFORM OTP BLOCK giftCardResponse====>>>>",
        giftCardResponse
      );
      if (!giftCardResponse.code) {
        return {
          ReturnCode: 400,
          ReturnMessage: "Something Went Wrong !",
        };
      }
      return {
        ReturnCode: "0",
        status: "success",
        GiftcardCode: giftCardResponse.code,
        GiftcardId: giftCardResponse.id,
      };
    }
    return response;
  } else {
    // Non Plus User
    const couponData = {
      amount: data.PointValue || data.EasyPoints * 1 * (data.PointRate * 1),
      couponCode: data.TransactionCode,
      accessToken: storeDetails.AccessToken,
      EasyPoints: data.EasyPoints,
      PointRate: data.PointRate,
      PointsRedeem: data.PointRedeem,
      accessToken: storeDetails.AccessToken,
      storeName: storeDetails.StoreName,
    };
    console.log("data,", data);
    console.log("couponData,", couponData);
    console.log("StoreDetails", storeDetails);
    if (response.ReturnCode == "0") {
      const coupon = await createDiscountCoupon(couponData);
      if (!coupon) {
        return {
          ReturnCode: 400,
          ReturnMessage: "Something Went Wrong !",
        };
      }
      return {
        ReturnCode: "0",
        status: "success",
        code: coupon,
      };
    } else {
      return response;
    }
  }
};


export const wsResendOTP = async (req) => {
  const data = req.body;
  console.log("RESEND OTP", data);
  const date = new Date().toString().slice(4, -40).split(" ");
  const transactionDate = `${date[1]} ${date[0]} ${date[2]}`;
  const storeDetails = await Store.findOne({
    StoreName: data.StoreName,
  });
  if (!storeDetails) {
    return {
      ReturnCode: 500,
      ReturnMessage: "Something Went Wrong!",
    };
  }
  const securityToken = await wsGenerateSecurityToken(storeDetails);

  const resendOtpParams = {
    // EasyId: data.EasyId,
    SecurityToken: securityToken.Token,
    StoreCode: storeDetails?.StoreCode || "DummyStore",
    TransactionCode: data?.TransactionCode || "Old003",
    UserName: storeDetails?.UserName2 || "vaibhav@easyrewardz.com",
    BillDate: data?.BillDate,
    CountryCode: storeDetails?.CountryCode,
  };
  const ErBaseUrl = storeDetails?.ErBaseUrl;

  const response = await axiosRequest(
    `${ErBaseUrl}/api/ResendOTP`,
    resendOtpParams
  );
  console.log(
    "OOOOOOOOOOOTTTTTTTTTTTTPPPPPPPPPP RRRRRRREEEEEEESSSSSS resendOtpParams",
    resendOtpParams
  );
  console.log(
    "OOOOOOOOOOOTTTTTTTTTTTTPPPPPPPPPP RRRRRRREEEEEEESSSSSS",
    response
  );
  return response;
};

//this is for only non-plus user
export const wsReleaseRedemptionPoints = async (req) => {
  const data = req.body;
  const date = new Date().toString().slice(4, -40).split(" ");
  const transactionDate = `${date[1]} ${date[0]} ${date[2]}`;
  let storeDetails = await Store.findOne({
    StoreName: data.StoreName,
  });
  const securityToken = await wsGenerateSecurityToken(storeDetails);
  console.log("securityToken ----- ", securityToken);

  const releaseRedemptionParams = {
    EasyId: data.EasyId,
    SecurityToken: securityToken.Token,
    StoreCode: storeDetails.StoreCode,
    TransactionCode: data.TransactionCode,
    UserName: storeDetails.UserName2,
    TransactionDate: transactionDate,
    CountryCode: storeDetails.CountryCode,
  };
  /*
    @params to pass from FrontEnd
      EasyId
      TransactionCode
      StoreCode
  */
  console.log("releaseRedemptionParams", releaseRedemptionParams);
  const ErBaseUrl = storeDetails.ErBaseUrl;

  let response;
  try {
    response = await axiosRequest(
      `${ErBaseUrl}/api/ReleaseRedemptionPoints`,
      releaseRedemptionParams
    );
  } catch (error) {
    console.log("Relese point redemption error-----------", error);
  }

  if (response.ReturnCode == 0) {
    const code = data.CouponCode;
    const AccessToken = storeDetails?.AccessToken;
    await deleteDiscountCode({
      code: code,
      AccessToken: AccessToken,
      StoreName: storeDetails?.StoreName,
    });
  }
  console.log("RESPONSE releaseRedemptionParams ======>>>>>>", response);
  // ctx.response.body = response;
  return response;
};

export const wsReleaseRedemptionPointsService = async (req, res) => {
  const data = req.body;
  const date = new Date().toString().slice(4, -40).split(" ");
  const transactionDate = `${date[1]} ${date[0]} ${date[2]}`;
  let storeDetails = await Store.findOne({
    StoreName: data?.StoreName,
  });

  const isPlusUser = storeDetails?.isPlusStore;
  const isUser = storeDetails?.isUser;

  const securityToken = await wsGenerateSecurityToken(storeDetails);
  console.log("securityToken ----- ", securityToken);

  const releaseRedemptionParams =
    isPlusUser && isUser === "plus"
      ? {
        EasyId: data.EasyId,
        SecurityToken: securityToken.Token,
        StoreCode: storeDetails.StoreCode,
        TransactionCode: data.TransactionCode,
        UserName: storeDetails.UserName2,
        TransactionDate: data.TransactionDate,
        DisableGiftCard: data.DisableGiftCard,
        CountryCode: storeDetails.CountryCode,
      }
      : {
        EasyId: data.EasyId,
        SecurityToken: securityToken.Token,
        StoreCode: storeDetails.StoreCode,
        TransactionCode: data.TransactionCode,
        UserName: storeDetails.UserName2,
        TransactionDate: transactionDate,
        CountryCode: storeDetails.CountryCode,
      };

  console.log("releaseRedemptionParams", releaseRedemptionParams);
  const ErBaseUrl = storeDetails?.ErBaseUrl;

  if (isPlusUser && isUser == "plus") {
    if (!data.GiftcardId) {
      const response = await axiosRequest(
        `${ErBaseUrl}/api/ReleaseRedemptionPoints`,
        releaseRedemptionParams
      );
      console.log("RESPONSE releaseRedemptionParams ======>>>>>>", response);
      return res.send(response);
    }
    /*
    @params to pass from FrontEnd
      EasyId
      TransactionCode
      StoreCode
  */

    var disableGiftcardParams = "";
    var config = {
      method: "post",
      url: `https://${storeDetails.StoreName}/admin/api/2024-01/gift_cards/${data.GiftcardId}/disable.json`,
      headers: {
        "X-Shopify-Access-Token": `${storeDetails.appAccessToken}`,
      },
      data: disableGiftcardParams,
    };

    // const disableGiftcardResponse = await axios(config)
    // console.log(disableGiftcardResponse.status)

    console.log("axios request in disable gift card", config);

    const giftcardDisableResponse = await axios(config)
      .then(function (response) {
        console.log("gift card disable", JSON.stringify(response.data));

        return { ReturnCode: 0 };
        // return res.send(response.data)
      })
      .catch(function (error) {
        console.log("error in releaseRedempiton", error.message);
        console.log(error.response.status);
        return {
          ReturnCode: 456,
          ReturnMessage: "GiftCard can not be disabled. Try Again",
        };
      });

    console.log("IgiftcardDisableResponse =========", giftcardDisableResponse);

    if (giftcardDisableResponse.ReturnCode == 456) {
      console.log("IF BLOCK RAN");
      return giftcardDisableResponse;
    }

    console.log("releaseRedemptionParams", releaseRedemptionParams);

    const response = await axiosRequest(
      `${ErBaseUrl}/api/ReleaseRedemptionPoints`,
      releaseRedemptionParams
    );
    console.log("RESPONSE releaseRedemptionParams ======>>>>>>", response);
    return response;
  } else {
    let response;
    try {
      response = await axiosRequest(
        `${ErBaseUrl}/api/ReleaseRedemptionPoints`,
        releaseRedemptionParams
      );
    } catch (error) {
      console.log("Relese point redemption error-----------", error);
    }

    if (response.ReturnCode == 0) {
      const code = data.CouponCode;
      const AccessToken = storeDetails.AccessToken;
      await deleteDiscountCode({
        code: code,
        AccessToken: AccessToken,
        StoreName: storeDetails.StoreName,
      });
    }
    console.log("RESPONSE releaseRedemptionParams ======>>>>>>", response);
    return response;
  }
};

const deleteDiscountCode = async (data) => {
  /*
  input params {code: "wskjdhkjsdhkjqh", AccessToken:"some access token"}
  */
  const queryData = JSON.stringify({
    query: `{
      codeDiscountNodeByCode(code: "${data.code}") {
        id
      }
    }`,
  });

  const config = {
    method: "post",
    url: `https://${data.StoreName}/admin/api/${api_key}/graphql.json`,
    headers: {
      "x-Shopify-Access-Token": data.AccessToken,
      "Content-Type": "application/json",
    },
    data: queryData,
  };
  const discountResponse = await axios(config);
  const discountResponseData = discountResponse.data;
  const discountCodeId = discountResponseData.data.codeDiscountNodeByCode?.id;

  console.log(discountCodeId);

  const deleteQueryData = JSON.stringify({
    query: `mutation discountCodeDelete($id: ID!) {
          discountCodeDelete(id: $id) {
            deletedCodeDiscountId
            userErrors {
              field
              code
              message
            }
          }
        }`,
    variables: {
      id: `${discountCodeId}`,
    },
  });

  const deleteDiscountConfig = {
    method: "post",
    url: `https://${data.StoreName}/admin/api/${api_key}/graphql.json`,
    headers: {
      "x-Shopify-Access-Token": data.AccessToken,
      "Content-Type": "application/json",
    },
    data: deleteQueryData,
  };
  const deleteDiscountResponse = await axios(deleteDiscountConfig);
  console.log(deleteDiscountResponse.data);
};

export const unblockCoupon = async (req) => {
  const data = req.body;
  let storeDetails = await Store.findOne({
    StoreName: data.StoreName,
  });
  const securityToken = await wsGenerateSecurityToken(storeDetails);
  console.log("securityToken ----- ", securityToken);

  const unblockCouponParams = {
    RequestID: data.RequestID,
    CouponCode: data.CouponCode,
    UserName: storeDetails.UserName2,
    SecurityToken: securityToken.Token,
  };
  /*
    @params to pass from FrontEnd
      EasyId
      TransactionCode
      StoreCode
  */
  const ErBaseUrl = storeDetails.ErBaseUrl;

  console.log("unblockCouponParams", unblockCouponParams);
  const response = await axiosRequest(
    `${ErBaseUrl}/api/UnBlockCoupon`,
    unblockCouponParams
  );
  console.log("RESPONSE unblockCouponParams ======>>>>>>", response);
  return response;
};

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

export const createGiftCard = async (data) => {
  console.log("data in createGiftCard", data);
  const amount =
    data.amount * 1 || data.PointsRedeem * 1 * (data.PointRate * 1);
  const accessToken = data.accessToken;
  const gift_card_access_Token = data?.appAccessToken;
  const StoreName = data?.storeName;
  const uniqueCouponCode = `easyRewards${(Math.random() + 5)
    .toString(36)
    .substring(4)}`;

  // var myHeaders = new Headers();
  // //apply gift_card_access_Token when user create a manual app through app
  // myHeaders.append("X-Shopify-Access-Token", gift_card_access_Token);
  // // myHeaders.append("X-Shopify-Access-Token", accessToken);
  // myHeaders.append("Content-Type", "application/json");

  // var raw = JSON.stringify({
  //   gift_card: {
  //     note: "This gift card is created for easyRewardz point redemption",
  //     initial_value: amount,
  //     code: uniqueCouponCode,
  //     // "template_suffix": null
  //   },
  // });

  var raw = {
    gift_card: {
      note: "This gift card is created for easyRewardz point redemption",
      initial_value: amount,
      code: uniqueCouponCode,
      // "template_suffix": null
    },
  };

  // var requestOptions = {
  //   method: "POST",
  //   headers: myHeaders,
  //   body: raw,
  //   // redirect: 'follow'
  // };
  let headers = {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": gift_card_access_Token,
  };
  return axios({
    method: "post",
    url: `https://${StoreName}/admin/api/${api_key}/gift_cards.json`,
    headers,
    data: raw,
  })
    .then((res) => {
      console.log("response in giftCard", res?.data?.gift_card);
      console.log("response in giftCard", res.data);
      return res?.data.gift_card;
    })
    .catch((err) => {
      console.log("error in giftCard", err);
      return err;
    });
};

const createDiscountCoupon = async (data) => {
  console.log("=========== Inside Discount Function =============");
  console.log(data);
  const amount = data.PointsRedeem * 1 * (data.PointRate * 1);
  const accessToken = data.accessToken;
  const storeName = data.storeName;
  const date = new Date(Date.now() + 1200000);
  const startDate = new Date(Date.now()).toISOString();
  const codeExpiry = date.toISOString();
  //PANKAJ_EXPERIMENT
  //===========================
  //(ORIGINAL)
  // const uniqueCouponCode = `easyRewards${(Math.random() + 5)
  // .toString(36)
  // .substring(7)}`;
  // console.log(`easyRewards${uniqueCouponCode}`);
  //(changed)
  const uniqueCouponCode = `rewards${(Math.random() + 5)
    .toString(36)
    .substring(7)}`;
  //================================
  var data = JSON.stringify({
    query: `mutation MyMutation {
    discountCodeBasicCreate(
      basicCodeDiscount: {
        code: "${uniqueCouponCode}",
        appliesOncePerCustomer: true,
        customerGets: {
          value: { discountAmount: {amount: "${amount}", appliesOnEachItem: false} }, 
          items: { all: true }
        },
        usageLimit: 1,
        title: "${uniqueCouponCode}",
        customerSelection: { all: true },
        startsAt: "${startDate}",
        endsAt: "${codeExpiry}"
      }
    ) {
      codeDiscountNode {
        id
      }
      userErrors {
        code
        extraInfo
        field
        message
      }
    }
  }`,
    variables: {},
  });

  var config = {
    method: "post",
    url: `https://${storeName}/admin/api/2022-01/graphql.json`,
    headers: {
      "x-shopify-access-token": accessToken,
      "Content-Type": "application/json",
      Cookie: "request_method=POST",
    },
    data: data,
  };
  return axios(config)
    .then(function (response) {
      // console.log(response);
      //console.log(JSON.stringify(response.data));
      Logger(
        "createDiscountCoupon",
        {
          storeName: storeName,
          dataSendToGraphQl: data,
          response: response.data,
        },
        __filename
      );

      if (response) {
        console.log("********&&&&&&&&&&&&&&&&", uniqueCouponCode);
        return uniqueCouponCode;
      }
    })
    .catch(function (error) {
      console.log(error);
      Logger(
        "createDiscountCoupon",
        "Error Occured In createDiscountCoupon",
        __filename,
        error
      );
    });
};

export const getShopifyShopDetails = async (req, res, next) => {
  try {
    const shopName = req.query.shopName || req.query.shop;

    if (!shopName) return "Shop is not Provided";
    const storeDetails = await Store.findOne({ StoreName: shopName });
    let res1 = await axios.get(
      `https://${shopName}/admin/api/2022-10/shop.json`,
      {
        headers: {
          "X-Shopify-Access-Token": storeDetails.AccessToken,
        },
      }
    );

    // console.log("res", res1.data)
    return res.send({ domain: res1.data.shop.domain });
  } catch (error) {
    console.log(error);
    return res.send({
      error: error.message || "Couldn't Get the Shopify Shop Details",
    });
  }
};
