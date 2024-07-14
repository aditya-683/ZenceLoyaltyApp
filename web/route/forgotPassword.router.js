import express from 'express';
import { forgetPasswordController } from '../controller/forgotPassword.controller.js';
import { verifyjwt } from '../middleware/middleware.js';
import verify from '../middleware/proxyVerifyMiddleware.js';

const forgetPasswordRouter = express.Router();

forgetPasswordRouter.post("/api/forgotPassword", verify, forgetPasswordController);

export default forgetPasswordRouter;   