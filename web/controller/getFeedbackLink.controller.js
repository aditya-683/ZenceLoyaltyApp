import { getFeedBackLink } from "../service/nps.service.js";
import { CatchAsync } from "../utils/catch-async.js";

export const getFeedBackLinkController = CatchAsync(async (req, res, next) => {
  const getFeedBackLinkResponse = await getFeedBackLink(req, res, next);
  return res.send(getFeedBackLinkResponse);
});
