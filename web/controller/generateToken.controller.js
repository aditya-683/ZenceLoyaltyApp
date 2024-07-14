import { generateTokenService } from "../service/generateToken.service.js";
import { CatchAsync } from "../utils/catch-async.js";

export const generateTokenController = CatchAsync(async (req, res, next) => {
  const generateTokenControllerResponse = await generateTokenService(req);
  return res.send(generateTokenControllerResponse);
});
