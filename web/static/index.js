const observer = new PerformanceObserver((list) => {
  //  console.log("PerformanceObserver List :::", list);
  for (const entry of list.getEntries()) {
    // console.log("observer 1")
    // console.log("entry.initiatorType", entry.initiatorType)
    // console.log("entry.name", entry.name)
    // console.log("entry", entry)

    if (
      entry.initiatorType === "fetch" ||
      entry.initiatorType === "xmlhttprequest"
    ) {
      // console.log("observer 1 if conditions")

      if (
        [
          `${window.location.origin}/cart/add.js`,
          `${window.location.origin}/cart/add`,
          // `${window.location.origin}/cart/update.js`,
          `${window.location.origin}/cart/change.js`,
          `${window.location.origin}/cart/change`,
          `${window.location.origin}/cart/clear.js`,
          `${window.location.origin}/cart/clear`,
        ].includes(entry.name)
      ) {
        // console.log("observer 2")
        // console.log(localStorage.identifier, ' <- Fetch request detected to > ', entry.name);

        if (
          localStorage.getItem("identifier") &&
          localStorage.getItem("id") &&
          localStorage.getItem("cd")
        ) {
          /*  console.log(
             "RRRRRRREEEEEELLLLLEEEEEEAAAAASSSSSSSSSSEEEDDDDDDD   PPPPOOOOIIINNNTTTSSS ======>>>>>>"
           ); */
          const releasePointsData = {
            EasyId: localStorage.id,
            TransactionCode: localStorage.identifier,
            StoreName: Shopify.shop,
            CouponCode: localStorage.cd,
          };
          // console.log("release Points Data :::", releasePointsData);
          const removeCartAttr = () => {
            //  console.log("remove_CartAttr :::")
            var xhr = new XMLHttpRequest();
            xhr.open("GET", "/cart.js", true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.onload = function () {
              if (xhr.status === 200) {
                var resp = JSON.parse(xhr.responseText);
                var nullHash = {};
                for (var [key, value] of Object.entries(resp.attributes)) {
                  nullHash[key] = null;
                }
                //cart/update.js
                // console.log("cart update is start :::::::")
                var xhr2 = new XMLHttpRequest();
                xhr2.open("POST", "/cart/update.js", true);
                xhr2.setRequestHeader("Content-Type", "application/json");
                xhr2.onload = function () {
                  if (xhr2.status === 200) {
                    // console.log("Cart updated successfully");
                  } else {
                    console.log("Error updating cart");
                  }
                };
                xhr2.send(JSON.stringify({ attributes: nullHash }));
              } else {
                console.log("Error getting cart data");
              }
            };
            xhr.send();
          };
          const xhr = new XMLHttpRequest();
          // console.log("after remove_Cart_Attr :::::");

          xhr.open("POST", "/apps/ez/api/ReleaseRedemptionPoints");
          xhr.setRequestHeader("Content-Type", "application/json");
          xhr.onload = function () {
            if (xhr.status === 200) {
              const result = JSON.parse(xhr.responseText);
              // console.log("POINT RELEASED DDDDDD", result);
              localStorage.removeItem("identifier");
              localStorage.removeItem("cd");
            } else {
              // console.error("POINT RELEASE ERROR", xhr.statusText);
              const error = JSON.parse(xhr.responseText);
              if (error.ReturnCode == 370) {
                localStorage.removeItem("identifier");
                localStorage.removeItem("cd");
              }
            }
          };

          // console.log("before Network Error Func :::");
          xhr.onerror = function () {
            console.error("Network Error");
          };
          xhr.send(JSON.stringify(releasePointsData));

          removeCartAttr();

          //   console.log("localStorage.identifier", localStorage.identifier);
        }

        if (localStorage.getItem("ub")?.length > 1) {
          unblockCoupon(JSON.parse(localStorage.getItem("ub")))
            .then((res) => {
              // console.log("coupon Released");
              localStorage.removeItem("ub");
            })
            .catch((err) => {
              console.log("error while releasing coupon:", err);
            });
        }
      }
    }
    // console.log("observer 1 else code")
  }

});

observer.observe({
  type: "resource",
  buffered: true,
});
/* observer.observe({
  entryTypes: ["resource"]
}); */

const applyDiscountCode = async (discountCode) => {
  console.log("applyDiscountCoupon ::", discountCode);
  if (discountCode == null || !discountCode) {
    await fetch(`/discount/random`);
    return;
  } else {
    try {
      await fetch(`/discount/${discountCode}`);
    } catch (error) {
      console.log("apply discount error:", error);
    }
  }
};
const possibleSelector = [
  'button[name="checkout"]',
  ".btn.cart__checkout",
  "#checkout",
  '[href="/checkout"]',
  'form[action="/cart"]',
  "#cart-notification-form",
  'button[type="submit"]',
  'form[action="/cart"]',
  'input[type="submit"]',
  'form[action="/checkout"]',
  'input[type="submit"]',
  'form[action="/checkout"]',
  'button[type="submit"]',
  "button.ucd-checkout-btn",
];
let stc_DefaultSelector = possibleSelector.find((item) => {
  //console.log(item, " <- item selected");
  return document.querySelector(item)?.innerHTML !== undefined;
});

/* console.log(
  "possible-selector is :",
  stc_DefaultSelector
); */

const makeAjaxRequest = async (url, data, method = "POST") => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      //console.log("bbbbbbbbbbbbb");
      if (xhr.readyState === 4 && xhr.status === 200) {
        // console.log("Yes result came", xhr.responseText);
        resolve(xhr.responseText);
      } else if (xhr.readyState === 4 && xhr.status !== 200) {
        reject(xhr.responseText);
      }
    };

    xhr.open(method, url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(data));
  });
};

/* console.log(
  "33333333333333333333333333333333333333333333333333333333333333333"
); */
function showLoader(isVisible) {
  let loader =
    document
      .querySelector("#iframeID")
      ?.contentWindow?.document?.body?.querySelector(".abhi_loader") ||
    document.querySelector(".abhi_loader");

  if (loader) {
    if (isVisible && loader.style.display == "block") return;
    else if (!isVisible && loader.style.display == "none") return;

    if (isVisible) loader.style.display = "block";
    else loader.style.display = "none";
  }
}

const showErrorMessage = (message) => {
  showLoader(false);
  // console.log("=-====================================== ", message);
  let targetedErrP_tag =
    document
      .querySelector("#iframeID")
      ?.contentWindow?.document?.body?.querySelector(".errorMessage") ||
    document.querySelector(".errorMessage");

  if (targetedErrP_tag) {
    targetedErrP_tag.innerHTML = message;
    targetedErrP_tag.style.marginTop = "10px";
  }
};

// let shop = Shopify.shop;

/* console.log(
  "4444444444444444444444444444444444444444444444444444444444444444444444"
); */

const checkTestModeAndReturn = async () => {
  try {
    const settingsUrl = `/apps/ez/api/getAppSettings`;
    const appSettingsParams = { storeName: Shopify.shop };
    const currentThemeId = Shopify.theme.id;
    const appSettingsResponses = await makeAjaxRequest(
      settingsUrl,
      appSettingsParams
    );
    const appSettingsResponse = JSON.parse(appSettingsResponses);
    const isTestMode = appSettingsResponse?.isTestMode;
    const testThemeId = appSettingsResponse?.testThemeId;
    // console.log("isTestMode ", isTestMode);
    // console.log("static/inde.js",xyz);
    //console.log("testThemeId", testThemeId);
    // console.log("currentThemeId", currentThemeId);
    if (isTestMode && currentThemeId != testThemeId) {
      // console.log("Redemption is not applicable on this theme as this is in test mode theme id==>", currentThemeId);
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
};

async function addButton() {
  try {
    const isTestMode = await checkTestModeAndReturn();
    if (isTestMode) return;

    const url = `/apps/ez/api/GetStoreDetails`;

    const data = { url: Shopify.shop, tag: "fe" };
    const responseData = await makeAjaxRequest(url, data);
    const response = JSON.parse(responseData);

    // console.log("response -> ", response);

    if (response.RedeemButton.DomSelector) {
      stc_DefaultSelector = response.RedeemButton.DomSelector.split(",");
      stc_DefaultSelector.forEach((id) => {
        // console.log("FOR EACH ID", id);
        const button = document.createElement("button");
        button.classList.add(
          "btn",
          "btn-primary",
          "abhi_eazyRewardz-submit-button",
          "abhi_easyPointModalBtn",
          "jfvspnezsm"
        );

        // console.log("response.RedeemButton.ButtonColor===", response.RedeemButton.ButtonColor)
        const RedeemPointbuttonTextColor = response?.Modal1?.RedeemPointsBgColor
          ? `${response?.Modal1?.RedeemPointsBgColor} !important`
          : "white !important";

        button.style.backgroundColor = `${response.RedeemButton.ButtonColor} !important`;
        button.style.color = RedeemPointbuttonTextColor;
        button.style.width = "100%";
        // button.style.marginBottom = "10px";
        button.innerHTML = "Redeem Points";
        id &&
          document.querySelector(id) &&
          document.querySelector(id).before(button);

        const iframe = document.createElement("iframe");
        iframe.id = "iframeID";
        id && document.body.appendChild(iframe);
      });

      await clickEvent();
    } else {
      // console.log(stc_DefaultSelector);
      //  console.log("INSIDE ELSE SELECTOR INITIAL RENDER");
      const button = document.createElement("button");
      button.setAttribute("id", "panId");
      button.classList.add(
        "btn",
        "btn-primary",
        "abhi_eazyRewardz-submit-button",
        "abhi_easyPointModalBtn",
        "bwpfkvpdfn"
      );
      const RedeemPointbuttonTextColor = response?.Modal1?.RedeemPointsBgColor
        ? `${response?.Modal1?.RedeemPointsBgColor} !important`
        : "white !important";

      button.style.backgroundColor = `${response?.RedeemButton?.ButtonColor + "!important" || "black"
        }`;
      button.style.background =
        response?.Modal1?.RedeemPointsBgColor || "black";
      button.style.color = RedeemPointbuttonTextColor;
      button.style.width = "100%";
      button.style.marginBottom = "10px";
      button.innerHTML = `${response?.Modal1?.RedeemPointsButtonText || "Redeem Points"
        }`;
      document
        .querySelectorAll(stc_DefaultSelector)
        .forEach((x) => x.before(button));
      const iframe = document.createElement("iframe");
      iframe.id = "iframeID";

      document
        .querySelectorAll(stc_DefaultSelector)
        .forEach((x) => x.before(iframe));

      if (
        response.domainName == "1691498061788" ||
        response.StoreName == "sundarisilks.myshopify.com"
      ) {
        // console.log("SundariSilks ===>");
        const element = document.querySelector(
          ".newsletter form .abhi_easyPointModalBtn"
        );
        if (element) {
          element.style.display = "none";
          // console.log("SundariSilks done ===============>");
        } else {
          console.log("Element not found!");
        }
        let p = document.querySelector("#iframeID");
        document.body.append(p);
        // console.log("inside SundariSilks Conditions");


      }
      await clickEvent();
    }

    let styleTag = document.createElement("style");
    const customStyleTag = document.createElement("style");

    styleTag.innerHTML = `
    iframe#iframeID {
      display: none;
      position: fixed;
      z-index: 999;
      /* padding-top: 100px; */
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      overflow: auto;
      /* background-color: rgb(0, 0, 0); */
      /* background-color: rgba(0, 0, 0, 0.4); */
      font-family: "Raleway", sans-serif;
    }
  .abhi_eazyRewardz-submit-button {
    width: 200px;
    color: white;
    font-weight: 500;
    cursor: pointer;
    background-color:${response?.RedeemButton?.ButtonColor + " !important" || "black"
      };
    border: 1px solid black;
    padding: 10px 15px;
    margin-top: 8px;
   }
  
  .abhi_eazyRewardz-submit-button:hover {
    opacity: 0.9;
  }
  
  @media (max-width: 450px) {
    .abhi_eazyRewardz-submit-button {
      padding: 10px 0px;
      width: 155px;
    }
  }  
     
  @media only screen and (max-width: 600px) {
   .abhi_eazyRewardz-submit-button {
      width: 180px;
      padding: 10px 0px;
    }
  }
  `;
    const customeCss_user = response?.CustomCss;
    customStyleTag.innerHTML = customeCss_user;
    document.head.appendChild(styleTag);
    document.head.appendChild(customStyleTag);
  } catch (error) {
    console.log("error addButton", error);
  }
}

addButton();

async function clickEvent() {
  document
    .querySelector(".abhi_eazyRewardz-submit-button")
    .addEventListener("click", async function (e) {
      e.preventDefault();
      //checking modal is open in window screen
      let p = document.querySelector("#iframeID");
      document.body.append(p);
      document.querySelector("#iframeID").style.zIndex = "+10000";
      document.querySelector("#iframeID").style.display = "block";
      // console.log("data ", Shopify.shop);
      await fetchData();
    });
}

//location
const checkLocation = () => {
  return window.location.href.split("/")[2];
};

async function fetchData() {
  var requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  //change
  fetch("/apps/ez/api/easyrewardz-script", requestOptions)
    .then((response) => response.text())
    .then((result) => createModal(result))
    .catch((error) => console.log("error", error));
}

const getCouponOtpHtml = () => {
  const abhi_uiSetting = JSON.parse(localStorage.getItem("abhi_uiSetting"));
  const green = "green";
  const red = "red";
  return `
  <h2 style="text-align:center" class="byngxzarjw"><b>Enter OTP</b></h2>
    <form class='iqtgvjxgru'>
      <div class="abhi_form-group abhi_eazyRewardzFormGroup swlrbnuobs">
        <label class = "ok1 xbldtnylwu" for="otp">Enter OTP</label>
        <input class="eazyRewardz-input form-control form-control-lg couponOtpInput ezdryevqiw" name="otp" type="number" placeholder="" required>
        </div>
        <a style="color:blue; cursor:pointer; font-size:12px;" class="resendCouponOtp dwjuksslge">RESEND OTP</a><br>
        <p class="cbqxhgzzbm errorMessage 99999" style="color:red !important;"></p>
        <div class="mt0elbdz7tk abhi_loader"></div>
        <div class="all_buttons button_groups couponOTP_button_groups">
          <button type="submit" class="cfcmmzprka btn btn-primary abhi_eazyRewardz-submit-button btn-lg confirmCouponOtp button button-1" style="background-color:${abhi_uiSetting?.Modal3?.SubmitButtonColor || green
            } !important">Submit</button>
          <button type="submit" class="bfseipbcxk btn btn-danger abhi_eazyRewardz-cancel-button btn-lg continueCheckoutCoupon stc_cancleButtonOtpForm button button-1" style="background-color:${abhi_uiSetting?.Modal3?.CancelButtonColor || red
            } !important">Cancel</button>
        </div>
    </form>
`;
};

const unblockCoupon = async (data) => {
  try {
    const url = `/apps/ez/api/UnblockCoupon`;
    const responses = await makeAjaxRequest(url, data);
    const response = JSON.parse(responses);
    if (response.ReturnCode == "0") {
      appendDiscountInCheckOutForPoints("");

      applyDiscountCode("");
      const dataa = {
        attributes: {
          TBT: "nothing",
        },
      };
      const appendCart = await makeAjaxRequest(`/cart.js`, dataa);

      if (localStorage.getItem("ub")?.length > 1) localStorage.removeItem("ub");
      //location.reload();
    } else {
      showErrorMessage(response.ReturnMessage);
    }
  } catch (error) {
    console.log("unblockCoupon Error:", error);
  }
};

const confirmCouponRedemptionWithoutOtp = async (POSPromo) => {
  //when OPT is not required
  await applyDiscountCode(POSPromo);
  const successMessage = `<p style="color:green" class="gneiuxympi">Discount Applied ! </p>`;
  document
    .querySelector("#cart-errors")
    ?.insertAdjacentHTML("afterend", successMessage);
  // ashish
  const couponCodeHtml = `<b style="color:green;" class="thclepgzag">${POSPromo.toUpperCase()}</b>`;

  let ashishDiv = `<span class="sure yqwaglessa"></span><p style="text-align: center;width:100%">Coupon Redeemed! Use coupon code ${couponCodeHtml} in checkout</p>`;
  document
    .querySelector("#iframeID")
    .contentWindow.document.body.querySelector(
      ".abhi_modal-content"
    ).innerHTML += ashishDiv;
  document
    .querySelector("#iframeID")
    .contentWindow.document.body.querySelector(
      ".abhi_easyModalDynamicContent"
    ).style.display = "none";

  document
    .querySelector("#iframeID")
    .contentWindow.document.body.querySelector(
      ".closeModalAndReleasePoints"
    ).style.display = "none";

  document
    .querySelector("#iframeID")
    .contentWindow.document.body.querySelector(
      ".closeSuccessModal"
    ).style.display = "block";

  document
    .querySelector("#iframeID")
    .contentWindow.document.body.querySelector(".closeSuccessModal")
    .addEventListener("click", async (e) => {
      e.preventDefault();
      document.querySelector("#iframeID").style.display = "none";
      // location.reload();
    });
};

const confirmCouponOtp = async (data) => {
  try {
    let errorMessage =
      document
        .querySelector("#iframeID")
        ?.contentWindow?.document?.body?.querySelector(".errorMessage") ||
      document.querySelector(".errorMessage");

    if (errorMessage?.textContent?.length >= 1) {
      //clearing the text for previous error messages
      errorMessage.textContent = " ";
      errorMessage.style.display = "none";
    }

    showLoader(true);
    const url = `/apps/ez/api/ConfirmCouponOtp`;
    const couponOtp = document.querySelector(".couponOtpInput")?.value;
    const params = { ...data, couponOtp };
    const responses = await makeAjaxRequest(url, data);
    const response = JSON.parse(responses);

    // console.log("Parameters Coupon", data);

    const dataa = {
      attributes: {
        EasyId: data.EasyId,
        RequestID: data.RequestID,
        OrderTypeId: "easyRewardsDiscountCoupon",
        TempCouponCode: data.CouponCode,
      },
    };
    const appendCart = await makeAjaxRequest(`/cart.js`, dataa);
    if (response.ReturnCode == "0") {
      const cartForm = document.querySelectorAll("form[action='/cart']");
      let input = document.createElement("input");
      input.type = "hidden";
      input.name = "discount";
      input.value = data.DiscountCode;
      input.class = "easyReward-discount";

      await applyDiscountCode(data.DiscountCode);
      showLoader(false);
      const successMessage = `<p style="color:green" class="gneiuxympi">Discount Applied ! </p>`;
      document
        .querySelector("#cart-errors")
        ?.insertAdjacentHTML("afterend", successMessage);
      // ashish
      const couponCodeHtml = `<b style="color:green;" class="thclepgzag">${data.DiscountCode.toUpperCase()}</b>`;

      let ashishDiv = `<span class="sure yqwaglessa"></span><p style="text-align: center;width:100%">Coupon Redeemed! Use coupon code ${couponCodeHtml} in checkout</p>`;
      document
        .querySelector("#iframeID")
        .contentWindow.document.body.querySelector(
          ".abhi_modal-content"
        ).innerHTML += ashishDiv;
      document
        .querySelector("#iframeID")
        .contentWindow.document.body.querySelector(
          ".abhi_easyModalDynamicContent"
        ).style.display = "none";

      document
        .querySelector("#iframeID")
        .contentWindow.document.body.querySelector(
          ".closeSuccessModal"
        ).style.display = "block";

      document
        .querySelector("#iframeID")
        .contentWindow.document.body.querySelector(".closeSuccessModal")
        .addEventListener("click", async (e) => {
          e.preventDefault();
          document.querySelector("#iframeID").style.display = "none";
          // location.reload();
        });
    } else {
      // ends
      showErrorMessage(response.ReturnMessage);
    }
  } catch (error) {
    console.log(error);
  }
};

const renderOtpHtml = (data, requiredParameters, pointsRedeem) => {
  const abhi_uiSetting = JSON.parse(localStorage.getItem("abhi_uiSetting"));
  const html = abhi_getConfirmOtpHtml(abhi_uiSetting);
  //     alert(requiredParameters)

  document
    .querySelector("#iframeID")
    .contentWindow.document.body.querySelector(".stc_cancleButtonOtpForm")
    ?.addEventListener("click", async function (e) {
      e.preventDefault();
      const responses = await releasePoints();
      const response = JSON.parse(responses);
      if (response.ReturnCode == "0") {
        // console.log("Reload 1");
        location.reload();
      } else {
        // console.log("Reload 2");
        location.reload();
      }
    });

  document
    .querySelector("#iframeID")
    .contentWindow.document.body.querySelector(
      ".abhi_easyModalDynamicContent"
    ).innerHTML = html;

  document
    .querySelector("#iframeID")
    .contentWindow.document.body.querySelector(".confirmOtp")
    .addEventListener("click", async function (e) {
      e.preventDefault();
      showLoader(true);

      // disabling submit button to prevent multiple clicks.
      document
        .querySelector("#iframeID")
        .contentWindow.document.body.querySelector(
          ".confirmOtp"
        ).disabled = true;
      document
        .querySelector("#iframeID")
        .contentWindow.document.body.querySelector(
          ".confirmOtp"
        ).style.opacity = "0.5";

      // ends

      const url = `/apps/ez/api/ConfirmOTP`;
      const enteredOTP = document
        .querySelector("#iframeID")
        .contentWindow.document.body.querySelector(".OtpInput").value;
      const date = new Date().toString().split(" ");
      const aDate = `${date[2]} ${date[1]} ${date[3]}`;

      //  alert(pointsRedeem)

      const postData = {
        EasyId: requiredParameters.EasyId,
        TransactionCode: localStorage.identifier,
        SmsCode: document
          .querySelector("#iframeID")
          .contentWindow.document.body.querySelector(".OtpInput").value,
        TransactionDate: aDate,
        CountryCode: "91",
        StoreName: Shopify.shop,
        PointRedeem: pointsRedeem,
        EasyPoints: requiredParameters.EasyPoints,
        PointRate: requiredParameters.PointRate,
        PointValue: requiredParameters.PointValue,
      };
      // console.log("lllllll -> ", postData);
      const responses = await makeAjaxRequest(url, postData);
      // console.log("cccc -> ", responses);
      const response = JSON.parse(responses);
      if (response.ReturnCode != "0") {
        console.log(
          "=========> When user code is 365 then error",
          response.ReturnCode
        );

        //  enabling submit button here since the otp was invalid
        document
          .querySelector("#iframeID")
          .contentWindow.document.body.querySelector(
            ".confirmOtp"
          ).disabled = false;
        document
          .querySelector("#iframeID")
          .contentWindow.document.body.querySelector(
            ".confirmOtp"
          ).style.opacity = "1";

        // ends
        showErrorMessage(response.ReturnMessage);
        return;
      }

      // display success message on UI (to be done)
      const dataa = {
        attributes: {
          EasyId: requiredParameters.EasyId,
          RedemptionCode: enteredOTP,
          OldTransactionCode: localStorage.identifier,
          PointRedeem: pointsRedeem,
          EasyPoints: requiredParameters.EasyPoints,
          PointRate: requiredParameters.PointRate,
          PointValue: requiredParameters.PointValue,
          OrderTypeId: "easyRewardsPoints",
        },
      };
      const appendCart = await makeAjaxRequest(`/cart.js`, dataa);
      // ---------------------------------------------------------------------------------
      if (response.ReturnCode == "0") {
        localStorage.setItem("cd", response.code);
        const coupon = response.code;
        const applyCouponFunction = async (coupon) => { };
        await applyDiscountCode(coupon);
        showErrorMessage("");
        const successMessage = `<p class="lpwotwrlkl" style="color:green">Discount Applied !</p>`;
        document
          .querySelector("#cart-errors")
          ?.insertAdjacentHTML("afterend", successMessage);
        // ashish
        const couponCodeHtml = `<b class="vkxxnhwnmu" style="color:green;">${response.code.toUpperCase()}</b>`;
        let ashishDiv = `<span class="sure vzxjcsalml"></span><p style="text-align: center;width:100%">Point Redeemed! Use coupon code ${couponCodeHtml} in checkout</p>`;

        document
          .querySelector("#iframeID")
          .contentWindow.document.body.querySelector(
            ".abhi_form-group"
          ).innerHTML += ashishDiv;
        document
          .querySelector("#iframeID")
          .contentWindow.document.body.querySelector(
            ".resendOtp"
          ).style.display = "none";
        document
          .querySelector("#iframeID")
          .contentWindow.document.body.querySelector(".applied").style.display =
          "none";
        document
          .querySelector("#iframeID")
          .contentWindow.document.body.querySelector(
            ".cancel_hide"
          ).style.display = "none";
        document
          .querySelector("#iframeID")
          .contentWindow.document.body.querySelector(
            ".OtpInput"
          ).style.display = "none";
        document
          .querySelector("#iframeID")
          .contentWindow.document.body.querySelector(
            ".hide_label"
          ).style.display = "none";
        document
          .querySelector("#iframeID")
          .contentWindow.document.body.querySelector(
            ".closeModalAndReleasePoints"
          ).style.display = "none";
        document
          .querySelector("#iframeID")
          .contentWindow.document.body.querySelector(
            ".closeSuccessModal"
          ).style.display = "block";
        document
          .querySelector("#iframeID")
          .contentWindow.document.body.querySelector(
            ".abhi_easyModalDynamicContent h2 b"
          ).style.display = "none";

        document
          .querySelector("#iframeID")
          .contentWindow.document.body.querySelector(
            ".abhi_mobileScreen"
          ).style.height = "70px";
        document
          .querySelector("#iframeID")
          .contentWindow.document.body.querySelector(
            ".abhi_modal-content"
          ).style.padding = "0 25px";
      } else {
        showErrorMessage(response.ReturnMessage);
      }
    });

  // Release Point when user click on cancle button
  document
    .querySelector("#iframeID")
    .contentWindow.document.body.querySelector(
      ".confirmModalCancleButtonReleasPoint"
    )
    ?.addEventListener("click", async () => {
      const releasePointsResponse = await releasePoints();
      // console.log("releasePointsResponse", releasePointsResponse);
      // console.log("click Cancle button");
      if (
        releasePointsResponse?.ReturnCode === 0 ||
        releasePointsResponse?.ReturnCode == "0"
      ) {
        window.location.reload();
      } else {
        showErrorMessage(
          releasePointsResponse?.ReturnMessage || "Please Try After Some Time"
        );
      }
    });

  document
    .querySelector("#iframeID")
    .contentWindow.document.body.querySelector(".closeSuccessModal")
    .addEventListener("click", async (e) => {
      e.preventDefault();
      document.querySelector("#iframeID").style.display = "none";
    });
  document
    .querySelector("#iframeID")
    .contentWindow.document.body.querySelector(".resendOtp")
    .addEventListener("click", async (e) => {
      const date = new Date().toString().split(" ");
      const aDate = `${date[2]} ${date[1]} ${date[3]}`;
      e.preventDefault();
      const url = `/apps/ez/api/ResendOTPs`;
      const response = await makeAjaxRequest(url, {
        EasyId: localStorage.id,
        TransactionCode: localStorage.identifier,
        BillDate: aDate,
        CountryCode: "91",
        StoreName: Shopify.shop,
      });
      //             alert("clicked!!")
    });
};

const appendDiscountInCheckOutForPoints = (couponCodeForPoints) => {
  const cartForm = document.querySelectorAll("form[action='/cart']");
  const input = document.createElement("input");
  input.type = "hidden";
  input.className = "easyReward-discount";
  input.name = "discount";
  input.value = couponCodeForPoints;
  if (cartForm.length === 0) {
    return true;
  } else {
    cartForm.forEach((x) => {
      x.append(input);
    });
    return false;
  }
};

const releasePoints = async () => {
  try {
    const url = `/apps/ez/api/ReleaseRedemptionPoints`;
    const date = new Date().toString().split(" ");
    const aDate = `${date[2]} ${date[1]} ${date[3]}`;
    const responses = await makeAjaxRequest(url, {
      EasyId: localStorage.id,
      TransactionCode: localStorage.identifier,
      StoreName: Shopify.shop,
      TransactionDate: aDate,
      CouponCode: localStorage.cd,
      DisableGiftCard: localStorage.cd,
    });
    const response = JSON.parse(responses);

    if (response.ReturnCode == 0) {
      localStorage.removeItem("identifier");
      localStorage.removeItem("cd");
      appendDiscountInCheckOutForPoints("");
      const dataa = {
        attributes: {
          TBT: "nothing",
        },
      };
      const appendCart = await makeAjaxRequest(`/cart.js`, dataa);
    }
    return response;
  } catch (error) {
    console.log(error);
  }
};

function reloadOnCancel() {
  document
    .querySelector("#iframeID")
    .contentWindow.document.body.querySelector(".continueCheckout")
    .addEventListener("click", async function (e) {
      e.preventDefault();
      showLoader(true);
      const response = await releasePoints();
      showLoader(false);

      if (response.ReturnCode == "0") {
        // console.log("Reload 3");
        location.reload();
      } else {
        // console.log("Reload 4");
        location.reload();
      }
    });
}

async function createModal(htmlData) {
  var frame = document.querySelector("#iframeID");
  var frameDoc = frame.contentDocument || frame.contentWindow.document;
  frameDoc.documentElement.innerHTML = htmlData;
  await allFunctionality();
}

function closeModal() {
  var frame = document.getElementById("iframeID");
  frame.style.display = "none";
  var frameDoc = frame.contentDocument || frame.contentWindow.document;
  frameDoc.documentElement.innerHTML = "";
}

const abhi_modalHtml = `<div id="myModal" class="ybvprkhxna abhi_eazyRewardzModal" style="width:100vw; height:100vh; display:none;">
  <div class="gcpjthsyzs abhi_modal-content abhi_mobileScreen" style="width:60%">
    <span class="qfgfnipstk abhi_closeEasyModal closeModalAndReleasePoints">&times;</span>
    <span class="epiahlabhk abhi_closeEasyModal closeSuccessModal" style="display:none">&times;</span>
	<div class="guctghydek abhi_easyModalDynamicContent">
      <h2 class="gwpujckyww" style="text-align:center"><b>Redeem Points</b></h2>
      <form class="rvntjuvexv JAI SHRI RAM!">
        <div class="zphzbqyogz abhi_form-group abhi_eazyRewardzFormGroup">
          <label for="exampleInputEmail1 ">Mobile Number  </label>
          <input id = "defa" class="nepenhcivt eazyRewardz-input form-control form-control-lg abhi_mobileInput" type="number" placeholder="" >  
        </div>
        <div class="mt0elbdz7tk abhi_loader"></div>
        <p class="nylsklkfmt errorMessage" style="color:red !important; margin-top:15px !important"></p>
        <div class="all_buttons button_groups">
          <button type="button" id="firstModalSubmit" class="jmgfsmrgkq btn btn-primary abhi_eazyRewardz-submit-button btn-lg getAvailablePointsSubmit button button-1">Submit</button>
          <button type="submit" class="gogkvrlngg btn btn-danger abhi_eazyRewardz-cancel-button btn-lg abhi_continueCheckoutSubmit button button-1">Cancel</button>
        </div>
        </form>  
	</div> 
  </div>
</div>`;

const abhi_getModalHtml = (abhi_uiSetting) => {
  return `
       <h2 class="dflfvkmrze" style="text-align:center"><b>${abhi_uiSetting.Modal1.Heading}</b></h2>
    
        <form class="willqlpjmj">
          <div class="xcynydjtfs abhi_form-group abhi_eazyRewardzFormGroup">
            <label class = "ybhdamykns size_mob" for="exampleInputEmail1 ashish">Mobile Number </label>
            <input class="rwawiqccmd eazyRewardz-input form-control form-control-lg abhi_mobileInput" type="number" placeholder=""  oninput="javascript: if (this.value.length > this.maxLength) this.value = this.value.slice(0, this.maxLength);" maxlength = "10" > 
          </div>
          <div class="cwxrfeqynk abhi_form-group abhi_eazyRewardzFormGroup">
            <label for="exampleInputEmail1" class="discountCouponInput" style="display:none">Coupon Code</label>
            <input class="xvjwiqkroq eazyRewardz-input form-control form-control-lg discountCouponInput discountCouponInputValue " type="text" placeholder="" style="display:none">  
          </div>
          <div class="mt0elbdz7tk abhi_loader"></div>
          <p class="mzqaimmzky errorMessage" style="color:red !important;"></p>
          <div class="all_buttons button_groups">
            <button type="button" class="demerozkez btn btn-primary abhi_eazyRewardz-submit-button btn-lg getAvailablePointsSubmit abhi_checkPointsButton btn-font 1111 button button-1" style="background-color:${abhi_uiSetting.RedeemButton.ButtonColor} !important">${abhi_uiSetting.Modal1.RedeemPointsButtonText}</button>
            <button type="button" class="pxlxtsdnyi btn btn-primary abhi_eazyRewardz-submit-button btn-lg  applyCouponButton btn-font button button-1" style="background-color:${abhi_uiSetting.Modal1.ApplyCouponButtonColor} !important">${abhi_uiSetting.Modal1.ApplyCouponButtonText}</button>
            <button type="submit" class="exopzxgmec btn unblock-coupon-01 btn-danger abhi_eazyRewardz-cancel-button btn-lg abhi_continueCheckoutSubmit btn-font button button-1"  style="background-color:${abhi_uiSetting.Modal1.CancelButtonColor} !important">${abhi_uiSetting.Modal1.CancelButtonText}</button> 
        </div>  
      </form>
        <div class="mksanaawte customMessageWrap" style="text-align:left;line-height:15px;margin-top:8px;"></div>
`;
};

const abhi_getAvailablePointsHtml = (data, abhi_uiSetting) => {
  return `
      <h2 style="text-align:center" class="vqasemythr availablePointsH2"><b class = "onagivjyva last">${abhi_uiSetting.Modal2.Heading}</b></h2>
	
      <h3 class="cfcaknfkgj availablePointsH3"><b>Balance: </b></h3>
	  <h4 class="jbecaekose" style="color: #597dcf;font-size:15px;">Balance Points : ${data.AvailablePoints}</h4>
      <button type="submit" class="llfupmardm btn btn-danger abhi_eazyRewardz-cancel-button btn-lg closeAvailablePointModal" style="display:none; background-color:${abhi_uiSetting.Modal2.CancelButtonColor} !important">${abhi_uiSetting.Modal2.CancelButtonText}</button>
      <form class="dkeouapbum redeemPointsForm availablePointsForm 0000">
        <div class="cgdgqykjxj abhi_form-group abhi_eazyRewardzFormGroup">
          <label class ="ptfvnvwuwh size_mob" for="redeemPoints">Enter Points to Redeem</label>
          <input class="cqqssezehb eazyRewardz-input form-control form-control-lg redeemPointsInput" name="redeemPoints" min="1" max"${data.AvailablePoints}" type="number" placeholder="">  
        </div>
        <div class="mt0elbdz7tk abhi_loader"></div>
        <p class="lagevznoeg errorMessage" style="color:red !important;"></p>
        <div class="all_buttons button_groups availablePoint_button_groups">
          <button type="submit" class="hpoopseyry btn btn-primary abhi_eazyRewardz-submit-button btn-lg abhi_redeemAvailablePoints btn-font 222 button button-1" style="background-color:${abhi_uiSetting.Modal2.SubmitButtonColor} !important">${abhi_uiSetting.Modal2.SubmitButtonText}</button>
          <button type="submit" class="qunumtkoou btn btn-danger abhi_eazyRewardz-cancel-button btn-lg continueCheckout btn-font button button-1" style="background-color:${abhi_uiSetting.Modal2.CancelButtonColor} !important">${abhi_uiSetting.Modal2.CancelButtonText}</button>
        </div>
      </form>
      
    `;
};

const submitRedeemCouponOtp = async () => {
  showLoader(true);
  const url = `/apps/ez/api/RedeemCoupon`;
  if (
    !document
      .querySelector("#iframeID")
      .contentWindow.document.body.querySelector(".abhi_mobileInput").value
  ) {
    return showErrorMessage("Please Enter Mobile No.");
  }
  if (
    !document
      .querySelector("#iframeID")
      .contentWindow.document.body.querySelector(".discountCouponInputValue")
      .value
  ) {
    return showErrorMessage("Please Enter Coupon Code.");
  }

  let mydate = new Date();
  let month = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ][mydate.getMonth()];
  let str =
    mydate.getDate().toString().length > 1
      ? mydate.getDate() + " " + month + " " + mydate.getFullYear()
      : `0${mydate.getDate()}` + " " + month + " " + mydate.getFullYear();

  const params = {
    EasyId: document
      .querySelector("#iframeID")
      .contentWindow.document.body.querySelector(".abhi_mobileInput").value,
    EasyDiscountCoupon: document
      .querySelector("#iframeID")
      .contentWindow.document.body.querySelector(".discountCouponInputValue")
      .value,
    StoreName: Shopify.shop,
    Date: str,
  };

  const responses = await makeAjaxRequest(url, params);
  const response = JSON.parse(responses);

  if (response.ReturnCode != "0") {
    return showErrorMessage(response.ReturnMessage);
  } else {
    const otpParams = {
      EasyId: document
        .querySelector("#iframeID")
        .contentWindow.document.body.querySelector(".abhi_mobileInput").value,
      RequestID: response.RequestID,
      CouponCode: document
        .querySelector("#iframeID")
        .contentWindow.document.body.querySelector(".discountCouponInputValue")
        .value,
      DiscountCode: response.POSPromo,
      StoreName: Shopify.shop,
    };

    const ubPrams = {
      RequestID: response?.RequestID,
      CouponCode: otpParams?.CouponCode,
      StoreName: Shopify.shop,
    };
    localStorage.setItem("ub", JSON.stringify(ubPrams));
    if (response.OTPRequired != 1) {
      await confirmCouponRedemptionWithoutOtp(response.POSPromo);
    } else {
      const couponHtml = getCouponOtpHtml();
      document
        .querySelector("#iframeID")
        .contentWindow.document.body.querySelector(
          ".abhi_easyModalDynamicContent"
        ).innerHTML = couponHtml;
      document
        .querySelector("#iframeID")
        .contentWindow.document.body.querySelector(
          ".abhi_closeEasyModal"
        ).style.display = "none";

      document
        .querySelector("#iframeID")
        .contentWindow.document.body.querySelector(".confirmCouponOtp")
        .addEventListener("click", function (e) {
          e.preventDefault();
          // disabling submit button to prevent multiple clicks.
          let cofirmCoupnOtpBtn = e.target;

          cofirmCoupnOtpBtn.disabled = true;
          cofirmCoupnOtpBtn.style.opacity = "0.5";
          if (
            document
              .querySelector("#iframeID")
              .contentWindow.document.body.querySelector(".couponOtpInput")
          ) {
            otpParams.couponOtp =
              document.body?.querySelector(".couponOtpInput")?.value ||
              document
                .querySelector("#iframeID")
                .contentWindow.document.body?.querySelector(".couponOtpInput")
                ?.value;
          }

          confirmCouponOtp(otpParams)
            .then((res) => {
              cofirmCoupnOtpBtn.disabled = false;
              cofirmCoupnOtpBtn.style.opacity = "1";
            })
            .catch((error) => [console.log("confirmCouponOtp error", error)]);
        });

      document
        .querySelector("#iframeID")
        .contentWindow.document.body.querySelector(".resendCouponOtp")
        .addEventListener("click", function (e) {
          e.preventDefault();
          resendCouponOtp(otpParams);
        });

      document
        .querySelector("#iframeID")
        .contentWindow.document.body.querySelector(".continueCheckoutCoupon")
        .addEventListener("click", function (e) {
          e.preventDefault(".continueCheckoutCoupon");
          // console.log("");
          unblockCoupon(otpParams)
            .then((res) => {
              location.reload();
            })
            .catch((error) => {
              showErrorMessage(error.message || "Redemption Failed");
            });
        });
    }
    showLoader(false);
  }
};

const checkApiStatus = async () => {
  const settingsUrl = `/apps/ez/api/getAppSettings`;
  const appSettingsParams = { storeName: Shopify.shop };
  const currentThemeId = Shopify.theme.id;
  const appSettingsResponses = await makeAjaxRequest(
    settingsUrl,
    appSettingsParams
  );
  const appSettingsResponse = JSON.parse(appSettingsResponses);
  const isTestMode = appSettingsResponse.isTestMode;
  const testThemeId = appSettingsResponse.testThemeId;

  if (isTestMode && currentThemeId != testThemeId) {
    return;
  }
  const url = `/apps/ez/api/GetStoreDetails`;
  const data = { url: Shopify.shop, tag: "fe" };
  const responseData = await makeAjaxRequest(url, data);
  const response = JSON.parse(responseData);

  if (true) {
    let mainDivForErContent = document.createElement("div");
    mainDivForErContent.innerHTML = abhi_modalHtml;
    document
      .querySelector("#iframeID")
      .contentWindow.document.body.appendChild(mainDivForErContent);
    document
      .querySelector("#iframeID")
      .contentWindow.document.body.querySelector(
        "#myModal .abhi_closeEasyModal"
      )
      .addEventListener("click", function (e) {
        document
          .querySelector("#iframeID")
          .contentWindow.document.body.querySelector("#myModal").style.display =
          "none";
      });

    localStorage.setItem(
      "abhi_uiSetting",
      JSON.stringify({
        Modal1: {
          Heading: response.Modal1.Heading,
          CustomMessage: response.Modal1.CustomMessage,
          SubmitButtonText: response.Modal1.SubmitButtonText,
          SubmitButtonColor: response.Modal1.SubmitButtonColor,
          CancelButtonText: response.Modal1.CancelButtonText,
          CancelButtonColor: response.Modal1.CancelButtonColor,
          RedeemPointsButtonColor: response.Modal1.RedeemPointsButtonColor,
          RedeemPointsButtonText: response.Modal1.RedeemPointsButtonText,
          ApplyCouponButtonColor: response.Modal1.ApplyCouponButtonColor,
          ApplyCouponButtonText: response.Modal1.ApplyCouponButtonText,
        },
        ModalB: {
          Heading: response.ModalB.Heading,
          CancelButtonText: response.ModalB.CancelButtonText,
          CancelButtonColor: response.ModalB.CancelButtonColor,
        },
        Modal2: {
          Heading: response.Modal2.Heading,
          SubmitButtonText: response.Modal2.SubmitButtonText,
          SubmitButtonColor: response.Modal2.SubmitButtonColor,
          CancelButtonText: response.Modal2.CancelButtonText,
          CancelButtonColor: response.Modal2.CancelButtonColor,
        },
        Modal3: {
          Heading: response.Modal3.Heading,
          SubmitButtonText: response.Modal3.SubmitButtonText,
          SubmitButtonColor: response.Modal3.SubmitButtonColor,
          CancelButtonText: response.Modal3.CancelButtonText,
          CancelButtonColor: response.Modal3.CancelButtonColor,
        },
        RedeemButton: {
          ButtonColor: response.ButtonColor,
          DomSelector: response.DomSelector,
        },
      })
    );

    var customCss = document.createElement("style");
    customCss.innerText = `${response.CustomCss}`;
    document
      .querySelector("#iframeID")
      .contentWindow.document.head.appendChild(customCss);

    const uiSetting = JSON.parse(localStorage.getItem("abhi_uiSetting"));

    const newHtml = abhi_getModalHtml(response);

    document
      .querySelector("#iframeID")
      .contentWindow.document.body.querySelector(
        ".abhi_easyModalDynamicContent"
      ).innerHTML = newHtml;
    const customMessage = document.createElement("small");
    customMessage.classList.add("customMessage");
    customMessage.textContent = response.Modal1.CustomMessage;
    document
      .querySelector("#iframeID")
      .contentWindow.document.body.querySelector(".customMessageWrap")
      .appendChild(customMessage);
    document
      .querySelector("#iframeID")
      .contentWindow.document.body.querySelector("#myModal").style.display =
      "block";
    document
      .querySelector("#iframeID")
      .contentWindow.document.body.querySelector(".getAvailablePointsSubmit")
      .addEventListener("click", getAvailablePointsSubmit);

    //IF USER PRESS Enter
    document
      .querySelector("#iframeID")
      .contentWindow.document.body.querySelector(".abhi_mobileInput")
      .addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          getAvailablePointsSubmit;
        }
      });

    document
      .querySelector("#iframeID")
      .contentWindow.document.body.querySelector(
        ".getAvailablePointsSubmit"
      ).style.backgroundColor =
      uiSetting.Modal1.RedeemPointsButtonColor + " !important";
    document
      .querySelector("#iframeID")
      .contentWindow.document.body.querySelector(
        ".getAvailablePointsSubmit"
      ).innerText = uiSetting.Modal1.RedeemPointsButtonText;
    document
      .querySelector("#iframeID")
      .contentWindow.document.body.querySelector(
        ".applyCouponButton"
      ).style.backgroundColor =
      uiSetting.Modal1.ApplyCouponButtonColor + " !important";
    document
      .querySelector("#iframeID")
      .contentWindow.document.body.querySelector(
        ".applyCouponButton"
      ).innerText = uiSetting.Modal1.ApplyCouponButtonText;
    document
      .querySelector("#iframeID")
      .contentWindow.document.body.querySelector(
        ".abhi_continueCheckoutSubmit"
      ).style.backgroundColor =
      uiSetting.Modal1.CancelButtonColor + " !important";
    document
      .querySelector("#iframeID")
      .contentWindow.document.body.querySelector(
        ".abhi_continueCheckoutSubmit"
      ).innerText = uiSetting.Modal1.CancelButtonText;

    document
      .querySelector("#iframeID")
      .contentWindow.document.body.querySelector(".applyCouponButton")
      .addEventListener("click", function () {
        document
          .querySelector("#iframeID")
          .contentWindow.document.body.querySelector(
            ".discountCouponInput"
          ).style.display = "block";
        document
          .querySelector("#iframeID")
          .contentWindow.document.body.querySelector(
            ".discountCouponInputValue"
          ).style.display = "block";

        document
          .querySelector("#iframeID")
          .contentWindow.document.body.querySelector(
            ".abhi_eazyRewardzFormGroup"
          ).style.marginBottom = "55px";

        document
          .querySelector("#iframeID")
          .contentWindow.document.body.querySelector(
            ".xvjwiqkroq"
          ).style.marginLeft = "10px";

        document
          .querySelector("#iframeID")
          .contentWindow.document.body.querySelector(".applyCouponButton")
          .classList.add("redeemCouponSubmit");
        const abhi_uiSetting = JSON.parse(
          localStorage.getItem("abhi_uiSetting")
        );
        document
          .querySelector("#iframeID")
          .contentWindow.document.body.querySelector(
            ".applyCouponButton"
          ).innerHTML = "Submit";
        document
          .querySelector("#iframeID")
          .contentWindow.document.body.querySelector(
            ".applyCouponButton"
          ).style.backgroundColor = abhi_uiSetting.Modal1.SubmitButtonColor;
        document
          .querySelector("#iframeID")
          .contentWindow.document.body.querySelector(
            ".getAvailablePointsSubmit"
          ).style.display = "none";
        document
          .querySelector("#iframeID")
          .contentWindow.document.body.querySelector(".redeemCouponSubmit")
          .addEventListener("click", function (e) {
            e.preventDefault();
            let redeemCouponbtn = e.target;
            redeemCouponbtn.disabled = true;
            redeemCouponbtn.style.opacity = "0.5";
            submitRedeemCouponOtp()
              .then((res) => {
                redeemCouponbtn.disabled = false;
                redeemCouponbtn.style.opacity = "1";
              })
              .catch((error) => {
                console.log("submitRedeemCouponOtp error", error);
                redeemCouponbtn.disabled = true;
                redeemCouponbtn.style.opacity = "1";
              });
          });
      });
    // });

    //test code to check will this work
    document
      .querySelector("#iframeID")
      .contentWindow.document.body.querySelector("a[href$=availablePoints]")
      ?.addEventListener("click", function (e) {
        e.preventDefault();
        const abhi_uiSetting = JSON.parse(
          localStorage.getItem("abhi_uiSetting")
        );
        const newHtml = abhi_getModalHtml(abhi_uiSetting);
        document
          .querySelector("#iframeID")
          .contentWindow.document.body.querySelector(
            ".abhi_easyModalDynamicContent"
          ).innerHTML = newHtml;
        document
          .querySelector("#iframeID")
          .contentWindow.document.body.querySelector(
            ".abhi_checkPointsButton"
          ).id = "checkBalancePoint";
        document
          .querySelector("#iframeID")
          .contentWindow.document.body.querySelector(
            ".getAvailablePointsSubmit"
          ).innerHTML = "Submit";
        document
          .querySelector("#iframeID")
          .contentWindow.document.body.querySelector(
            ".getAvailablePointsSubmit"
          ).style.backgroundColor = abhi_uiSetting.Modal1.SubmitButtonColor;
        document
          .querySelector("#iframeID")
          .contentWindow.document.body.querySelector(
            ".applyCouponButton"
          ).style.display = "none";
        document
          .querySelector("#iframeID")
          .contentWindow.document.body.querySelector("#myModal").style.display =
          "block";
        document
          .querySelector("#iframeID")
          .contentWindow.document.body.querySelector(
            ".getAvailablePointsSubmit"
          )
          .addEventListener("click", getAvailablePointsSubmit);

        //IF USER PRESS Enter
        document
          .querySelector("#iframeID")
          .contentWindow.document.body.querySelector(".abhi_mobileInput")
          .addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
              getAvailablePointsSubmit;
            }
          });
        document
          .querySelector("#iframeID")
          .contentWindow.document.body.querySelector(
            ".availablePointsH2"
          ).innerHTML = "Point Balance";
      });

    const identifier = `easyRewards${(Math.random() + 5)
      .toString(36)
      .substring(2)}`;
    if (!localStorage.identifier) {
      /*  console.log(
         "NOOOOOTTTTTTTTTTT LOCALSTORAGE ITENTIFIER",
         localStorage.identifier
       ); */
      localStorage.setItem("identifier", identifier);
    }
  }
};

const renderavailablePointDetails = (data, higherOrderParams) => {
  const abhi_uiSetting = JSON.parse(localStorage.getItem("abhi_uiSetting"));
  const html = abhi_getAvailablePointsHtml(data, abhi_uiSetting);

  document
    .querySelector("#iframeID")
    .contentWindow.document.body.querySelector(
      ".abhi_easyModalDynamicContent"
    ).innerHTML = html;
  if (!higherOrderParams.EasyId) {
    return showErrorMessage("Please Enter Mobile No");
  }

  document
    .querySelector("#iframeID")
    .contentWindow.document.body.querySelector(".abhi_redeemAvailablePoints")
    .addEventListener("click", async function (e) {
      e.preventDefault();
      showLoader(true);
      // if (!document.querySelector(".abhi_mobileInput").value) {
      //   // return showErrorMessage("Please Enter Mobile No.")
      // }
      const enteredAmount = document
        .querySelector("#iframeID")
        .contentWindow.document.body.querySelector(".redeemPointsInput").value;
      const url = `/apps/ez/api/CheckForEasyPointsRedemption`;

      const cartDataJson = await fetch(`/cart.js`);
      const cartData = await cartDataJson.json();

      const date = new Date().toString().split(" ");
      const aDate = `${date[2]} ${date[1]} ${date[3]}`;
      const postdata = {
        EasyId: higherOrderParams.EasyId,
        EasyPoints: enteredAmount * 1,
        Amount: cartData.total_price / 100,
        StoreName: Shopify.shop,
        PointRate: higherOrderParams.PointRate,
        TransactionCode: localStorage.identifier,
        RedemptionDate: aDate,
      };

      const pointsRedeem = enteredAmount;
      const responses = await makeAjaxRequest(url, postdata);
      const response = JSON.parse(responses);

      if (response.ReturnCode != "0") {
        showErrorMessage(response.ReturnMessage);
        return;
      }
      showLoader(false);
      higherOrderParams.PointValue = response.CashWorthPoints;
      higherOrderParams.EasyPoints = response.EasyPoints;
      renderOtpHtml(data, higherOrderParams, pointsRedeem);
    });

  reloadOnCancel();
};

const abhi_getConfirmOtpHtml = (abhi_uiSetting) => {
  return `
	  <h2 class="imxklbkmsj" style="text-align:center"><b>${abhi_uiSetting.Modal3.Heading}</b></h2>
      <form class="yspafnlagh">
     
        <div class="rcqlrgrazq abhi_form-group abhi_eazyRewardzFormGroup">   
          <label class = "rshrhhvsbt hide_label" for="otp">Enter OTP</label>
          <input class="fvrsblcopk eazyRewardz-input form-control form-control-lg OtpInput" name="otp" type="number" placeholder="">
          </div>
          <a style="color:blue; cursor:pointer; font-size:16px;" class="aqcscnbndg resendOtp">RESEND OTP</a><br>
        <br>
        <div class="mt0elbdz7tk abhi_loader"></div>
          <p class="botnxquouv errorMessage 99999" style="color:red !important;"></p>
          <div class="all_buttons button_groups confirm_button_groups">
            <button type="submit" class="rhiamlufzn btn btn-primary applied abhi_eazyRewardz-submit-button btn-lg confirmOtp btn-font 000 button button-1" style="background-color:${abhi_uiSetting.Modal3.SubmitButtonColor} !important;opacity:1">${abhi_uiSetting.Modal3.SubmitButtonText}</button>
	          <button type="submit" class="skwshlajnw btn btn-danger abhi_eazyRewardz-cancel-button btn-lg  btn-font stc_cancleButtonOtpForm continueCheckout cancel_hide button button-1 confirmModalCancleButtonReleasPoint" style="background-color:${abhi_uiSetting.Modal3.CancelButtonColor} !important">${abhi_uiSetting.Modal3.CancelButtonText}</button>
          </div>
      </form>
    `;
};

const showPointBalance = (data) => {
  const abhi_uiSetting = JSON.parse(localStorage.getItem("abhi_uiSetting"));
  const checkAvailablePointsHtml = `
      <h2 class="bcuyyjprfd" style="text-align:center" class="availablePointsH2"><b class="banner_otp">${abhi_uiSetting.ModalB.Heading}</b></h2>
      <div class="wfziesqtjh" style="text-align:center; border: 1px solid grey; margin-top:5px; margin-bottom:5px; padding-top:5px; padding-bottom:5px">
      <h4 class="dvdlqtrdlb" style="color: #597dcf;font-size:15px;">Balance Points : ${data.AvailablePoints}</h4>
      </div>
      <div class="mt0elbdz7tk abhi_loader"></div>
      <p class="ddfsbmvedg errorMessage" style="color:red !important;"></p>
      <br>
      <button type="submit" class="esyevaxdmg btn btn-danger abhi_eazyRewardz-cancel-button btn-lg closeAvailablePointModal" style="background-color:${abhi_uiSetting.ModalB.CancelButtonColor} !important">${abhi_uiSetting.ModalB.CancelButtonText}</button>
    `;
  document.querySelector(".abhi_easyModalDynamicContent").innerHTML =
    checkAvailablePointsHtml;

  document
    .querySelector(".closeAvailablePointModal")
    .addEventListener("click", function (e) {
      // console.log(".closeAvailablePointModal");
      location.reload();
    });
  document
    .querySelector(".abhi_modal-content")
    .classList.add("abhi_mobileScreen");
};

const getAvailablePointsSubmit = async (e) => {
  e.preventDefault();
  showLoader(true);
  const enteredMobileNo = document
    .querySelector("#iframeID")
    .contentWindow.document.body.querySelector(".abhi_mobileInput").value;
  localStorage.setItem("id", enteredMobileNo);
  const data = {
    EasyId: enteredMobileNo,
    StoreName: Shopify.shop,
  };
  const url = `/apps/ez/api/CustomerAvailablePoints`;
  const responses = await makeAjaxRequest(url, data);
  const response = JSON.parse(responses);

  if (response.ReturnCode !== "0") {
    showErrorMessage("No Benefits to redeem. Complete the transaction to earn loyalty benefits.");
    return;
  }

  showLoader(false);
  const higherOrderParams = {
    EasyId: enteredMobileNo,
    PointRate: response.PointRate,
    TotalPointValue: response.PointValue,
    PartnerName: response.PartnerName,
  };
  if (!localStorage.identifier) {
    const identifier = `easyRewards${(Math.random() + 5)
      .toString(36)
      .substring(2)}`;
    localStorage.setItem("identifier", identifier);
  }
  if (e.target.id == "checkBalancePoint") {
    showPointBalance(response);
  } else {
    renderavailablePointDetails(response, higherOrderParams);
  }
};

async function allFunctionality() {
  await checkApiStatus();

  const getCouponOtpHtml = () => {
    return `
		<h2 class="ykckkvngvg" style="text-align:center"><b>Enter OTP</b></h2>
      <form class="grajpqprgs">
        <div class="ybtufvsxwz abhi_form-group abhi_eazyRewardzFormGroup">
          <label class = "tzpaagrrdx ok1" for="otp">Enter OTP</label>
          <input class="ptikzzzzcl eazyRewardz-input form-control form-control-lg couponOtpInput" name="otp" type="number" placeholder="" required>
          </div>
          <a style="color:blue; cursor:pointer; font-size:12px;" class="jflovfmbqw resendCouponOtp">RESEND OTP</a><br>
       <div class="all_buttons button_groups couponOTP_button_groups">
      <button type="submit" class="pfqocesboi btn btn-primary abhi_eazyRewardz-submit-button btn-lg confirmCouponOtp button button-1" style="background-color:green !important">Submit</button>
	    <button type="submit" class="ydyiacliff btn btn-danger abhi_eazyRewardz-cancel-button btn-lg continueCheckoutCoupon stc_cancleButtonOtpForm button button-1" style="background-color:red !important">Cancel</button>
      </div>
      </form>
	`;
  };

  const confirmCouponOtp = async (data) => {
    const url = `/apps/ez/api/ConfirmCouponOtp`;
    const couponOtp = document.querySelector(".couponOtpInput").value;
    const params = { ...data, couponOtp };

    const responses = await makeAjaxRequest(url, data);
    const response = JSON.parse(responses);

    const dataa = {
      attributes: {
        EasyId: data.EasyId,
        RequestID: data.RequestID,
        OrderTypeId: "easyRewardsDiscountCoupon",
        TempCouponCode: data.CouponCode,
      },
    };
    const appendCart = await makeAjaxRequest(`/cart.js`, dataa);
    if (response.ReturnCode == "0") {
      const cartForm = document.querySelector("form[action='/cart']");
      let input = document.createElement("input");
      input.type = "hidden";
      input.name = "discount";
      input.value = data.DiscountCode;
      input.class = "easyReward-discount";

      const shopName = checkLocation();
      const url = shopName.split(".");
      const domain = `${url[url.length - 2]}.${url[url.length - 1]}`;
      const DB_domain = `${url[0]}`;

      const discountURL = `https://www.${domain}/discount/${coupon}`;
      const TestingURL = `https://${DB_domain}.myshopify.com/discount/${coupon}`;
      try {
        await fetch(domain == "myshopify.com" ? TestingURL : discountURL, {
          mode: "cors",
          headers: {
            "Access-Control-Allow-Origin": " * ",
          },
        })
          .then((response) => response.text()) //response.json()s
          .then((result) => console.log(result, "inside apply coupon success"));
      } catch (error) {
        console.log(error);
        // alert(error);
      }

      const successMessage = `<p style="color:green">Discount Applied ! </p>`;
      document
        .querySelector("#cart-errors")
        .insertAdjacentHTML("afterend", successMessage);
      document.querySelector("#myModal").style.display = "none";
    } else {
      showErrorMessage(response.ReturnMessage);
    }
  };
  const resendCouponOtp = async (data) => {
    const url = `/apps/ez/api/ResendCouponOtp`;
    const params = {
      EasyId: data.EasyId,
      TransactionCode: data.CouponCode,
      StoreName: data.StoreName,
    };
    const response = await makeAjaxRequest(url, params);
  };
  const unblockCoupon = async (data) => {
    const url = `/apps/ez/api/UnblockCoupon`;
    const responses = await makeAjaxRequest(url, data);
    const response = JSON.parse(responses);
    if (response.ReturnCode == "0") {
      //         alert("stop")
      // console.log("alret");
      location.reload();
    } else {
      showErrorMessage(response.ReturnMessage);
    }
  };

  document
    .querySelector("#iframeID")
    .contentWindow.document.body.querySelector(".getAvailablePointsSubmit")
    .addEventListener("click", getAvailablePointsSubmit);
  //IF USER PRESS Enter
  document
    .querySelector("#iframeID")
    .contentWindow.document.body.querySelector(".abhi_mobileInput")
    .addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        getAvailablePointsSubmit;
      }
    });
  document
    .querySelector("#iframeID")
    .contentWindow.document.body.querySelector(".abhi_closeEasyModal")
    .addEventListener("click", closeModal);

  document
    .querySelector("#iframeID")
    .contentWindow.document.body.querySelector(".applyCouponButton")
    .addEventListener("click", function () {
      document
        .querySelector("#iframeID")
        .contentWindow.document.body.querySelector(
          ".discountCouponInputValue"
        ).style.display = "block";
      document
        .querySelector("#iframeID")
        .contentWindow.document.body.querySelector(
          ".discountCouponInput"
        ).style.display = "block";
      document
        .querySelector("#iframeID")
        .contentWindow.document.body.querySelector(
          ".abhi_eazyRewardzFormGroup"
        ).style.marginBottom = "15px";

      document
        .querySelector("#iframeID")
        .contentWindow.document.body.querySelector(
          ".xvjwiqkroq"
        ).style.marginLeft = "10px";

      document
        .querySelector("#iframeID")
        .contentWindow.document.body.querySelector(".applyCouponButton")
        .classList.add("redeemCouponSubmit");
      const abhi_uiSetting = JSON.parse(localStorage.getItem("abhi_uiSetting"));
      document
        .querySelector("#iframeID")
        .contentWindow.document.body.querySelector(
          ".applyCouponButton"
        ).innerHTML = "Submit";
      document
        .querySelector("#iframeID")
        .contentWindow.document.body.querySelector(
          ".applyCouponButton"
        ).style.backgroundColor = abhi_uiSetting.Modal1.SubmitButtonColor;
      document
        .querySelector("#iframeID")
        .contentWindow.document.body.querySelector(
          ".getAvailablePointsSubmit"
        ).style.display = "none";

      document
        .querySelector("#iframeID")
        .contentWindow.document.body.querySelector(".redeemCouponSubmit")
        .addEventListener("click", async function (e) {
          e.preventDefault();
          /*   console.log("redeemCouponSubmit class triggered OnClick") */
          // const redeem = await submitRedeemCouponOtp();
        });
    });

  document
    .querySelector("#iframeID")
    .contentWindow.document.body.querySelector(".abhi_continueCheckoutSubmit")
    .addEventListener("click", function (e) {
      // fetchData()
      if (localStorage.getItem("ub")?.length > 1) {
        unblockCoupon(JSON.parse(localStorage.getItem("ub")))
          .then((res) => {
            // console.log("coupon Released");
            localStorage.removeItem("ub");
          })
          .catch((err) => {
            console.log("error while releasing coupon:", err);
          });
      } else {
        location.reload();
      }
    });

  document
    .querySelector("#iframeID")
    .contentWindow.document.body.querySelector(".closeModalAndReleasePoints")
    .addEventListener("click", async function (e) {
      const response = await releasePoints();
      // const response = JSON.parse(responses);
      if (response.ReturnCode === "0") {
        location.reload();
      } else {
        location.reload();
      }
    });
}
