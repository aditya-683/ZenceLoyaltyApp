 import express from 'express';
 import {testFilesController}  from "../controller/testFile.controller.js";

 const testingRouter = express.Router();

 testingRouter.get("/api/getTest", testFilesController);

 export default testingRouter;   