import express from 'express';
import { verifyjwt } from '../middleware/middleware.js';
import { userRegistrationMultiPassController } from '../controller/userRegistration.controller.js';
import { userRegistration } from '../service/auth.service.js';
import verify from '../middleware/proxyVerifyMiddleware.js';
const userRegistrationRouter = express.Router();

userRegistrationRouter.post("/api/userRegistration", verify, userRegistration, userRegistrationMultiPassController);
export default userRegistrationRouter;