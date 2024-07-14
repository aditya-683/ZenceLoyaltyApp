import express from 'express';
import { verifyjwt } from '../middleware/middleware.js';
import { redeemCouponController } from '../controller/redeemCoupon.controller.js';
import verify from '../middleware/proxyVerifyMiddleware.js';
const redeemCouponRouter = express.Router();

redeemCouponRouter.post("/api/RedeemCoupon", verify, redeemCouponController);

export default redeemCouponRouter;