import { resendCouponOTP } from "../service/helperFunction.service.js";
import { CatchAsync } from "../utils/catch-async.js";

export const resendCouponOtpController = CatchAsync(async (req, res, next) => {
  const resendCouponOtpControllerRes = await resendCouponOTP(req);
  return res.send(resendCouponOtpControllerRes);
});
