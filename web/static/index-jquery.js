(function (ns, fetch) {
  if (typeof fetch !== "function") return;

  ns.fetch = function () {
    const response = fetch.apply(this, arguments);

    response.then((res) => {
      // res.text().then(function(data) {
      //   console.log('!!!!!!!!!!!!!!!!!!!!!',data); // this will be a string
      // });
      const isUrlHasQueryParam = res.url.includes("?");
      console.log("isUrlHasQueryParam", isUrlHasQueryParam);
      const enhancedCartUrl = isUrlHasQueryParam
        ? res.url.toString().split("?")[0]
        : res.url;

      console.log("enhancedCartUrl", enhancedCartUrl);
      console.log("uuuuuuuuuuuuuuuu", res.url.toString().split("?"));

      console.log(
        "includes url",
        `${window.location.origin}/cart/change.js`.includes(enhancedCartUrl)
      );
      if (
        [
          `${window.location.origin}/cart/add.js`,
          `${window.location.origin}/cart/update.js`,
          `${window.location.origin}/cart/change.js`,
          `${window.location.origin}/cart/clear.js`,
        ].includes(enhancedCartUrl)
      ) {
        res
          .clone()
          .json()
          .then((data) => {
            console.log("2222222222222222222222222222", data);
            console.log("000000000000000", localStorage.identifier);
            if (localStorage.identifier) {
              console.log(
                "RRRRRRREEEEEELLLLLEEEEEEAAAAASSSSSSSSSSEEEDDDDDDD   PPPPOOOOIIINNNTTTSSS ======>>>>>>"
              );
              const releasePointsData = {
                EasyId: localStorage.id,
                TransactionCode: localStorage.identifier,
                StoreName: Shopify.shop,
                CouponCode: localStorage.cd,
              };
              const removeCartAttr = () => {
                const dataa = {
                  attributes: {},
                };
                //const appendCart = await makeAjaxRequest(`/cart.js`, dataa)
                jQuery.ajax({
                  type: "POST",
                  url: "/cart.js", // /a/bb
                  data: dataa,
                  async: true,
                  dataType: "json",
                  success: function (result) {
                    console.log(
                      "ATTTRRRR REMMMOOOVVVEEEDDD CARRRTTTTTT",
                      result
                    );
                  },
                });
              };
              jQuery.ajax({
                type: "POST",
                url: "/a/b/api/ReleaseRedemptionPoints", // /a/bb
                data: releasePointsData,
                async: true,
                dataType: "json",
                success: function (result) {
                  console.log("POINT RELEASED DDDDDD", result);
                  localStorage.removeItem("identifier");
                  localStorage.removeItem("cd");
                },
                error: function (error) {
                  console.log("POINT RELEASE ERROR", error);
                  if (error.ReturnCode == 370) {
                    localStorage.removeItem("identifier");
                    localStorage.removeItem("cd");
                  }
                },
              });
              removeCartAttr();

              console.log("localStorage.identifier", localStorage.identifier);
            }
            console.log("@@@@@@@@@@@@@@@checker function@@@@@@@@@@@", data);
          });
      }
    });

    return response;
  };
})(window, window.fetch);

console.log("HEy Chaudhary");
const abhi_modalHtml = `<div id="myModal" class="modal abhi_eazyRewardzModal" style="width:100vw; height:100vh; display:none;">
  <div class="abhi_modal-content abhi_mobileScreen" style="width:60%">
    <span class="abhi_closeEasyModal closeModalAndReleasePoints">&times;</span>
    <span class="abhi_closeEasyModal closeSuccessModal" style="display:none">&times;</span>
	<div class="abhi_easyModalDynamicContent">
      <h2 style="text-align:center"><b>Redeem Points</b></h2>
	  <p class="errorMessage" style="color:red !important;"></p>
      <form>
        <div class="abhi_form-group abhi_eazyRewardzFormGroup">
          <label for="exampleInputEmail1 ">Mobile Number  </label>
          <input id = "defa" class="eazyRewardz-input form-control form-control-lg abhi_mobileInput" type="number" placeholder="" >  
        </div>
        <button type="button" id="firstModalSubmit" class="btn btn-primary abhi_eazyRewardz-submit-button btn-lg getAvailablePointsSubmit">Submit</button>
        <button type="submit" class="btn btn-danger abhi_eazyRewardz-cancel-button btn-lg abhi_continueCheckoutSubmit">Cancel</button>
      </form>
	</div> 
  </div>
</div>`;
const abhi_getModalHtml = (abhi_uiSetting) => {
  return `
       <h2 style="text-align:center"><b>${abhi_uiSetting.Modal1.Heading}</b></h2>
      <p class="errorMessage" style="color:red !important;"></p>
        <form>
          <div class="abhi_form-group abhi_eazyRewardzFormGroup">
            <label class = "size_mob" for="exampleInputEmail1 ashish">Mobile Number </label>
            <input class="eazyRewardz-input form-control form-control-lg abhi_mobileInput" type="number" placeholder=""  oninput="javascript: if (this.value.length > this.maxLength) this.value = this.value.slice(0, this.maxLength);" maxlength = "10" > 
            <br>
          </div>
          <div class="abhi_form-group abhi_eazyRewardzFormGroup">
            <label for="exampleInputEmail1" class="discountCouponInput" style="display:none">Coupon Code</label>
            <input class="eazyRewardz-input form-control form-control-lg discountCouponInput discountCouponInputValue " type="text" placeholder="" style="display:none">  
          </div>
          <button type="button" class="btn btn-primary abhi_eazyRewardz-submit-button btn-lg getAvailablePointsSubmit abhi_checkPointsButton btn-font" style="background-color:${abhi_uiSetting.Modal1.RedeemPointsButtonColor}">${abhi_uiSetting.Modal1.RedeemPointsButtonText}</button>
          <button type="button" class="btn btn-primary abhi_eazyRewardz-submit-button btn-lg  applyCouponButton btn-font" style="background-color:${abhi_uiSetting.Modal1.ApplyCouponButtonColor}">${abhi_uiSetting.Modal1.ApplyCouponButtonText}</button>
        <button type="submit" class="btn btn-danger abhi_eazyRewardz-cancel-button btn-lg abhi_continueCheckoutSubmit btn-font "  style="background-color:${abhi_uiSetting.Modal1.CancelButtonColor}">${abhi_uiSetting.Modal1.CancelButtonText}</button> 
   
 
        </form>
        <div class="customMessageWrap" style="text-align:left;line-height:15px;margin-top:8px;"></div>
`;
};

const abhi_getAvailablePointsHtml = (data, abhi_uiSetting) => {
  return `
      <h2 style="text-align:center" class="availablePointsH2"><b class = "last">${abhi_uiSetting.Modal2.Heading}</b></h2>
	  <p class="errorMessage" style="color:red !important;"></p>
      <h3 class="availablePointsH3"><b>Balance: </b></h3>
	  <h4 style="color: #597dcf;font-size:15px;">Available Points : ${data.AvailablePoints}</h4>
	 

      <button type="submit" class="btn btn-danger abhi_eazyRewardz-cancel-button btn-lg closeAvailablePointModal" style="display:none; background-color:${abhi_uiSetting.Modal2.CancelButtonColor}">${abhi_uiSetting.Modal2.CancelButtonText}</button>

      <form class="redeemPointsForm class="availablePointsForm"">
        <div class="abhi_form-group abhi_eazyRewardzFormGroup">
          <label class ="size_mob" for="redeemPoints">Enter Points to Redeem</label>
          <input class="eazyRewardz-input form-control form-control-lg redeemPointsInput" name="redeemPoints" min="1" max"${data.AvailablePoints}" type="number" placeholder="">  
        </div>
        <button type="submit" class="btn btn-primary abhi_eazyRewardz-submit-button btn-lg abhi_redeemAvailablePoints btn-font" style="background-color:${abhi_uiSetting.Modal2.SubmitButtonColor}">${abhi_uiSetting.Modal2.SubmitButtonText}</button>
        <button type="submit" class="btn btn-danger abhi_eazyRewardz-cancel-button btn-lg continueCheckout btn-font" style="background-color:${abhi_uiSetting.Modal2.CancelButtonColor}">${abhi_uiSetting.Modal2.CancelButtonText}</button>
      </form>
    `;
};
const abhi_getConfirmOtpHtml = (abhi_uiSetting) => {
  return `
	  <h2 style="text-align:center"><b>${abhi_uiSetting.Modal3.Heading}</b></h2>
      <form>
        <div class="abhi_form-group abhi_eazyRewardzFormGroup">
          <label class = "hide_label" for="otp">Enter OTP</label>
          <input class="eazyRewardz-input form-control form-control-lg OtpInput" name="otp" type="number" placeholder="">
          </div>
          <a style="color:blue; cursor:pointer; font-size:16px;" class="resendOtp">Resend OTP</a><br>
          <br><br>
        <button type="submit" class="btn btn-primary applied abhi_eazyRewardz-submit-button btn-lg confirmOtp btn-font" style="background-color:${abhi_uiSetting.Modal3.SubmitButtonColor}">${abhi_uiSetting.Modal3.SubmitButtonText}</button>
	    <button type="submit" class="btn btn-danger abhi_eazyRewardz-cancel-button btn-lg continueCheckout btn-font cancel_hide" style="background-color:${abhi_uiSetting.Modal3.CancelButtonColor}">${abhi_uiSetting.Modal3.CancelButtonText}</button>
      </form>
    `;
};
function docReady(fn) {
  // see if DOM is already available
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    // call on next available tick
    setTimeout(fn, 1);
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}
docReady(function () {
  console.log("RETURN");
  // return
  // window.addEventListener("load", (event) => {
  console.log(
    "HIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII"
  );
  // $("#myModal").css({"display":"none"})
  const styleLink = `<link rel="stylesheet" href="/a/b/index.css"></link>`;
  const jqueryLink = `<scriptsrc="https://code.jquery.com/jquery-3.6.3.min.js"integrity="sha256-pvPw+upLPUjgMXY0G+8O0xUf+/Im1MZjXxxgOcBQBXU="crossorigin="anonymous"></script>`;
  const googleFonts =
    '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Courgette&family=Italianno&family=Montserrat&family=Raleway&family=Tangerine&display=swap" rel="stylesheet">';
  //recomment if needed
  // document.head.innerHTML = document.head.innerHTML + bootstrapLink + googleFonts  + styleLink
  document.head.innerHTML =
    document.head.innerHTML + googleFonts + styleLink + jqueryLink;

  // const baseUrl = '/a/b'
  const baseUrl = "/a/b";
  const makeAjaxRequest = async (url, data, method) => {
    const httpMethod = method ? method : "POST";
    return jQuery.ajax({
      type: httpMethod,
      url: url, // /a/bb
      data: data,
      async: true,
      dataType: "json",
      success: function (result) {
        console.log("Yes result came", result);
        return result;
      },
      error: function (error) {
        return error;
      },
    });
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
  let selector = possibleSelector.find((item) => {
    return $(item).html() != undefined;
  });

  const checkApiStatus = async () => {
    const settingsUrl = `${baseUrl}/api/getAppSettings`;
    const appSettingsParams = { storeName: Shopify.shop };
    const currentThemeId = Shopify.theme.id;
    const appSettingsResponse = await makeAjaxRequest(
      settingsUrl,
      appSettingsParams
    );
    const isTestMode = appSettingsResponse.isTestMode;
    const testThemeId = appSettingsResponse.testThemeId;
    if (isTestMode && currentThemeId != testThemeId) {
      return;
    }
    const url = `${baseUrl}/api/GetStoreDetails`;
    const data = { url: Shopify.shop, tag: "fe" };
    const response = await makeAjaxRequest(url, data);
    console.log("selector is seriously here , ", response);
    console.log("selector is seriously here , ", selector);
    console.log("selector is seriously here , ", response.isAppDisabled);
    console.log("Before RETURN");
    console.log("AFTER RETURN");
    if (response.Status == "Active") {
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
      console.log("CUSTOM CSS", customCss);
      customCss.innerText = `${response.CustomCss}`;
      console.log("CUSTOM CSS WITH STYLE TAG", customCss);

      // document.head.innerHTML = document.head.innerHTML + customCss

      document.head.appendChild(customCss);

      console.log("Abhi_abhi ", response.RedeemButton);
      console.log("SELECTOR Without DOM SELECTOR", selector);

      if (response.RedeemButton.DomSelector) {
        selector = response.RedeemButton.DomSelector.split(",");
        console.log("SELECTOR From DOM SELECTOR", selector);
        console.log(
          "response.RedeemButton.DomSelector.includes(',')",
          response.RedeemButton.DomSelector.includes(",")
        );
        console.log(
          "response.RedeemButton.DomSelector",
          response.RedeemButton.DomSelector
        );
        selector.forEach((id) => {
          console.log("FOR EACH ID", id);
          $(`<button class='btn btn-primary abhi_eazyRewardz-submit-button abhi_easyPointModalBtn' style="background-color:${response.RedeemButton.ButtonColor} !important; width: 100%;margin-bottom: 10px;" >
              Redeem Points
               </button>`).insertBefore(`${id}`);
        });
      } else {
        $(`<button class='btn btn-primary abhi_eazyRewardz-submit-button abhi_easyPointModalBtn' style="background-color:${response.RedeemButton.ButtonColor} !important ;width: 100%;margin-bottom: 10px;" >
              Redeem Points
           </button>`).insertBefore(`${selector}`);
      }

      $(".abhi_continueCheckoutSubmit").click(function (e) {
        location.reload();
      });
      $(".closeModalAndReleasePoints").click(async function (e) {
        const response = await releasePoints();
        if (response.ReturnCode == "0") {
          location.reload();
        } else {
          location.reload();
        }
      });
      $(".abhi_easyPointModalBtn").click(function (e) {
        e.preventDefault();
        const newHtml = abhi_getModalHtml(response);
        $(".abhi_easyModalDynamicContent").html(newHtml);
        var $customMessage = $("<small />", {
          class: "customMessage",
          text: response.Modal1.CustomMessage,
        });

        $(".customMessageWrap").append($customMessage);

        $("#myModal").css({ display: "block" });

        $(".getAvailablePointsSubmit").click(getAvailablePointsSubmit);

        $(".applyCouponButton").click(function () {
          $(".discountCouponInput").css({ display: "block" });
          $(".abhi_eazyRewardzFormGroup").css({ "margin-bottom": "55px" });

          $(".applyCouponButton").addClass("redeemCouponSubmit");
          const abhi_uiSetting = JSON.parse(
            localStorage.getItem("abhi_uiSetting")
          );
          $(".applyCouponButton").html("Submit");
          $(".applyCouponButton").css({
            "background-color": `${abhi_uiSetting.Modal1.SubmitButtonColor}`,
          });
          $(".getAvailablePointsSubmit").css({ display: "none" });

          $(".redeemCouponSubmit").click(async function (e) {
            e.preventDefault();
            const redeem = await submitRedeemCouponOtp();
          });
        });
      });
      //test code to check will this work
      $("a[href$=availablePoints]").click(function (e) {
        e.preventDefault();
        const abhi_uiSetting = JSON.parse(
          localStorage.getItem("abhi_uiSetting")
        );
        const newHtml = abhi_getModalHtml(abhi_uiSetting);
        $(".abhi_easyModalDynamicContent").html(newHtml);
        $(".abhi_checkPointsButton").attr("id", "checkBalancePoint");

        $(".getAvailablePointsSubmit").html("Submit");
        $(".getAvailablePointsSubmit").css({
          "background-color": `${abhi_uiSetting.Modal1.SubmitButtonColor}`,
        });

        $(".applyCouponButton").css({ display: "none" });
        $("#myModal").css({ display: "block" });
        $(".getAvailablePointsSubmit").click(getAvailablePointsSubmit);
        $(".availablePointsH2").html("Point Balance");
      });
    }
    //return response
  };
  console.log("checkApi status called");
  checkApiStatus();

  const identifier = `easyRewards${(Math.random() + 5)
    .toString(36)
    .substring(2)}`;
  if (!localStorage.identifier) {
    console.log(
      "NOOOOOTTTTTTTTTTT LOCALSTORAGE ITENTIFIER",
      localStorage.identifier
    );
    localStorage.setItem("identifier", identifier);
  }
  const storeName = Shopify.shop;
  //insert Redeem EasyPoint Button Before Checkout Button
  //   $(`<button class='btn btn-primary abhi_eazyRewardz-submit-button abhi_easyPointModalBtn' style='margin-left:160px;margin-bottom:20px;'>
  // 		Want to Redeem Easy Points
  //      </button>`
  //    ).insertBefore('.checkOutButton')

  $(".page-width").append(abhi_modalHtml);

  $("#myModal .abhi_closeEasyModal").click(function (e) {
    $("#myModal").css({ display: "none" });
  });
  const getAvailablePointsSubmit = async (e) => {
    e.preventDefault();
    const enteredMobileNo = $(".abhi_mobileInput").val();
    localStorage.setItem("id", enteredMobileNo);
    const data = {
      EasyId: enteredMobileNo,
      StoreName: Shopify.shop,
    };
    const url = `${baseUrl}/api/CustomerAvailablePoints`;
    //     const url2 = `https://easyrewards.herokuapp.com/api/CustomerAvailablePoints`
    const response = await makeAjaxRequest(url, data);
    console.log(response);
    if (response.ReturnCode !== "0") {
      // showErrorMessage(response.ReturnMessage);
      showErrorMessage("Enter Valid Mobile Number");
      return;
    }
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

  const renderavailablePointDetails = (data, higherOrderParams) => {
    const abhi_uiSetting = JSON.parse(localStorage.getItem("abhi_uiSetting"));
    const html = abhi_getAvailablePointsHtml(data, abhi_uiSetting);
    $(".abhi_easyModalDynamicContent").html(html);
    if (!higherOrderParams.EasyId)
      return showErrorMessage("Please Enter Mobile No");
    $(".abhi_redeemAvailablePoints").click(async function (e) {
      e.preventDefault();
      if (!$(".abhi_mobileInput").val()) {
        // return showErrorMessage("Please Enter Mobile No.")
      }
      const enteredAmount = $(".redeemPointsInput").val();
      const url = `${baseUrl}/api/CheckForEasyPointsRedemption`;
      console.log(Shopify.shop);
      const cartData = await makeAjaxRequest(`/cart.js`);

      const postdata = {
        EasyId: higherOrderParams.EasyId,
        EasyPoints: enteredAmount,
        Amount: cartData.total_price,
        StoreName: Shopify.shop,
        PointRate: higherOrderParams.PointRate,
        TransactionCode: localStorage.identifier,
      };
      const pointsRedeem = enteredAmount;
      const response = await makeAjaxRequest(url, postdata);
      console.log("checkForRedemResponse", response);
      if (response.ReturnCode != "0") {
        showErrorMessage(response.ReturnMessage);
        return;
      }
      higherOrderParams.PointValue = response.CashWorthPoints;
      renderOtpHtml(data, higherOrderParams, pointsRedeem);
    });
  };
  const renderOtpHtml = (data, requiredParameters, pointsRedeem) => {
    const abhi_uiSetting = JSON.parse(localStorage.getItem("abhi_uiSetting"));
    const html = abhi_getConfirmOtpHtml(abhi_uiSetting);
    //     alert(requiredParameters)

    $(".abhi_easyModalDynamicContent").html(html);
    $(".continueCheckout").click(async function (e) {
      e.preventDefault();
      const response = await releasePoints();
      if (response.ReturnCode == "0") {
        location.reload();
      } else {
        location.reload();
      }
    });
    $(".confirmOtp").click(async function (e) {
      e.preventDefault();
      console.log("dsafgaukidhjsadhkdfgkajdhasjfdhakjsdhak");
      const url = `${baseUrl}/api/ConfirmOTP`;
      const enteredOTP = $(".OtpInput").val();
      const date = new Date().toString().split(" ");
      const aDate = `${date[2]} ${date[1]} ${date[3]}`;

      //         alert(pointsRedeem)

      const postData = {
        EasyId: requiredParameters.EasyId,
        TransactionCode: localStorage.identifier,
        SmsCode: $(".OtpInput").val(),
        TransactionDate: aDate,
        CountryCode: "91",
        StoreName: Shopify.shop,
        PointRedeem: pointsRedeem,
        EasyPoints: requiredParameters.EasyPoints,
        PointRate: requiredParameters.PointRate,
      };
      console.log(postData);
      const response = await makeAjaxRequest(url, postData);
      console.log(response);
      if (response.ReturnCode != "0") {
        showErrorMessage(response.ReturnMessage);
        return;
      }

      // display success message on UI (to be done)
      console.log("Parameters Points", requiredParameters);
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
      if (response.ReturnCode == "0") {
        localStorage.setItem("cd", response.code);
        appendDiscountInCheckOutForPoints(response.code); // passing discountCoupon
        const successMessage = `<p style="color:green">Discount Applied ! </p>`;
        $(successMessage).insertAfter("#cart-errors");
        // $("#myModal").css({"display":"none"})
        // ashish
        let ashishDiv = `<span class="sure"> Successfully applied</span>`;
        document.querySelector(".abhi_form-group").innerHTML += ashishDiv;
        $(".resendOtp").css({ display: "none" });
        $(".applied").css({ display: "none" });
        $(".cancel_hide").css({ display: "none" });
        $(".OtpInput").css({ display: "none" });
        $(".hide_label").css({ display: "none" });
        $(".closeModalAndReleasePoints").css({ display: "none" });
        $(".closeSuccessModal").css({ display: "block" });

        $(".abhi_easyModalDynamicContent h2 b").css({ display: "none" });
      } else {
        showErrorMessage(response.ReturnMessage);
      }
    });
    const appendDiscountInCheckOutForPoints = (couponCodeForPoints) => {
      const cartForm = $("form[action='/cart']");
      cartForm.append(
        `<input type="hidden" class="easyReward-discount" name="discount" value="${couponCodeForPoints}">`
      );
    };
    $(".resendOtp").click(async function (e) {
      const date = new Date().toString().split(" ");
      const aDate = `${date[2]} ${date[1]} ${date[3]}`;
      e.preventDefault();
      const url = `${baseUrl}/api/ResendOTPs`;
      const response = await makeAjaxRequest(url, {
        EasyId: localStorage.id,
        TransactionCode: localStorage.identifier,
        //           SmsCode: $(".OtpInput").val(),
        TransactionDate: aDate,
        CountryCode: "91",
        StoreName: Shopify.shop,
      });
      //             alert("clicked!!")
    });
  };

  const showErrorMessage = (message) => {
    console.log("=-====================================== ", message);
    $(".errorMessage").html(message);
  };
  const releasePoints = async () => {
    const url = `${baseUrl}/api/ReleaseRedemptionPoints`;
    const response = await makeAjaxRequest(url, {
      EasyId: localStorage.id,
      TransactionCode: localStorage.identifier,
      StoreName: Shopify.shop,
      CouponCode: localStorage.cd,
    });
    if (response.ReturnCode == 0) {
      localStorage.removeItem("identifier");
      localStorage.removeItem("cd");
      appendDiscountInCheckOutForPoints("");
      const dataa = {
        attributes: {},
      };
      const appendCart = await makeAjaxRequest(`/cart.js`, dataa);
    }
    return response;
  };
  const showPointBalance = (data) => {
    const abhi_uiSetting = JSON.parse(localStorage.getItem("abhi_uiSetting"));
    const checkAvailablePointsHtml = `
      <h2 style="text-align:center" class="availablePointsH2"><b class="banner_otp">${abhi_uiSetting.ModalB.Heading}</b></h2>
	  <p class="errorMessage" style="color:red !important;"></p>
	  <div style="text-align:center; border: 1px solid grey; margin-top:5px; margin-bottom:5px; padding-top:5px; padding-bottom:5px">
        <h4 style="color: #597dcf;font-size:15px;">Available Points : ${data.AvailablePoints}</h4>

	  </div>
		<br>
      <button type="submit" class="btn btn-danger abhi_eazyRewardz-cancel-button btn-lg closeAvailablePointModal" style="background-color:${abhi_uiSetting.ModalB.CancelButtonColor}">${abhi_uiSetting.ModalB.CancelButtonText}</button>
    `;
    $(".abhi_easyModalDynamicContent").html(checkAvailablePointsHtml);
    $(".closeAvailablePointModal").click(function (e) {
      location.reload();
    });
    $(".abhi_modal-content").addClass("abhi_mobileScreen");
    //     $(".abhi_modal-content").css("width", "55%")
  };
  const submitRedeemCouponOtp = async () => {
    //     alert("Redeem Coupon")
    const url = `${baseUrl}/api/RedeemCoupon`;
    if (!$(".abhi_mobileInput").val()) {
      return showErrorMessage("Please Enter Mobile No.");
    }
    if (!$(".discountCouponInputValue").val()) {
      return showErrorMessage("Please Enter Coupon Code.");
    }
    const params = {
      EasyId: $(".abhi_mobileInput").val(),
      EasyDiscountCoupon: $(".discountCouponInputValue").val(),
      StoreName: Shopify.shop,
    };
    const response = await makeAjaxRequest(url, params);
    if (response.ReturnCode != "0") {
      showErrorMessage(response.ReturnMessage);
    } else {
      const otpParams = {
        EasyId: $(".abhi_mobileInput").val(),
        RequestID: response.RequestID,
        CouponCode: $(".discountCouponInputValue").val(),
        DiscountCode: response.POSPromo,
        StoreName: Shopify.shop,
      };

      if (response.OTPRequired != 1) {
        const cartForm = $("form[action='/cart']");
        cartForm.append(
          `<input type="hidden" class="easyReward-discount" name="discount" value="${response.POSPromo}">`
        );
        const successMessage = `<p style="color:green">Discount Applied ! </p>`;
        $(successMessage).insertAfter("#cart-errors");
        $("#myModal").css({ display: "none" });
      } else {
        const couponHtml = getCouponOtpHtml();
        $(".abhi_easyModalDynamicContent").html(couponHtml);
        $(".abhi_closeEasyModal").css({ display: "none" });

        $(".confirmCouponOtp").click(function (e) {
          e.preventDefault();
          confirmCouponOtp(otpParams);
        });
        $(".resendCouponOtp").click(function (e) {
          e.preventDefault();
          resendCouponOtp(otpParams);
        });

        $(".continueCheckoutCoupon").click(function (e) {
          e.preventDefault();
          unblockCoupon(otpParams);
        });
      }
    }
  };
  const getCouponOtpHtml = () => {
    return `
		<h2 style="text-align:center"><b>Enter Otp</b></h2>
      <form>
        <div class="abhi_form-group abhi_eazyRewardzFormGroup">
          <label class = "ok1" for="otp">Enter OTP</label>
          <input class="eazyRewardz-input form-control form-control-lg couponOtpInput" name="otp" type="number" placeholder="" required>
          </div>
          <a style="color:blue; cursor:pointer; font-size:12px;" class="resendCouponOtp">Resend Otp</a><br>
        <button type="submit" class="btn btn-primary abhi_eazyRewardz-submit-button btn-lg confirmCouponOtp" style="background-color:green">Submit</button>
	    <button type="submit" class="btn btn-danger abhi_eazyRewardz-cancel-button btn-lg continueCheckoutCoupon" style="background-color:red">Cancle</button>
      </form>
	`;
  };
  const confirmCouponOtp = async (data) => {
    const url = `${baseUrl}/api/ConfirmCouponOtp`;
    const couponOtp = $(".couponOtpInput").val();
    const params = { ...data, couponOtp };
    const response = await makeAjaxRequest(url, params);
    console.log("Parameters Coupon", data);

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
      const cartForm = $("form[action='/cart']");
      cartForm.append(
        `<input type="hidden" class="easyReward-discount" name="discount" value="${data.DiscountCode}">`
      );
      const successMessage = `<p style="color:green">Discount Applied ! </p>`;
      $(successMessage).insertAfter("#cart-errors");
      $("#myModal").css({ display: "none" });
    } else {
      showErrorMessage(response.ReturnMessage);
    }
  };
  const resendCouponOtp = async (data) => {
    const url = `${baseUrl}/api/ResendCouponOtp`;
    const params = {
      EasyId: data.EasyId,
      TransactionCode: data.CouponCode,
      StoreName: data.StoreName,
    };
    const response = await makeAjaxRequest(url, params);
  };
  const unblockCoupon = async (data) => {
    const url = `${baseUrl}/api/UnblockCoupon`;
    const response = await makeAjaxRequest(url, data);
    if (response.ReturnCode == "0") {
      //         alert("stop")
      location.reload();
    } else {
      showErrorMessage(response.ReturnMessage);
    }
  };
  // });
});
