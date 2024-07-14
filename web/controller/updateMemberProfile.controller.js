import { updateMemberProfile } from "../service/userProfile.service.js";
import { CatchAsync } from "../utils/catch-async.js";

export const updateMemberProfileController = CatchAsync(
  async (req, res, next) => {
    const updateMemberProfileResponse = await updateMemberProfile(req);
    return res.send(updateMemberProfileResponse);
  }
);
