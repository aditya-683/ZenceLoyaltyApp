import { Router } from "express"
import { verifyjwt } from "../middleware/middleware.js";
import { downloadReconFileController } from "../controller/downloadFile.controller";

const router = Router()
router.post("/api/downloadFile",downloadReconFileController);

export default router;