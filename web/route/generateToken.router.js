import { Router } from 'express';
import { generateTokenController } from '../controller/generateToken.controller.js';
import verify from '../middleware/proxyVerifyMiddleware.js';

const generateTokenRouter = Router();

generateTokenRouter.post("/api/generateToken", generateTokenController);

export default generateTokenRouter;