import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCallback } from "react";
import { useAppQuery } from "../hooks/useAppQuery.js";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch.js";
import {
  modal1,
  input,
  form,
  submitBtn,
  container,
  smallDescription,
} from "./Tab2.module.css";
import AddChangesModal from "./Modal/AddChangesModal.jsx";
import {
  Modal,
  TextField,
  Button,
  Stack,
  Frame,
  Toast,
  Label,
  VerticalStack,
} from "@shopify/polaris";
import ThemePrev from "./ThemePrev.jsx";
import { getShopNameFromUrl } from "../utils/frontendUtils.js";
import LoadingComponent from "./LoadingComponent.jsx";

export function Tab2() {
  const [storeName, setStoreName] = useState("");
  const [isAppDisabled, setIsAppDisabled] = useState(false);
  const [useOrderCreateHook, setUseOrderCreateHook] = useState(false);
  const [useOrderFulfillHook, setUseOrderFulfillHook] = useState(false);
  const [useOrderCancelHook, setUseOrderCancelHook] = useState(false);
  const [useOrderReturnHook, setUseOrderReturnHook] = useState(false);
  const [usePointsAsTender, setUsePointsAsTender] = useState(false);
  const [useTaxSettingsExclProduct, setUseTaxSettingsExclProduct] =
    useState(false);
  const [
    allowGuestRegistrationOnOrderPlace,
    setAllowGuestRegistrationOnOrderPlace,
  ] = useState(false);
  const [
    usePhoneFromShippingForRegistration,
    setUsePhoneFromShippingForRegistration,
  ] = useState(false);
  const [callSaveSkuForGuestOrders, setCallSaveSkuForGuestOrders] =
    useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [testThemeId, setTestThemeId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const fetch = useAuthenticatedFetch();
  const [active, setActive] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [couponWithoutOtp, setCouponWithoutOtp] = useState(false);

  const toggleActive = useCallback(() => setActive((active) => !active), []);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const url = location.href;
  const storeUrl = getShopNameFromUrl(url);
  const bodyData = { storeName: storeUrl };

  // console.log(bodyData, "kkkkkk");

  const {
    data: shopData,
    isSuccess,
    isError,
    isFetching,
    isLoading,
  } = useAppQuery({
    url: "/api/getAppSettings",
    fetchInit: {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify(bodyData),
    }, //fetchInit ends

    reactQueryOptions: {
      onSuccess: (responseData) => {
        // console.log("responseData_from_tab2", responseData);
        if (!responseData) {
          setErrorMessage("SomeThing Went Wrong");
        }
        setIsAppDisabled(responseData?.isAppDisabled);
        setUseOrderCreateHook(responseData?.useOrderCreateHook);
        setUseOrderFulfillHook(responseData?.useOrderFulfillHook);
        setUseOrderCancelHook(responseData?.useOrderCancelHook);
        setUseOrderReturnHook(responseData?.useOrderReturnHook);
        setUsePointsAsTender(responseData?.usePointsAsTender);
        setUseTaxSettingsExclProduct(responseData?.useTaxSettingsExclProduct);
        setAllowGuestRegistrationOnOrderPlace(
          responseData?.allowGuestRegistrationOnOrderPlace
        );
        setUsePhoneFromShippingForRegistration(
          responseData?.usePhoneFromShippingForRegistration
        );
        setCallSaveSkuForGuestOrders(responseData?.callSaveSkuForGuestOrders);
        setIsTestMode(responseData?.isTestMode);
        setTestThemeId(responseData?.testThemeId);
        setStoreName(responseData?.storeName || responseData?.StoreName); //because of the storeName spelling in other places
        setCouponWithoutOtp(responseData?.couponWithoutOtp);

        /* console.log(
          "####################################### responseData",
          responseData
        ); */
      },
    },
  });

  const data = {
    storeName,
    testThemeId,
    isTestMode,
    isAppDisabled,
    useOrderCreateHook,
    useOrderFulfillHook,
    useOrderCancelHook,
    useOrderReturnHook,
    usePointsAsTender,
    useTaxSettingsExclProduct,
    allowGuestRegistrationOnOrderPlace,
    usePhoneFromShippingForRegistration,
    callSaveSkuForGuestOrders,
    couponWithoutOtp
  };
  const valueSubmited = (event) => {
    event.preventDefault();
    console.log("data ", data);
    fetch(`/api/saveAppSettings`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
      }),
    })
      .then((response) => response.json())
      .then((res) => {
        // console.log("saveAppSettings result from tab 2:", res);
        // console.log("Response", res);
        setErrorMessage("Details Updated...");
        handleCloseModal();
        toggleActive();
      })
      .catch((err) => {
        // console.log(err);
        setErrorMessage("Something Went Wrong!!!");
        // console.error("CheckApiStatusCall Error:",err)
      });
  };

  const toastMarkup = active ? (
    <Toast
      content={errorMessage || "Details Updated"}
      onDismiss={toggleActive}
    />
  ) : null;

  const handleTheme = (id) => {
    if (isTestMode) {
      setTestThemeId(id);
    } else {
      setTestThemeId();
    }
  };

  return (
    <>
      {isLoading ? (
        <LoadingComponent isLoading={isLoading} tabCount={5} />
      ) : (
        <>
          {toastMarkup}
          <div className={form} style={{ width: "100%" }}>
            <div className={container}>
              <div className={modal1}>
                <h3>Loyalty Feature</h3>

                <div className={input}>
                  <label>Enable Test Mode</label>
                  <input
                    type="checkBox"
                    checked={isTestMode}
                    onChange={(event) => setIsTestMode(!isTestMode)}
                  />
                </div>
                <small className={smallDescription}>
                  {/* Disabling this option will make the App live in All the Themes */}
                  {isTestMode
                    ? `Need to enter the test theme Id once the "Enable Test Mode" is enabled`
                    : "Enable Test Mode Disabling this option will make the App live in All the Themes"}
                </small>

                {isTestMode && (
                  <>
                    <ThemePrev
                      value={isTestMode}
                      testThemeId={testThemeId}
                      setIsTestMode={setIsTestMode}
                      setTestThemeId={setTestThemeId}
                      handleTheme={handleTheme}
                      setErrorMessage={setErrorMessage}
                    />
                  </>
                )}

                <div className={input}>
                  <label>Order Creation Notification</label>
                  <input
                    type="checkBox"
                    checked={useOrderCreateHook}
                    onChange={(event) =>
                      setUseOrderCreateHook(!useOrderCreateHook)
                    }
                  />
                </div>

                <small className={smallDescription}>
                  {useOrderCreateHook
                    ? ""
                    : "Disable only if the data source is an omni system"}
                </small>

                <div className={input}>
                  <label>Order Fulfillment</label>
                  <input
                    type="checkBox"
                    checked={useOrderFulfillHook}
                    onChange={(event) =>
                      setUseOrderFulfillHook(!useOrderFulfillHook)
                    }
                  />
                </div>

                <small className={smallDescription}>
                  {useOrderFulfillHook
                    ? ""
                    : "Notification Disable only if the status is flowing to CRM via an omni system"}
                </small>

                <div className={input}>
                  <label>Order Cancellation</label>
                  <input
                    type="checkBox"
                    checked={useOrderCancelHook}
                    onChange={(event) =>
                      setUseOrderCancelHook(!useOrderCancelHook)
                    }
                  />
                </div>

                <small className={smallDescription}>
                  {useOrderCancelHook
                    ? ""
                    : "Notification Disable only if the status is flowing to CRM via an omni system"}
                </small>

                <div className={input}>
                  <label>Order Return Notification</label>
                  <input
                    type="checkBox"
                    checked={useOrderReturnHook}
                    onChange={(event) =>
                      setUseOrderReturnHook(!useOrderReturnHook)
                    }
                  />
                </div>

                <small className={smallDescription}>
                  {useOrderReturnHook
                    ? ""
                    : "Disable only if the status is flowing to CRM via an omni system"}
                </small>

                <div className={input}>
                  <label>Redeem Points as Mode of Payment</label>
                  <input
                    type="checkBox"
                    checked={usePointsAsTender}
                    onChange={(event) =>
                      setUsePointsAsTender(!usePointsAsTender)
                    }
                  />
                </div>
                <small className={smallDescription}>
                  By default Point is used as discount
                </small>

                <div className={input}>
                  <label>Product uploaded are Tax exclusive</label>
                  <input
                    type="checkBox"
                    checked={useTaxSettingsExclProduct}
                    onChange={(event) =>
                      setUseTaxSettingsExclProduct(!useTaxSettingsExclProduct)
                    }
                  />
                </div>
                <small className={smallDescription}>
                  Most of the Time Taxes are Included in Product Price
                </small>

                <div className={input}>
                  <label>
                    Do you want to Register Guest Customer as Loyalty Customer
                  </label>
                  <input
                    type="checkBox"
                    checked={allowGuestRegistrationOnOrderPlace}
                    onChange={(event) => {
                      setAllowGuestRegistrationOnOrderPlace(
                        !allowGuestRegistrationOnOrderPlace
                      );
                      setCallSaveSkuForGuestOrders(
                        !allowGuestRegistrationOnOrderPlace
                      );
                      setUsePhoneFromShippingForRegistration(
                        !allowGuestRegistrationOnOrderPlace
                      );
                    }}
                  />
                </div>

                <small className={smallDescription}>
                  This is recommended from loyalty industry best practice
                  perspective
                </small>

                <div className={input}>
                  <label>
                    Do you want to consider Shipping Mobile to enrol a Loyalty
                    Customer
                  </label>
                  <input
                    type="checkBox"
                    checked={usePhoneFromShippingForRegistration}
                    onChange={(event) =>
                      setUsePhoneFromShippingForRegistration(
                        !usePhoneFromShippingForRegistration
                      )
                    }
                  />
                </div>
                <div className={input}>
                  <label>Do you want guest orders to earn points</label>
                  <input
                    type="checkBox"
                    checked={callSaveSkuForGuestOrders}
                    onChange={(event) => {
                      setAllowGuestRegistrationOnOrderPlace(
                        !callSaveSkuForGuestOrders
                      );
                      setCallSaveSkuForGuestOrders(!callSaveSkuForGuestOrders);
                      setUsePhoneFromShippingForRegistration(
                        !callSaveSkuForGuestOrders
                      );
                    }}
                  />
                </div>

                <div className={input}>
                  <label>Redeem coupon without OTP.</label>
                  <input
                    type="checkBox"
                    checked={couponWithoutOtp}
                    onChange={(event) => {
                      console.log("Coupon without otp is running.");
                      setCouponWithoutOtp(el => !el)
                    }}
                  />

                </div>
              </div>
              <small className={smallDescription}>
                If this is marked as true it allows your customer to use the coupon without verifying the otp.
              </small>

              <div className={submitBtn}>
                {showModal ? (
                  <div>
                    <Modal
                      open={handleOpenModal}
                      onClose={handleCloseModal}
                      title="Please Confirm Update"
                      primaryAction={{
                        content: "Confirm",
                        onAction: valueSubmited,
                      }}
                      secondaryActions={[
                        {
                          content: "Cancel",
                          onAction: handleCloseModal,
                        },
                      ]}
                    >
                      <Modal.Section>
                        <VerticalStack>
                          <p>
                            You're about to make changes to the details
                            provided. Please review the updated details before
                            confirming.
                          </p>
                        </VerticalStack>
                      </Modal.Section>
                    </Modal>
                  </div>
                ) : (
                  <div></div>
                )}
                <Button size="large" primary onClick={handleOpenModal}>
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// export default Tab2;
