import { Router } from 'express';
import { verifyjwt } from '../middleware/middleware.js';
import { getAvailableCouponsController } from '../controller/getAvailableCoupons.controller.js';
import verify from '../middleware/proxyVerifyMiddleware.js';

const getAvailableCouponsRouter = Router();

getAvailableCouponsRouter.post("/api/GetAvailableCoupons", verify, getAvailableCouponsController);

export default getAvailableCouponsRouter;   