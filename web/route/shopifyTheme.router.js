import { Router } from "express";
import {
  getShopifyThemeByIdConstroller,
  getShopifyThemeConstroller,
} from "../controller/shopifyTheme.controller.js";
import verify from "../middleware/proxyVerifyMiddleware.js";
import { getShopifyShopDetails } from "../service/helperFunction.service.js";
const themeRouter = Router();
themeRouter.get("/api/getShopfiyTheme", verify, getShopifyThemeConstroller);
themeRouter.get("/api/getTheme", verify, getShopifyThemeByIdConstroller);
themeRouter.get("/api/getShopifyShopDetails", verify, getShopifyShopDetails);
export default themeRouter;
