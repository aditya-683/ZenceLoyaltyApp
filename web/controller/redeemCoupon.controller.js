import { RedeemCoupon } from "../service/helperFunction.service.js";
import { CatchAsync } from "../utils/catch-async.js";

export const redeemCouponController = CatchAsync(async (req, res, next) => {
  const redeemCouponResponse = await RedeemCoupon(req);
  return res.send(redeemCouponResponse);
});
