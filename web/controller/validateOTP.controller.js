import { validateOtp } from "../service/auth.service.js";
import { CatchAsync } from "../utils/catch-async.js";

export const validateOTPController = CatchAsync(async (req, res, next) => {
  const validateOTPResponse = await validateOtp(req);
  return res.send(validateOTPResponse);
});
