import {
  wsConfirmOTP,
  wsConfirmOTPService,
} from "../service/helperFunction.service.js";
import { CatchAsync } from "../utils/catch-async.js";

export const wsConfirmOTPController = CatchAsync(async (req, res, next) => {
  // const wsConfirmOTPData =  await wsConfirmOTP(req);
  //combinedApp
  const combinedAppWsConfirmOTPDataResponse = await wsConfirmOTPService(req);
  return res.send(combinedAppWsConfirmOTPDataResponse);
});
