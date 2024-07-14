import { generateOtp } from "../service/auth.service.js";
import { CatchAsync } from "../utils/catch-async.js";

export const generateOTPController = CatchAsync(async (req, res, next) => {
  const generateOtpDataResponse = await generateOtp(req);
  return res.send(generateOtpDataResponse);
});
