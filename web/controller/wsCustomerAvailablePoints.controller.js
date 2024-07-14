import { wsCustomerAvailablePoints } from "../service/helperFunction.service.js";
import { CatchAsync } from "../utils/catch-async.js";

export const wsCustomerAvailablePointsController = CatchAsync(
  async (req, res, next) => {
    const wsCustomerAvailablePointsResponse = await wsCustomerAvailablePoints(
      req
    );
    console.log(
      "wsCustomerAvailablePointResponse",
      wsCustomerAvailablePointsResponse
    );
    return res.send(wsCustomerAvailablePointsResponse);
  }
);
