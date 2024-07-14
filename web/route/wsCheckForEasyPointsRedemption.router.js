import { Router } from 'express';
import { verifyjwt } from '../middleware/middleware.js';
import { wsCheckForEasyPointsRedemptionController } from '../controller/wsCheckForEasyPointsRedemption.controller.js';
import verify from '../middleware/proxyVerifyMiddleware.js';

const wsCheckForEasyPointsRedemptionRouter = Router();

wsCheckForEasyPointsRedemptionRouter.post("/api/CheckForEasyPointsRedemption", verify, wsCheckForEasyPointsRedemptionController);
export default wsCheckForEasyPointsRedemptionRouter;
