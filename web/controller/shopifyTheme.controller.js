import {
  getShopifyThemeService,
  getThemebyId,
} from "../service/theme.service.js";
import { CatchAsync } from "../utils/catch-async.js";

export const getShopifyThemeConstroller = CatchAsync(async (req, res) => {
  const themeServiceResponse = await getShopifyThemeService(req.query);
  return res.send(themeServiceResponse);
});

export const getShopifyThemeByIdConstroller = CatchAsync(async (req, res) => {
  const themeServiceResponse = await getThemebyId(req);
  return res.send(themeServiceResponse);
});
