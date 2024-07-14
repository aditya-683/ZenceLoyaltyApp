import express from "express";
import { getFaqController, postFaqController } from "../controller/faq.controller.js";
import verify from "../middleware/proxyVerifyMiddleware.js";

const faqRouter = express.Router();

faqRouter.post("/api/post-faq", verify, postFaqController);
faqRouter.get("/api/all-faq", verify, getFaqController);

export default faqRouter;