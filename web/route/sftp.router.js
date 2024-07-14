import { Router } from "express";
import { sftpController } from "../controller/sftp.controller.js";

const sftpRouter = Router();
sftpRouter.post("/api/sftp-checker", sftpController);

export default sftpRouter;
