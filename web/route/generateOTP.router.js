import express from 'express';
import { verifyjwt } from '../middleware/middleware.js';
import { generateOTPController } from '../controller/generateOTP.controller.js';
import verify from '../middleware/proxyVerifyMiddleware.js';

const generateOTPRouter = express.Router();

generateOTPRouter.post("/api/GenerateOTP", verify, generateOTPController);

export default generateOTPRouter;   