import { Store } from "../model/store.model.js";
import { isEmpty } from "../utils/utility.js";
import {
  axiosRequest,
  generateSecurityToken,
} from "./commonModules.service.js";

export const isCustomerService = async (req) => {
  const { EasyId, StoreName, CountryCode } = req.body;
  if (isEmpty(EasyId)) {
    return {
      status: true,
      data: null,
      message: "Invalide EasyId",
    };
  } else if (isEmpty(StoreName)) {
    return {
      status: true,
      data: null,
      message: "Invalide UserName",
    };
  } else if (isEmpty(CountryCode)) {
    return {
      status: true,
      data: null,
      message: "Invalide CountryCode",
    };
  } else {
    const storeDetails = await Store.findOne({ StoreName : StoreName });
    const securityToken = await generateSecurityToken(storeDetails);

    const isCustomerParams = {
      EasyId: EasyId,
      UserName: storeDetails.UserName2,
      SecurityToken: securityToken.Token,
      CountryCode: CountryCode,
    };
    console.log("isCustomerParams form isCustomerRoute ====>", isCustomerParams);

    const isCustomerResponse = await axiosRequest(
      `${storeDetails.ErBaseUrl}/api/IsCustomer`,
      isCustomerParams
    );
    return {
        status: true,
        data:isCustomerResponse,
        message: "successfully response"
    };
  };
};
