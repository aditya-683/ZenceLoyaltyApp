import { Router } from 'express';
import { verifyjwt } from '../middleware/middleware.js';
import { getFeedBackLinkController } from '../controller/getFeedbackLink.controller.js';
import verify from '../middleware/proxyVerifyMiddleware.js';

const getFeedBackLinkRouter = Router();

getFeedBackLinkRouter.post("/api/get_feedback_link", verify, getFeedBackLinkController);

export default getFeedBackLinkRouter;