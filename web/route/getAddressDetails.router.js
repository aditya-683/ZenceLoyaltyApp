import { Router } from 'express';
import { verifyjwt } from '../middleware/middleware.js';
import { getAddressDetailsController } from '../controller/getAddressDetails.controller.js';
import verify from '../middleware/proxyVerifyMiddleware.js';

const getAddressDetailsRouter = Router();

getAddressDetailsRouter.post("/api/getAddressDetails", verify, getAddressDetailsController);
export default getAddressDetailsRouter;