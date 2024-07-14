import express from 'express';
import { verifyjwt } from '../middleware/middleware.js';
import { updatePasswordController } from '../controller/updatePassword.controller.js';
import verify from '../middleware/proxyVerifyMiddleware.js';

const updatePasswordRouter = express.Router();

updatePasswordRouter.post("/api/updatePassword", verify, updatePasswordController);

export default updatePasswordRouter; 