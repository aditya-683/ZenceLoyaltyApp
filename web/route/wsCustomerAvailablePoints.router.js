import { Router } from "express";
import { wsCustomerAvailablePointsController } from "../controller/wsCustomerAvailablePoints.controller.js";
import verify from "../middleware/proxyVerifyMiddleware.js";

const wsCustomerAvailablePointsRouter = Router();

wsCustomerAvailablePointsRouter.post(
  "/api/CustomerAvailablePoints",
  verify,
  wsCustomerAvailablePointsController
);
export default wsCustomerAvailablePointsRouter;
