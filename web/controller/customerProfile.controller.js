import { customerProfile } from "../service/userProfile.service.js";
import { CatchAsync } from "../utils/catch-async.js";

export const customerProfileController = CatchAsync(async (req, res, next) => {
  const customerProfileResponse = await customerProfile(req);
  res.send(customerProfileResponse);
});
