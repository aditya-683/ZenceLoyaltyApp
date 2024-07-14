import { Router } from 'express';
import { verifyjwt } from '../middleware/middleware.js';
import { GetCustomerTransactionDetailsController } from '../controller/getCustomerTransactionDetails.controller.js';
import verify from '../middleware/proxyVerifyMiddleware.js';

const getCustomerTransactionDetailsRouter = Router();

getCustomerTransactionDetailsRouter.post("/api/GetCustomerTransactionDetails", verify, GetCustomerTransactionDetailsController);

export default getCustomerTransactionDetailsRouter;