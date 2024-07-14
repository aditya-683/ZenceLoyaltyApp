import { wsCheckForEasyPointsRedemption } from "../service/helperFunction.service.js";
import { CatchAsync } from "../utils/catch-async.js";

export const wsCheckForEasyPointsRedemptionController = CatchAsync(
  async (req, res, next) => {
    const wsCheckForEasyPointsRedemptionResponse =
      await wsCheckForEasyPointsRedemption(req);
    return res.send(wsCheckForEasyPointsRedemptionResponse);
  }
);
