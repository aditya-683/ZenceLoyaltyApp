import { Router } from 'express';
import { verifyjwt } from '../middleware/middleware.js';
import { wsReleaseRedemptionPointsController } from '../controller/wsReleaseRedemptionPoints.controller.js';
import verify from '../middleware/proxyVerifyMiddleware.js';
const wsReleaseRedemptionPointsRouter = Router();

wsReleaseRedemptionPointsRouter.post("/api/ReleaseRedemptionPoints", verify, wsReleaseRedemptionPointsController);

export default wsReleaseRedemptionPointsRouter;