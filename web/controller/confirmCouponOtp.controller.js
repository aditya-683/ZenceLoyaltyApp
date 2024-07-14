import { confirmCouponOtp } from "../service/helperFunction.service.js";
import { CatchAsync } from "../utils/catch-async.js";

export const confirmCouponOtpController = CatchAsync(async (req, res, next) => {
  const confirmCouponOtpResponse = await confirmCouponOtp(req);
  res.send(confirmCouponOtpResponse);
});
