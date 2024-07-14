import { multiPassLogin } from "../service/auth.service.js";
import { CatchAsync } from "../utils/catch-async.js";

export const userRegistrationMultiPassController = CatchAsync(
  async (req, res, next) => {
    const multiPassResponse = await multiPassLogin(req);
    return res.send(multiPassResponse);
  }
);
