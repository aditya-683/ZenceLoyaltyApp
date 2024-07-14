import express from 'express';
import { verifyjwt } from '../middleware/middleware.js';
import { validateOTPController } from '../controller/validateOTP.controller.js';
import verify from '../middleware/proxyVerifyMiddleware.js';

const validateOTPRouter = express.Router();

validateOTPRouter.post("/api/ValidateOTP", verify, validateOTPController);

export default validateOTPRouter;   