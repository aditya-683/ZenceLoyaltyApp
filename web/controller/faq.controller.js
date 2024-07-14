import { getFaqService, postFaqService } from "../service/faq.service.js";
import { CatchAsync } from "../utils/catch-async.js";

export const postFaqController = CatchAsync(async (req, res, next) => {
  const response = await postFaqService(req);
  // console.log("response in postFaqController ::",postFaqController);
  return res.send(response.error ? error : response.data);
});

export const getFaqController = CatchAsync(async (req, res, next) => {
  const response = await getFaqService(req);
  return res.send(response.error ? error : response.data);
});
