import axios from "axios";
import { GetStoreDetails } from "./helperFunction.service.js";
import {
  generateSecurityToken,
  searchUserInEasyRewardz,
  updateMemberProfileEasy,
  isCustomerInEasyrewardz,
} from "./commonModules.service.js";
// import { updateMemberProfile } from "./userProfileController";
import { validateRecaptchaRequest } from "./commonModules.service.js";
import Multipassify from "multipassify";
import md5 from "md5";
import { Store } from "../model/store.model.js";
import dotenv from "dotenv";
// import AppLogs from '../model'
dotenv.config();

let api_key = process.env.API_VERSION;

const registerUserInEasyRewards = async (data, securityToken, storeDetails) => {
  const hashedPassword = md5(data.Password);
  const easyRewardzRegistrationParams = {
    SecurityToken: securityToken.Token,
    UserName: storeDetails.UserName2,
    StoreCode: storeDetails.StoreCode,
    FirstName: data.FirstName,
    LastName: data.LastName,
    EmailId: data.EmailId,
    Password: hashedPassword,
    MobileNo: data.MobileNo,
    DateOfBirth: data.DateOfBirth || "",
    AnniversaryDate: data.AnniversaryDate || "",
    EcommerceCustomer: true,
    Gender: data.Gender || "",
    CountryCode: data.CountryCode || "",
    marketingacceptance: data.marketingacceptance || "",
    termsandconditionsacceptance: data.termsandconditionsacceptance || "",
    Occupation: data.Occupation || "",
    RelationshipStatus: data.RelationshipStatus || "",
    ReferralCode: data.ReferralCode || "",
    AddressId: data.AddressId || "",
    Addresstype: data.Addresstype || "",
    CustomerName: data.CustomerName || "",
    Mobile: data.Mobile || "",
    Pincode: data.Pincode || "",
    State: data.State || "",
    City: data.City || "",
    Landmark: data.Landmark || "",
    AddressLine1: data.AddressLine1 || "",
    AddressLine2: data.AddressLine2 || "",
    DefaultAddress: data.DefaultAddress || "",
    CountryCode: data.CountryCode,
  };
  console.log("easyRewardzRegistrationParams,", easyRewardzRegistrationParams);
  console.log("***************************************");
  const ErBaseUrl = storeDetails.ErBaseUrl;
  const registrationResponse = await axiosRequest(
    `${ErBaseUrl}/api/customerSignUp`,
    easyRewardzRegistrationParams
  );
  console.log(
    "***************************************Reg Res",
    registrationResponse
  );
  return registrationResponse;
};

const searchUserInShopify = async (data, storeDetails, tag) => {
  const email = data.ShopifyEmailId ? data.ShopifyEmailId : data.EmailId;
  const phone = data.ShopifyPhone ? data.ShopifyPhone : data.MobileNo;

  let url;
  if (tag === "email") {
    url = `https://${storeDetails.StoreName}/admin/api/${api_key}/customers/search.json?email=${email}`;
  } else if (tag === "phone") {
    url = `https://${storeDetails.StoreName}/admin/api/${api_key}/customers/search.json?phone=${phone}`;
  } else {
    url = `https://${storeDetails.StoreName}/admin/api/${api_key}/customers/search.json?email=${email}`;
  }

  const config = {
    method: "get",
    url: url,
    headers: { "X-Shopify-Access-Token": `${storeDetails.AccessToken}` },
    data: "",
  };
  console.log("ccccccccccccccccccccccoooooooonnnnfffiiigg", config);
  const searchUserShopifyResponse = await axios(config);
  console.log(
    "searchUserShopifyResponse{{{{{{{{{{{{{{{{{{{{{{{[[[",
    searchUserShopifyResponse.data
  );
  return searchUserShopifyResponse;
};

const updateUserInShopify = async (data, storeDetails, customerId) => {
  const countryCode = storeDetails.CountryCode;
  const customerInfo = {};
  if (data.EmailId) {
    customerInfo.email = `${data.EmailId}`;
  }
  if (data.MobileNo) {
    customerInfo.phone = `${countryCode}${data.MobileNo}`;
  }
  (customerInfo.password = `${data.Password}`),
    (customerInfo.password_confirmation = `${data.Password}`);
  const param = JSON.stringify({
    customer: {
      customerInfo,
    },
  });
  const config = {
    method: "put",
    url: `https://${storeDetails.StoreName}/admin/api/${api_key}/customers/${customerId}.json`,
    headers: {
      "X-Shopify-Access-Token": `${storeDetails.AccessToken}`,
      "Content-Type": "application/json",
    },
    data: param,
  };
  console.log("CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC", config);
  const shopifyUserUpdateResponse = await axios(config);
  return shopifyUserUpdateResponse;
};

const createUserInShopify = async (data, storeDetails) => {
  const countryCode = storeDetails.CountryCode;
  const param = JSON.stringify({
    customer: {
      first_name: `${data.FirstName}`,
      last_name: `${data.LastName}`,
      email: `${data.EmailId}`,
      phone: `+${countryCode}${data.MobileNo}`,
      password: `${data.Password}`,
      password_confirmation: `${data.Password}`,
    },
  });
  const config = {
    method: "post",
    url: `https://${storeDetails.StoreName}/admin/api/${api_key}/customers.json`,
    headers: {
      "X-Shopify-Access-Token": `${storeDetails.AccessToken}`,
      "Content-Type": "application/json",
    },
    data: param,
  };
  console.log("CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC", config);
  try {
    const shopifyUserCreateResponse = await axios(config);
    return shopifyUserCreateResponse;
  } catch (err) {
    return {
      data: null,
      error: true,
      message: err,
      axiosError: err?.response?.data?.errors,
    };
  }
};

//change the Name generateOtp -----------to------------> generateOTP
const generateOTP = async (data, securityToken, storeDetails) => {
  console.log(
    "+++++++++++======== securityToken =========++++++++++++++ ::",
    securityToken
  );
  console.log("++++++++++=== DATA =====++++++ ::", data);
  const generatOtpParams = {
    MemberID: data.MemberID || "",
    EmailID: data.EmailId,
    MobileNumber: data.MobileNo,
    StoreCode: storeDetails.StoreCode,
    UserName: storeDetails.UserName2,
    SecurityToken: securityToken?.Token,
    CountryCode: data.CountryCode || "91",
  };
  console.log(generatOtpParams);
  const ErBaseUrl = storeDetails.ErBaseUrl;

  const generateOtpResponse = await axiosRequest(
    `${ErBaseUrl}/api/GenerateOTP`,
    generatOtpParams
  );
  return generateOtpResponse;
};

// // for demo
// exports.userRegistrationGenerateOtp = async (ctx, next) => {
//   const data = ctx.request.body;
//   const storeDetails = await Store.findOne({
//     StoreName: data.StoreName,
//   });

//   const logsSaved = await AppLogs.create({
//     ip_address: data.IP,
//     er_endpoint: "https://Apacwebapi.erlpaas.com/api/GenerateOTP",
//     middleware_endpoint: "https://www.batabd.com/apps/b/api/Registration/GenerateOtp",
//     request_body: JSON.stringify(data),
//     email: data.EmailId,
//     phone: data.MobileNo,
//   })
//   // console.log(storeDetails)
//   // if(data.Token) {

//     console.log(data.Token)
//     const tokenValidationResponse = await validateRecaptchaRequest(data.Token)
//     console.log("??????????????????????????????????????????????????????????")
//     console.log("??????????????????????????????????????????????????????????")
//     console.log(tokenValidationResponse.data)
//     console.log("??????????????????????????????????????????????????????????")
//     console.log("??????????????????????????????????????????????????????????")
//     const isTokenValid = tokenValidationResponse.data
//     if (!isTokenValid?.success) {
//       return ctx.response.body = {
//         ReturnCode: "786",
//         ReturnMessage: "Too many Request"
//       }
//     }
//   // }
//   const securityToken = await generateSecurityToken(storeDetails);
//   if (securityToken.ReturnCode != "0")
//     return (ctx.response.body = securityToken);

//   const generateOtpParams = {
//     MemberID: "",
//     EmailId: data.EmailId,
//     MobileNo: data.MobileNo,
//     CountryCode: data.CountryCode,
//   };
//   if (!data.EmailId || !data.MobileNo)
//     return (ctx.response.body = {
//       ReturnCode: 324,
//       ReturnMessage: "Missing Required Fields",
//     });
//   const checkEmailParams = {
//     EasyId: data.EmailId,
//     CountryCode: data.CountryCode,
//   };

//   const isCustomerInEasyrewardzEmail = await isCustomerInEasyrewardz(
//     checkEmailParams,
//     securityToken,
//     storeDetails
//   );
//   console.log("isCustomerInEasyrewardzEmail===>", isCustomerInEasyrewardzEmail);

//   console.log("data.MobileNo", data.MobileNo);
//   console.log(
//     "isCustomerInEasyrewardzEmail.Mobile != data.MobileNo",
//     isCustomerInEasyrewardzEmail.Mobile != data.MobileNo
//   );
//   if (
//     isCustomerInEasyrewardzEmail.ReturnCode == "0" &&
//     isCustomerInEasyrewardzEmail.Mobile != data.MobileNo
//   )
//     return (ctx.response.body = {
//       ReturnCode: "1",
//       ReturnMessage:
//         "Please change either the EmailId or the MobileNo to continue",
//     });

//   const checkMobileParams = {
//     EasyId: data.MobileNo,
//     CountryCode: data.CountryCode,
//   };
//   console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!checkMobileParams", checkMobileParams);
//   const isCustomerInEasyrewardzMobile = await isCustomerInEasyrewardz(
//     checkMobileParams,
//     securityToken,
//     storeDetails
//   );
//   console.log(
//     "!!!!!!!!!!!!!!!!!!!!!!!!!!isCustomerInEasyrewardzMobile",
//     isCustomerInEasyrewardzMobile
//   );

//   console.log(
//     "isCustomerInEasyrewardzMobile===>",
//     isCustomerInEasyrewardzMobile
//   );

//   if (
//     isCustomerInEasyrewardzMobile.Email != "" &&
//     isCustomerInEasyrewardzMobile.ReturnCode == "0" &&
//     isCustomerInEasyrewardzMobile.Email.toLowerCase() !=
//       data.EmailId.toLowerCase()
//   )
//     return (ctx.response.body = {
//       ReturnCode: "2",
//       ReturnMessage:
//         "Please change either the EmailId or the MobileNo to continue",
//     });
//   // START - For Non-Ecommerce Existing Customer
//   if (
//     isCustomerInEasyrewardzMobile.ReturnCode == "0" &&
//     isCustomerInEasyrewardzMobile.EcommerceCustomer == false
//   ) {
//     const generateOtpResponse = await generateOtp(
//       generateOtpParams,
//       securityToken,
//       storeDetails
//     );
//     return (ctx.response.body = {
//       ...generateOtpResponse,
//       ...isCustomerInEasyrewardzMobile,
//     });
//   }
//   // END - For Non-Ecommerce Existing Customer

//   // START - For Non-Ecommerce Existing Customer
//   if (
//     isCustomerInEasyrewardzEmail.ReturnCode == "0" &&
//     isCustomerInEasyrewardzEmail.EcommerceCustomer == false
//   ) {
//     const generateOtpResponse = await generateOtp(
//       generateOtpParams,
//       securityToken,
//       storeDetails
//     );
//     return (ctx.response.body = {
//       ...generateOtpResponse,
//       ...isCustomerInEasyrewardzEmail,
//     });
//   }
//   // END - For Non-Ecommerce Existing Customer
//   if (
//     isCustomerInEasyrewardzMobile.ReturnCode == "0" &&
//     isCustomerInEasyrewardzEmail.ReturnCode == "0"
//   )
//     return (ctx.response.body = {
//       ReturnCode: "3",
//       ReturnMessage: "Email and Mobile Number already exists . Kindly login",
//     });

//   const generateOtpResponse = await generateOtp(
//     generateOtpParams,
//     securityToken,
//     storeDetails
//   );
//   console.log("OTP GENERATED ========>>>>>>>>", generateOtpResponse);

//   return (ctx.response.body = generateOtpResponse);
// };

export const userRegistration = async (req, res, next) => {
  const data = req.body;

  console.log("req body", data);
  const storeDetails = await Store.findOne({
    StoreName: data.StoreName,
  });
  const CountryCode = storeDetails?.CountryCode;
  const ErBaseUrl = storeDetails.ErBaseUrl;
  if (!ErBaseUrl) {
    return res.send({
      ReturnCode: 111,
      ReturnMessage: "Please add EasyRewardz Base Url in App Details",
    });
  }
  console.log(storeDetails);
  const securityToken = await generateSecurityToken(storeDetails);
  if (securityToken.ReturnCode != "0") return res.send(securityToken);

  const checkEmailParams = {
    EasyId: data.EmailId,
    CountryCode: data.CountryCode,
  };
  const isCustomerInEasyrewardzEmail = await isCustomerInEasyrewardz(
    checkEmailParams,
    securityToken,
    storeDetails
  );
  console.log("isCustomerInEasyrewardzEmail", isCustomerInEasyrewardzEmail);

  if (
    isCustomerInEasyrewardzEmail.Mobile != "" &&
    isCustomerInEasyrewardzEmail.ReturnCode == "0" &&
    isCustomerInEasyrewardzEmail.Mobile != data.MobileNo
  ) {
    return res.send({
      ReturnCode: "1",
      ReturnMessage:
        "Please change either the EmailId or the MobileNo to continue",
    });
  }
  const checkMobileParams = {
    EasyId: data.MobileNo,
    CountryCode: data.CountryCode,
  };
  const isCustomerInEasyrewardzMobile = await isCustomerInEasyrewardz(
    checkMobileParams,
    securityToken,
    storeDetails
  );
  console.log("isCustomerInEasyrewardzMobile", isCustomerInEasyrewardzMobile);
  if (
    isCustomerInEasyrewardzMobile.Email != "" &&
    isCustomerInEasyrewardzMobile.ReturnCode == "0" &&
    isCustomerInEasyrewardzMobile.Email.toLowerCase() !=
      data.EmailId.toLowerCase()
  ) {
    return res.send({
      ReturnCode: "2",
      ReturnMessage:
        "Please change either the EmailId or the MobileNo to continue",
    });
    // return resAsFailed(isCustomerInEasyrewardzResponse)
  }

  //testing
  if (
    isCustomerInEasyrewardzMobile.Email != "" &&
    isCustomerInEasyrewardzMobile.ReturnCode == "0" &&
    isCustomerInEasyrewardzMobile.Email.toLowerCase() ==
      data.EmailId.toLowerCase() &&
    isCustomerInEasyrewardzEmail.Mobile != "" &&
    isCustomerInEasyrewardzEmail.ReturnCode == "0" &&
    isCustomerInEasyrewardzEmail.Mobile == data.MobileNo
  ) {
    return res.send({
      data: isCustomerInEasyrewardzMobile,
      ReturnMessage: "User Already Registered,Please login your account",
    });
  }

  console.log(
    "isCustomerInEasyrewardzMobile",
    isCustomerInEasyrewardzMobile.ReturnCode != "0"
  );
  console.log(
    "isCustomerInEasyrewardzEmail",
    isCustomerInEasyrewardzEmail.ReturnCode != "0"
  );

  const searchUserShopifyResponse = await searchUserInShopify(
    data,
    storeDetails
  );
  const searchUserShopifyByPhoneResponse = await searchUserInShopify(
    data,
    storeDetails,
    "phone"
  );
  console.log(
    "searchUserShopifyByPhoneResponse ======>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",
    searchUserShopifyResponse.data.customers
  );
  console.log(
    "searchUserShopifyResponse ======>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",
    searchUserShopifyResponse.data.customers
  );
  if (
    searchUserShopifyResponse.data.customers.length <= 0 &&
    searchUserShopifyByPhoneResponse.data.customers.length <= 0
  ) {
    console.log("-----------INSIDE IFFFFFF---->>>>>>>>>>>>>>.");
    const shopifyUserCreateResponse = await createUserInShopify(
      data,
      storeDetails
    );
    console.log(
      "--------------------------------->>>>>>>>>>>>>>.",
      shopifyUserCreateResponse
    );
  }
  const isEasyRewardzOfflineCustomer =
    (isCustomerInEasyrewardzMobile.ReturnCode == "0" &&
      isCustomerInEasyrewardzMobile.EcommerceCustomer == false) ||
    (isCustomerInEasyrewardzEmail.ReturnCode == "0" &&
      isCustomerInEasyrewardzEmail.EcommerceCustomer == false);
  console.log(
    "########## isCustomerInEasyrewardzMobile.ReturnCode isCustomerInEasyrewardzMobile.ReturnCode isCustomerInEasyrewardzMobile.ReturnCode",
    isCustomerInEasyrewardzMobile.ReturnCode
  );
  console.log(
    "########## isCustomerInEasyrewardzEmail.ReturnCode isCustomerInEasyrewardzEmail.ReturnCode isCustomerInEasyrewardzEmail.ReturnCode",
    isCustomerInEasyrewardzEmail.ReturnCode
  );
  console.log(
    "########## isEasyRewardzOfflineCustomer isEasyRewardzOfflineCustomer isEasyRewardzOfflineCustomer",
    isEasyRewardzOfflineCustomer
  );

  if (isEasyRewardzOfflineCustomer) {
    const existingShopifyCustomer = await searchUserInShopify(
      data,
      storeDetails,
      "email"
    );
    const existingShopifyCustomerByPhone = await searchUserInShopify(
      data,
      storeDetails,
      "phone"
    );
    console.log(
      "existingShopifyCustomerByPhone",
      existingShopifyCustomerByPhone.data.customers,
      existingShopifyCustomerByPhone.data.customers[0],
      existingShopifyCustomerByPhone.data.customers[0]?.id
    );

    console.log(
      "existingShopifyCustomerEMAIL",
      existingShopifyCustomer.data.customers,
      existingShopifyCustomer.data.customers[0]
      //existingShopifyCustomer.data.customers[0].id
    );
    const customerIdByPhone = existingShopifyCustomerByPhone.data.customers[0]
      ? existingShopifyCustomerByPhone.data.customers[0]?.id
      : null;
    const customerIdByEmail = existingShopifyCustomer.data.customers[0]
      ? existingShopifyCustomer.data.customers[0]?.id
      : null;
    const shopifyCustomerId = customerIdByEmail || customerIdByPhone;
    const updatedShopifyUser = await updateUserInShopify(
      data,
      storeDetails,
      shopifyCustomerId
    );
    console.log(
      "***********updatedShopifyUser updatedShopifyUser**************************8",
      updatedShopifyUser
    );
    console.log(
      "************* updatedShopifyUser OOOFFFLLLIIINNNEEEE************************8"
    );
    const updateMemberProfileRes = await updateMemberProfileEasy(
      data,
      storeDetails,
      securityToken
    );
    console.log("updateMemberProfileRes ======>>", updateMemberProfileRes);

    data.CurrentPassword = "";
    data.NewPassword = data.Password;
    const updateMemberPasswordRes = await updatePasswordEasy(
      data,
      storeDetails,
      securityToken
    );
    console.log("updateMemberPasswordRes ======>>", updateMemberPasswordRes);
    if (updateMemberPasswordRes.ReturnCode != "0") {
      return updateMemberPasswordRes;
    }
  }

  if (
    isCustomerInEasyrewardzMobile.ReturnCode != "0" &&
    isCustomerInEasyrewardzEmail.ReturnCode != "0"
  ) {
    const userDetailsFromShopify = await searchUserInShopify(
      data,
      storeDetails
    );
    const userDetailsFromShopifyByPhone = await searchUserInShopify(
      data,
      storeDetails,
      "phone"
    );
    console.log(
      "userDetailsFromShopifyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy",
      userDetailsFromShopify.data
    );
    if (
      userDetailsFromShopify.data.customers.length > 0 ||
      userDetailsFromShopifyByPhone.data.customers.length > 0
    ) {
      const customerIdByPhone = userDetailsFromShopifyByPhone.data.customers[0]
        ? userDetailsFromShopifyByPhone.data.customers[0].id
        : null;
      const customerIdByEmail = userDetailsFromShopify.data.customers[0]
        ? userDetailsFromShopify.data.customers[0].id
        : null;
      const shopifyExistingCustomerId = customerIdByEmail || customerIdByPhone;

      const updatedShopifyUser = await updateUserInShopify(
        data,
        storeDetails,
        shopifyExistingCustomerId
      );
      console.log(
        "**********updatedShopifyUser NOT EXITS AT ALL***************************8",
        updatedShopifyUser
      );
    }
    console.log(
      "*******************************updatedShopifyUser *updatedShopifyUser*****8"
    );
    const registerUserInEasyRewardsResponse = await registerUserInEasyRewards(
      data,
      securityToken,
      storeDetails
    );
    console.log(
      "registerUserInEasyRewardsResponse ======>>",
      registerUserInEasyRewardsResponse
    );
    if (registerUserInEasyRewardsResponse.ReturnCode != "0") {
      //   return (ctx.response.body = registerUserInEasyRewardsResponse);
      return res.send(registerUserInEasyRewardsResponse);
    }
  }

  //Q) Activate Account OR Create Customer in Shopify With Password

  // const generateOtpResponse = await generateOtp(data, securityToken, storeDetails)
  // if (generateOtpResponse.ReturnCode != "0") {
  //   return ctx.response.body = generateOtpResponse
  // }

  console.log("Hello from multiPass");
  let RedirectTo = {
    isRedirectToResetPassword: false,
  };

  req.body = {
    data,
    EmailId: data.EmailId,
    StoreName: data.StoreName,
    ...{ RedirectTo },
  };
  next();
};

export const validateOtp = async (req) => {
  const data = req.body;
  const storeDetails = await Store.findOne({
    StoreName: data.StoreName,
  });
  if (!storeDetails) {
    return {
      ReturnCode: "32",
      ReturnMessage: `Store ${data.StoreName} does not Exist in EasyRewards`,
    };
  }
  const securityToken = await generateSecurityToken(storeDetails);
  if (securityToken.ReturnCode != "0") {
    return securityToken;
  }

  const validateOtpParams = {
    //MemberID: `${data.MobileNo}`,
    UserName: `${storeDetails.UserName2}`,
    RequestID: `${data.RequestID}`,
    OTP: `${data.OTP}`,
    SecurityToken: `${securityToken.Token}`,
    CountryCode: data.CountryCode,
  };
  const ErBaseUrl = storeDetails.ErBaseUrl;
  const generateOtpResponse = await axiosRequest(
    `${ErBaseUrl}/api/ValidateOTP`,
    validateOtpParams
  );
  return generateOtpResponse;
};

export const generateOtp = async (req) => {
  const data = req.body;
  const storeDetails = await Store.findOne({
    StoreName: data.StoreName,
  });
  if (!storeDetails) {
    return {
      ReturnCode: "32",
      ReturnMessage: `Store ${data.StoreName} does not Exist in EasyRewards`,
    };
  }
  const securityToken = await generateSecurityToken(storeDetails);
  const generateOtpResponse = await generateOTP(
    { data, ...{ MemberID: data.MobileNo, EmailId: data.EmailId } },
    //        MobileNo:data.MemberID to data.MobileNo  EmailID ---> data.EmailId
    securityToken,
    storeDetails
  );

  return generateOtpResponse;
};

export const userLogin = async (req, res, next) => {
  let data = req.body;
  const storeDetails = await Store.findOne({
    StoreName: data.StoreName,
  });
  if (!storeDetails) {
    return res.send({
      ReturnCode: "32",
      ReturnMessage: `Store ${data.StoreName} does not Exist in EasyRewards`,
    });
  }

  const securityToken = await generateSecurityToken(storeDetails);
  if (securityToken.ReturnCode != "0") {
    return res.send(securityToken);
  }

  console.log("data ==================>>>>>>>>>"), data;

  const isCustomerParams = {
    EasyId: data.MemberId,
    CountryCode: data.CountryCode,
  };
  console.log("isCustomerParams ==================>>>>>>>>>"), isCustomerParams;

  const isEasyrewardzCustomer = await isCustomerInEasyrewardz(
    isCustomerParams,
    securityToken,
    storeDetails
  );
  console.log("isEasyrewardzCustomer", isEasyrewardzCustomer.ReturnCode != 0);
  // CASE 1 [SCENARIO 4] => ACCOUNT DOES NOT EXIST IN EASYREWARDZ
  console.log("isEasyrewardzCustomer=============>", isEasyrewardzCustomer);
  console.log(
    "isEasyrewardzCustomer=============>",
    isEasyrewardzCustomer.ReturnCode
  );
  if (isEasyrewardzCustomer.ReturnCode != 0) {
    return res.send({
      ReturnCode: "4",
      ReturnMessage: "Account Does Not Exist In EasyRewardz Please Signup",
    });
  }

  const isWebsiteFlag = isEasyrewardzCustomer.EcommerceCustomer == "true";
  // if (isCustomerInEasyrewardz.ReturnCode == "0" && isCustomerInEasyrewardzEmail.Mobile != data.MobileNo)  return ctx.response.body = {ReturnCode: "1", ReturnMessage: "Please change either the EmailId or the MobileNo to continue"}
  // if (isCustomerInEasyrewardz.ReturnCode == "0")  return ctx.response.body = {ReturnCode: "3", ReturnMessage: "Email and Mobile Number already exists . Kindly login"}
  const searchShopifyMemberParams = {
    data,
    ...{ ShopifyEmailId: isEasyrewardzCustomer.Email },
  };

  const searchShopifyMemberResponse = await searchUserInShopify(
    searchShopifyMemberParams,
    storeDetails
  );
  const isUserShopifyMember =
    searchShopifyMemberResponse.data.customers.length > 0;

  const hashedPassword = md5(data.Password);
  const userLoginParams = {
    SecurityToken: securityToken.Token,
    UserName: storeDetails.UserName2,
    MemberId: data.MemberId,
    StoreCode: storeDetails.StoreCode,
    Password: hashedPassword,
    Countrycode: data.CountryCode, // this key should be Countrycode as asked by easyrewardz
  };
  const ErBaseUrl = storeDetails.ErBaseUrl;

  console.log("userLoginParams ==================>>>>>>>>>", userLoginParams);
  const userLoginResponse = await axiosRequest(
    `${ErBaseUrl}/api/CustomerLogin`,
    userLoginParams
  );
  console.log("userLoginResponse", userLoginResponse);
  const isPasswordMatch = userLoginResponse.PasswordMatch == "True";
  const isTemporaryPassword = userLoginResponse.TemporaryPassword == true;
  let RedirectTo = {
    isRedirectToResetPassword: false,
  };
  //CASE-2 [SCENARIO-3] WEBSITE FLAG FALSE AND EXIST IN SHOPIFY
  if (!isWebsiteFlag && !isPasswordMatch && isUserShopifyMember) {
    return res.send({
      ReturnCode: "3",
      ReturnMessage: "Password Incorrect Please Reset Password",
    });
  }

  // CASE-3 [SCENARIO-5] LOGIN WITH TEMPORARY PASSWORD
  if (!isPasswordMatch) {
    return res.send({
      ReturnCode: "5",
      ReturnMessage: "Incorrect Password Please Choose Forgot Password",
    });
  }

  // CASE 4 [SCENARIO 7] => ACCOUNT DOES NOT EXIST IN EASYREWARDZ
  if (!isUserShopifyMember) {
    return res.send({
      ReturnCode: "7",
      ReturnMessage: "Account Does Not Exist In Shopify Please Signup",
    });
  }

  //might change the whole if block
  if (isTemporaryPassword) {
    RedirectTo.isRedirectToResetPassword = true;
    res.send({
      data,
      ...{
        EmailId: isEasyrewardzCustomer.Email,
        StoreName: data.StoreName,
        RedirectTo,
      },
    });
    return next();
  }
  if (
    userLoginResponse.ReturnCode == "253" ||
    userLoginResponse.PasswordMatch == "False"
  ) {
    return res.send({
      ReturnCode: "1",
      ReturnMessage: "Invalid E-mail/Mobile No or Password",
    });
  }
  // If Temperary Password then User Should change his Password
  // data.EmailId =
  req.body = {
    data,
    ...{
      EmailId: isEasyrewardzCustomer.Email,
      StoreName: data.StoreName,
      RedirectTo,
    },
  };
  next();
};

export const multiPassLogin = async (req) => {
  const data = req.body;
  const storeDetails = await Store.findOne({
    StoreName: data.StoreName,
  });
  const multipassSecret = storeDetails.MultiPassSecret;
  console.log("MULTIPASS DATA ++++____>>>>>>>>", data);
  console.log("MULTIPASS DATA ++++____>>>>>>>>", data.EmailId);
  let multipassify = new Multipassify(multipassSecret);
  // Create your customer data hash
  let customerData = {
    email: data.EmailId || EmailId,
    // remote_ip:'USERS IP ADDRESS',
    // return_to:"http://some.url"
  };

  // Need this When Temp Password
  console.log(
    "data.RedirectTo.isRedirectToResetPassword ==============>>>>",
    data.RedirectTo.isRedirectToResetPassword
  );
  if (data.RedirectTo && data.RedirectTo.isRedirectToResetPassword) {
    customerData.return_to = "/pages/reset-password"; //need to confirm Path
  }
  console.log("customerData ==============>>>>", customerData);

  // Encode a Multipass token
  let token = multipassify.encode(customerData);

  // Generate a Shopify multipass URL to your shop
  let url = multipassify.generateUrl(customerData, `${data.StoreName}`);
  console.log("MULTIPASS urlurl ++++____>>>>>>>>", url);

  return {
    ReturnCode: "0",
    LoginUrl: url,
    ReturnMessage: "Success",
  };
};

export const forgotPassword = async (req) => {
  const data = req.body;
  const storeDetails = await Store.findOne({
    StoreName: data.StoreName,
  });
  if (!storeDetails) {
    return {
      ReturnCode: "32",
      ReturnMessage: `Store ${data.StoreName} does not Exist in EasyRewards`,
    };
  }
  const securityToken = await generateSecurityToken(storeDetails);
  if (securityToken.ReturnCode != "0") {
    return securityToken;
  }

  const forgotPasswordParams = {
    SecurityToken: `${securityToken.Token}`,
    UserName: `${storeDetails.UserName2}`,
    EmailId: `${data.EmailId}`,
    StoreCode: `${storeDetails.StoreCode}`,
    // MobileNo: `${data.MobileNo}`,
    Countrycode: data.CountryCode,
  };
  console.log(forgotPasswordParams);
  const forgotPasswordResponse = await axiosRequest(
    `${storeDetails?.ErBaseUrl}/api/forgotPassword`,
    forgotPasswordParams
  );
  console.log(forgotPasswordResponse);

  return forgotPasswordResponse;
};

const updatePasswordEasy = async (data, storeDetails, securityToken) => {
  const hashedCurrentPassword =
    data.CurrentPassword != "" ? md5(data.CurrentPassword) : "";
  const hashedPassword = md5(data.NewPassword);
  const updatePasswordParams = {
    SecurityToken: `${securityToken.Token}`,
    UserName: `${storeDetails.UserName2}`,
    StoreCode: `${storeDetails.StoreCode}`,
    EmailId: `${data.EmailId}`,
    MobileNo: `${data.MobileNo}`,
    CurrentPassword: hashedCurrentPassword,
    NewPassword: `${hashedPassword}`,
    CountryCode: `${data.CountryCode}`,
  };
  const ErBaseUrl = storeDetails.ErBaseUrl;
  console.log("updatePasswordParams", updatePasswordParams);
  return await axiosRequest(
    `${ErBaseUrl}/api/updatePassword`,
    updatePasswordParams
  );
};

export const updatePassword = async (req, res) => {
  const data = req.body;
  const storeDetails = await Store.findOne({
    StoreName: data.StoreName,
  });
  console.log("+++++++++++++++++++++++++++++===");
  console.log("+++++++++++++++++++++++++++++===");
  console.log("+++++++++++++++++++++++++++++===");
  console.log("+++++++++++++++++++++++++++++===");
  console.log(data);
  if (!storeDetails) {
    return {
      ReturnCode: "32",
      ReturnMessage: `Store ${data.StoreName} does not Exist in EasyRewards`,
    };
  }

  const securityToken = await generateSecurityToken(storeDetails, storeDetails);
  if (securityToken.ReturnCode != "0") {
    return securityToken;
  }

  const updatePasswordResponse = await updatePasswordEasy(
    data,
    storeDetails,
    securityToken
  );
  console.log("updatePasswordResponse", updatePasswordResponse);
  return updatePasswordResponse;
};

export const getCustomerDetails = async (req) => {
  const data = req.body;
  const storeDetails = await Store.findOne({
    StoreName: data.StoreName,
  });
  if (!storeDetails) {
    return {
      ReturnCode: "32",
      ReturnMessage: `Store ${data.StoreName} does not Exist in EasyRewards`,
    };
  }

  const securityToken = await generateSecurityToken(storeDetails);
  if (securityToken.ReturnCode != "0") {
    return securityToken;
  }
  const customerResponse = await isCustomerInEasyrewardz(
    data,
    securityToken,
    storeDetails
  );

  return customerResponse;
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
