import express from 'express';
import { verifyjwt } from '../middleware/middleware.js';
import { unblockCouponController } from '../controller/unblockCoupon.controller.js';
import verify from '../middleware/proxyVerifyMiddleware.js';
const unblockCouponRouter = express.Router();

unblockCouponRouter.post("/api/UnblockCoupon", verify, unblockCouponController);
export default unblockCouponRouter;