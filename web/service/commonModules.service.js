import axios from "axios";
import {Store} from "../model/store.model.js";
import { isEmpty } from "../utils/utility.js";
import { AppLogs } from "../model/appLogs.model.js";

export const generateSecurityToken = async (storeInfo) => {
  const data = {
    UserName: storeInfo.UserName,
    UserPassword: storeInfo.UserPassword,
    DevId: storeInfo.DevId,
    AppId: storeInfo.AppId,
    ProgramCode: storeInfo.ProgramCode,
  };
  return axiosRequest(`${storeInfo.ErBaseUrl}/api/GenerateSecurityToken`, data);
};

export const  searchUserInEasyRewardz = async (data, securityToken, storeDetails) => {
  const searchMemberInEasyRewardzParams = {
    EasyId: data.MobileNo,
    UserName: storeDetails.UserName2,
    SecurityToken: securityToken.Token,
    CountryCode: `${data.SavedAddresses.CountryCode}`,
  };
  console.log(searchMemberInEasyRewardzParams);
  const searchMemberEasyRewardzResponse = await axiosRequest(
    `${storeDetails.ErBaseUrl}/api/SearchMember`,
    searchMemberInEasyRewardzParams
  );
  return searchMemberEasyRewardzResponse;
};

export const isCustomerInEasyrewardz = async (data, securityToken, storeDetails) => {
  const isCustomerParams = {
    EasyId: data.EasyId,
    UserName: storeDetails.UserName2,
    SecurityToken: securityToken.Token,
    CountryCode: data.CountryCode,
  };
  console.log("isCustomerParams===>", isCustomerParams);

  const isCustomerResponse = await axiosRequest(
    `${storeDetails.ErBaseUrl}/api/IsCustomer`,
    isCustomerParams
  );
  return isCustomerResponse;
};

export const updateMemberProfileEasy = async (data, storeDetails, securityToken) => {
  const updateMemberProfileParams = {
    SecurityToken: securityToken.Token,
    FirstName: `${data.FirstName}`,
    LastName: `${data.LastName}`,
    DateOfBirth: data.DateOfBirth || "",
    MobileNo: `${data.MobileNo}`,
    Address1: data.Address1 || "",
    Address2: data.Address2 || "",
    Pincode: data.Pincode || "",
    EmailId: `${data.EmailId}`,
    Gender: `${data.Gender}`,
    StoreCode: `${storeDetails.StoreCode}`,
    AnniversaryDate: data.AnniversaryDate || "",
    UserName: `${storeDetails.UserName2}`,
    ChannelCode: data.ChannelCode || "",
    CustomerTypeCode: data.CustomerTypeCode || "",
    ReferralCode: `${data.ReferralCode}` || "",
    NumberofChildren: data.NumberofChildren || "",
    CountryCode: `${data.CountryCode}`,
    EcommerceCustomer: true,

    NoOfFamilyMembers: data.NoOfFamilyMembers || "",
    PreferredCategory: data.PreferredCategory || "",
    HaveYourPurchasedOnline: data.HaveYourPurchasedOnline || "",
    RelationshipStatus: data.RelationshipStatus || "",
    Occupation: data.Occupation || "",
  };
  console.log("updateMemberProfileParams", updateMemberProfileParams);
  const ErBaseUrl = storeDetails.ErBaseUrl;

  const config = {
    method: "post",
    url: `${ErBaseUrl}/api/UpdateMemberProfile`,
    data: updateMemberProfileParams,
  };
  return await axios(config);
};

export const getCustomersIp = async () => {
  const config = {
    method: "get",
    url: `  https://api.ipify.org/`,
  };
  const ipAddress = await axios(config);
 ///////dobut
  return res.send({
    ReturnCode: "0",
    IP: ipAddress,
  });
};

export const validateRecaptchaRequest = async (captchaToken) => {
  console.log("11111111111111111111111111111111111111", captchaToken);
  console.log("11111111111111111111111111111111111111", captchaToken);
  console.log("11111111111111111111111111111111111111", captchaToken);
  console.log("11111111111111111111111111111111111111", captchaToken);
  console.log("11111111111111111111111111111111111111", captchaToken);

  const token = captchaToken.replace("@.", "a");
  var config = {
    method: "post",
    url: `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.secret_code_for_token}&response=${token}`,
  };

  return await axios(config);
  //   {
  //     "success": true,
  //     "challenge_ts": "2022-10-19T08:29:46Z",
  //     "hostname": "www.batabd.com"
  // }
};
export const getLogs = async (req) => {
  const data = req.body;
  const store = data.StoreName;
  let page = parseInt(data.page);
  let limit = parseInt(data.limit);
  if (isEmpty(store)) {
    return {
        ReturnCode: "786",
        ReturnMessage:
          "Missing Required Fields [StoreName] . Please add StoreName in Request Body",
      }
  }
  if (!page || !limit) {
    return {
      ReturnCode: "786",
      ReturnMessage: "Missing Required Fields [page] and [limit]",
    };
 
  }
  if (limit >= 100) {
    return {
      ReturnCode: "787",
      ReturnMessage: "Limit should be less than or equal to 100",
    };
    
  }

  let query = {
    $and: [{ StoreName: store }],
  };

  if (data.ip_address) {
    query["$and"].push({ ip_address: data.ip_address });
  }
  if (data.email) {
    // query.email = data.email;
    query["$and"].push({ phone: data.phone });
  }
  if (data.phone) {
    // query.phone = data.phone;
    query["$and"].push({ phone: data.phone });
  }
  console.log(query);

  let logs = await AppLogs.find(query)
    .skip(limit * page - limit)
    .limit(limit)
    .lean();
  const totalDoc = await AppLogs.estimatedDocumentCount(query);
  console.log("logs", logs);
  console.log("totalDoc", totalDoc);

  ////doubt
  return {
    data: logs,
    metaData: {
      page: page,
      totalPage: parseInt(parseInt(totalDoc) / limit),
      totalDocument: totalDoc,
    },
  };
};

export const axiosRequest = async (url, data, headers) => {
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
