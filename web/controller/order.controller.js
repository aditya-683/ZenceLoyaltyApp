import {
  CheckApiStatusService,
  CheckUserAndSendDataService,
  GetStoreDetailsService,
  SaveUiSettingService,
  UpdateCancelOrderStatusService,
  UpdateOrderStatusService,
  updateRefundOrderStatusService,
} from "../service/order.service.js";
import { CatchAsync } from "../utils/catch-async.js";

export const GetStoreDetailsController = CatchAsync(async (req, res, next) => {
  const GetStoreDetailsData = await GetStoreDetailsService(req);
  console.log("Get_StoreDetails_Data_from_Controller =========>", GetStoreDetailsData?.StoreName);
  return res.send(GetStoreDetailsData);
});

export const CheckApiStatusController = CatchAsync(async (req, res) => {
  const CheckApiStatusData = await CheckApiStatusService(req);
  return res.send(CheckApiStatusData);
});

export const SaveUiSettingController = CatchAsync(async (req, res, next) => {
  const SaveUiSettingData = await SaveUiSettingService(req);
  return res.send(SaveUiSettingData);
});

/**************************************************************  Will be triggerd on order created webhook**************************************************************************************************/
export const CheckUserAndSendDataController = CatchAsync((req, res, next) => {
  CheckUserAndSendDataService(req, res, next);
  return res.sendStatus(200);
});

/**************************************************************  Will be triggerd on order fulfilled webhook**************************************************************************************************/
export const UpdateOrderStatusController = CatchAsync((req, res, next) => {
  UpdateOrderStatusService(req, res, next);
  return res.sendStatus(200);
});

/**************************************************************  Will be triggerd on order cancelled webhook**************************************************************************************************/
export const UpdateCancelOrderStatusController = CatchAsync(
  async (req, res, next) => {
    const UpdateCancelOrderStatusData = await UpdateCancelOrderStatusService(
      req,
      res,
      next
    );
    return res.status(200);
  }
);

export const UpdateRefundOrderStatusControllers = CatchAsync(
  async (req, res, next) => {
    const UpdateRefundOrderStatusData = await updateRefundOrderStatusService(
      req,
      res,
      next
    );
    return res.status(200);
  }
);
