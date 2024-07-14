import { getCustomerTransactionDetails } from "../service/userProfile.service.js";
import { CatchAsync } from "../utils/catch-async.js";

export const GetCustomerTransactionDetailsController = CatchAsync(
  async (req, res, next) => {
    const getCustomerTransactionDetailsResponse =
      await getCustomerTransactionDetails(req);
    return res.send(getCustomerTransactionDetailsResponse);
  }
);
