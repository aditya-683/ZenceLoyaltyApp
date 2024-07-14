import { getAddressDetails } from "../service/userProfile.service.js";
import { CatchAsync } from "../utils/catch-async.js";

export const getAddressDetailsController = CatchAsync(
  async (req, res, next) => {
    const getAddressDetailsResponse = await getAddressDetails(req);
    return res.send(getAddressDetailsResponse);
  }
);
