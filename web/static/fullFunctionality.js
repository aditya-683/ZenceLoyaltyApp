window.addEventListener("DOMContentLoaded", (event) => {
  const renderOtpHtml = (data, requiredParameters, pointsRedeem) => {
    const abhi_uiSetting = JSON.parse(
      localStorage.getItem("abhi_uiSetting")
    );
    const html = abhi_getConfirmOtpHtml(abhi_uiSetting);
    //     alert(requiredParameters)

    document.querySelector(".abhi_easyModalDynamicContent").innerHTML = html;

    document.querySelector(".confirmOtp").addEventListener("click", async function (e) {
        e.preventDefault();
        // console.log("dsafgaukidhjsadhkdfgkajdhasjfdhakjsdhak");
        const url = `/a/b/api/ConfirmOTP`;
        const enteredOTP = document.querySelector(".OtpInput").value;
        const date = new Date().toString().split(" ");
        const aDate = `${date[2]} ${date[1]} ${date[3]}`;

        //         alert(pointsRedeem)

        const postData = {
          EasyId: requiredParameters.EasyId,
          TransactionCode: localStorage.identifier,
          SmsCode: document
            
            .querySelector(".OtpInput").value,
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

        // console.log("mmmmm -> ", response);
        if (response.ReturnCode != "0") {
          showErrorMessage(response.ReturnMessage);
          return;
        }

        // display success message on UI (to be done)
        // console.log("Parameters Points", requiredParameters);
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
          document
            .querySelector("#cart-errors")
            ?.insertAdjacentHTML("afterend", successMessage);
          // ashish
          const couponCodeHtml = `<b style="color:green;">${response.code.toUpperCase()}</b>`;
          let ashishDiv = `<span class="sure"></span><p style="text-align: center;width:100%">Point Redeemed! Use coupon code ${couponCodeHtml} in checkout</p>`;
          document.querySelector(".abhi_form-group").innerHTML += ashishDiv;
          document.querySelector(
              ".resendOtp"
            ).style.display = "none";
          document.querySelector(
              ".applied"
            ).style.display = "none";
          document.querySelector(
              ".cancel_hide"
            ).style.display = "none";
          document.querySelector(
              ".OtpInput"
            ).style.display = "none";
          document
            .querySelector(
              ".hide_label"
            ).style.display = "none";
          document.querySelector(
              ".closeModalAndReleasePoints"
            ).style.display = "none";
          document.querySelector(
              ".closeSuccessModal"
            ).style.display = "block";
          document.querySelector(
              ".abhi_easyModalDynamicContent h2 b"
            ).style.display = "none";
        } else {
          showErrorMessage(response.ReturnMessage);
        }
      });

    document.querySelector(".closeSuccessModal")
      .addEventListener("click", async (e) => {
        e.preventDefault();
        document.querySelector(
            ".abhi_eazyRewardzModal"
          ).style.display = "none";
        location.reload();
      });
    document.querySelector(".resendOtp")
      .addEventListener("click", async (e) => {
        const date = new Date().toString().split(" ");
        const aDate = `${date[2]} ${date[1]} ${date[3]}`;
        e.preventDefault();
        const url = `/a/b/api/ResendOTPs`;
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

  // console.log(
  //   "8888888888888888888888888888888888888888888888888888888888888888888"
  // );

  const appendDiscountInCheckOutForPoints = (couponCodeForPoints) => {
    const cartForm = document.querySelector("form[action='/cart']");
    const input = document.createElement("input");
    input.type = "hidden";
    input.className = "easyReward-discount";
    input.name = "discount";
    input.value = couponCodeForPoints;
    cartForm.append(input);
  };

  // console.log(
  //   "9999999999999999999999999999999999999999999999999999999999999999999999999999"
  // );

  const releasePoints = async () => {
    const url = `/a/b/api/ReleaseRedemptionPoints`;
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
    // console.log("RESPONSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS", response);
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
  };

  function reloadOnCancel() {
    // console.log(
    //   "gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg"
    // );
    document.querySelector(".continueCheckout")
      .addEventListener("click", async function (e) {
        e.preventDefault();
        const response = await releasePoints();
        // const response = JSON.parse(responses);

        // console.log("checkout -> ", response);

        if (response.ReturnCode == "0") {
          location.reload();
        } else {
          location.reload();
        }
      });
  }

  // console.log("10101010101010101010101010101010101010101010101010");

  const abhi_modalHtml = `<div id="myModal" class="abhi_eazyRewardzModal" style="width:100vw; height:100vh; display:none;">
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
    // console.log(
    //   "abhi_uiSetting.Modal1.RedeemPointsButtonColor -> ",
    //   abhi_uiSetting.Modal1.RedeemPointsButtonColor
    // );
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

     
      <br>
      <button type="button" class="btn btn-primary abhi_eazyRewardz-submit-button btn-lg getAvailablePointsSubmit abhi_checkPointsButton btn-font 1111" style="background-color:${abhi_uiSetting.Modal1.RedeemPointsButtonColor} !important">${abhi_uiSetting.Modal1.RedeemPointsButtonText}</button>
      <button type="button" class="btn btn-primary abhi_eazyRewardz-submit-button btn-lg  applyCouponButton btn-font" style="background-color:${abhi_uiSetting.Modal1.ApplyCouponButtonColor} !important">${abhi_uiSetting.Modal1.ApplyCouponButtonText}</button>
    <button type="submit" class="btn btn-danger abhi_eazyRewardz-cancel-button btn-lg abhi_continueCheckoutSubmit btn-font "  style="background-color:${abhi_uiSetting.Modal1.CancelButtonColor} !important">${abhi_uiSetting.Modal1.CancelButtonText}</button> 


    </form>
    <div class="customMessageWrap" style="text-align:left;line-height:15px;margin-top:8px;"></div>
`;
  };

  const abhi_getAvailablePointsHtml = (data, abhi_uiSetting) => {
    return `
  <h2 style="text-align:center" class="availablePointsH2"><b class = "last">${abhi_uiSetting.Modal2.Heading}</b></h2>
   <p class="errorMessage" style="color:red !important;"></p>
  <h3 class="availablePointsH3"><b>Balance: </b></h3>
<h4 style="color: #597dcf;font-size:15px;">Balance Points : ${data.AvailablePoints}</h4>


  <button type="submit" class="btn btn-danger abhi_eazyRewardz-cancel-button btn-lg closeAvailablePointModal" style="display:none; background-color:${abhi_uiSetting.Modal2.CancelButtonColor} !important">${abhi_uiSetting.Modal2.CancelButtonText}</button>

  <form class="redeemPointsForm availablePointsForm 0000">
    <div class="abhi_form-group abhi_eazyRewardzFormGroup">
      <label class ="size_mob" for="redeemPoints">Enter Points to Redeem</label>
      <input class="eazyRewardz-input form-control form-control-lg redeemPointsInput" name="redeemPoints" min="1" max"${data.AvailablePoints}" type="number" placeholder="">  
    </div>

   

    <button type="submit" class="btn btn-primary abhi_eazyRewardz-submit-button btn-lg abhi_redeemAvailablePoints btn-font 222" style="background-color:${abhi_uiSetting.Modal2.SubmitButtonColor} !important">${abhi_uiSetting.Modal2.SubmitButtonText}</button>
    <button type="submit" class="btn btn-danger abhi_eazyRewardz-cancel-button btn-lg continueCheckout btn-font" style="background-color:${abhi_uiSetting.Modal2.CancelButtonColor} !important">${abhi_uiSetting.Modal2.CancelButtonText}</button>
  </form>
`;
  };

  const checkApiStatus = async () => {
    // console.log("nnnnnnnnnnnnnnnnnnnnnn");
    const settingsUrl = `/a/b/api/getAppSettings`;
    const appSettingsParams = { storeName: Shopify.shop };
    const currentThemeId = Shopify.theme.id;
    const appSettingsResponses = await makeAjaxRequest(
      settingsUrl,
      appSettingsParams
    );
    const appSettingsResponse = JSON.parse(appSettingsResponses);
    const isTestMode = appSettingsResponse.isTestMode;
    const testThemeId = appSettingsResponse.testThemeId;
    // console.log("isTestMode", isTestMode);
    // console.log("testThemeId", testThemeId);
    // console.log("currentThemeId", currentThemeId);
    if (isTestMode && currentThemeId != testThemeId) {
      return;
    }
    const url = `/a/b/api/GetStoreDetails`;
    // // for Testing
    // const url = `/a/b-easyreward/api/GetStoreDetails`
    const data = { url: Shopify.shop, tag: "fe" };
    const responseData = await makeAjaxRequest(url, data);
    const response = JSON.parse(responseData);
    // console.log("selector is seriously here , ", response.status);
    // console.log("selector is seriously here , ", selector);
    // console.log("selector is seriously here , ", response.isAppDisabled);
    // console.log("Before RETURN");
    // console.log("AFTER RETURN ", Shopify.shop);

    if (true) {
      // console.log("vvvvvvvvvvvvvvvvvvvvvv");
      // if (response.Status == "Active") {
      let mainDivForErContent = document.createElement("div");
      mainDivForErContent.innerHTML = abhi_modalHtml;
      document.appendChild(mainDivForErContent);
      document.querySelector(
          "#myModal .abhi_closeEasyModal"
        )
        .addEventListener("click", function (e) {
          document.querySelector(
              "#myModal"
            ).style.display = "none";
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
            RedeemPointsButtonColor:
              response.Modal1.RedeemPointsButtonColor,
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
      // console.log(response, "CUSTOM CSS", customCss);/
      customCss.innerText = `${response.CustomCss}`;
      // console.log("CUSTOM CSS WITH STYLE TAG", customCss);

      // document.head.innerHTML = document.head.innerHTML + customCss

      document.head.appendChild(customCss);

      // console.log("Abhi_abhi ", response.RedeemButton);
      // console.log("SELECTOR Without DOM SELECTOR", selector);

      document
        .querySelector(".abhi_easyPointModalBtn")
        .addEventListener("click", function (e) {
          e.preventDefault();
          const newHtml = abhi_getModalHtml(response);
          document.querySelector(
              ".abhi_easyModalDynamicContent"
            ).innerHTML = newHtml;
          const customMessage = document.createElement("small");
          customMessage.classList.add("customMessage");
          customMessage.textContent = response.Modal1.CustomMessage;
          document
            .querySelector(".customMessageWrap")
            .appendChild(customMessage);
          document
            .querySelector(
              "#myModal"
            ).style.display = "block";
          document
            .querySelector(
              ".getAvailablePointsSubmit"
            )
            .addEventListener("click", getAvailablePointsSubmit);

          document
            .querySelector(".applyCouponButton")
            .addEventListener("click", function () {
              // console.log(
              //   "mmmmmmmmmmmm -> ",
              //   document.querySelector(
              //       ".discountCouponInput"
              //     )
              // );
              document.querySelector(
                  ".discountCouponInput"
                ).style.display = "block";
              document.querySelector(
                  ".discountCouponInputValue"
                ).style.display = "block";

              document.querySelector(
                  ".abhi_eazyRewardzFormGroup"
                ).style.marginBottom = "55px";
              document
                
                .querySelector(
                  ".applyCouponButton"
                )
                .classList.add("redeemCouponSubmit");
              const abhi_uiSetting = JSON.parse(
                localStorage.getItem("abhi_uiSetting")
              );
              document
                
                .querySelector(
                  ".applyCouponButton"
                ).innerHTML = "Submit";
              document
                
                .querySelector(
                  ".applyCouponButton"
                ).style.backgroundColor =
                abhi_uiSetting.Modal1.SubmitButtonColor;
              document
                
                .querySelector(
                  ".getAvailablePointsSubmit"
                ).style.display = "none";
              document
                
                .querySelector(
                  ".redeemCouponSubmit"
                )
                .addEventListener("click", async function (e) {
                  e.preventDefault();
                  const redeem = await submitRedeemCouponOtp();
                });
            });
        });

      //test code to check will this work
      document
        
        .querySelector(
          "a[href$=availablePoints]"
        )
        ?.addEventListener("click", function (e) {
          e.preventDefault();
          const abhi_uiSetting = JSON.parse(
            localStorage.getItem("abhi_uiSetting")
          );
          const newHtml = abhi_getModalHtml(abhi_uiSetting);
          document
            
            .querySelector(
              ".abhi_easyModalDynamicContent"
            ).innerHTML = newHtml;
          document
            
            .querySelector(
              ".abhi_checkPointsButton"
            ).id = "checkBalancePoint";
          document
            
            .querySelector(
              ".getAvailablePointsSubmit"
            ).innerHTML = "Submit";
          document
            
            .querySelector(
              ".getAvailablePointsSubmit"
            ).style.backgroundColor =
            abhi_uiSetting.Modal1.SubmitButtonColor;
          document
            
            .querySelector(
              ".applyCouponButton"
            ).style.display = "none";
          document
            
            .querySelector(
              "#myModal"
            ).style.display = "block";
          document
            
            .querySelector(
              ".getAvailablePointsSubmit"
            )
            .addEventListener("click", getAvailablePointsSubmit);
          document
            
            .querySelector(
              ".availablePointsH2"
            ).innerHTML = "Point Balance";
        });

      const identifier = `easyRewards${(Math.random() + 5)
        .toString(36)
        .substring(2)}`;
      if (!localStorage.identifier) {
        // console.log(
        //   "NOOOOOTTTTTTTTTTT LOCALSTORAGE ITENTIFIER",
        //   localStorage.identifier
        // );
        localStorage.setItem("identifier", identifier);
      }
    }

    //return response
  };

  const renderavailablePointDetails = (data, higherOrderParams) => {
    const abhi_uiSetting = JSON.parse(
      localStorage.getItem("abhi_uiSetting")
    );
    const html = abhi_getAvailablePointsHtml(data, abhi_uiSetting);

    document
      
      .querySelector(
        ".abhi_easyModalDynamicContent"
      ).innerHTML = html;
    if (!higherOrderParams.EasyId) {
      return showErrorMessage("Please Enter Mobile No");
    }

    document
      
      .querySelector(
        ".abhi_redeemAvailablePoints"
      )
      .addEventListener("click", async function (e) {
        e.preventDefault();
        // if (!document.querySelector(".abhi_mobileInput").value) {
        //   // return showErrorMessage("Please Enter Mobile No.")
        // }
        const enteredAmount = document
          
          .querySelector(".redeemPointsInput")
          .value;
        const url = `/a/b/api/CheckForEasyPointsRedemption`;
        // console.log(Shopify.shop);
        const cartDataJson = await fetch(`/cart.js`);
        const cartData = await cartDataJson.json();
        // console.log(
        //   "cartDataaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        //   cartData
        // );
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
        // console.log("CHECK FOR POINTS", postdata);
        const pointsRedeem = enteredAmount;
        const responses = await makeAjaxRequest(url, postdata);
        const response = JSON.parse(responses);

        // console.log("checkForRedemResponse", response);
        if (response.ReturnCode != "0") {
          showErrorMessage(response.ReturnMessage);
          return;
        }
        higherOrderParams.PointValue = response.CashWorthPoints;
        higherOrderParams.EasyPoints = response.EasyPoints;
        renderOtpHtml(data, higherOrderParams, pointsRedeem);
      });

    reloadOnCancel();
  };

  const abhi_getConfirmOtpHtml = (abhi_uiSetting) => {
    return `
<h2 style="text-align:center"><b>${abhi_uiSetting.Modal3.Heading}</b></h2>
  <form>
    <div class="abhi_form-group abhi_eazyRewardzFormGroup">
      <label class = "hide_label" for="otp">Enter OTP</label>
      <input class="eazyRewardz-input form-control form-control-lg OtpInput" name="otp" type="number" placeholder="">
      </div>
      <a style="color:blue; cursor:pointer; font-size:16px;" class="resendOtp">Resend Otp</a><br>
      <br>
    <button type="submit" class="btn btn-primary applied abhi_eazyRewardz-submit-button btn-lg confirmOtp btn-font 000" style="background-color:${abhi_uiSetting.Modal3.SubmitButtonColor} !important">${abhi_uiSetting.Modal3.SubmitButtonText}</button>
  <button type="submit" class="btn btn-danger abhi_eazyRewardz-cancel-button btn-lg continueCheckout btn-font cancleButtonOtpForm cancel_hide" style="background-color:${abhi_uiSetting.Modal3.CancelButtonColor} !important">${abhi_uiSetting.Modal3.CancelButtonText}</button>
  </form>
`;
  };

  const showPointBalance = (data) => {
    const abhi_uiSetting = JSON.parse(
      localStorage.getItem("abhi_uiSetting")
    );
    const checkAvailablePointsHtml = `
  <h2 style="text-align:center" class="availablePointsH2"><b class="banner_otp">${abhi_uiSetting.ModalB.Heading}</b></h2>
<p class="errorMessage" style="color:red !important;"></p>
<div style="text-align:center; border: 1px solid grey; margin-top:5px; margin-bottom:5px; padding-top:5px; padding-bottom:5px">
    <h4 style="color: #597dcf;font-size:15px;">Balance Points : ${data.AvailablePoints}</h4>

</div>
<br>
  <button type="submit" class="btn btn-danger abhi_eazyRewardz-cancel-button btn-lg closeAvailablePointModal" style="background-color:${abhi_uiSetting.ModalB.CancelButtonColor} !important">${abhi_uiSetting.ModalB.CancelButtonText}</button>
`;
    document.querySelector(
      ".abhi_easyModalDynamicContent"
    ).innerHTML = checkAvailablePointsHtml;

    document
      .querySelector(".closeAvailablePointModal")
      .addEventListener("click", function (e) {
        location.reload();
      });
    document
      .querySelector(".abhi_modal-content")
      .classList.add("abhi_mobileScreen");
    //     document.querySelector('.abhi_modal-content').style.width = '55%';
  };

  async function allFunctionality() {
    // console.log("checkApi status called");
    await checkApiStatus();

    const getCouponOtpHtml = () => {
      return `
<h2 style="text-align:center"><b>Enter Otp</b></h2>
  <form>
    <div class="abhi_form-group abhi_eazyRewardzFormGroup">
      <label class = "ok1" for="otp">Enter OTP</label>
      <input class="eazyRewardz-input form-control form-control-lg couponOtpInput" name="otp" type="number" placeholder="" required>
      </div>
      <a style="color:blue; cursor:pointer; font-size:12px;" class="resendCouponOtp">Resend Otp</a><br>
      <br> 
    <button type="submit" class="btn btn-primary abhi_eazyRewardz-submit-button btn-lg confirmCouponOtp" style="background-color:green !important">Submit</button>
  <button type="submit" class="btn btn-danger abhi_eazyRewardz-cancel-button btn-lg continueCheckoutCoupon cancleButtonOtpForm" style="background-color:red !important">Cancle</button>
  </form>
`;
    };

    const confirmCouponOtp = async (data) => {
      const url = `/a/b/api/ConfirmCouponOtp`;
      const couponOtp = document.querySelector(".couponOtpInput").value;
      const params = { ...data, couponOtp };
      const responses = await makeAjaxRequest(url, params);
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
        const cartForm = document.querySelector("form[action='/cart']");
        let input = document.createElement("input");
        input.type = "hidden";
        input.name = "discount";
        input.value = data.DiscountCode;
        input.class = "easyReward-discount";
        container.appendChild(input);
        // cartForm.insertAdjacentHTML(
        //   'beforeend',
        //   `<input type="hidden" class="easyReward-discount" name="discount" value="${data.DiscountCode}">`
        // );
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
      const url = `/a/b/api/ResendCouponOtp`;
      const params = {
        EasyId: data.EasyId,
        TransactionCode: data.CouponCode,
        StoreName: data.StoreName,
      };
      const response = await makeAjaxRequest(url, params);
    };
    const unblockCoupon = async (data) => {
      const url = `/a/b/api/UnblockCoupon`;
      const responses = await makeAjaxRequest(url, data);
      const response = JSON.parse(responses);
      if (response.ReturnCode == "0") {
        //         alert("stop")
        location.reload();
      } else {
        showErrorMessage(response.ReturnMessage);
      }
    };

    const submitRedeemCouponOtp = async () => {
      const url = `/a/b/api/RedeemCoupon`;
      if (
        !document
          
          .querySelector(".abhi_mobileInput")
          .value
      ) {
        return showErrorMessage("Please Enter Mobile No.");
      }
      if (
        !document
          
          .querySelector(
            ".discountCouponInputValue"
          ).value
      ) {
        return showErrorMessage("Please Enter Coupon Code.");
      }

      let mydate = new Date();
      let month = [
        "Jan",
        "Feb",
        "March",
        "April",
        "May",
        "June",
        "July",
        "Aug",
        "Sept",
        "Oct",
        "Nov",
        "Dec",
      ][mydate.getMonth()];
      let str = mydate.getDate() + " " + month + " " + mydate.getFullYear();

      // console.log(str);
      const params = {
        EasyId: document
          
          .querySelector(".abhi_mobileInput")
          .value,
        EasyDiscountCoupon: document
          
          .querySelector(
            ".discountCouponInputValue"
          ).value,
        StoreName: Shopify.shop,
        Date: str,
      };

      const responses = await makeAjaxRequest(url, params);
      const response = JSON.parse(responses);

      if (response.ReturnCode != "0") {
        showErrorMessage(response.ReturnMessage);
      } else {
        // console.log("vvvvvvvvvvvvvvvvvv");
        const otpParams = {
          EasyId: document
            
            .querySelector(".abhi_mobileInput")
            .value,
          RequestID: response.RequestID,
          CouponCode: document
            
            .querySelector(
              ".discountCouponInputValue"
            ).value,
          DiscountCode: response.POSPromo,
          StoreName: Shopify.shop,
        };

        if (response.OTPRequired != 1) {
          const cartForm = document.querySelector("form[action='/cart']");
          const input = document.createElement("input");
          input.type = "hidden";
          input.className = "easyReward-discount";
          input.name = "discount";
          input.value = response.POSPromo;
          cartForm.insertAdjacentElement("afterbegin", input);

          // cartForm.appendChild(input);
          const successMessage = `<p style="color:green">Discount Applied ! </p>`;
          document
            .querySelector("#cart-errors")
            .insertAdjacentHTML("afterend", successMessage);
          document
            
            .querySelector(
              "#myModal"
            ).style.display = "none";
        } else {
          const couponHtml = getCouponOtpHtml();
          document
            
            .querySelector(
              ".abhi_easyModalDynamicContent"
            ).innerHTML = couponHtml;
          document
            
            .querySelector(
              ".abhi_closeEasyModal"
            ).style.display = "none";

          document
            
            .querySelector(".confirmCouponOtp")
            .addEventListener("click", function (e) {
              e.preventDefault();
              confirmCouponOtp(otpParams);
            });
          document
            
            .querySelector(".resendCouponOtp")
            .addEventListener("click", function (e) {
              e.preventDefault();
              resendCouponOtp(otpParams);
            });

          document
            
            .querySelector(".resendCouponOtp")
            .querySelector(".continueCheckoutCoupon")
            .addEventListener("click", function (e) {
              e.preventDefault();
              unblockCoupon(otpParams);
            });
        }
      }
    };

    const getAvailablePointsSubmit = async (e) => {
      e.preventDefault();
      const enteredMobileNo = document
        
        .querySelector(".abhi_mobileInput")
        .value;
      localStorage.setItem("id", enteredMobileNo);
      const data = {
        EasyId: enteredMobileNo,
        StoreName: Shopify.shop,
      };
      const url = `/a/b/api/CustomerAvailablePoints`;
      //     const url2 = `https://easyrewards.herokuapp.com/api/CustomerAvailablePoints`
      const responses = await makeAjaxRequest(url, data);
      const response = JSON.parse(responses);

      // console.log(response);
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

    // console.log('first -> ', document.querySelector(".getAvailablePointsSubmit"))
    document
      
      .querySelector(
        ".getAvailablePointsSubmit"
      )
      .addEventListener("click", getAvailablePointsSubmit);
    document
      
      .querySelector(".abhi_closeEasyModal")
      .addEventListener("click", closeModal);

    document
      
      .querySelector(".applyCouponButton")
      .addEventListener("click", function () {
        document
          
          .querySelector(
            ".discountCouponInputValue"
          ).style.display = "block";
        document
          
          .querySelector(
            ".discountCouponInput"
          ).style.display = "block";
        document
          
          .querySelector(
            ".abhi_eazyRewardzFormGroup"
          ).style.marginBottom = "55px";
        document
          
          .querySelector(".applyCouponButton")
          .classList.add("redeemCouponSubmit");
        const abhi_uiSetting = JSON.parse(
          localStorage.getItem("abhi_uiSetting")
        );
        document
          
          .querySelector(
            ".applyCouponButton"
          ).innerHTML = "Submit";
        document
          
          .querySelector(
            ".applyCouponButton"
          ).style.backgroundColor = abhi_uiSetting.Modal1.SubmitButtonColor;
        document
          
          .querySelector(
            ".getAvailablePointsSubmit"
          ).style.display = "none";
        document
          
          .querySelector(".redeemCouponSubmit")
          .addEventListener("click", async function (e) {
            e.preventDefault();
            const redeem = await submitRedeemCouponOtp();
          });
      });

    document
      
      .querySelector(".cancleButtonOtpForm")
      ?.addEventListener("click", async function (e) {
        e.preventDefault();
        const responses = await releasePoints();
        // const response = JSON.parse(responses);
        // console.log(
        //   "RRRRRRRRRRRRREEEEEEEEEEEEEEESSSSSSSSSSSSSSSSSSSSSSSS",
        //   responses
        // );
        if (responses.ReturnCode == "0") {
          location.reload();
        } else {
          location.reload();
        }
      });

    document
      
      .querySelector(
        ".abhi_continueCheckoutSubmit"
      )
      .addEventListener("click", function (e) {
        location.reload();
      });

    document
      
      .querySelector(
        ".closeModalAndReleasePoints"
      )
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
});
