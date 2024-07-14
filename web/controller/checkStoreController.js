import {
  checkStoreIsPlusOrNonPlusService,
  isPlusStore,
  updateNonPlusToPlusService,
  updatePlusStoreToNonPlusService,
  updateStoreFromAdminService,
} from "../service/checkStore.service.js";
import { CatchAsync } from "../utils/catch-async.js";

export const checkStoreController = CatchAsync(async (req, res) => {
  const response = await checkStoreIsPlusOrNonPlusService(req);
  return res.status(response?.status).send(response?.data || response?.error);
});

export const isPlusStoreController = async(req,res) => {
  // console.log("REQ ------------ ", req)
  const response = await isPlusStore(req);
  return res.send(response);
}

export const updateStorePlusToNonPlusController = CatchAsync(
  async (req, res) => {
    const response = await updatePlusStoreToNonPlusService(req);
    return res.status(response?.status).send(response?.messsage);
  }
);

export const updateStoreNonPlusToPlusController = CatchAsync(
  async (req, res) => {
    const response = await updateNonPlusToPlusService(req);
    return res.status(response?.status).send(response?.messsage);
  }
);

export const updatedStoreDetailsInAdminController = CatchAsync(
  async (req, res) => {
    const response = await updateStoreFromAdminService(req);
    return res.status(200).json({ message: response });
  }
);
