import express from 'express';
import { verifyjwt } from '../middleware/middleware.js';
import { updateMemberProfileController } from '../controller/updateMemberProfile.controller.js';
import verify from '../middleware/proxyVerifyMiddleware.js';

const updateMemberProfileRouter = express.Router();

updateMemberProfileRouter.post("/api/UpdateMemberProfile", verify, updateMemberProfileController);
export default updateMemberProfileRouter;