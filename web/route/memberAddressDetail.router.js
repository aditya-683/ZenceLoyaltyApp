import { Router } from 'express';
import { verifyjwt } from '../middleware/middleware.js';
import { memberAddressDetailController } from '../controller/memberAddressDetail.controller.js';
import verify from '../middleware/proxyVerifyMiddleware.js';

const memberAddressDetailRouter = Router();

memberAddressDetailRouter.post("/api/memberAddressDetail", verify, memberAddressDetailController);
export default memberAddressDetailRouter;