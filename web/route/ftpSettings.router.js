import { Router } from "express"
import { verifyjwt } from '../middleware/middleware.js';
import { GetFtpSettingsController, SaveFtpSettingsController, UpdateFtpSettingsController } from "../controller/ftpSettings.controller.js"
import verify from "../middleware/proxyVerifyMiddleware.js";
const ftpRouter = Router()

ftpRouter.get("/api/getFtpSettings", verify, GetFtpSettingsController);
ftpRouter.post("/api/saveFtpSettings", verify, SaveFtpSettingsController)
ftpRouter.post("/api/updateFtpSettings", verify, UpdateFtpSettingsController);

export default ftpRouter 
