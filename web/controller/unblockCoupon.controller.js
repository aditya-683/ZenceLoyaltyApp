import { unblockCoupon } from "../service/helperFunction.service.js";
import { CatchAsync } from "../utils/catch-async.js";

export const unblockCouponController = CatchAsync(async (req, res, next) => {
  const UnblockCouponResponse = await unblockCoupon(req);
  return res.send(UnblockCouponResponse);
});
