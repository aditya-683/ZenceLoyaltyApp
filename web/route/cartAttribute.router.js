import { Router } from 'express';
import { getACartAttributeController, getAllCartAttributesController, saveCartAttributeController, updateCartAttributeController } from '../controller/cartAttrController.js';
import verify from '../middleware/proxyVerifyMiddleware.js';


const cartRouter = Router();

cartRouter.post("/api/SaveCartAttr", verify, saveCartAttributeController);
cartRouter.patch("/api/UpdateCartAttr", verify, updateCartAttributeController);
cartRouter.post("/api/getAllCartAttributes", verify, getAllCartAttributesController);
cartRouter.post("/api/getACartAttribute", verify, getACartAttributeController);

export default cartRouter;
