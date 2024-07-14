import { Store } from "../model/store.model.js";
import { createGiftCard } from "./helperFunction.service.js";

export const createGiftCardService = async (req, res) => {
  const data = req.body;
  const storeDetails = await Store.findOne({ StoreName: data?.StoreName });
  const giftCardData = {
    amount: data.EasyPoints * data.PointRate,
    couponCode: data.TransactionCode,
    accessToken: storeDetails.AccessToken,
    EasyPoints: data.EasyPoints,
    PointRate: data.PointRate,
    PointsRedeem: data.PointRedeem,
    accessToken: storeDetails.AccessToken,
    storeName: storeDetails.StoreName,
    appAccessToken: storeDetails.appAccessToken,
  };

  const giftCardResponse = await createGiftCard(giftCardData);
  if (!giftCardResponse.code) {
    res.send({
      ReturnCode: 400,
      ReturnMessage: "Something Went Wrong !",
    });
  }
  res.send({
    ReturnCode: "0",
    status: "success",
    GiftcardCode: giftCardResponse.code,
    GiftcardId: giftCardResponse.id,
  });
};
