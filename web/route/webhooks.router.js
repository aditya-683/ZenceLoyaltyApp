import { Router } from 'express';
import { verifyjwt } from '../middleware/middleware.js';
import { webhooksController } from '../controller/webHooksController.js';
import { webhookValidation } from '../middleware/middleware.js';

const weebHookRouter = Router();
weebHookRouter.route("/webhooks/uninstallApp", webhookValidation).post(webhooksController);

export default weebHookRouter;