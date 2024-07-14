import { getAvailableCoupons } from "../service/helperFunction.service.js";
import { CatchAsync } from "../utils/catch-async.js";

export const getAvailableCouponsController = CatchAsync(
  async (req, res, next) => {
    const getAvailableCouponsResponse = await getAvailableCoupons(req);
    return res.send(getAvailableCouponsResponse);
  }
);
