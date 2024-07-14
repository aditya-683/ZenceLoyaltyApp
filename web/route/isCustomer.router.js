import express from "express";
import { isCustomerController } from "../controller/isCustomerController.js";
import verify from "../middleware/proxyVerifyMiddleware.js";

const isCustomerRouter = express.Router();

isCustomerRouter.post("/api/isCustomer",verify,isCustomerController);

export default isCustomerRouter;
