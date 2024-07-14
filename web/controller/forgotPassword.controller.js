import { forgotPassword } from "../service/auth.service.js";
import { CatchAsync } from "../utils/catch-async.js";

export const forgetPasswordController = CatchAsync(async (req, res, next) => {
  const forgotPasswordResponse = await forgotPassword(req);
  return res.send(forgotPasswordResponse);
});
