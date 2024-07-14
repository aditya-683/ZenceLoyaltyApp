import {
  wsReleaseRedemptionPoints,
  wsReleaseRedemptionPointsService,
} from "../service/helperFunction.service.js";
import { CatchAsync } from "../utils/catch-async.js";

export const wsReleaseRedemptionPointsController = CatchAsync(
  async (req, res, next) => {
    // const wsReleaseRedemptionPointsResponse =  await wsReleaseRedemptionPoints(req);
    const wsReleaseRedemptionPointsResponse =
      await wsReleaseRedemptionPointsService(req);
    return res.send(wsReleaseRedemptionPointsResponse);
  }
);
