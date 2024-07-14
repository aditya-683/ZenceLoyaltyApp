import { getCustomerDetails } from "../service/auth.service.js";
import { CatchAsync } from "../utils/catch-async.js";

export const easyCustomerDetailsController = CatchAsync(
  async (req, res, next) => {
    const getCustomerDetailsResponse = await getCustomerDetails(req, res);
    return res.send(getCustomerDetailsResponse);
  }
);
