import { multiPassLogin } from "../service/auth.service.js";
import { CatchAsync } from "../utils/catch-async.js";

export const userLoginMultipassLogin = CatchAsync(async (req, res, next) => {
  const multiPassLoginData = await multiPassLogin(req);
  return res.send(multiPassLoginData);
});
