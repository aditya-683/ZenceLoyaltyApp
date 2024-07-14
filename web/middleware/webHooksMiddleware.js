//Middleware
import * as crypto from "crypto";
import {
  CheckUserAndSendDataService,
  UpdateCancelOrderStatusService,
  UpdateOrderStatusService,
  updateRefundOrderStatusService,
} from "../service/order.service.js";
import { Logger } from "../CloudWatch/logger.js";
import { Store } from "../model/store.model.js";

const secret = `${process.env.SHOPIFY_API_SECRET}`;
const webhookValidation = async (req, res, next) => {
  console.log("webhook triggred");
  let digest = crypto
    .createHmac("SHA256", secret)
    .update(req.rawBody, "utf8", "hex")
    .digest("base64");
  //  console.log(ctx.request.rawBody);
  //  console.log("==============================================");
  //  console.log(digest);
  //  console.log("==============================================");
  //  console.log(ctx.request.headers["x-shopify-hmac-sha256"]);
  if (digest === req.headers["x-shopify-hmac-sha256"]) {
    console.log("verified webhook", req);
    return next();
  } else {
    console.log("inside UnVerified webhook");
    return res.sendStatus(403);
  }
};
const formatWebhookRequestBody = async (req, res, next) => {
  const body = req.body.detail.payload;
  const metadata = req.body.detail.metadata;
  const topic = metadata["X-Shopify-Topic"];
  const shop = metadata["X-Shopify-Shop-Domain"];
  const Req = {
    body: body,
    headers: {
      "x-shopify-shop-domain": shop,
    },
  };
  const Res = {
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

  const Next = {};

  switch (topic) {
    case "orders/create":
      console.log("Webhook hit :orders/create");

      CheckUserAndSendDataService(Req, Res, next);

      break;
    case "orders/updated":
      console.log("Webhook hit :orders/updated");

      updateRefundOrderStatusService(Req, Res, next);
      break;

    case "orders/fulfilled":
      console.log("Webhook hit :orders/fulfilled");

      UpdateOrderStatusService(Req, Res, next);

      break;
    case "orders/partially_fulfilled":
      console.log("Webhook hit :orders/partially_fulfilled");
      const storeDetails = await Store.findOne({ StoreName: shop });

      if (!storeDetails) {
        Logger(
          "PartialOrderStatus",
          `Partial Order Status Webhook Returned Due to empty store details
       `
        );

        return;
      }

      if (body?.fulfillment_status && body.fulfillment_status == "partial") {
        UpdateOrderStatusService(Req, Res, next);
      }

      break;

    case "orders/cancelled":
      console.log("Webhook hit :orders/cancelled");
      UpdateCancelOrderStatusService(Req, Res, next);
      break;

    default:
      break;
  }
};
const verifyAWSEvent = async (req, res, next) => {
  console.log("webhook triggred");
  let digest = crypto
    .createHmac("SHA256", secret)
    .update(JSON.stringify(secret), "utf8", "hex")
    .digest("base64");
  // console.log("req-body-payload", req.body.detail.payload);
  console.log("===============digest===============================");
  console.log(digest);
  console.log("================Hmac-SHA256==============================");
  console.log(req.headers["x-shopify-hmac-sha256"]);
  if (digest === req.headers["x-shopify-hmac-sha256"]) {
    console.log("verified webhook");
    await formatWebhookRequestBody(req, res, next);
    return next();
  } else {
    console.log("inside UnVerified webhook");
    return res.sendStatus(403);
  }
};

export { webhookValidation, verifyAWSEvent };
