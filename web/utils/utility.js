import axios from "axios";
import { AppSetting } from "../model/appSetting.model.js";
import { Store } from "../model/store.model.js";

export function getShopNameFromUrl(fullUrl) {
  /*
   str=https://admin.myadmin.com/store/dawn201/apps/jkgaghjghjg/?shop=www.url.com&host=7788jhghafsgdhfghf"
   
   Explanation:
   
   The regular expression used here is /shop=([^&]*)/. Here's what each part of the regular expression means:
   
   / and / are the delimiters used to define the regular expression pattern.
   shop= matches the literal string "shop=" in the input string.
   ([^&]*) matches any character sequence that doesn't contain an ampersand (&). 
   The [^&] part is a negated character class that matches any character except an ampersand, 
   and the * quantifier means to match zero or more of these characters. 
   The parentheses capture this matched sequence as a group.
   
   output:www.url.com
   */
  /* const regex = /shop=([^&]*)/;
  const match = fullUrl.match(regex);
  let result = match ? match[1] : null;
  if (!result) {
    result = sessionStorage.getItem("store-url-check");
  } else if (!result) {
    result = document.getElementsByTagName("iframe")[0].src.match(regex);
  }

  if (result) sessionStorage.setItem("store-url-check", result);

  return result; */

  /* Trying to avoid the Local or session storage  */
  const regex = /store\/([^/]+)\/apps/;//admin parent fullUrl-->https://admin.shopify.com/store/easyrewards/apps/easyrewards
  const match = fullUrl.match(regex);
  let result = match && `${match[1]}.myshopify.com`;
  if (!result) {

    result = document.getElementsByTagName("iframe")[0]?.src.match(/shop=([^&]*)/) ?
      document.getElementsByTagName("iframe")[0]?.src.match(/shop=([^&]*)/)[1] : null;

  }

  return result;
}

export function isEmpty(arg) {
  if (arg === "" || arg === undefined || arg === null) return true;
  else if (arg && typeof arg === "number") return false;
  else if (Array.isArray(arg) && arg.length <= 0) return true;
  else if (Object.keys(arg).length <= 0) return true;
  else return false;
}

export function getStartAndEndDate(specificISDateString) {
  // const now = new Date('2024-01-04T00:00:52.519Z'); // Get the current date and time
  const now = new Date(specificISDateString); // Get the current date and time
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Subtract 24 hours in milliseconds
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // Subtract 48 hours in milliseconds

  //console.log(`One day ago: ${oneDayAgo}`);//One day ago: Mon Apr 03 2023 00:00:52 GMT+0000 (Coordinated Universal Time)
  //console.log(`Two days ago: ${twoDaysAgo}`);//Two days ago: Sun Apr 02 2023 00:00:52 GMT+0000 (Coordinated Universal Time)

  return [oneDayAgo, twoDaysAgo];
}

export function getDateString(date) {
  //Example- new Date('2023-01-17T10:44:25.427+00:00').toDateString()
  // output returned-->'Tue Jan 17 2023'
  if (!date) return new Date().toDateString();
  return new Date(date).toDateString();
}

export function getDateTimestamp(date) {
  //Example- new Date('2023-01-17T10:44:25.427+00:00').getTime().toString()
  // output returned-->'1673952265427'
  if (!date) return new Date().getTime().toString();
  return new Date(date).getTime().toString();
}

export function convertToDateTimeObject(timeString) {
  const [hours, minutes, seconds] = timeString.split(":");
  const date = new Date();
  date.setHours(parseInt(hours, 10));
  date.setMinutes(parseInt(minutes, 10));
  date.setSeconds(parseInt(seconds, 10));
  return date;

  // Example usage
  // const timeString = '14:30:00';
  // const timeObject = convertToTimeObject(timeString);
  // console.log(timeObject);

  //output:Sun Mar 27 2022 14:30:00 GMT+0800 (Taipei Standard Time)
}

export function getCronExpression(MM = "00", HH = "00", timeInterval = "00") {
  let newMM = parseInt(MM) + parseInt(timeInterval);
  let newHH = parseInt(HH);

  if (newMM >= 60) {
    newMM = Math.abs(newMM - 60);
    newHH = newHH + 1;
  }

  if (newMM < 10) {
    newMM = `0${newMM}`;
  }

  if (newHH < 10) {
    newHH = `0${newHH}`;
  }

  return `${newMM} ${newHH} * * *`;

  /*
  EG:
  console.log(getCronExpression(59)); //59 00 * * *
  console.log(getCronExpression('58','5','5'));   //59 00 * * *
  console.log(getCronExpression('7','5','5'));   //12 05 * * *
  console.log(getCronExpression('4','5','5'));   //09 05 * * *
  console.log(getCronExpression('03','00','5'));  //08 00 * * *
  */
}

export function isPrefixedWithHash(str) {
  const regex = /^#/;
  return regex.test(str);
  /*  if (regex.test(str)) {
     console.log("The string starts with #");
   } else {
     console.log("The string does not start with #");
   } */
  //CALL-->isPrefixHash("SWT123")
  //OUTPUT-->THE string does not start with #
}

export const appDefaultSettings = async (shop, accessToken, isPlusStore) => {
  console.log(
    "+++++++++++++++ appDefaultSettings is started +++++++++++++++++++"
  );
  console.log("shop, accessToken, newScriptTag", shop, accessToken);

  const savedStore = await Store.find({
    StoreName: shop,
  });
  const uniqueValueForDomain = new Date().valueOf().toString();

  const isStoreSaved = savedStore.length > 0;
  if (!isStoreSaved) {
    const savedData = await Store.create({
      AccessToken: accessToken,
      StoreName: shop,
      domainName: uniqueValueForDomain,
      Status: "InActive",
      isPlusStore: false,
      Modal1: {
        Heading: "Enter Your Mobile Number",
        SubmitButtonText: "Submit",
        SubmitButtonColor: "#1E1E1E",
        CancelButtonText: "Cancel",
        CancelButtonColor: "#1E1E1E",
        CustomMessage: "",
        RedeemPointsButtonColor: "#1E1E1E",
        RedeemPointsButtonText: "Redeem Rewards",
        ApplyCouponButtonColor: "#1E1E1E",
        ApplyCouponButtonText: "Redeem Loyalty Coupon",
      },
      ModalB: {
        Heading: "Account Balance",
        CancelButtonText: "Cancel",
        CancelButtonColor: "#1E1E1E",
      },
      Modal2: {
        Heading: "Enter Points to Redeem",
        SubmitButtonText: "Submit",
        SubmitButtonColor: "#1E1E1E",
        CancelButtonText: "Cancel",
        CancelButtonColor: "#1E1E1E",
      },
      Modal3: {
        Heading: "Confirm OTP",
        SubmitButtonText: "Submit",
        SubmitButtonColor: "#1E1E1E",
        CancelButtonText: "Cancel",
        CancelButtonColor: "#1E1E1E",
      },
      RedeemButton: {
        ButtonColor: "#1E1E1E",
        DomSelector: "",
      },
    });
    // console.log("appDefaultSettings function :*********", savedData);
  }
  // add app settings
  const appSettings = await AppSetting.find({
    StoreName: shop,
    isDeleted: false
  });
  const isAppSettingsSaved = appSettings.length > 0;
  if (!isAppSettingsSaved) {
    const savedData = await AppSetting.create({
      StoreName: shop,
      webhooksAllowed: [],
      domainName: uniqueValueForDomain,
      pointsSetting: "pointAsTender",
      taxSetting: "taxInProduct",
      isTestMode: true,
    });
  }

  //Not Sure About Prod ************
  const isAccessTokenUpdated =
    isStoreSaved && savedStore.AccessToken != accessToken;
  if (isAccessTokenUpdated) {
    const savedStore = await Store.updateOne(
      { StoreName: shop },
      { AccessToken: accessToken },
      { new: true }
    );
    // console.log("appDefaultSettings function:savedStore =>", savedStore);
  }

  if (isPlusStore) {
    const updateStoreDetails = await Store.updateOne(
      {
        StoreName: shop,
      },
      { $set: { isPlusStore: true } }
    );
  }
  console.log("+++++++++++++++ appDefaultSettings is end +++++++++++++++++++");
  return;
};

//checkShopisPLusOrNonPlus  ---> return a promise
export const checkShopisPlusOrNonPlus = async (shop, accessToken) => {
  if (!shop || !accessToken) {
    return "Your Shop||accessToken is not provided";
  }
  try {
    let res = await axios.get(`https://${shop}/admin/api/2022-10/shop.json`, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
      },
    });
    let data = await res;
    return data;
  } catch (error) {
    return error;
  }
};

export const getShopfromHeadReferer = (request) => {
  const inputString = request.headers.referer;
  const regex = /(?:^|&)shop=([^&]+)/;
  const match = inputString.match(regex);
  if (match) {
    const shopValue = match[1];
    console.log("shopValue", shopValue);
    return shopValue;
  } else {
    console.log("Shop value not found in the string.");
  }
}

export function replaceNullWithEmptyString(obj) {
  for (let key in obj) {
      if (obj[key] === null) {
          obj[key] = ''; // Replace null with an empty string
      }
  }
  return obj;
}