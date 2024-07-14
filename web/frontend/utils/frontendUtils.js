function getShopNameFromUrl(fullUrl) {
    // console.log("Full url ", fullUrl);
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
    // const regex = /shop=([^&]*)/;
    // const match = fullUrl.match(regex);
    // let result = match ? match[1] : null;
    // if (!result) {
    //     result = sessionStorage.getItem("store-url-check");
    // } else if (!result) {
    //     result = document.getElementsByTagName("iframe")[0].src.match(regex);
    // }

    // if (result) sessionStorage.setItem("store-url-check", result);
    // // console.log("Result ", result);
    // return result;



    /* Trying to avoid the Local or session storage  */

    // const regex = /store\/([^/]+)\/apps/;//admin parent fullUrl-->https://admin.shopify.com/store/easyrewards/apps/easyrewards
    // const match = fullUrl.match(regex);
    // let result = match && `${match[1]}.myshopify.com`;
    // if (!result) {
    //     result = document.getElementsByTagName("iframe")[0]?.src.match(/shop=([^&]*)/) ?
    //         document.getElementsByTagName("iframe")[0]?.src.match(/shop=([^&]*)/)[1] : null;
    // }

    // console.log("Result ",result);
    // return result ? result : "";

    console.log("fullUrl ",fullUrl);
    if (fullUrl) {
        return fullUrl.split("&shop=")[1].split("&timestamp")[0]
    }
    else {
       return null
    }
}


export {
    getShopNameFromUrl
}