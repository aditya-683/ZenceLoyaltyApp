import { Router } from 'express';
import { verifyjwt } from '../middleware/middleware.js';
import { lookupController } from '../controller/lookup.controller.js';
import verify from '../middleware/proxyVerifyMiddleware.js';

const lookupRouter = Router();

lookupRouter.post("/api/Lookup", verify, lookupController);
export default lookupRouter;