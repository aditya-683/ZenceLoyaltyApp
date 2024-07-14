import { isCustomerService } from "../service/isCustomer.service.js"

export const isCustomerController = async(req,res) => {
    const response = await isCustomerService(req);
    return res.send(response);
}