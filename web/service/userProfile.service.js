import axios from "axios";
import {
  generateSecurityToken,
  updateMemberProfileEasy,
} from "./commonModules.service.js";
import { Store } from "../model/store.model.js";

export const getCustomerTransactionDetails = async (req) => {
  const data = req.body;
  const storeDetails = await Store.findOne({
    StoreName: data.StoreName,
  });
  if (!storeDetails)
    return {
      ReturnCode: "32",
      ReturnMessage: `Store ${data.StoreName} does not Exist in EasyRewards`,
    };

  const securityToken = await generateSecurityToken(storeDetails);
  if (securityToken.ReturnCode != "0") return securityToken;

  const customerTransactionParams = {
    EasyId: `${data.EasyId}`,
    SecurityToken: `${securityToken.Token}`,
    TransactionTypeId: "0",
    TransactionDetailsCount: `${data.TransactionDetailsCount}`,
    PageSize: `${data.PageSize}`,
    PageNumber: `${data.PageNumber}`,
    StartDate: `${data.StartDate}`,
    EndDate: `${data.EndDate}`,
    BillNo: `${data.BillNo}`,
    CountryCode: `${data.CountryCode}`,
  };
  const ErBaseUrl = storeDetails.ErBaseUrl;
  console.log("customerTransactionParams", customerTransactionParams);
  const config = {
    method: "post",
    url: `${ErBaseUrl}/api/GetCustomerTransactionDetails`,
    data: customerTransactionParams,
  };
  const customerTransactionResponse = await axios(config);
  return customerTransactionResponse.data;
};

export const updateAddress = async (req) => {
  const data = req.body;
  const storeDetails = await Store.findOne({
    StoreName: data.StoreName,
  });
  if (!storeDetails)
    return {
      ReturnCode: "32",
      ReturnMessage: `Store ${data.StoreName} does not Exist in EasyRewards`,
    };

  const securityToken = await generateSecurityToken(storeDetails);
  if (securityToken.ReturnCode != "0") return securityToken;

  const updateAddressParams = {
    SecurityToken: `${securityToken.Token}`,
    UserName: `${storeDetails.UserName2}`,
    StoreCode: `${storeDetails.StoreCode}`,
    MemberId: `${data.MemberId}`,
    CountryCode: `${data.CountryCode}`,
    SavedAddresses: {
      AddressId: `${data.SavedAddresses.AddressId}`,
      Addresstype: `${data.SavedAddresses.Addresstype}`,
      CustomerName: `${data.SavedAddresses.CustomerName}`,
      CountryCode: `${data.SavedAddresses.CountryCode}`,
      Mobile: `${data.SavedAddresses.Mobile}`,
      Pincode: `${data.SavedAddresses.Pincode}`,
      Country: `${data.SavedAddresses.Country}`,
      State: `${data.SavedAddresses.State}`,
      City: `${data.SavedAddresses.City}`,
      Landmark: `${data.SavedAddresses.Landmark}`,
      AddressLine1: `${data.SavedAddresses.AddressLine1}`,
      AddressLine2: `${data.SavedAddresses.AddressLine2}`,
      DefaultAddress: `${data.SavedAddresses.DefaultAddress}`,
    },
  };
  const ErBaseUrl = storeDetails.ErBaseUrl;

  const config = {
    method: "post",
    url: `${ErBaseUrl}/api/memberAddressDetail`,
    data: updateAddressParams,
  };
  const updateAddressResponse = await axios(config);
  console.log("??????????????????????????????????/", updateAddressResponse);
  return updateAddressResponse.data;
};

export const getAddressDetails = async (req) => {
  const data = req.body;
  const storeDetails = await Store.findOne({
    StoreName: data.StoreName,
  });
  if (!storeDetails)
    return {
      ReturnCode: "32",
      ReturnMessage: `Store ${data.StoreName} does not Exist in EasyRewards`,
    };

  const securityToken = await generateSecurityToken(storeDetails);
  if (securityToken.ReturnCode != "0") {
    return securityToken;
  }
  const getAddressParams = {
    SecurityToken: `${securityToken.Token}`,
    UserName: `${storeDetails.UserName2}`,
    StoreCode: `${storeDetails.StoreCode}`,
    EmailId: `${data.EmailId}`,
    MobileNo: `${data.MobileNo}`,
    CountryCode: `${data.CountryCode}`,
  };
  console.log("++++++++++++", getAddressParams);
  const ErBaseUrl = storeDetails.ErBaseUrl;

  const config = {
    method: "post",
    url: `${ErBaseUrl}/api/getAddressDetail`,
    data: getAddressParams,
  };
  const getAddressResponse = await axios(config);
  console.log("??????????????????????????????????/", getAddressResponse);
  return getAddressResponse.data;
};

export const customerProfile = async (req) => {
  const data = req.body;
  const storeDetails = await Store.findOne({
    StoreName: data.StoreName,
  });
  if (!storeDetails)
    return {
      ReturnCode: "32",
      ReturnMessage: `Store ${data.StoreName} does not Exist in EasyRewards`,
    };

  const securityToken = await generateSecurityToken(storeDetails);
  if (securityToken.ReturnCode != "0") return securityToken;

  const customerProfileParams = {
    SecurityToken: `${securityToken.Token}`,
    UserName: `${storeDetails.UserName2}`,
    StoreCode: `${storeDetails.StoreCode}`,
    EasyId: `${data.EasyId}`,
    EmailId: `${data.EmailId}`,
    MobileNo: `${data.MobileNo}`,
    CountryCode: `${data.CountryCode}`,
  };
  console.log("customerProfileParams", customerProfileParams);
  const ErBaseUrl = storeDetails.ErBaseUrl;

  const config = {
    method: "post",
    url: `${ErBaseUrl}/api/CustomerProfile`,
    data: customerProfileParams,
  };
  const customerProfileResponse = await axios(config);
  console.log("??????????????????????????????????/", customerProfileResponse);
  return customerProfileResponse.data;
};

export const lookup = async (req) => {
  const data = req.body;
  const storeDetails = await Store.findOne({
    StoreName: data.StoreName,
  });
  if (!storeDetails)
    return {
      ReturnCode: "32",
      ReturnMessage: `Store ${data.StoreName} does not Exist in EasyRewards`,
    };

  const securityToken = await generateSecurityToken(storeDetails);
  if (securityToken.ReturnCode != "0") return securityToken;

  const lookupParams = {
    SecurityToken: `${securityToken.Token}`,
    UserName: `${storeDetails.UserName2}`,
    StoreCode: `${storeDetails.StoreCode}`,
    MemberId: `${data.MemberId}`,
    TransactionDate: `${data.TransactionDate}`,
    PrimaryOrderNumber: `${data.PrimaryOrderNumber}`,
    InvoiceId: `${data.InvoiceId}`,
    CountryCode: `${data.CountryCode}`,
  };
  const ErBaseUrl = storeDetails.ErBaseUrl;

  const config = {
    method: "post",
    url: `${ErBaseUrl}/api/Lookup`,
    data: lookupParams,
  };
  const lookupResponse = await axios(config);
  console.log("??????????????????????????????????/", lookupResponse);
  return lookupResponse.data;
};
// it is just an function

export const updateMemberProfile = async (req) => {
  const data = req.body;
  console.log(data);
  console.log("=====================================");
  console.log("=====================================");
  console.log("=====================================");
  console.log("=====================================");
  const storeDetails = await Store.findOne({
    StoreName: data.StoreName,
  });
  if (!storeDetails)
    return {
      ReturnCode: "32",
      ReturnMessage: `Store ${data.StoreName} does not Exist in EasyRewards`,
    };

  const securityToken = await generateSecurityToken(storeDetails);
  if (securityToken.ReturnCode != "0") {
    return securityToken;
  }
  const updateMemberProfileResponse = await updateMemberProfileEasy(
    data,
    storeDetails,
    securityToken
  );
  console.log(
    "??????????????????????????????????/",
    updateMemberProfileResponse.data
  );
  return updateMemberProfileResponse.data;
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
