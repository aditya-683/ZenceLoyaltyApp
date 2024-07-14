import express from 'express';
import { verifyjwt } from '../middleware/middleware.js';
import { resendCouponOtpController } from '../controller/resendCouponOtp.controller.js';
import verify from '../middleware/proxyVerifyMiddleware.js';
const resendCouponOtpRouter = express.Router();

resendCouponOtpRouter.post("/api/ResendCouponOtp", verify, resendCouponOtpController);
export default resendCouponOtpRouter;