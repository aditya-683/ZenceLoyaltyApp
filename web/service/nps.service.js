import axios from "axios";
import {CartAttr} from "../model/attribute.model.js";
import {Store} from "../model/store.model.js";
import { generateSecurityToken } from "./commonModules.service.js";
import { isEmpty } from "../utils/utility.js";

export const getFeedBackLink = async (req) => {
  const bodyData = req.body;
  const data = req.body;
  const store = data.StoreName;

  if (isEmpty(store))
    return {
      message: "Please Add StoreName in the request body",
      StoreName: "Empty",
    };

  console.log("data", data);
  let storeDetails = await Store.findOne({
    StoreName: store,
  });
  const dbCartAttr = await CartAttr.findOne({
    $and: [{ checkoutToken: data.checkoutToken }, { StoreName: store }],
  });
  console.log("dbCartAttr", dbCartAttr);

  const securityToken = await generateSecurityToken(storeDetails);
  console.log("securityToken", securityToken);

  const npsParams = {
    ProgramCode: storeDetails.ProgramCode, // Parameter from Generate Security Token
    MemberId: dbCartAttr.phone,
    StoreCode: "demo",
    DateTime: data.dateTime,
    SecurityToken: securityToken.Token,
    CustomerStoreType: "Transaction", // HardCoded String
    ApplicationName: "lpaas", // HardCoded String
    ApplicationReferenceId: data.orderId || dbCartAttr.orderId, // Order Number
    CountryCode: storeDetails.CountryCode,
    PatientName: "", //Optional
    CollectaOfferCode: "Offline", // Mandatory Configurable
  };
  console.log("npsParams", npsParams);
  const ErBaseUrl = storeDetails.ErBaseUrl;
  const npsResponse = await axiosRequest(
    `${ErBaseUrl}/api/CollectaIssuanceAPI`,
    npsParams
  );
  console.log("npsResponse", npsResponse);

  return npsResponse;
};

const axiosRequest = async (url, data, headers) => {
  try {
    const response = await axios({
      method: "POST",
      headers,
      url: url,
      data: data,
    });
    return response.data;
  } catch (err) {
    console.log("Error From Log ", err);
  }
};
