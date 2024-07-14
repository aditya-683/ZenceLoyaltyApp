import { confirmCouponOtp } from "../service/helperFunction.service.js";
import { CatchAsync } from "../utils/catch-async.js";

export const couponOtpController = CatchAsync(async (req, res, next) => {
  const confirmCouponOtpData = await confirmCouponOtp(req, res, next);
  return res.send(confirmCouponOtpData);
});
