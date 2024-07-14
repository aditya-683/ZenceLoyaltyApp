import { Router } from "express"
import { verifyjwt } from '../middleware/middleware.js';
import { getAppSettingsController, saveAppSettingsController } from "../controller/settings.controller.js"
import verify from "../middleware/proxyVerifyMiddleware.js";

const settingsRouter = Router()

settingsRouter.patch("/api/saveAppSettings", verify, saveAppSettingsController)
settingsRouter.post("/api/getAppSettings", verify, getAppSettingsController)

export default settingsRouter   