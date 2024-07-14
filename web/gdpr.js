import { DeliveryMethod } from "@shopify/shopify-api";
import {
  CheckUserAndSendDataService,
  UpdateCancelOrderStatusService,
  UpdateOrderStatusService,
  updateRefundOrderStatusService,
} from "./service/order.service.js";
import { Store } from "./model/store.model.js";
import shopify from "./shopify.js";
import { isEmpty } from "./utils/utility.js";
import axios from "axios";
import { CartAttr } from "./model/attribute.model.js";
import { AppSetting } from "./model/appSetting.model.js";
import { FtpSettings } from "./model/ftpSettings.modal.js";
import { StoreDetails } from "./model/storeDetails.model.js";
import { SkuReconModel } from "./model/skuRecon.model.js";


import events from "events";

const emitter = new events.EventEmitter();


/**
 * @type {{[key: string]: import("@shopify/shopify-api").WebhookHandler}}
 */

const WEBHOOK_URL = process.env.AWS_EVENT_BRIDGE;

export default {
  /**
   * Customers can request their data from a store owner. When this happens,
   * Shopify invokes this webhook.
   *
   * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#customers-data_request
   */
  APP_UNINSTALLED: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      console.log("App UnInstallation Got Triggered");

      const deleteStoreDetails = await Store.findOneAndDelete({
        StoreName: shop,
      });
      const session = await shopify.config.sessionStorage.findSessionsByShop(
        shop
      );

      await CartAttr.updateMany(
        {
          StoreName: shop,
        },
        {
          $set: {
            isDeleted: true,
          },
        }
      );

      await StoreDetails.updateMany(
        {
          storeName: shop,
        },
        {
          $set: {
            unInstalled: true,
          },
        }
      );

      await AppSetting.deleteMany({ StoreName: shop });

      await FtpSettings.updateMany(
        {
          StoreName: shop,
        },
        {
          $set: {
            isDeleted: true,
          },
        }
      );

      if (!isEmpty(session)) {
        const deletAllSessionPromise = session.map((sess) =>
          shopify.config.sessionStorage.deleteSession(sess.id)
        );
        await Promise.all(deletAllSessionPromise);
      }
    },
  },
  CUSTOMERS_DATA_REQUEST: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      console.log(topic, shop);
      const payload = JSON.parse(body);
      console.log("customers_data_request =======>", payload);
    },
  },
  CUSTOMERS_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      console.log("customers_redact ======>", payload);
    },
  },

  /**
   * 48 hours after a store owner uninstalls your app, Shopify invokes this
   * webhook.
   *
   * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#shop-redact
   */
  SHOP_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      console.log("shop_redact ==============>", payload);
    },
  },

  ////.................................. OUR WEBHOOKS ..........................................////////

  ORDERS_CREATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      console.log("order_create_webhooks ===========>", payload);
      const req = {
        body: payload,
        headers: {
          "x-shopify-shop-domain": shop,
        },
      };
      const res = {
        sendStatus: (status) => {
          console.log(`${topic}::${shop}::${status}`);
        },
        send: (data) => {
          console.log(`${topic}::${shop}::${data}`);
        },
        status: (status) => {
          console.log(`${topic}::${shop}::${status}`);
        },
      };

      const next = {};
      CheckUserAndSendDataService(req, res, next);
    },
  },

  // ORDERS_CREATE: {
  //   deliveryMethod: DeliveryMethod.EventBridge,
  //   arn: WEBHOOK_URL,

  // },
  ORDERS_UPDATED: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      console.log("order_update_webhooks ===========>", payload);

      const req = {
        body: payload,
        headers: {
          "x-shopify-shop-domain": shop,
        },
      };
      const res = {
        sendStatus: (status) => {
          console.log(`${topic}::${shop}::${status}`);
        },
        send: (data) => {
          console.log(`${topic}::${shop}::${data}`);
        },
        status: (status) => {
          console.log(`${topic}::${shop}::${status}`);
        },
      };

      const next = {};
      updateRefundOrderStatusService(req, res, next);
    },
  },
  // ORDERS_UPDATED: {
  //   deliveryMethod: DeliveryMethod.EventBridge,
  //   arn: WEBHOOK_URL,
  // },

  ORDERS_FULFILLED: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      console.log("order_fulfilled_webhooks ===========>", payload);

      const req = {
        body: payload,
        headers: {
          "x-shopify-shop-domain": shop,
        },
      };
      const res = {
        sendStatus: (status) => {
          console.log(`${topic}::${shop}::${status}`);
        },
        send: (data) => {
          console.log(`${topic}::${shop}::${data}`);
        },
        status: (status) => {
          console.log(`${topic}::${shop}::${status}`);
        },
      };

      const next = {};
      UpdateOrderStatusService(req, res, next);
    },
  },

  // ORDERS_FULFILLED: {
  //   deliveryMethod: DeliveryMethod.EventBridge,
  //   arn: WEBHOOK_URL,
  // },

  ORDERS_PARTIALLY_FULFILLED: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      console.log(
        "order_ ORDERS_PARTIALLY_FULFILLED_webhooks ===========>",
        payload
      );
      const storeDetails = await Store.findOne({ StoreName: shop });
      if (!storeDetails) return;

      /* This will be used to handle partial fullfillment orders
     ,& comparing it with "partial" will help  us to avoid duplicated calld for 
      each FULfillment create as this webhook will also get triggered whenever
      all the items inside the order gets fullfilled.
      */
      if (
        payload?.fulfillment_status &&
        payload.fulfillment_status == "partial"
      ) {
        const req = {
          body: payload,
          headers: {
            "x-shopify-shop-domain": shop,
          },
        };

        const res = {
          sendStatus: (status) => {
            console.log(`${topic}::${shop}::${status}`);
          },
          send: (data) => {
            console.log(`${topic}::${shop}::${data}`);
          },
          status: (status) => {
            console.log(`${topic}::${shop}::${status}`);
          },
        };

        const next = {};
        UpdateOrderStatusService(req, res, next);
      }
    },
  },

  // ORDERS_PARTIALLY_FULFILLED: {
  //   deliveryMethod: DeliveryMethod.EventBridge,
  //   arn: WEBHOOK_URL,
  // },
  ORDERS_CANCELLED: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      console.log("order_cancelled_webhooks ===========>==", payload);

      const req = {
        body: payload,
        headers: {
          "x-shopify-shop-domain": shop,
        },
      };
      const res = {
        sendStatus: (status) => {
          console.log(`${topic}::${shop}::${status}`);
        },
        send: (data) => {
          console.log(`${topic}::${shop}::${data}`);
        },
        status: (status) => {
          console.log(`${topic}::${shop}::${status}`);
        },
      };
      const next = {};
      UpdateCancelOrderStatusService(req, res, next);
    },
  },

  // ORDERS_CANCELLED: {
  //   deliveryMethod: DeliveryMethod.EventBridge,
  //   arn: WEBHOOK_URL,
  // },


  REFUNDS_CREATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      console.log("-------- topic -----  ", topic);
      console.log("payload ", payload);
      await update_refund_order_status(payload, shop)

    }
  }
};

const update_refund_order_status = async (body, shop, next) => {

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
  const data = body;
  // const orderName = data.name//u
  console.log("Shop ", shop);
  const storeNameFromWebhook = shop;
  const appSettings = await AppSetting.findOne({
    StoreName: storeNameFromWebhook,
  });

  console.log("appSettings ", appSettings);


  if (!appSettings.useOrderReturnHook) {
    removeEventListner(
      `updateRefundOrderStatusCalled-${data.id}`,
      `!appSettings.useOrderReturnHook=${!appSettings.useOrderReturnHook}`,
      "updateRefundOrderStatus"
    );
    console.log("Line 352 ");
  }

  console.log("update_refund_order_status:2");

  const date = new Date().toString().slice(4, -40).split(" ");
  const currentDate = `${date[1]} ${date[0]} ${date[2]}`;
  if (!data.processed_at) {
    removeEventListner(
      `updateRefundOrderStatusCalled-${data.id}`,
      `!data.processed_at=${!data.processed_at}`,
      "updateRefundOrderStatus"
    );
    console.log("Line 365 ");
  }
  console.log("update_refund_order_status-3");

  let EasyId;

  const dbCartAttr = await CartAttr.findOne({
    orderId: data.order_id,
  });

  console.log("update_refund_order_status-4");

  if (!dbCartAttr) {
    removeEventListner(
      `updateRefundOrderStatusCalled-${data.id}`,
      `!dbCartAttr=${!dbCartAttr}`,
      "updateRefundOrderStatus"
    );
    console.log("Line 383 ");
  }
  EasyId = dbCartAttr.phone;

  console.log("EasyId =============>", EasyId);
  if (!EasyId || EasyId == 0) {
    removeEventListner(
      `updateRefundOrderStatusCalled-${data.id}`,
      `!EasyId || EasyId == 0 and EasyId is =${EasyId}`,
      "updateRefundOrderStatus"
    );

    console.log("Line 395 ");

  }

  //// this code is commented because the data that is recieved in this function
  //// come from orderRefund and it only contains refund LineItems
  //// so if we updateSKU Recon here it will save OrderData as refundLineItems which is inCorrect

  let storeDetails = await Store.findOne({
    StoreName: storeNameFromWebhook,
  });
  const CountryCode = storeDetails.CountryCode;
  const ErBaseUrl = storeDetails.ErBaseUrl;

  const skuReconOrder = await SkuReconModel.findOne({
    orderId: data.order_id,
  });
  const fullOrderData = skuReconOrder?.orderObject[0];
  console.log("RETURN    SKUUU RECOOONNNN FROMM DB", fullOrderData);
  console.log(
    "RETURN    SKUUU RECOOONNNN FROMM DB skuReconOrder skuReconOrder ===>>> ",
    skuReconOrder
  );
  console.log("RETURN    SKUUU RECOOONNNN FROMM DB");

  const processedAtDate = new Date(`${fullOrderData.created_at}`)
    .toString()
    .slice(4, -40)
    .split(" ");

  /*const dateArrayFromProcessed = fullOrderData.created_at
    .split("T")[0]
    .split("-"); // Output Array ["2022", "07", "18"]*/

  //transaction date should be current date as per goColors in case of return
  const dateArrayFromProcessed = new Date()
    .toISOString()
    .split("T")[0]
    .split("-"); // Output Array ["2022", "07", "18"]

  const dateNumber = dateArrayFromProcessed[2];
  const monthNumber = dateArrayFromProcessed[1];
  const monthInErFormat = monthMap[monthNumber];
  const yearNumber = dateArrayFromProcessed[0];
  const transactionDate = `${dateNumber} ${monthInErFormat} ${yearNumber}`;

  const securityToken = await wsGenerateSecurityToken(storeDetails);

  if (securityToken.ReturnCode != "0") {
    removeEventListner(
      `updateRefundOrderStatusCalled-${data.id}`,
      `securityToken.ReturnCode != "0"`,
      "updateRefundOrderStatus"
    );

    console.log("Line 450 ");
  }

  if (!(data.refund_line_items.length > 0)) {
    removeEventListner(
      `updateRefundOrderStatusCalled-${data.id}`,
      `!(data.refund_line_items.length > 0)`,
      "updateRefundOrderStatus"
    );
    console.log("Line 459 ");
  }

  /*TODO:
  1.pick up only refund lineItems
  2.separate cancelled and return item from above array based on fulfillment status
  3.if fulfillment_status=null then cancel || if fulfilled then it is return item
  4. various fulfillment_status:fulfilled,unfulfilled,partial,scheduled,on hold
  */

  const refundLineItems = data.refund_line_items.flatMap(
    /*the actual returned items qty is available at top level obj
    here replacing it with qty inside the line-item , also the restock-type is "return" for any fulfilled item
    and restock-type="cancel" for any cancel item(available at top-level obj not in line_items arry)
    */
    (it) => {
      let modifiedLineItem = it.line_item;
      modifiedLineItem.quantity = it.quantity;
      return modifiedLineItem;
    }
  );

  const canceledLineItems = refundLineItems.filter(
    (it) => it.fulfillment_status === null
  );

  /*if refund webhook data.lineItems.id is in fulfilment lineitems id array then this is returned line items
  const returnedLineitems = data.line_items.filter((it) => {
    if (fulFillmentLineItems.includes(it.id)) return it;
  });
  */
  //if it is not in fulfillment line item array then this canceled order

  const returnedItems = refundLineItems.filter(
    /*here the partial is the status when any item in order get partially fulfilled means
    only some qty of an item within single order gets fulfilled*/
    (lineItem) =>
      lineItem.fulfillment_status === "fulfilled" ||
      lineItem.fulfillment_status === "partial"
  );

  //const refundLineItems=[t-shirt,shirt];
  let transactionItems = [];

  if (returnedItems.length > 0) {
    // need to call saveSku instead of orderUpdate for goColors
    const countryCode = storeDetails.CountryCode;
    // const fullOrderData = skuReconOrder.orderObject[0]

    // let saveSkuParams = await getPointAsTenderSaveSkuParams(fullOrderData, dbCartAttr, EasyId, countryCode, transactionDate, storeDetails, securityToken, 'r')

    console.log("RETURNED_ORDER SAVE SKU CALL");
    // console.log("RETURNED_ORDER SAVE SKU CALL", response);
    try {
      const saveSkuParams = await myCustomPayloadPointAsTenderSaveSkuParams(
        fullOrderData,
        dbCartAttr,
        EasyId,
        countryCode,
        transactionDate,
        storeDetails,
        securityToken,
        returnedItems,
        data.id
      );

      saveSkuParams.key = "pointAsTender";

      console.log(
        "updateRefundOrderStatus-saveSkuParams-payload",
        saveSkuParams
      );

      const response = await axiosRequest(
        `${ErBaseUrl}/api/SaveSKUBillDetails`,
        saveSkuParams
      );

      console.log(
        "updateRefundOrderStatus-SaveSKUBillDetails-Response",
        response
      );

    } catch (error) {
      console.log(error);
    }
    console.log("Line 545");


    /*need to consider when one item is refunded and one item is canceled
       then cancelled items array and refund items both will be non null*/
  }

  if (canceledLineItems.length > 0) {
    const CancelTransactionItems = canceledLineItems.map((item) => {
      console.log("itemmmm", item.id);
      return {
        InvoiceId: `invoice_${item.id}`,
        ItemStatus: "Cancelled",
        Date: `${currentDate}`,
        ItemId: `${item.sku}`,
        ItemQty: `${item.quantity}`, // can be added from Fullfillment too
      };
    });


    transactionItems = [...transactionItems, ...CancelTransactionItems]; //only creating the single array of object [ { value: 1 }, { value: 2 }, { value: 3 }, { value: 4 } ]
  }
  console.log(
    "UpdateRefundOrderStatus-transactionItems, ===========================>>>>>",
    transactionItems
  );

  const updateOrderParams = {
    SecurityToken: securityToken.Token,
    UserName: storeDetails.UserName2,
    StoreCode: storeDetails.StoreCode,
    MemberId: EasyId,
    TransactionDate: transactionDate,
    PrimaryOrderNumber: dbCartAttr.orderName,
    OrderStatus: "",
    CountryCode: CountryCode,
    TransactionItems: {
      TransactionItem: transactionItems,
    },
  };

  const response = await axiosRequest(
    `${ErBaseUrl}/api/OrderStatusUpdate`,
    updateOrderParams
  );

  console.log(
    response,
    "RRRRREEEEEEEESSSSSSSSSSPPPPPOOOOOOONNNNNNNNNNSSSSSSSSEEEEEEEEE"
  );

  removeEventListner(
    `updateRefundOrderStatusCalled-${data.id}`,
    `update_refund_order_status finished`,
    `updateRefundOrder`
  );
};

const myCustomPayloadPointAsTenderSaveSkuParams = async (
  data,
  dbCartAttr,
  EasyId,
  countryCode,
  transactionDate,
  storeDetails,
  securityToken,
  returnItemArr,
  CurrentRefundId
) => {
  //same login for all the calculatioons
  //

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
    ? pointsCartAttributeValue.PointsValue * 1
    : 0; // 9

  const discountApplications = data.discount_codes[0];
  const easyRewardCouponValue = discountApplications
    ? discountApplications.amount * 1
    : 0;

  let PointsValueRedeemed = giftCardValue * 1;
  const CouponValueRedeemed = easyRewardCouponValue;
  const PointsRedeemed = pointsCartAttributeValue
    ? pointsCartAttributeValue.PointsQty
    : "";
  const storeName = storeDetails.StoreName;

  // const discountPrice = data.current_total_discounts/data.line_items.length
  const orderTransactionDetails = await getOrderTransactions(
    data.id,
    storeDetails.AccessToken,
    storeName
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

    return returnItemArr.map((item) => {
      let payload;

      const itemTax = item.tax_lines
        .map((tax) => Number(tax.price))
        .reduce((prev, curr) => prev + curr, 0);
      console.log("===============================> itemTax ", itemTax);
      const itemDiscount =
        item.discount_allocations.length > 0
          ? item.discount_allocations[0].amount * 1
          : 0;
      console.log(
        "===============================> itemDiscount ",
        itemDiscount
      );

      const singleLineItemQuantity = item.quantity * 1;
      const singleUnitTax = itemTax > 0 ? itemTax / singleLineItemQuantity : 0;
      const singleUnitPrice = (item.price - singleUnitTax).toFixed(2) * 1;
      const totalPrice = (item.quantity * item.price).toFixed(2) * 1; // Substracting item Tax here Because Tax in Incl. in Product Price
      console.log("===============================> totalPrice ", totalPrice);

      const billedPrice = (totalPrice - itemDiscount).toFixed(2) * 1; //Item discount.
      console.log("===============================> billedPrice ", billedPrice);

      payload = {
        ItemType: "r",
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
        RefBillNo: orderName,
      };

      return payload;
    });
  };

  const getQtyLevelTransactionItems = (valueRedeemed) => {
    /* this will create the transaction items for each qty in an order
    for example line_items=[{item1,qty:2},{item2,qty:1}]
    
    const transactionItems=[{item1-qty1,item1-qty2,item2-qty1}]
    so if there are total 2+1=3 qty in a single order of two line_items we need to 
    send an array of 3 objects as transaction items.
    */
    return returnItemArr.map((item) => {
      let payload;

      let qtyLevelPayload = [];

      for (let qty = 1; qty <= item.quantity; qty++) {
        const itemTax = item.tax_lines
          .map((tax) => Number(tax.price))
          .reduce((prev, curr) => prev + curr, 0);
        console.log("===============================> itemTax ", itemTax);
        const itemDiscount =
          item.discount_allocations.length > 0
            ? item.discount_allocations[0].amount * 1
            : 0;
        console.log(
          "===============================> itemDiscount ",
          itemDiscount
        );

        const singleLineItemQuantity = item.quantity * 1;
        const singleUnitTax = itemTax > 0 ? itemTax / singleLineItemQuantity : 0;
        const singleUnitPrice = (item.price - singleUnitTax).toFixed(2) * 1;
        const totalPrice = (item.quantity * item.price).toFixed(2) * 1; // Substracting item Tax here Because Tax in Incl. in Product Price
        console.log("===============================> totalPrice ", totalPrice);

        const billedPrice = (totalPrice - itemDiscount).toFixed(2) * 1; //Item discount.
        console.log("===============================> billedPrice ", billedPrice);

        payload = {
          ItemType: "r",
          ItemQty: `${1}`,
          Unit: `${singleUnitPrice}`, // price for Single Item
          ItemDiscount: `${roundOff(itemDiscount / item.quantity)}`, // calculate based on
          ItemTax: `${roundOff(itemTax / item.quantity)}`,
          TotalPrice: `${roundOff(totalPrice / item.quantity)}`,
          BilledPrice: `${roundOff(billedPrice / item.quantity)}`,
          Department: "Shopify",
          Category: "NA",
          Group: "NA",
          ItemId: `${item.sku}`,
          RefBillNo: orderName,
        };

        qtyLevelPayload.push(payload);
      }
      return [...qtyLevelPayload];
    });


  }


  const transactionsItems = getTransactionItems(
    PointsValueRedeemed + CouponValueRedeemed
  );

  const qtyLevelTransactionItems = getQtyLevelTransactionItems(PointsValueRedeemed + CouponValueRedeemed).flatMap(item => item);//using flatMap to create array of objects from [[{o1q1,o1q2}],[{o2q1,o2q2}]]

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
      pointsCartAttributeValue,
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

  console.log("returnItemArr ", returnItemArr.length);

  // let returnId = returnItemArr[0].id

  const gcTenderAmount =
    totalGiftCardAmount > 0 ? totalGiftCardAmount - PointsValueRedeemed : 0;
  const pgTenderAmount =
    totalItemBilledPrice + shippingPrice - totalGiftCardAmount;
  const pointsTender = PointsValueRedeemed;
  const curretTimeInMillis = new Date().getTime();
  const orderDataParams = {
    SecurityToken: securityToken.Token,
    StoreCode: storeDetails.StoreCode,
    TransactionDate: transactionDate, //transaction date should be current date as per goColors in case of return
    PrimaryOrderNumber: `R_${orderName}-${CurrentRefundId}`,

    BillNo: `R_${orderName}-${CurrentRefundId}`,

    EasyId: EasyId,
    UserName: storeDetails.UserName2,
    Channel: "Online",
    ShippingCharge: shippingPrice,
    BillValue: `-${totalItemBilledPrice + shippingPrice}`,
    PointsRedeemed: "",
    PointsValueRedeemed: "",
    AllowPointIssuance: "",
    IssuanceOnRedemption: "",
    SKUOfferCode: "",
    PreDelivery: "",
    CountryCode: countryCode,
    TransactionItems: {
      TransactionItem: qtyLevelTransactionItems,
    },
    PaymentMode: {},
  };
  return orderDataParams;
};


function removeEventListner(eventId, returnReason, returnFunnctionName) {
  try {
    console.log(
      `${returnFunnctionName} returned due to ${returnReason} and removed listener :${eventId}`
    );
    emitter.removeAllListeners(eventId);
  } catch (error) {
    console.log("Error ", error);
  }
}

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


const getOrderTransactions = async (orderId, accessToken, storeName) => {
  var config = {
    method: "get",
    url: `https://${storeName}/admin/api/2024-01/orders/${orderId}/transactions.json`,
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

const roundOff = (num) => {
  try {
    return Number(num).toFixed(2) * 1;

  } catch (error) {
    console.log("roundOff:error catched", {
      num: num
    }, __filename, error)
  }
}

const ConfirmEasyPointsRedemption = async (
  pointsCartAttributeValue,
  orderData,
  netAmount,
  ParamRedemptionCode,
  storeDetails,
  EasyId
) => {
  const data = orderData;
  const orderName = data.name;
  const securityToken = await wsGenerateSecurityToken(storeDetails);
  const RedemptionCode =
    pointsCartAttributeValue?.RedemptionCode ||
    pointsCartAttributeValue?.RedemptionCode;
  const OldTransactionCode =
    data.pointsAttribute.OldTransactionCode ||
    pointsCartAttributeValue?.OldTransactionCode;
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
  console.log(
    "confirmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmEasyPointsParams",
    confirmEasyPointsParams
  );
  const ErBaseUrl = storeDetails.ErBaseUrl;
  const response = await axiosRequest(
    `${ErBaseUrl}/api/ConfirmEasyPointsRedemption`,
    confirmEasyPointsParams
  );
  console.log(
    "RRRRRRREEEEEEEEEEEEESSSSSSSSSSSSSconfirmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmEasyPointsParams",
    response
  );

  return response;
};