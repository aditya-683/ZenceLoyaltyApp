
import { Router } from "express"
import verify from "../middleware/proxyVerifyMiddleware.js"
import { CheckApiStatusController, CheckUserAndSendDataController, GetStoreDetailsController, SaveUiSettingController, UpdateCancelOrderStatusController, UpdateOrderStatusController, UpdateRefundOrderStatusControllers } from "../controller/order.controller.js"
import { verifyAWSEvent, webhookValidation } from "../middleware/webHooksMiddleware.js"
const orderRouter = Router()


orderRouter.post("/api/GetStoreDetails", verify, GetStoreDetailsController)
orderRouter.post("/api/CheckApiStatus", verify, CheckApiStatusController)
orderRouter.patch("/api/saveUiSetting", verify, SaveUiSettingController)
orderRouter.post("/api/checkUserAndSendData", verify, CheckUserAndSendDataController)
orderRouter.post("/api/updateOrderStatus", verify, UpdateOrderStatusController) // run on order fullfillment
orderRouter.post("/api/updateCancelOrderStatus", verify, UpdateCancelOrderStatusController)//run on order cancel
orderRouter.post("/api/updateReturnOrderStatus", verify, UpdateRefundOrderStatusControllers) // run on order update
orderRouter.post("/api/aws-order-webhooks", verifyAWSEvent)
export default orderRouter;