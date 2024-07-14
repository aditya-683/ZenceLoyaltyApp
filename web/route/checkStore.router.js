import express from 'express';
import { checkStoreController, isPlusStoreController, updateStoreNonPlusToPlusController, updateStorePlusToNonPlusController, updatedStoreDetailsInAdminController } from '../controller/checkStoreController.js';
import verify from '../middleware/proxyVerifyMiddleware.js';

const checkStorePlusOrNonPlus = express.Router();

checkStorePlusOrNonPlus.get("/api/checkStore", verify, checkStoreController)
checkStorePlusOrNonPlus.post("/api/checkStore", checkStoreController);
checkStorePlusOrNonPlus.put("/api/changeToNonPlus", updateStorePlusToNonPlusController);
checkStorePlusOrNonPlus.put("/api/changeToPlus", updateStoreNonPlusToPlusController);
checkStorePlusOrNonPlus.put("/api/saveAdminSetting", updatedStoreDetailsInAdminController)
checkStorePlusOrNonPlus.post("/api/isPlusStore", verify, isPlusStoreController);
export default checkStorePlusOrNonPlus;