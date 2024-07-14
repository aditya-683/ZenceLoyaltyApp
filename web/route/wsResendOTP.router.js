import { Router } from 'express';
import { verifyjwt } from '../middleware/middleware.js';
import { wsResendOTPController } from '../controller/wsResendOTP.controller.js';
import verify from '../middleware/proxyVerifyMiddleware.js';

const wsResendOTPRouter = Router();

wsResendOTPRouter.post("/api/ResendOTP", verify, wsResendOTPController);
wsResendOTPRouter.post("/api/ResendOTPs", verify, wsResendOTPController);

export default wsResendOTPRouter;