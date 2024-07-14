import { SessionStore } from "../model/customSession.model.js";
import { Session } from "@shopify/shopify-api";
import {
  appDefaultSettings,
  checkShopisPlusOrNonPlus,
  replaceNullWithEmptyString,
} from "../utils/utility.js";
import axios from "axios";
import { StoreDetails } from "../model/storeDetails.model.js";
import { Store } from "../model/store.model.js";
const registerShopifySctipTags = async (shop, apptoken) => {
  try {
    //Now Using App-Embeds to Register a Script

    /* const scriptUrl = `https://${shop}/admin/api/2023-07/script_tags.json`;

        const allScriptRes = await axios.get(scriptUrl, {
            headers: {
                "X-Shopify-Access-Token": apptoken,
                "Content-Type": "application/json",
            },
        });

        const scriptTags = allScriptRes.data.script_tags
            .filter((tag) => tag.src == `${process.env.BASEURL}/index.js`)
            .map((filteredTag) => filteredTag.src);

        // console.log("+++++++++++++++++++++++++++ SCRIPT TAGS", scriptTags);
        const isEasyRewardScriptTag = scriptTags.includes(
            `${process.env.BASEURL}/index.js`
        );
        let isPlusStore = false;
        if (isEasyRewardScriptTag) {
            //do nothing if there is already a script register
        } else {

            const checkShopisPlusorNosPlusResponse = await checkShopisPlusOrNonPlus(
                shop,
                apptoken
            );

            const checkShopData = checkShopisPlusorNosPlusResponse?.data;
            const planNameInDevploment = "Shopify Plus"; //"Developer Preview"; //"Shopify Plus"||shopify_plus
            const deveplometPlusSandbox = "plus_partner_sandbox";

            if ((checkShopData?.shop?.plan_display_name === planNameInDevploment) ||
                (checkShopData?.shop?.plan_name === deveplometPlusSandbox) ||
                (checkShopData?.shop?.plan_display_name === "Shopify Plus Partner Sandbox")) {
                isPlusStore = true;
                console.log("updateStoreDetails  ::: isPlusStore===", isPlusStore);
            } else {
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
                            "X-Shopify-Access-Token": apptoken,
                            "Content-Type": "application/json",
                        },
                    }
                );
            }

            // const scriptId=scripTagsResponse.data.script_tag.id;
        } */
    let isPlusStore = false;
    const checkShopisPlusorNosPlusResponse = await checkShopisPlusOrNonPlus(
      shop,
      apptoken
    );

    const checkShopData = checkShopisPlusorNosPlusResponse?.data;
    const planNameInDevploment = "Shopify Plus"; //"Developer Preview"; //"Shopify Plus"||shopify_plus
    const deveplometPlusSandbox = "plus_partner_sandbox";

    if (
      checkShopData?.shop?.plan_display_name === planNameInDevploment ||
      checkShopData?.shop?.plan_name === deveplometPlusSandbox ||
      checkShopData?.shop?.plan_display_name === "Shopify Plus Partner Sandbox"
    ) {
      isPlusStore = true;
      console.log("updateStoreDetails  ::: isPlusStore===", isPlusStore);
    }
    await appDefaultSettings(shop, apptoken);
    return true;
  } catch (err) {
    console.log("registerShopifySctipTags error", err);
    return false;
  }
};

const makeStoreAddress = (storeData = {}) => {
  const addressParts = [];
  if (storeData?.address1) addressParts.push(storeData?.address1);
  if (storeData?.address2) addressParts.push(storeData?.address2);
  if (storeData?.city) addressParts.push(storeData?.city);
  if (storeData?.province) addressParts.push(storeData?.province);
  if (storeData?.country_name) addressParts.push(storeData?.country_name);
  if (storeData?.zip) addressParts.push(storeData?.zip);

  return addressParts.join(", ");
};

const registerStoreDetails = async (shop, apptoken) => {
  try {
    let res = await axios.get(` https://${shop}/admin/api/2023-10/shop.json`, {
      headers: {
        "X-Shopify-Access-Token": apptoken,
      },
    });
    const storeData = res?.data?.shop;

    const storeDataAddress = makeStoreAddress(storeData);

    const storeDetailsObj = {
      name: storeData?.shop_owner,
      companyName: storeData?.domain,
      address: storeDataAddress,
      phone: storeData?.phone,
      countryCode: storeData?.country_code,
      email: storeData?.customer_email,
      storeName: shop,
    };
     await StoreDetails.findOneAndUpdate(
      { storeName: shop },
      { unInstalled: false, ...storeDetailsObj },
      { upsert: true, new: true }
    );

  
  } catch (error) {
    console.log("registerStoreDetails Error", error);
    return false;
  }
};

export class CustomSession {
  async storeSession(session) {
    try {
      const sessionId = session.id;
      console.log("sessopnmobj==", session);
      const propArray = session.toPropertyArray();
      console.log("propArray==", propArray);
      await SessionStore.updateOne(
        {
          id: sessionId,
        },
        {
          $set: { ...session },
        },
        { upsert: true }
      );

      await registerStoreDetails(session?.shop, session?.accessToken);

      return registerShopifySctipTags(session.shop, session.accessToken);
    } catch (error) {
      console.log("error in storeSession:", error);
      return false;
    }
  }

  async loadSession(id) {
    try {
      

      const sessionStorage = await SessionStore.findOne({
        id: id,
      });
    

      console.log(sessionStorage,"%%%%%%%%%%%%%%%%%%%%")

      if (sessionStorage) {

        const storeDetails=await StoreDetails.find({storeName:sessionStorage?.shop})

        if(storeDetails.length===0){
        await registerStoreDetails(sessionStorage?.shop, sessionStorage?.accessToken);
        }

        /*  sessionStorage.isActive = function () {
                     const scopesUnchanged = Shopify.Context.SCOPES.equals(session.scope);
 
                     if (
                         scopesUnchanged &&
                         session.accessToken &&
                         (!session.expires || session.expires >= new Date())) {
                         return true;
                     }
                     return false;
                 } */
        let { _id, __v, ...formatedSession } = sessionStorage._doc;
        const sessObj = new Session(formatedSession);
        console.log("expires==", sessObj.expires);
        console.log("isActive==", sessObj.isActive());
        console.log("isOnline==", sessObj.isOnline);
        return sessObj;
      } else {
        return undefined;
      }
    } catch (error) {
      console.log("error in loadSession:", error);
      return undefined;
    }
  }

  async deleteSession(sessionId) {
    try {
      await SessionStore.deleteOne({
        id: sessionId,
      });
      return true;
    } catch (error) {
      console.log("error in deleteSession:", error);
      return false;
    }
  }

  async findSessionsByShop(shop) {
    try {
      console.log("find Session $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
      const sessionObject = await SessionStore.findOne({
        shop: shop,
      });
      if (!sessionObject) return [];
      return [sessionObject];
    } catch (error) {
      console.log("error in deleteSession:", error);
      return [];
    }
  }

  async deleteSessions(sessionIds) {
    try {
      await SessionStore.deleteMany({
        id: {
          $in: [sessionIds],
        },
      });
      return true;
    } catch (error) {
      console.log("error in deleteSession:", error);
      return false;
    }
  }
}
