import axios from "axios";
import { Store } from "../model/store.model.js";
import { checkShopisPlusOrNonPlus, getShopfromHeadReferer } from "../utils/utility.js";

//when user change Plus Store To Non Plus
var plusToNonPlusScriptId;

export const checkStoreService = async (req) => {
  try {
    let shopName = req.query.shop;
    const storeDetails = await Store.findOne({
      StoreName: shopName,
    });
    const accessToken = storeDetails.AccessToken;
    const shopDetailsResponse = await checkShopisPlusOrNonPlus(
      shopName,
      accessToken
    );
    const shopDetails = shopDetailsResponse?.data;

    if (shopDetails.plan_display_name === "Shopify Plus") {
      const updateStoreDetails = await Store.updateOne(
        { StoreName: shopName },
        { isPlusStore: true }
      );
      console.log("update Details from checkStore Api ::", updateStoreDetails);
      return {
        data: updateStoreDetails,
      };
    }
  } catch (err) {
    return {
      error: err,
      message: err.message,
    };
  }
};

export const checkStoreIsPlusOrNonPlusService = async (req) => {
  try {
    const data = req.body;
    const storeDetails = await Store.findOne({ StoreName: data.StoreName || getShopfromHeadReferer(req) });
    console.log("storeDatails", storeDetails);

    const checkShopisPlusorNosPlusResponse = await checkShopisPlusOrNonPlus(
      storeDetails?.StoreName,
      storeDetails?.AccessToken
    );
    const checkShopData = checkShopisPlusorNosPlusResponse?.data;

    console.log("checkShopData Response :::", checkShopData);
    return {
      status: 200,
      data: checkShopData,
      isPlusStore:storeDetails?.isPlusStore,
      isUser:storeDetails?.isUser
    };
  } catch (err) {
    return {
      statsu: 500,
      error: err.message || "Internal server error",
    };
  }
};


export const isPlusStore = async(req) => {
  const data = req.body;
  console.log("REQUEST BOdy", data)
  if(!data?.StoreName){
    return {
      status:"error",
      code:500,
      message:"please provide store Name"
    }
  }
  const storeDetails = await Store.findOne({ StoreName: data.StoreName || getShopfromHeadReferer(req) });
  console.log("storeDatails Store Name", storeDetails.StoreName);
  return {
    status:"success",
    isPlusStore : storeDetails?.isPlusStore,
    isUser : storeDetails?.isUser
  }
}

export const updatePlusStoreToNonPlusService = async (req) => {
  try {
    const data = req.body;
    const shop = data?.StoreName || req.query.shop || getShopfromHeadReferer(req);
    console.log("data", data);
    if (typeof data?.value !== "boolean") {
      return {
        status: 400,
        messsage: "Please provide data is boolean",
      };
    }
    const storeDetails = await Store.findOne({ StoreName: shop });
    console.log("storeDatails", storeDetails);

    await Store.findByIdAndUpdate(storeDetails?._id, {
      $set: {
        isPlusStore: data?.value || false,
        customeToken: null,
        jwtToken: null,
        isUser: "non-plus",
      },
    });

    const allScriptTag = await checkAllScriptTag(
      storeDetails?.StoreName,
      storeDetails?.AccessToken
    );
    console.log("allScriptTag", allScriptTag);
    const allScriptTagSrc = allScriptTag.map((filteredTag) => filteredTag.src);
    const isEasyRewardScriptTag = allScriptTagSrc.includes(
      `${process.env.BASEURL}/index.js`
    );

    console.log(
      "isEasyRewardScriptTag in Change Plan Plus to Non plus",
      isEasyRewardScriptTag
    );
    if (isEasyRewardScriptTag) {
      return {
        status: 200,
        data: "",
        message: "script tag is already registerd",
      };
    } else {
      /*
      //NO SCRIPT IS USED NOW EVERYTHING IS HANDLED BY SHOPIFY THEME APP EXTENSION
 
       const scriptUrl = `https://${storeDetails?.StoreName}/admin/api/2023-07/script_tags.json`;
       const scripTagsResponse = await axios.post(
         scriptUrl,
         {
           script_tag: {
             event: "onload",
             src: `${process.env.BASEURL}/index.js`,
           },
         },
         {
           headers: {
             "X-Shopify-Access-Token": storeDetails?.AccessToken,
             "Content-Type": "application/json",
           },
         }
       );
       plusToNonPlusScriptId = scripTagsResponse?.data?.script_tag?.id;
       console.log("plusToNonPlusScriptId ::", plusToNonPlusScriptId); */
      return {
        status: 200,
        data: null,
      };
    }
  } catch (err) {
    console.log(err)
    return {
      status: 500,
      error: err.message,
    };
  }
};

////====   When user Change Non Plus To Plus (but user already Plus User)
export const updateNonPlusToPlusService = async (req) => {
  try {
    const data = req.body;
    const storeName = data?.StoreName || req.query.shop || getShopfromHeadReferer(req);
    console.log(`Inside updateNonPlusToPlusService fun:storeName=> ${storeName}`)
    console.log("data", data);
    if (typeof data?.value !== "boolean") {
      return {
        status: 400,
        messsage: "Please provide data is boolean",
      };
    }
    const storeDetails = await Store.findOne({ StoreName: storeName });
    const shop = storeDetails?.StoreName;
    const accessToken = storeDetails?.AccessToken;

    console.log("storeDatails", storeDetails);

    await Store.findByIdAndUpdate(storeDetails?._id, {
      $set: {
        isPlusStore: data?.value || true,
        customeToken: null,
        isUser: "plus",
      },
    });

    console.log("plusToNonPlusScriptId", plusToNonPlusScriptId);

    /* 
    //NO SCRIPT IS USED NOW EVERYTHING IS HANDLED BY SHOPIFY THEME APP EXTENSION
    const allScriptTags = await checkAllScriptTag(shop, accessToken);
    console.log("allScriptTags", allScriptTags);

    const scriptTags = allScriptTags?.filter(
      (tag) => tag.src == `${process.env.BASEURL}/index.js`
    );
    console.log("scriptTags in change in PLUS", scriptTags);
    const scriptUrl = `https://${shop}/admin/api/2023-07/script_tags/${scriptTags[0].id}.json`;

    console.log("script Url from api", scriptUrl);
    const scripTagsResponse = await axios.delete(scriptUrl, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });
    console.log("scripTagsResponse From API", scripTagsResponse); 
    */
    return {
      status: 200,
      data: null,
    };
  } catch (err) {
    console.log(err)
    return {
      status: 500,
      error: err.message,
    };
  }
};


export const updateStoreFromAdminService = async (req) => {
  try {
    const data = req.body;
    console.log("data", data);

    const storeDetails = await Store.findOne({ StoreName: data?.StoreName || req.query.shop || getShopfromHeadReferer(req) });
    console.log("storeDetails", storeDetails);

    const updateData = await Store.findByIdAndUpdate(storeDetails?._id, {
      $set: {
        appAccessToken: data?.appAccessToken,
        allowOrigin: data?.allowOrigin,
        MultiPassSecret: data?.MultiPassSecret,
      },
    });
    return "data updated successfully";
  } catch (err) {
    return {
      status: 500,
      error: err.message,
    };
  }
};


export const checkAllScriptTag = async (shop, accessToken) => {
  const checkAllScriptUrl = `https://${shop}/admin/api/2023-07/script_tags.json`;
  const allScriptRes = await axios.get(checkAllScriptUrl, {
    headers: {
      "X-Shopify-Access-Token": accessToken,
      "Content-Type": "application/json",
    },
  });

  const scriptTags = allScriptRes?.data?.script_tags.filter(
    (tag) => tag.src == `${process.env.BASEURL}/index.js`
  );

  return scriptTags;
};
