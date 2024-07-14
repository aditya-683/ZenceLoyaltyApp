import { lookup } from "../service/userProfile.service.js";
import { CatchAsync } from "../utils/catch-async.js";

export const lookupController = CatchAsync(async (req, res, next) => {
  const lookupResponse = await lookup(req);
  return res.send(lookupResponse);
});
