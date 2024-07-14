import { Router } from 'express';
import { verifyjwt } from '../middleware/middleware.js';
import { getLogsController } from '../controller/getLogsController.js';
import verify from '../middleware/proxyVerifyMiddleware.js';
const getLogsRouter = Router();


getLogsRouter.post('/logs', verify, getLogsController);

export default getLogsRouter;