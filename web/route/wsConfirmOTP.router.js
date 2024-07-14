import { Router } from 'express';
import { verifyjwt } from '../middleware/middleware.js';
import { wsConfirmOTPController } from '../controller/wsConfirmOTP.controller.js';
import verify from '../middleware/proxyVerifyMiddleware.js';

const wsConfirmOTPRouter = Router();

wsConfirmOTPRouter.post("/api/ConfirmOTP", verify, wsConfirmOTPController)
export default wsConfirmOTPRouter;