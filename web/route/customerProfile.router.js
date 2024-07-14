import { Router } from 'express';
import { verifyjwt } from '../middleware/middleware.js';
import { customerProfileController } from '../controller/customerProfile.controller.js';
import verify from '../middleware/proxyVerifyMiddleware.js';

const customerProfileRouter = Router();

customerProfileRouter.post("/api/customerProfile", verify, customerProfileController);
export default customerProfileRouter;