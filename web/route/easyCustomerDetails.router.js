import express from 'express';
import { verifyjwt } from '../middleware/middleware.js';
import { easyCustomerDetailsController } from '../controller/easyCustomerDetails.controller.js';
import verify from '../middleware/proxyVerifyMiddleware.js';

const getEasyCustomerDetailsRouter = express.Router();

getEasyCustomerDetailsRouter.post("/api/GetEasyCustomerDetails", verify, easyCustomerDetailsController);


export default getEasyCustomerDetailsRouter;