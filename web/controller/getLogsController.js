import { getLogs } from "../service/commonModules.service.js";
import { CatchAsync } from "../utils/catch-async.js";

export const getLogsController = CatchAsync(async (req, res, next) => {
  const getLogsData = await getLogs(req);
  return res.send(getLogsData);
});
