import { wsResendOTP } from "../service/helperFunction.service.js";
import { CatchAsync } from "../utils/catch-async.js";

export const wsResendOTPController = CatchAsync(async (req, res, next) => {
  const wsResendOTPResponse = await wsResendOTP(req);
  return res.send(wsResendOTPResponse);
});
