import express from 'express';
import { couponOtpController } from '../controller/couponOtp.controller.js';
import { verifyjwt } from '../middleware/middleware.js';

const couponOTPRouter = express.Router();

couponOTPRouter.post("/api/CouponOtp",couponOtpController);

export default couponOTPRouter;