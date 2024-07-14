import { updateAddress } from "../service/userProfile.service.js";
import { CatchAsync } from "../utils/catch-async.js";

export const memberAddressDetailController = CatchAsync(
  async (req, res, next) => {
    const updateAddressResponse = await updateAddress(req, res, next);
    return res.send(updateAddressResponse);
  }
);
