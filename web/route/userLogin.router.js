import express from 'express';
import { verifyjwt } from '../middleware/middleware.js';

import { userLoginMultipassLogin } from '../controller/userLogin.Controller.js';
import { userLogin } from '../service/auth.service.js';
import verify from '../middleware/proxyVerifyMiddleware.js';

const userLoginRouter = express.Router();

userLoginRouter.post("/api/UserLogin", verify, userLogin, userLoginMultipassLogin);

export default userLoginRouter;   