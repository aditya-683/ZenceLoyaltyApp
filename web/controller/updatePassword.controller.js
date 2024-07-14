import { updatePassword } from "../service/auth.service.js";
import { CatchAsync } from "../utils/catch-async.js";

export const updatePasswordController = CatchAsync(async (req, res, next) => {
  const updatePasswordResponse = await updatePassword(req);
  return res.send(updatePasswordResponse);
});
