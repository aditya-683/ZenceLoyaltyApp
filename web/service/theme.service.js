import axios from "axios";
import { Store } from "../model/store.model.js";
import { getShopfromHeadReferer } from "../utils/utility.js";


export const getShopifyThemeService = async (query) => {
    const storeName = query.shopName || query.shop;
    const theme = query.themeId;
    console.log("theme ", theme);
    try {
        const storeDetails = await Store.findOne({
            StoreName: storeName
        })
        const accessToken = storeDetails?.AccessToken;

        if (!theme) {
            const themeResponse = await axios
                .get(`https://${storeName}/admin/api/2023-07/themes.json`, {
                    headers: {
                        "X-Shopify-Access-Token": `${accessToken}`,
                    },
                });
            const themeArray = themeResponse.data;
            console.log("data :::", themeArray);
            return { data: themeArray };
        } else {
            const themeResponse = await axios.get(`https://${storeName}/admin/api/2023-07/themes/${theme}.json`, {
                headers: {
                    "X-Shopify-Access-Token": `${accessToken}`,
                },
            })
            const themeArray = themeResponse.data;
            console.log("data :::", themeArray);
            return { data: themeArray };

        }
    } catch (err) {
        console.log("err in theme", err.message);
        return { message: "err", err: err.message };
    };
}

export const getThemebyId = async (req) => {
    const themeId = req.query.themeId;
    const shopName = req.shopName || getShopfromHeadReferer(req)|| req.shop 
    
    console.log("themeId =========>>>>>>>>>",themeId);
    console.log("shopName =======>>>>>>>>>>",shopName);

    const storeDetails = await Store.findOne({
        StoreName: shopName
    })
    const accessToken = storeDetails.AccessToken;

    const themeResponse = await axios.get(`https://${shopName}/admin/api/2023-07/themes/${themeId}.json`, {
        headers: {
            "X-Shopify-Access-Token": `${accessToken}`,
        },
    })
    const themeObject = themeResponse.data;
    console.log("data :::", themeObject);
    return { data: themeObject };
}