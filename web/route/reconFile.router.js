import { Router } from "express"
import { verifyjwt } from '../middleware/middleware.js';
import { postReconFileController, postDownloadFileController } from "../controller/reconFile.controller.js";
import verify from "../middleware/proxyVerifyMiddleware.js";

const createSkuAndTenderReconFileRouter = Router()

createSkuAndTenderReconFileRouter.post("/api/reconFile", verify, postReconFileController);


createSkuAndTenderReconFileRouter.post("/api/downloadFile", verify, postDownloadFileController);


export default createSkuAndTenderReconFileRouter;