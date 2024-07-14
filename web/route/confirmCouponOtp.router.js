import express from 'express';
import { confirmCouponOtpController } from '../controller/confirmCouponOtp.controller.js';
import { verifyjwt } from '../middleware/middleware.js';
import verify from '../middleware/proxyVerifyMiddleware.js';

const confirmCouponOtpRouter = express.Router();

confirmCouponOtpRouter.post("/api/ConfirmCouponOtp", verify, confirmCouponOtpController);

//plus route confirm coupon otp,// recreated this rout with different End Point name
confirmCouponOtpRouter.post("/api/CouponOtp", verify, confirmCouponOtpController);


export default confirmCouponOtpRouter;