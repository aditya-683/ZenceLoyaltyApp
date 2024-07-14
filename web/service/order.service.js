import { Store } from "../model/store.model.js";
import { CartAttr } from "../model/attribute.model.js";
import { AppSetting } from "../model/appSetting.model.js";
import * as cron from "node-cron";
import events from "events";
import axios from "axios";
import { isEmpty } from "../utils/utility.js";
import {
  registerUserInEasyReward,
  getPointAsTenderSaveSkuParams,
  getPointAsDiscountSaveSkuParams,
} from "./settings.service.js";
import { SkuReconModel } from "../model/skuRecon.model.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Logger } from "../CloudWatch/logger.js";
import {
  unblockCoupon,
  wsReleaseRedemptionPoints,
} from "./helperFunction.service.js";
import { WB_TOPICS } from "../utils/constants.js";

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
    console.log({
      msg: `${returnFunnctionName} returned due to ${returnReason} and removed listener :${eventId}`,
      store: storeNameFromWebhook,
    });
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

function registerEventListener(store, eventId, req, res, next, cb) {
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

const formatPhoneNumber = (mobileNo, countryCode) => {
  let EasyId;
  let arr = mobileNo?.split("");
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

const wsGenerateSecurityToken = async (storeInfo) => {
  if (
    isEmpty(storeInfo.UserName) ||
    isEmpty(storeInfo.UserPassword) ||
    isEmpty(storeInfo.DevId) ||
    isEmpty(storeInfo.ProgramCode)
  ) {
    return;
  }
  const data = {
    UserName: storeInfo.UserName, // || "IntegrationProd",
    UserPassword: storeInfo.UserPassword, // || "IntegrationProd123",
    DevId: storeInfo.DevId, // || "4b474ea9-e4ce-4fce-a7a1-74461dafed26",
    AppId: storeInfo.AppId, // || "828236dd-badd-4238-b0e8-a69ac653be1c",
    ProgramCode: storeInfo.ProgramCode, // || "IntegrationProd",
  };
  console.log("data_from_wsGenerate_SecuritToken", data);

  const axiosRequestResponse = axiosRequest(
    `${storeInfo.ErBaseUrl}/api/GenerateSecurityToken`,
    data
  );

  //   const filter = { _id: mongodb_id };
  //   const apiLogsParmas = {
  //     functionName : "wsGenerateSecurityToken",
  //     method : "POST",
  //     apiEndPoint : "GenerateSecurityToken",
  //     body : data,
  //     response : axiosRequestResponse.data
  // }

  //   const update = { $push: { middlewareApiCalls: apiLogsParmas } };
  //   await ApiLogs.findOneAndUpdate(filter , )

  return axiosRequestResponse;
};

export const GetStoreDetailsService = async (req) => {
  const data = req.body;
  console.log("<<<<<<<<<<<data>>>>>>>>>>>>>>", data)
  const shopNameFromFrontend = data.url || req.query.shop;
  let storeDetails = await Store.findOne({
    StoreName: shopNameFromFrontend,
  });
  let appSettings = await AppSetting.findOne({
    StoreName: shopNameFromFrontend,
    isDeleted: false
  });

  if (isEmpty(storeDetails)) {
    console.log("!storeDetails");
    return;
  }

  const isActive = await wsGenerateSecurityToken(storeDetails);
  // console.log("::::::::::: isActive", isActive);
  // if(isActive.ReturnCode != "0") {
  const storeDetailWithStatus = { ...storeDetails, Status: "InActive" };
  if (isActive?.ReturnCode != "0") {
    storeDetails.Status = "InActive";

    // return res.body = storeDetailWithStatus
  } else {
    storeDetails.Status = "Active";
  }
  /*  console.log(storeDetails, "storeDetails:::::::::::::::::::::");
   console.log(appSettings, "appSettings:::::::::::::::::::::"); */
  /*  console.log(
     appSettings?.isAppDisabled,
     "appSettings?.isAppDisabled:::::::::::::::::::::"
   ); */
  /*  console.log(data, "data:::::::::::::::::::::"); */
  let { AccessToken, giftCardToken, ...response } = storeDetails._doc;

  if (data.tag == "admin") {
    return response;
  }
  else {
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
      jwtToken: storeDetails.jwtToken,
      allowOrigin:storeDetails.allowOrigin
    };

  }
  return response;


  // status_code:200 ,
};

export const CheckApiStatusService = async (req) => {
  console.log("CHECK STATUSSSSSSSSSSSSSSSS", req.body);
  // const data = JSON.parse(req.body)
  const data = req.body;
  console.log("Request Body:", data);
  console.log("Incomming Request Query:", req.query);

  let storeName = (req.query.shop) || (data.Shop.includes("&")
    ? data.Shop.split("&")
      .filter((item) => item.includes("shop"))[0]
      .split("=")[1]
    : (data.Shop));
  const isActive = await wsGenerateSecurityToken(data);
  console.log(isActive);
  storeName = storeName ? storeName : req.query.shop;

  if (isActive?.ReturnCode != "0") {
    console.log("IIIIIIIIIIIIFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF");
    const updateStatus = await Store.findOneAndUpdate(
      { StoreName: storeName },
      { $set: { Status: "InActive" } },
      { new: true }
    );

    return {
      status: 400,
      message: "Incorrect Api Details",
    };
  }

  // console.log("____+++++++______++++++++++++ STATUS", data.Status);
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
  return updatedStoreDetails;
};

export const SaveUiSettingService = async (req) => {
  // console.log(req.query);
  const data = req.body;
  // console.log(data);
  const shopNameFromFrontend = data.url || req.query.shop;
  let storeDetails = await Store.findOne({
    StoreName: shopNameFromFrontend,
  });
  const updatedStoreDetails = await Store.findOneAndUpdate(
    { StoreName: shopNameFromFrontend },
    {
      $set: {
        Modal1: {
          Heading: data.Modal1.Heading,
          CustomMessage: data.Modal1.CustomMessage,
          SubmitButtonText: data.Modal1.SubmitButtonText,
          SubmitButtonColor: data.Modal1.SubmitButtonColor,
          CancelButtonText: data.Modal1.CancelButtonText,
          CancelButtonColor: data.Modal1.CancelButtonColor,
          CustomMessage: data.Modal1.CustomMessage,
          RedeemPointsButtonColor: data.Modal1.RedeemPointsButtonColor,
          RedeemPointsBgColor: data.Modal1.RedeemPointsBgColor,
          RedeemPointsButtonText: data.Modal1.RedeemPointsButtonText,
          ApplyCouponButtonColor: data.Modal1.ApplyCouponButtonColor,
          ApplyCouponButtonText: data.Modal1.ApplyCouponButtonText,
        },
        ModalB: {
          Heading: data.ModalB.Heading,
          CancelButtonText: data.ModalB.CancelButtonText,
          CancelButtonColor: data.ModalB.CancelButtonColor,
        },
        Modal2: {
          Heading: data.Modal2.Heading,
          SubmitButtonText: data.Modal2.SubmitButtonText,
          SubmitButtonColor: data.Modal2.SubmitButtonColor,
          CancelButtonText: data.Modal2.CancelButtonText,
          CancelButtonColor: data.Modal2.CancelButtonColor,
        },
        Modal3: {
          Heading: data.Modal3.Heading,
          SubmitButtonText: data.Modal3.SubmitButtonText,
          SubmitButtonColor: data.Modal3.SubmitButtonColor,
          CancelButtonText: data.Modal3.CancelButtonText,
          CancelButtonColor: data.Modal3.CancelButtonColor,
        },
        RedeemButton: {
          ButtonColor: data.RedeemButton.ButtonColor,
          DomSelector: data.RedeemButton.DomSelector,
        },
        CustomCss: data.CustomCss,
      },
    },
    { new: true }
  );
  // console.log(
  //   "updatedStoreDetails at SaveUiSetting function",
  //   updatedStoreDetails
  // );
  // console.log(data);

  return updatedStoreDetails;
  // res.body = updatedStoreDetails;
};

/**************************************************************  Will be triggerd on order created webhook**************************************************************************************************/
export const CheckUserAndSendDataService = async (req, res, next) => {
  try {
    const check_user_and_send_data = async (req, res, next) => {
      console.log(
        "+++++++++++++++ EXECUTION STARTED ++++++++++++++++++++++++++++++"
      );

      const storeNameFromWebhook = req.headers["x-shopify-shop-domain"];

      let storeDetails = await Store.findOne({
        StoreName: storeNameFromWebhook,
      });

      const appSettings = await AppSetting.findOne({
        StoreName: storeNameFromWebhook,
        isDeleted: false
      });

      console.log("+++++++++++++++ Data +++++++++++++++++++++++++++++ ", req.body);
      Logger(
        "checkUserAndSendData",
        {
          msg: "checkUserAndSendData Started because New Order Created",
          store: req.headers["x-shopify-shop-domain"],
        },
        __dirname
      );
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
        "10": "Oct",
        "11": "Nov",
        "12": "Dec",
      };
      const data = req.body;
      const isEasyRewardsPointsOrder =
        data.note_attributes.length > 0
          ? data.note_attributes.find((item) => item.name == "easyRewardsPoints")
            ?.value == "true"
          : false;

      const isEasyRewardsDiscountCouponOrder =
        data.note_attributes.length > 0
          ? data.note_attributes.find((item) => item.name == "easyRewardsDiscountCoupon")
            ?.value == "true"
          : false;

      console.log("isEasyRewardsDiscountCouponOrder  ", isEasyRewardsDiscountCouponOrder);
      /* call unblock/release point for any non royality data*/
      if (isEasyRewardsDiscountCouponOrder && data.discount_codes.length == 0) {
        const reqObj = {
          body: {
            StoreName: req.headers["x-shopify-shop-domain"],
            RequestID: data.note_attributes.find(
              (item) => item.name == "RequestID"
            ).value,
            CouponCode: data.note_attributes.find(
              (item) => item.name == "TempCouponCode"
            ).value,
          },
        };

        await unblockCoupon(reqObj);
      }
      if (isEasyRewardsPointsOrder) {

        if (!storeDetails.isPlusStore) {
          if (data.discount_codes.length == 0) {
            const reqObj = {
              body: {
                StoreName: req.headers["x-shopify-shop-domain"],
                EasyId: data.note_attributes.find((item) => item.name == "EasyId")
                  .value,
                TransactionCode: data.note_attributes.find(
                  (item) => item.name == "OldTransactionCode"
                ).value,
              },
            };
            await wsReleaseRedemptionPoints(reqObj);
          }
          else {
            let PointsAreUsedInPlusStore = data.note_attributes.find(
              (item) => item.name == "UseedCode"
            ).value
            // if (PointsAreUsedInPlusStore) {
            if (PointsAreUsedInPlusStore) {
              PointsAreUsedInPlusStore = JSON.parse(PointsAreUsedInPlusStore)
              const couponIsUssed = data.discount_codes.find((item) => item.code == PointsAreUsedInPlusStore?.code)
              if (couponIsUssed.length == 0) {
                const reqObj = {
                  body: {
                    StoreName: req.headers["x-shopify-shop-domain"],
                    EasyId: data.note_attributes.find((item) => item.name == "EasyId")
                      .value,
                    TransactionCode: data.note_attributes.find(
                      (item) => item.name == "OldTransactionCode"
                    ).value,
                  },
                };
                await wsReleaseRedemptionPoints(reqObj);
              }
            }

          }
        }
        else {
          let PointsAreUsedInPlusStore = data.note_attributes.find(
            (item) => item.name == "UseedCode"
          ).value
          if (PointsAreUsedInPlusStore) {
            PointsAreUsedInPlusStore = JSON.parse(PointsAreUsedInPlusStore)
            // UseedCode
            console.log(appSettings.usePointsAsTender && PointsAreUsedInPlusStore?.isTender);
            // When store accept tender and tender was true while transection took place.
            if (appSettings.usePointsAsTender && PointsAreUsedInPlusStore?.isTender) {

              // data.transactions
              try {

                let config = {
                  method: 'get',
                  maxBodyLength: Infinity,
                  url: `https://${storeDetails.StoreName}/admin/api/2023-10/orders/${data.id}/transactions.json`,
                  headers: {
                    'X-Shopify-Access-Token': storeDetails?.AccessToken,
                  }
                };

                const TransactionData = await axios.request(config)

                console.log("TransactionData ", TransactionData.data);

                const haveTheGiftCard = TransactionData.data.transactions.filter(el => {
                  return el.gateway == "gift_card" && el.receipt.gift_card_last_characters == PointsAreUsedInPlusStore.slice(-4)
                })

                console.log("haveTheGiftCard ", haveTheGiftCard);
                if (haveTheGiftCard.length == 0) {
                  const reqObj = {
                    body: {
                      StoreName: req.headers["x-shopify-shop-domain"],
                      EasyId: data.note_attributes.find((item) => item.name == "EasyId")
                        .value,
                      TransactionCode: data.note_attributes.find(
                        (item) => item.name == "OldTransactionCode"
                      ).value,
                    },
                  };
                  await wsReleaseRedemptionPoints(reqObj);
                }

              } catch (error) {
                console.error("Not able to get the order transaction. ", error);
              }

            }
            else {
              if (data.discount_codes.length == 0) {
                const reqObj = {
                  body: {
                    StoreName: req.headers["x-shopify-shop-domain"],
                    EasyId: data.note_attributes.find((item) => item.name == "EasyId")
                      .value,
                    TransactionCode: data.note_attributes.find(
                      (item) => item.name == "OldTransactionCode"
                    ).value,
                  },
                };
                await wsReleaseRedemptionPoints(reqObj);
              }
              else {
                const couponIsUssed = data.discount_codes.find((item) => item.code == PointsAreUsedInPlusStore?.code)
                if (couponIsUssed.length == 0) {
                  const reqObj = {
                    body: {
                      StoreName: req.headers["x-shopify-shop-domain"],
                      EasyId: data.note_attributes.find((item) => item.name == "EasyId")
                        .value,
                      TransactionCode: data.note_attributes.find(
                        (item) => item.name == "OldTransactionCode"
                      ).value,
                    },
                  };
                  await wsReleaseRedemptionPoints(reqObj);
                }

              }
            }
          }
        }
      }

      // /admin/api/2023-10/orders/450789469/transactions.json

      /*saving the cart attribute after the order created*/

      if (storeDetails.isPlusStore) {
        //for plus store 
        await CartAttr.updateOne(
          {
            checkoutToken: data.checkout_token,
            StoreName: req.headers["x-shopify-shop-domain"],
          },
          {
            $set: {
              StoreName: req.headers["x-shopify-shop-domain"],
              orderId: data?.id,
              orderName: data?.name,
              checkoutToken: data?.checkout_token,
              cartToken: data?.cart_token,
            },
          },
          { upsert: true }
        );
      } else {
        //for non plus store 
        //update the document if already exist else create new one with checkoutToken specified. it doesn't return new document but saves and update it in mongo.
        await CartAttr.updateOne(
          {
            checkoutToken: data.checkout_token,
            StoreName: req.headers["x-shopify-shop-domain"],
          },
          {
            $set: {
              StoreName: req.headers["x-shopify-shop-domain"],
              orderId: data?.id,
              orderName: data?.name,
              checkoutToken: data?.checkout_token,
              cartToken: data?.cart_token,
              points: isEasyRewardsPointsOrder
                ? JSON.stringify(convertArrayToObject(data.note_attributes))
                : null,
              coupon: isEasyRewardsDiscountCouponOrder
                ? JSON.stringify(convertArrayToObject(data.note_attributes))
                : null,
              phone:
                data.note_attributes.length > 0
                  ? convertArrayToObject(data.note_attributes)["EasyId"]
                  : 0,
            },
          },
          { upsert: true } //The { upsert: true } option tells MongoDB to perform an upsert operation, which means that if no document matches the filter, a new document will be inserted instead of updating an existing document.
        );
      }


      console.log(req.headers["x-shopify-shop-domain"]);


      if (!appSettings.useOrderCreateHook) {
        removeEventListner(
          storeNameFromWebhook,
          `CheckUserAndSendDataCalled-${data.id}`,
          `!appSettings.useOrderCreateHook`,
          "CheckUserAndSendData"
        );
        return res.sendStatus(200);
      }

      if (!data.processed_at) {
        removeEventListner(
          storeNameFromWebhook,
          `CheckUserAndSendDataCalled-${data.id}`,
          "!data.processed_at",
          "CheckUserAndSendData"
        );
        return res.sendStatus(200);
      }
      // console.log("+++++++++++++++ DATA ++++++++++++++++++++++++++++++", data);
      const date = new Date(`${data.processed_at}`)
        .toString()
        .slice(4, -40)
        .split(" ");
      const dateArrayFromProcessed = data.processed_at.split("T")[0].split("-"); // Output Array ["2022", "07", "18"]
      const dateNumber = dateArrayFromProcessed[2];
      const monthNumber = dateArrayFromProcessed[1];
      const monthInErFormat = monthMap[monthNumber];
      const yearNumber = dateArrayFromProcessed[0];
      const transactionDate = `${dateNumber} ${monthInErFormat} ${yearNumber}`;
      console.log("data.customer.phone ======>>", data?.customer?.phone);
      console.log("data.shipping_address ======>>", data?.shipping_address);

      let mobileNo = data.customer.phone || data.shipping_address.phone;

      console.log("shipping_adderss_phone", mobileNo);

      const ErBaseUrl = storeDetails.ErBaseUrl;
      const countryCode = storeDetails.CountryCode;

      // GET PHONE FROM CART ATTRIBUTE
      let EasyId;
      const dbCartAttr = await CartAttr.findOne({
        $and: [
          { checkoutToken: data.checkout_token },
          { StoreName: storeNameFromWebhook },
        ],
      });
      if (!dbCartAttr) {
        removeEventListner(
          storeNameFromWebhook,
          `CheckUserAndSendDataCalled-${data.id}`,
          "!dbCartAttr",
          "CheckUserAndSendData"
        );
        return res.sendStatus(200);
      }
      EasyId = dbCartAttr.phone;

      if (
        !appSettings.usePhoneFromShippingForRegistration &&
        !appSettings.allowGuestRegistrationOnOrderPlace &&
        !appSettings.callSaveSkuForGuestOrders &&
        dbCartAttr.phone == 0
      ) {
        console.log("Guest orders are not allowed from the admin panel");

        Logger(
          "Guest Order Not Allowed",
          {
            "appSettings.usePhoneFromShippingForRegistration":
              appSettings.usePhoneFromShippingForRegistration,
            usePhoneFromShippingForRegistration:
              appSettings.usePhoneFromShippingForRegistration,
            allowGuestRegistrationOnOrderPlace:
              appSettings.callSaveSkuForGuestOrders,
            "dbCartAttr.phone": dbCartAttr.phone,
            store: storeNameFromWebhook,
          },
          __dirname
        );

        removeEventListner(
          storeNameFromWebhook,
          `CheckUserAndSendDataCalled-${data.id}`,
          `!appSettings.usePhoneFromShippingForRegistration`,
          "CheckUserAndSendData"
        );
        return res.sendStatus(200);
      }

      if (
        appSettings.usePhoneFromShippingForRegistration &&
        appSettings.allowGuestRegistrationOnOrderPlace &&
        appSettings.callSaveSkuForGuestOrders &&
        dbCartAttr.phone == 0
      ) {
        EasyId = formatPhoneNumber(mobileNo, countryCode);
        data.EasyId = EasyId;
        const registerUser = registerUserInEasyReward(data, storeDetails);
        console.log("Guest orders are allowed from the admin panel");
        Logger(
          "Guest Order Allowed",
          {
            "appSettings.usePhoneFromShippingForRegistration":
              appSettings.usePhoneFromShippingForRegistration,
            usePhoneFromShippingForRegistration:
              appSettings.usePhoneFromShippingForRegistration,
            allowGuestRegistrationOnOrderPlace:
              appSettings.callSaveSkuForGuestOrders,
            "dbCartAttr.phone": dbCartAttr.phone,
            store: storeNameFromWebhook,
          },
          __dirname
        );
      }
      const addOrderIdInCartAttr = await CartAttr.findOneAndUpdate(
        {
          $and: [
            { checkoutToken: data.checkout_token },
            { StoreName: storeNameFromWebhook },
          ],
        },
        {
          $set: {
            StoreName: storeNameFromWebhook,
            orderId: data.id,
            phone: EasyId,
          },
        },
        { new: true }
      );
      const securityToken = await wsGenerateSecurityToken(storeDetails);
      // console.log("LLLLLLLL", securityToken);
      if (!securityToken.Token) {
        removeEventListner(
          storeNameFromWebhook,
          `CheckUserAndSendDataCalled-${data.id}`,
          `!securityToken.Token`,
          "CheckUserAndSendData"
        );
        return res.sendStatus(200);
      }
      let saveSkuParams;
      if (appSettings.usePointsAsTender) {
        saveSkuParams = await getPointAsTenderSaveSkuParams(
          data,
          dbCartAttr,
          EasyId,
          countryCode,
          transactionDate,
          storeDetails,
          securityToken,
          appSettings
        );
        saveSkuParams.key = "pointAsTender";
      } else {
        saveSkuParams = await getPointAsDiscountSaveSkuParams(
          data,
          dbCartAttr,
          EasyId,
          countryCode,
          transactionDate,
          storeDetails,
          securityToken,
          appSettings
        );
        saveSkuParams.key = "pointAsDiscount";
      }

      Logger(
        "CheckUserAndSendData-saveSkuParams",
        {
          saveSkuParams: saveSkuParams,
          store: storeNameFromWebhook,
        },
        __dirname
      );
      console.log("saveSkuParams  ", saveSkuParams);
      // SEND DATA TO EASYREWARDS ENDPOINT
      //
      const response = await axiosRequest(
        `${ErBaseUrl}/api/SaveSKUBillDetails`,
        saveSkuParams
      );

      console.log("response /api/SaveSKUBillDetails ", response);

      await CartAttr.updateOne(
        {
          $and: [
            { checkoutToken: data.checkout_token },
            { StoreName: storeNameFromWebhook },
          ],
        },
        {
          $set: {
            StoreName: storeNameFromWebhook,
            isSaveSkuSent: true,
            saveSkuResponse: JSON.stringify(response),
          },
        }
      );

      //update the document if already exist else create new one with orderId specified. it doesn't return new document but saves and update it in mongo.
      await SkuReconModel.updateOne(
        { orderId: data.id, StoreName: storeNameFromWebhook },
        {
          $set: {
            StoreName: storeNameFromWebhook,
            orderName: data.name,
            orderId: data.id,
            orderObject: data,
            createdAt: data.created_at,
            updatedAt: data.processed_at,
          },
        },
        { upsert: true } //The { upsert: true } option tells MongoDB to perform an upsert operation, which means that if no document matches the filter, a new document will be inserted instead of updating an existing document.
      );

      await SkuReconModel.updateOne(
        {
          $and: [{ orderId: data.id }, { StoreName: storeNameFromWebhook }],
        },
        {
          $push: {
            apiDescription: {
              webhookTopicHit: WB_TOPICS.ORDERS_CREATE,
              tittle:
                "save sku sent in CheckUserAndSendData when order created",
              url: `${ErBaseUrl}/api/SaveSKUBillDetails`,
              payload: JSON.stringify(saveSkuParams),
              response: JSON.stringify(response),
            },
          },
        }
      );

      Logger(
        "CheckUserAndSendDataCalled-SavSkuCalled-Response",
        {
          res: response,
          store: storeNameFromWebhook,
        },
        __dirname
      );

      //removing the all unique event listener associated with orderId to avoid any collision between concurrent webhook triggers.
      removeEventListner(
        storeNameFromWebhook,
        `CheckUserAndSendDataCalled-${data.id}`,
        `check_user_and_send_data finished`,
        "CheckUserAndSendData"
      );
    };

    //listening the event
    emitter.on(`CheckUserAndSendDataCalled-${req.body.id}`, () => {
      console.log(
        "CheckUserAndSendData: ",
        `CheckUserAndSendDataCalled-${req.body.id}-Listener Registered`
      );
      Logger(
        "CheckUserAndSendData",
        {
          msg: `CheckUserAndSendDataCalled-${req.body.id}-Listener Registered`,
          store: req.headers["x-shopify-shop-domain"],
        },
        __dirname
      );
      setTimeout(() => {
        //ading delay so that shopify could get the immediate 200 reponse from us

        check_user_and_send_data(req, res, next);
      }, 2000);
    });

    //triggering the event
    emitter.emit(`CheckUserAndSendDataCalled-${req.body.id}`);
    return res.sendStatus(200);
  } catch (error) {
    console.log("CheckUserAndSendData: Catched Error:", error);
    removeEventListner(
      req.headers["x-shopify-shop-domain"],
      `CheckUserAndSendDataCalled-${req.body.id}`,
      `Removed Listner Due to Catch error:${error?.message}`,
      "CheckUserAndSendDataCalled"
    );
    Logger(
      "CheckUserAndSendData",
      {
        msg: "CheckUserAndSendData-Catched Error",
        store: req.headers["x-shopify-shop-domain"],
      },
      __dirname,
      error
    );
  }
};

/**************************************************************  Will be triggerd on order fulfilled webhook**************************************************************************************************/
export const UpdateOrderStatusService = async (req, res, next) => {
  try {
    const update_order_status = async (req, res, next) => {
      console.log(
        "UpdateOrderStatus Started because  Order fulfilled triggerd"
      );
      Logger(
        "UpdateOrderStatus",
        {
          msg: "UpdateOrderStatus Started because  Order fulfilled trigged",
          store: req.headers["x-shopify-shop-domain"],
        },
        __dirname
      );
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
      const data = req.body;

      const storeNameFromWebhook = req.headers["x-shopify-shop-domain"];
      const appSettings = await AppSetting.findOne({
        StoreName: storeNameFromWebhook,
        isDeleted: false
      });

      if (!appSettings.useOrderFulfillHook) {
        removeEventListner(
          storeNameFromWebhook,
          `UpdateOrderStatusCalled-${data.id}`,
          `!appSettings.useOrderFulfillHook`,
          "UpdateOrderStatus"
        );
        return res.sendStatus(200);
      }
      const orderName = data.name;
      if (!data.processed_at) {
        removeEventListner(
          storeNameFromWebhook,
          `UpdateOrderStatusCalled-${data.id}`,
          `!data.processed_at`,
          "UpdateOrderStatus"
        );
        return res.sendStatus(200);
      }

      const date = new Date().toString().slice(4, -40).split(" ");
      const currentDate = `${date[1]} ${date[0]} ${date[2]}`;

      const dateArrayFromProcessed = data.processed_at.split("T")[0].split("-"); // Output Array ["2022", "07", "18"]
      const dateNumber = dateArrayFromProcessed[2];
      const monthNumber = dateArrayFromProcessed[1];
      const monthInErFormat = monthMap[monthNumber];
      const yearNumber = dateArrayFromProcessed[0];
      const transactionDate = `${dateNumber} ${monthInErFormat} ${yearNumber}`;

      let EasyId;

      const dbCartAttr = await CartAttr.findOne({
        $and: [
          { checkoutToken: data.checkout_token },
          { StoreName: storeNameFromWebhook },
        ],
      });
      if (!dbCartAttr) {
        removeEventListner(
          storeNameFromWebhook,
          `UpdateOrderStatusCalled-${data.id}`,
          `!dbCartAttr`,
          "UpdateOrderStatus"
        );
        return res.sendStatus(200);
      }
      EasyId = dbCartAttr.phone;

      console.log("EasyId =============>", EasyId);
      if (!EasyId || EasyId == 0) {
        removeEventListner(
          storeNameFromWebhook,
          `UpdateOrderStatusCalled-${data.id}`,
          `!EasyId || EasyId == 0`,
          "UpdateOrderStatus"
        );
        return res.sendStatus(200);
      }

      let storeDetails = await Store.findOne({
        StoreName: storeNameFromWebhook,
      });
      // console.log(data);
      // console.log(storeDetails);
      const CountryCode = storeDetails.CountryCode;
      const ErBaseUrl = storeDetails.ErBaseUrl;

      const securityToken = await wsGenerateSecurityToken(storeDetails);
      // console.log("INSIDE UPDATE LLLLLLLL", securityToken);

      /*  console.log(
         "data.fulfillments????????????????????????????????????????",
         data.fulfillments
       ); */

      /* 
     This below line will executes exclusively when a fulfilled webhook is triggered. 
     To ensure that only the presently fulfilled items are dispatched, 
     excluding those sent earlier, we need to select the latest entry in 
     the fulfillment array. This choice will correspond to the most recent item.
      */
      const fulfillmentIndex = data.fulfillments.length - 1;

      const FulFillmentLineItems = [
        data.fulfillments[fulfillmentIndex],
      ].flatMap((item) => {
        return item.line_items.map((it) => {
          it.custom_name = item.name;
          return it;
        });
      });
      /* console.log(
        "fulfillment????????????????????????????????????????",
        FulFillmentLineItems
      ); */
      const transactionItems = FulFillmentLineItems.map((item, index) => {
        console.log("itemmmm", item.id);
        return {
          InvoiceId: `invoice_${item.id}`,
          ItemStatus:
            item.fulfillment_status === "fulfilled" ||
              item.fulfillment_status === "partial"
              ? "Delivered"
              : item.fulfillment_status,
          Date: `${currentDate}`,
          ItemId: `${item.sku}`,
          ItemQty: `${item.quantity}`, // can be added from Fullfillment too
        };
      });
      /*  console.log(
         "transactionsItems ????????????????????????????????????????",
         transactionItems
       ); */

      if (securityToken.ReturnCode != "0") {
        Logger(
          "UpdateOrderStatus",
          {
            msg: "UpdateOrderStatus returned due securityToken.ReturnCode != 0",
            store: storeNameFromWebhook,
          },
          __dirname
        );

        removeEventListner(
          storeNameFromWebhook,
          `UpdateOrderStatusCalled-${data.id}`,
          `securityToken.ReturnCode != "0"`,
          `UpdateOrderStatus`
        );
        return res.sendStatus(200);
      }

      const updateOrderParams = {
        SecurityToken: securityToken.Token,
        UserName: storeDetails.UserName2,
        StoreCode: storeDetails.StoreCode,
        MemberId: EasyId,
        TransactionDate: transactionDate,
        PrimaryOrderNumber: orderName,
        OrderStatus: "",
        CountryCode: CountryCode,
        TransactionItems: {
          TransactionItem: transactionItems,
        },
      };
      // console.log("updateOrderParams ???????????????", updateOrderParams);
      Logger(
        "UpdateOrderStatusParams",
        {
          updateOrderParams: updateOrderParams,
          store: storeNameFromWebhook,
        },
        __dirname
      );

      // if (data.fulfillment_status) { // check this
      // Send data to end Point
      const response = await axiosRequest(
        `${ErBaseUrl}/api/OrderStatusUpdate`,
        updateOrderParams
      );

      await SkuReconModel.updateOne(
        {
          $and: [{ orderId: data.id }, { StoreName: storeNameFromWebhook }],
        },
        {
          $push: {
            apiDescription: {
              webhookTopicHit: WB_TOPICS.ORDERS_FULFILLED,
              tittle:
                "OrderStatusUpdate sent in UpdateOrderStatus function when order gets FullFilled",
              url: `${ErBaseUrl}/api/OrderStatusUpdate`,
              payload: JSON.stringify(updateOrderParams),
              response: JSON.stringify(response),
            },
          },
        }
      );

      /*   console.log(
          response,
          "RRRRREEEEEEEESSSSSSSSSSPPPPPOOOOOOONNNNNNNNNNSSSSSSSSEEEEEEEEE"
        ); */
      Logger(
        "UpdateOrderStatus-Response",
        {
          response: response,
          store: storeNameFromWebhook,
        },
        __dirname
      );

      removeEventListner(
        storeNameFromWebhook,
        `UpdateOrderStatusCalled-${data.id}`,
        `update_order_status finished`,
        "UpdateOrderStatus"
      );
    };

    emitter.on(`UpdateOrderStatusCalled-${req.body.id}`, () => {
      console.log(`UpdateOrderStatusCalled-${req.body.id}-Listener Registered`);
      Logger(
        "Event Register:",
        {
          msg: `UpdateOrderStatusCalled-${req.body.id}-Listener Registered`,
          store: req.headers["x-shopify-shop-domain"],
        },
        __dirname
      );

      setTimeout(() => {
        update_order_status(req, res, next);
      }, 2000);
    });

    emitter.emit(`UpdateOrderStatusCalled-${req.body.id}`);
    return res.sendStatus(200);
  } catch (error) {
    console.log("UpdateOrderStatus-Catched-Error-", err);
    removeEventListner(
      req.headers["x-shopify-shop-domain"],
      `UpdateOrderStatusCalled-${req.body.id}`,
      `Removed Listner Due to Catch error:${error?.message}`,
      "UpdateOrderStatus"
    );
    Logger(
      "UpdateOrderStatus",
      {
        msg: "UpdateOrderStatus-Catched-Error",
        store: req.headers["x-shopify-shop-domain"],
      },
      __dirname,
      error
    );
  }
};

/**************************************************************  Will be triggerd on order cancelled webhook**************************************************************************************************/

export const UpdateCancelOrderStatusService = async (req, res, next) => {
  try {
    const update_cancel_order_status = async (req, res, next) => {
      const data = req.body;
      const orderName = data.name;
      const storeNameFromWebhook = req.headers["x-shopify-shop-domain"];

      console.log(
        "UpdateCancelOrderStatus Started because Order cancelled got triggered"
      );
      Logger(
        "UpdateCancelOrderStatus",
        {
          msg: "UpdateCancelOrderStatus Started because Order cancelled got triggered",
          store: storeNameFromWebhook,
        },
        __dirname
      );

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

      const appSettings = await AppSetting.findOne({
        StoreName: storeNameFromWebhook,
        isDeleted: false
      });
      if (!appSettings.useOrderCancelHook) {
        removeEventListner(
          storeNameFromWebhook,
          `UpdateCancelOrderStatusCalled-${data.id}`,
          `!appSettings.useOrderCancelHook `,
          "UpdateCancelOrderStatus"
        );
        return res.sendStatus(200);
      }
      if (!data.processed_at) {
        removeEventListner(
          storeNameFromWebhook,
          `UpdateCancelOrderStatusCalled-${data.id}`,
          `!data.processed_at `,
          "UpdateCancelOrderStatus"
        );

        return res.sendStatus(200);
      }

      const date = new Date().toString().slice(4, -40).split(" ");
      const currentDate = `${date[1]} ${date[0]} ${date[2]}`;

      const processedAtDate = new Date(`${data.processed_at}`)
        .toString()
        .slice(4, -40)
        .split(" ");
      const dateArrayFromProcessed = data.processed_at.split("T")[0].split("-"); // Output Array ["2022", "07", "18"]
      const dateNumber = dateArrayFromProcessed[2];
      const monthNumber = dateArrayFromProcessed[1];
      const monthInErFormat = monthMap[monthNumber];
      const yearNumber = dateArrayFromProcessed[0];
      const transactionDate = `${dateNumber} ${monthInErFormat} ${yearNumber}`;

      let EasyId;

      const dbCartAttr = await CartAttr.findOne({
        $and: [
          { checkoutToken: data.checkout_token },
          { StoreName: storeNameFromWebhook },
        ],
      });
      if (!dbCartAttr) {
        removeEventListner(
          storeNameFromWebhook,
          `UpdateCancelOrderStatusCalled-${data.id}`,
          `!dbCartAttr `,
          "UpdateCancelOrderStatus"
        );
        return res.sendStatus(200);
      }
      EasyId = dbCartAttr.phone;

      console.log(__filename, "EasyId =============>", EasyId);
      if (!EasyId || EasyId == 0) {
        removeEventListner(
          storeNameFromWebhook,
          `UpdateCancelOrderStatusCalled-${data.id}`,
          `!EasyId || EasyId == 0 `,
          "UpdateCancelOrderStatus"
        );
        return res.sendStatus(200);
      }

      let storeDetails = await Store.findOne({
        StoreName: storeNameFromWebhook,
      });

      const CountryCode = storeDetails.CountryCode;
      const ErBaseUrl = storeDetails.ErBaseUrl;

      const securityToken = await wsGenerateSecurityToken(storeDetails);

      const canceledLineItems = data.refunds.flatMap(
        (it) => it.refund_line_items
      );
      /*  console.log(
         "data.fulfillments????????????????????????????????????????",
         data.fulfillments
       );
       console.log(
         "fulfillment????????????????????????????????????????",
         canceledLineItems
       ); */
      const transactionItems = canceledLineItems.map((item) => {
        // console.log("itemmmm", item.id);
        return {
          InvoiceId: `invoice_${item.line_item.id}`,
          ItemStatus: "Cancelled",
          Date: `${currentDate}`,
          ItemId: `${item.line_item.sku}`,
          ItemQty: `${item.quantity}`, // can be added from Fullfillment too
        };
      });
      /* console.log(
        "transactionsItems ????????????????????????????????????????",
        transactionItems
      ); */

      Logger(
        "UpdateCancelOrderStatus-transactionsItems",
        {
          msg: transactionItems,
          store: storeNameFromWebhook,
        },
        __dirname
      );
      if (securityToken.ReturnCode != "0") {
        removeEventListner(
          storeNameFromWebhook,
          `UpdateCancelOrderStatusCalled-${data.id}`,
          `securityToken.ReturnCode != "0" `,
          "UpdateCancelOrderStatus"
        );
        return;
      }
      const updateOrderParams = {
        SecurityToken: securityToken.Token,
        UserName: storeDetails.UserName2,
        StoreCode: storeDetails.StoreCode,
        MemberId: EasyId,
        TransactionDate: transactionDate,
        PrimaryOrderNumber: orderName,
        OrderStatus: "",
        CountryCode: CountryCode,
        TransactionItems: {
          TransactionItem: transactionItems,
        },
      };

      Logger(
        "UpdateCancelOrderStatus-updateOrderParams",
        {
          updateOrderParams: updateOrderParams,
          store: storeNameFromWebhook,
        },
        __dirname
      );

      // Send data to end Point
      const response = await axiosRequest(
        `${ErBaseUrl}/api/OrderStatusUpdate`,
        updateOrderParams
      );

      await SkuReconModel.updateOne(
        {
          $and: [{ orderId: data.id }, { StoreName: storeNameFromWebhook }],
        },
        {
          $push: {
            apiDescription: {
              webhookTopicHit: WB_TOPICS.ORDERS_CANCELLED,
              tittle:
                "OrderStatusUpdate sent in UpdateCancelOrderStatus function when order gets Cancelled",
              url: `${ErBaseUrl}/api/OrderStatusUpdate`,
              payload: JSON.stringify(updateOrderParams),
              response: JSON.stringify(response),
            },
          },
        }
      );

      /*  console.log(
         response,
         "RRRRREEEEEEEESSSSSSSSSSPPPPPOOOOOOONNNNNNNNNNSSSSSSSSEEEEEEEEE"
       ); */
      Logger(
        "UpdateCancelOrderStatus-OrderStatusUpdate-API-Response",
        {
          msg: response,
          store: storeNameFromWebhook,
        },
        __dirname
      );

      removeEventListner(
        storeNameFromWebhook,
        `UpdateCancelOrderStatusCalled-${data.id}`,
        `update_cancel_order_status finished `,
        "UpdateCancelOrderStatus"
      );
    };

    emitter.on(`UpdateCancelOrderStatusCalled-${req.body.id}`, () => {
      Logger(
        "UpdateCancelOrderStatus-Listener",
        {
          msg: `update_cancel_order_status-${req.body.id}-Listener Registered`,
          store: req.headers["x-shopify-shop-domain"],
        },
        __dirname
      );

      /*  console.log(
         `update_cancel_order_status-${req.body.id}-Listener Registered`
       ); */

      setTimeout(() => {
        update_cancel_order_status(req, res, next);
      }, 2000);
    });

    emitter.emit(`UpdateCancelOrderStatusCalled-${req.body.id}`);
    return res.sendStatus(200);
  } catch (error) {
    console.log("UpdateCancelOrderStatus catched error: ", error);
    removeEventListner(
      req.headers["x-shopify-shop-domain"],
      `UpdateCancelOrderStatusCalled-${req.body.id}`,
      `Removed Listner Due to Catch error:${error?.message}`,
      "UpdateCancelOrderStatusCalled"
    );

    Logger(
      "UpdateCancelOrderStatus",
      {
        msg: "UpdateCancelOrderStatus-Catched-Error",
        store: req.headers["x-shopify-shop-domain"],
      },
      __dirname,
      error
    );
  }
};

/**************************************************************  Will be triggerd on Order Updated webhook**************************************************************************************************/

export const updateRefundOrderStatusService = async (req, res, next) => {
  try {
    const update_refund_order_status = async (req, res, next) => {
      console.log(
        "updateRefundOrderStatus called because order update got triggered"
      );
      Logger(
        "updateRefundOrderStatus",
        {
          msg: "updateRefundOrderStatus called because order update got triggered",
          store: req.headers["x-shopify-shop-domain"],
        },
        __dirname
      );

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
        "10": "Oct",
        "11": "Nov",
        "12": "Dec",
      };
      const data = req.body;
      const orderName = data.name;
      const storeNameFromWebhook = req.headers["x-shopify-shop-domain"];
      let storeDetails = await Store.findOne({
        StoreName: storeNameFromWebhook,
      });

      /*saving the cart attribute after order updated
      because sometimes the order updated gets called before
      order created. 
      NOTE:both are called whenever order is created
      */

      const isEasyRewardsPointsOrder =
        data.note_attributes.length > 0
          ? data.note_attributes.find((item) => item.name == "OrderTypeId")
            ?.value == "easyRewardsPoints"
          : false;

      const isEasyRewardsDiscountCouponOrder =
        data.note_attributes.length > 0
          ? data.note_attributes.find((item) => item.name == "OrderTypeId")
            ?.value == "easyRewardsDiscountCoupon"
          : false;


      if (storeDetails.isPlusStore) {
        /*update the document if already exist else create new one with checkoutToken specified. 
             it doesn't return new document but saves and update it in mongo.*/
        await CartAttr.updateOne(
          {
            checkoutToken: data.checkout_token,
            StoreName: storeNameFromWebhook,
          },
          {
            $set: {
              StoreName: storeNameFromWebhook,
              orderId: data?.id,
              orderName: data?.name,
              checkoutToken: data?.checkout_token,
              cartToken: data?.cart_token,
            },
          },
          { upsert: true } //The { upsert: true } option tells MongoDB to perform an upsert operation, which means that if no document matches the filter, a new document will be inserted instead of updating an existing document.
        );
      } else {

        await CartAttr.updateOne(
          {
            checkoutToken: data.checkout_token,
            StoreName: storeNameFromWebhook,
          },
          {
            $set: {
              StoreName: storeNameFromWebhook,
              orderId: data?.id,
              orderName: data?.name,
              checkoutToken: data?.checkout_token,
              cartToken: data?.cart_token,
              points: isEasyRewardsPointsOrder
                ? JSON.stringify(convertArrayToObject(data.note_attributes))
                : null,
              coupon: isEasyRewardsDiscountCouponOrder
                ? JSON.stringify(convertArrayToObject(data.note_attributes))
                : null,
            },
          },
          { upsert: true }
        );
      }


      const appSettings = await AppSetting.findOne({
        StoreName: storeNameFromWebhook,
        isDeleted: false
      });
      if (!appSettings.useOrderReturnHook) {
        removeEventListner(
          storeNameFromWebhook,
          `updateRefundOrderStatusCalled-${data.id}`,
          `!appSettings.useOrderReturnHook`,
          "updateRefundOrderStatus"
        );
        return res.sendStatus(200);
      }
      const date = new Date().toString().slice(4, -40).split(" ");
      const currentDate = `${date[1]} ${date[0]} ${date[2]}`;
      if (!data.processed_at) {
        removeEventListner(
          storeNameFromWebhook,
          `updateRefundOrderStatusCalled-${data.id}`,
          `!data.processed_at`,
          "updateRefundOrderStatus"
        );
        return res.sendStatus(200);
      }

      const processedAtDate = new Date(`${data.processed_at}`)
        .toString()
        .slice(4, -40)
        .split(" ");
      const dateArrayFromProcessed = data.processed_at.split("T")[0].split("-"); // Output Array ["2022", "07", "18"]
      const dateNumber = dateArrayFromProcessed[2];
      const monthNumber = dateArrayFromProcessed[1];
      const monthInErFormat = monthMap[monthNumber];
      const yearNumber = dateArrayFromProcessed[0];
      const transactionDate = `${dateNumber} ${monthInErFormat} ${yearNumber}`;

      let EasyId;

      const dbCartAttr = await CartAttr.findOne({
        $and: [
          { checkoutToken: data.checkout_token },
          { StoreName: storeNameFromWebhook },
        ],
      });
      if (!dbCartAttr) {
        removeEventListner(
          storeNameFromWebhook,
          `updateRefundOrderStatusCalled-${data.id}`,
          `!dbCartAttr`,
          "updateRefundOrderStatus"
        );
        return res.sendStatus(200);
      }
      EasyId = dbCartAttr.phone;

      console.log(__filename, "EasyId =============>", EasyId);
      if (!EasyId || EasyId == 0) {
        removeEventListner(
          storeNameFromWebhook,
          `updateRefundOrderStatusCalled-${data.id}`,
          `!EasyId || EasyId == 0`,
          "updateRefundOrderStatus"
        );

        return res.sendStatus(200);
      }


      const CountryCode = storeDetails.CountryCode;
      const ErBaseUrl = storeDetails.ErBaseUrl;

      const securityToken = await wsGenerateSecurityToken(storeDetails);
      if (!(data.refunds.length > 0)) {
        removeEventListner(
          storeNameFromWebhook,
          `updateRefundOrderStatusCalled-${data.id}`,
          `!(data.refunds.length > 0)`,
          "updateRefundOrderStatus"
        );
        return res.sendStatus(200);
      }
      const refundsIndex = data.refunds.length - 1;
      // const returnedLineItems = data.refunds[refundsIndex].flatMap(it => it.refund_line_items)

      let transactionItems = data.refunds[refundsIndex].refund_line_items.map(
        (item, index) => {
          return {
            InvoiceId: `invoice_${item.line_item.id}`,
            ItemStatus: "Returned",
            Date: `${currentDate}`,
            ItemId: `${item.line_item.sku}`,
            ItemQty: `${item.quantity}`, // can be added from Fullfillment too
          };
        }
      );
      /*  console.log(
         "returnedItems, ===========================>>>>>",
         transactionItems
       ); */

      Logger(
        "updateRefundOrderStatus-returned Transaction Items",
        {
          msg: transactionItems,
          store: storeNameFromWebhook,
        },
        __dirname
      );
      if (securityToken.ReturnCode != "0") {
        removeEventListner(
          storeNameFromWebhook,
          `updateRefundOrderStatusCalled-${data.id}`,
          `securityToken.ReturnCode != "0"`,
          "updateRefundOrderStatus"
        );
        const res_object = {
          status: 500,
          message: "Error:Something Went Wrong Please Try Again",
          data: null,
        };

        return res.send(res_object);
      }

      const skuReconObj = await SkuReconModel.findOne({ orderId: data.id });

      //just return where there is an order cancelled webhook hit for a particular order
      //because cancellation will be handled by Order Cancelled webhook
      //but since the on cancellation a refun was created that's why
      //this webhook got triggered but we do not need to send another
      //update to ER as it would have already been sent in cancellation webhook.

      const foundAlreadyExistingCanceledOrderStatus =
        skuReconObj.apiDescription.filter(
          (item) => item.webhookTopicHit == WB_TOPICS.ORDERS_CANCELLED
        );

      if (!isEmpty(foundAlreadyExistingCanceledOrderStatus)) {
        removeEventListner(
          storeNameFromWebhook,
          `updateRefundOrderStatusCalled-${data.id}`,
          `Order Has Already Been Cancelled:${foundAlreadyExistingCanceledOrderStatus.map(
            (it) => JSON.parse(it.payload)
          )}`,
          "updateRefundOrderStatus"
        );

        return res.sendStatus(200);
      }

      const foundAlreadyExistingRefundStatus =
        skuReconObj.apiDescription.filter(
          (item) => item.webhookTopicHit == WB_TOPICS.ORDERS_UPDATED
        );
      if (skuReconObj && foundAlreadyExistingRefundStatus.length > 0) {
        const allPayloadCombined = foundAlreadyExistingRefundStatus.map((it) =>
          JSON.parse(it.payload)
        );

        //if the current refund item is greater then all the other previous refund item
        //
        const areAlreadySentToER = allPayloadCombined.every(
          (payload) =>
            new Date(data.refunds[refundsIndex].processed_at).getTime() >
            new Date(payload.processed_at).getTime()
        );
        if (!areAlreadySentToER) {
          let allTransactionItemsCombined = allPayloadCombined.map(
            (it) => it.TransactionItems.TransactionItem
          );
          const tobeExcludedInvoiceIds = allTransactionItemsCombined
            .flatMap((it) => it)
            .map((it) => it.InvoiceId);
          transactionItems = transactionItems.filter(
            (item) => !tobeExcludedInvoiceIds.includes(item.InvoiceId)
          );
        }
      }
      if (transactionItems.length < 1) {
        removeEventListner(
          storeNameFromWebhook,
          `updateRefundOrderStatusCalled-${data.id}`,
          `No TransactionItems:${transactionItems}`,
          "updateRefundOrderStatus"
        );

        return res.sendStatus(200);
      }

      const updateOrderParams = {
        SecurityToken: securityToken.Token,
        UserName: storeDetails.UserName2 || "vaibhav@easyrewardz.com",
        StoreCode: storeDetails.StoreCode || "DummyStore",
        MemberId: EasyId,
        TransactionDate: transactionDate,
        PrimaryOrderNumber: orderName,
        OrderStatus: "",
        CountryCode: CountryCode,
        TransactionItems: {
          TransactionItem: transactionItems,
        },
      };

      Logger(
        "updateRefundOrderStatus-transactionItems updateOrderParam",
        {
          msg: updateOrderParams,
          store: storeNameFromWebhook,
        },
        __dirname
      );

      const response = await axiosRequest(
        `${ErBaseUrl}/api/OrderStatusUpdate`,
        updateOrderParams
      );

      //update the document if already exist else create new one with orderId specified. it doesn't return new document but saves and update it in mongo.
      await SkuReconModel.updateOne(
        { orderId: data.id, StoreName: storeNameFromWebhook },
        {
          $set: {
            StoreName: storeNameFromWebhook,
            orderName: data.name,
            orderId: data.id,
            orderObject: data,
            createdAt: data.created_at,
            updatedAt: data.processed_at,
          },
        },
        { upsert: true } //The { upsert: true } option tells MongoDB to perform an upsert operation, which means that if no document matches the filter, a new document will be inserted instead of updating an existing document.
      );

      updateOrderParams.processed_at = data.refunds[refundsIndex].processed_at; // used to check duplicated refund

      await SkuReconModel.updateOne(
        {
          $and: [{ orderId: data.id }, { StoreName: storeNameFromWebhook }],
        },
        {
          $push: {
            apiDescription: {
              webhookTopicHit: WB_TOPICS.ORDERS_UPDATED,
              tittle:
                "OrderStatusUpdate sent in updateRefundOrderStatus function when order gets updated",
              url: `${ErBaseUrl}/api/OrderStatusUpdate`,
              payload: JSON.stringify(updateOrderParams),
              response: JSON.stringify(response),
            },
          },
        }
      );

      /*  console.log(
         "updateRefundOrderStatusCalled-called-OrderStatusUpdate-Response",
         response
       ); */
      Logger(
        "updateRefundOrderStatus-OrderStatusUpdate-API-Response",
        {
          msg: response,
          store: storeNameFromWebhook,
        },
        __dirname
      );

      removeEventListner(
        storeNameFromWebhook,
        `updateRefundOrderStatusCalled-${data.id}`,
        `update_refund_order_status finished`,
        "updateRefundOrderStatus"
      );
    };

    emitter.on(`updateRefundOrderStatusCalled-${req.body.id}`, () => {
      /*   console.log(
          `update_refund_order_status-${req.body.id}-Listener Registered`
        ); */
      Logger(
        "updateRefundOrderStatus-Listener",
        {
          msg: `update_refund_order_status-${req.body.id}-Listener Registered`,
          store: req.headers["x-shopify-shop-domain"],
        },
        __dirname
      );

      setTimeout(() => {
        update_refund_order_status(req, res, next);
      }, 4000);
    });

    emitter.emit(`updateRefundOrderStatusCalled-${req.body.id}`);
    // return {status : 200};
    return res.sendStatus(200);
  } catch (error) {
    console.log("updateRefundOrderStatus Catched Error : ", error);
    removeEventListner(
      req.headers["x-shopify-shop-domain"],
      `updateRefundOrderStatusCalled-${req.body.id}`,
      `removed Listener Due to Catch Error:${error?.message}`,
      "updateRefundOrderStatus"
    );
    Logger(
      "updateRefundOrderStatus",
      {
        msg: "updateRefundOrderStatus-Catched-Error",
        store: req.headers["x-shopify-shop-domain"],
      },
      __filename,
      error
    );
  }
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
    Logger(
      "axiosRequest",
      {
        msg: "axiosRequest-Catched-Error",
        method: "POST",
        headers,
        url: url,
        data: data,
      },
      __filename,
      err
    );
  }
};
