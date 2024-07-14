import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCallback } from "react";
import { modal1, input, form, submitBtn, container, readDoc } from "./Tab3.module.css";
import { useAppQuery } from "../hooks/useAppQuery";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch.js";
import AddChangesModal from "./Modal/AddChangesModal.jsx";
import {
  Button,
  HorizontalStack,
  Modal,
  Tag,
  Text,
  Toast,
  VerticalStack,
} from "@shopify/polaris";
import { getShopNameFromUrl } from "../utils/frontendUtils";
import LoadingComponent from "./LoadingComponent";

export function Tab3() {
  const [modal1Text, setModal1Text] = useState("");
  const [modal1CustomMessage, setModal1CustomMessage] = useState("");
  const [modal1SubmitClr, setModal1SubmitClr] = useState("");
  const [modal1SubmitText, setModal1SubmitText] = useState("");
  const [modal1RedeemPointsClr, setModal1RedeemPointsClr] = useState("");
  const [modal1RedeemPointsText, setModal1RedeemPointsText] = useState("");
  const [modal1ApplyCouponClr, setModal1ApplyCouponClr] = useState("");
  const [modal1RedeemPointsBgClr, setModal1RedeemPointsBgClr] = useState("");
  const [modal1ApplyCouponText, setModal1ApplyCouponText] = useState("");
  const [modal1CancelClr, setModal1CancelClr] = useState("");
  const [modal1CancelText, setModal1CancelText] = useState("");

  const [modalBText, setModalBText] = useState("");
  const [modalBCancelClr, setModalBCancelClr] = useState("");
  const [modalBCancelText, setModalBCancelText] = useState("");

  const [modal2Text, setModal2Text] = useState("");
  const [modal2SubmitClr, setModal2SubmitClr] = useState("");
  const [modal2SubmitText, setModal2SubmitText] = useState("");
  const [modal2CancelClr, setModal2CancelClr] = useState("");
  const [modal2CancelText, setModal2CancelText] = useState("");
  const [modal3Text, setModal3Text] = useState("");
  const [modal3SubmitClr, setModal3SubmitClr] = useState("");
  const [modal3SubmitText, setModal3SubmitText] = useState("");
  const [modal3CancelClr, setModal3CancelClr] = useState("");
  const [modal3CancelText, setModal3CancelText] = useState("");
  const [redeemButtonClr, setRedeemButtonClr] = useState("");
  const [redeemButtonDomSelector, setRedeemButtonDomSelector] = useState("");
  const [customCss, setCustomCss] = useState("");
  const [Shop, setShop] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const fetch = useAuthenticatedFetch();
  const [active, setActive] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [domTag, setDomTag] = useState([]);

  const toggleActive = useCallback(() => setActive((active) => !active), []);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const url = location.href;
  const storeUrl = getShopNameFromUrl(url);
  const bodyData = { title: "Name of url", url: storeUrl };

  const {
    data: shopData,
    isSuccess,
    isError,
    isFetching,
    isLoading,
  } = useAppQuery({
    url: "/api/GetStoreDetails",
    fetchInit: {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify(bodyData),
    }, //fetchInit ends

    reactQueryOptions: {
      onSuccess: (responseData) => {
        console.log("res_from_tab3", responseData);
        // const responseData = res.data;
        // console.log("lllllllllll", responseData);
        if (!responseData) {
          // console.log("Something Went Wrong");
        }
        setModal1Text(responseData?.Modal1?.Heading);
        setModal1CustomMessage(responseData?.Modal1?.CustomMessage);
        setModal1SubmitClr(responseData?.Modal1?.SubmitButtonColor);
        setModal1SubmitText(responseData.Modal1?.SubmitButtonText);
        setModal1RedeemPointsClr(responseData.Modal1?.RedeemPointsButtonColor);
        setModal1RedeemPointsBgClr(responseData.Modal1?.RedeemPointsBgColor);
        setModal1RedeemPointsText(responseData.Modal1?.RedeemPointsButtonText);

        setModal1ApplyCouponClr(responseData.Modal1?.ApplyCouponButtonColor);
        setModal1ApplyCouponText(responseData.Modal1?.ApplyCouponButtonText);
        setModal1CancelClr(responseData.Modal1?.CancelButtonColor);
        setModal1CancelText(responseData.Modal1?.CancelButtonText);

        setModalBText(responseData.ModalB?.Heading);
        setModalBCancelClr(responseData.ModalB?.CancelButtonColor);
        setModalBCancelText(responseData.ModalB?.CancelButtonText);

        setModal2Text(responseData.Modal2?.Heading);
        setModal2SubmitClr(responseData.Modal2?.SubmitButtonColor);
        setModal2SubmitText(responseData.Modal2?.SubmitButtonText);
        setModal2CancelClr(responseData.Modal2?.CancelButtonColor);
        setModal2CancelText(responseData.Modal2?.CancelButtonText);
        setModal3Text(responseData.Modal3?.Heading);
        setModal3SubmitClr(responseData.Modal3?.SubmitButtonColor);
        setModal3SubmitText(responseData.Modal3?.SubmitButtonText);
        setModal3CancelClr(responseData.Modal3?.CancelButtonColor);
        setModal3CancelText(responseData.Modal3?.CancelButtonText);
        setRedeemButtonClr(responseData.RedeemButton?.ButtonColor);
        // setRedeemButtonDomSelector(responseData.RedeemButton?.DomSelector);
        setDomTag(
          responseData.RedeemButton?.DomSelector.trim().length == 0
            ? undefined
            : responseData.RedeemButton?.DomSelector.split(",") ||
            responseData.RedeemButton?.DomSelector
        );
        setCustomCss(responseData?.CustomCss);
        setShop(responseData?.StoreName ? `https://${responseData?.StoreName}` : null);
      },
    },
    onError: () => {
      // console.log("Something Went Wrong");
    },
  });

  const data = {
    Modal1: {
      Heading: modal1Text,
      CustomMessage: modal1CustomMessage,
      SubmitButtonText: modal1SubmitText,
      SubmitButtonColor: modal1SubmitClr,
      CancelButtonText: modal1CancelText,
      CancelButtonColor: modal1CancelClr,
      RedeemPointsButtonColor: modal1RedeemPointsClr,
      RedeemPointsBgColor: modal1RedeemPointsBgClr,
      RedeemPointsButtonText: modal1RedeemPointsText,
      ApplyCouponButtonColor: modal1ApplyCouponClr,
      ApplyCouponButtonText: modal1ApplyCouponText,
    },
    ModalB: {
      Heading: modalBText,
      CancelButtonText: modalBCancelText,
      CancelButtonColor: modalBCancelClr,
    },
    Modal2: {
      Heading: modal2Text,
      SubmitButtonText: modal2SubmitText,
      SubmitButtonColor: modal2SubmitClr,
      CancelButtonText: modal2CancelText,
      CancelButtonColor: modal2CancelClr,
    },
    Modal3: {
      Heading: modal3Text,
      SubmitButtonText: modal3SubmitText,
      SubmitButtonColor: modal3SubmitClr,
      CancelButtonText: modal3CancelText,
      CancelButtonColor: modal3CancelClr,
    },
    RedeemButton: {
      ButtonColor: redeemButtonClr,
      DomSelector: domTag?.join(",") || redeemButtonDomSelector,
    },
    CustomCss: customCss,
    url: Shop,
    StoreName:Shop?.replace("https://","")
  };
  const valueSubmited = (event) => {
    event.preventDefault();

    // console.log("DATAAA", data);
    fetch(`/api/saveUiSetting`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        // console.log("saveAppSettings result from tab 3:", data);
        // console.log("Response", data);
        setErrorMessage("Details Updated...");
        handleCloseModal();
        toggleActive();
      })
      .catch((err) => {
        // console.log(err);
        // console.error("CheckApiStatusCall Error:", err);
        setErrorMessage("Something Went Wrong!!!");
      });
  };

  const toastMarkup = active ? (
    <Toast
      content={errorMessage || "Details Updated"}
      onDismiss={toggleActive}
    />
  ) : null;

  const handleEnterFunction = (e) => {
    if (e.key === "Enter") {
      if (
        redeemButtonDomSelector === undefined ||
        redeemButtonDomSelector === ""
      ) {
        return;
      } else if (domTag === undefined) {
        setDomTag([...redeemButtonDomSelector.split(",")]);
        setRedeemButtonDomSelector("");
        return;
      }

      // console.log("vaule :",e);
      setDomTag([...domTag, ...redeemButtonDomSelector.split(",")]);
      setRedeemButtonDomSelector("");
      return;
    }
  };
  //  console.log

  const removeTag = (id) => () => {
    // console.log("id", id);
    const filter = domTag?.filter((item, index) => index != id);
    // console.log("filter data :::", filter);
    setDomTag(filter);
  };

  const handleOpenDocs = () => {
    const url =
      "https://drive.google.com/file/d/1v7_r62jv16jb3dWbJfHU9jVubofXffzM/view?usp=sharing";
    window.open(url, "_blank", "noreferrer");
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
                <HorizontalStack align="space-between">
                  <Text variant="heading4xl" as="h1">
                    Main Modal
                  </Text>
                  <p className={readDoc}>
                    <Button onClick={handleOpenDocs} primary>
                      Read Docs
                    </Button>
                  </p>
                </HorizontalStack>
                <div className={input}>
                  <label>First Popup Header</label>
                  <input
                    type="text"
                    value={modal1Text || ""}
                    onChange={(event) => {
                      event.preventDefault();
                      setModal1Text(event.target.value);
                    }}
                  />
                </div>
                <div className={input}>
                  <label>Custom Message:</label>
                  <input
                    type="text"
                    value={modal1CustomMessage}
                    onChange={(event) =>
                      setModal1CustomMessage(event.target.value)
                    }
                  />
                </div>

                <div className={input}>
                  <label>Submit :</label>
                  <input
                    type="text"
                    value={modal1SubmitText}
                    onChange={(event) =>
                      setModal1SubmitText(event.target.value)
                    }
                  />
                </div>
                <div className={input}>
                  <label>Submit Button Color:</label>
                  <input
                    type="color"
                    value={modal1SubmitClr}
                    onChange={(event) => setModal1SubmitClr(event.target.value)}
                  />
                </div>

                <div className={input}>
                  <label>Redeem Points :</label>
                  <input
                    type="text"
                    value={modal1RedeemPointsText}
                    onChange={(event) =>
                      setModal1RedeemPointsText(event.target.value)
                    }
                  />
                </div>
                <div className={input}>
                  <label>Redeem Points Button Color:</label>
                  <input
                    type="color"
                    placeholder=""
                    value={modal1RedeemPointsClr}
                    onChange={(event) =>
                      setModal1RedeemPointsClr(event.target.value)
                    }
                  />
                </div>
                <div className={input}>
                  <label>Redeem Points Button Text Color:</label>
                  <input
                    type="color"
                    placeholder=""
                    value={modal1RedeemPointsBgClr}
                    onChange={(event) =>
                      setModal1RedeemPointsBgClr(event.target.value)
                    }
                  />
                </div>
                <div className={input}>
                  <label>Apply Coupon :</label>
                  <input
                    type="text"
                    value={modal1ApplyCouponText}
                    onChange={(event) =>
                      setModal1ApplyCouponText(event.target.value)
                    }
                  />
                </div>
                <div className={input}>
                  <label>Apply Coupon Button Color:</label>
                  <input
                    type="color"
                    value={modal1ApplyCouponClr}
                    onChange={(event) =>
                      setModal1ApplyCouponClr(event.target.value)
                    }
                  />
                </div>

                <div className={input}>
                  <label>Cancel :</label>
                  <input
                    type="text"
                    value={modal1CancelText}
                    onChange={(event) =>
                      setModal1CancelText(event.target.value)
                    }
                  />
                </div>
                <div className={input}>
                  <label>Cancel Button Color:</label>
                  <input
                    type="color"
                    value={modal1CancelClr}
                    onChange={(event) => setModal1CancelClr(event.target.value)}
                  />
                </div>
              </div>

              <div className={modal1}>
                <Text variant="heading4xl" as="h1">
                  Available Balance Modal
                </Text>
                <div className={input}>
                  <label>Balance Points:</label>
                  <input
                    type="text"
                    value={modalBText}
                    onChange={(event) => setModalBText(event.target.value)}
                  />
                </div>
                <div className={input}>
                  <label>Cancel Button Text:</label>
                  <input
                    type="text"
                    value={modal1CancelText}
                    onChange={(event) =>
                      setModalBCancelText(event.target.value)
                    }
                  />
                </div>
                <div className={input}>
                  <label>Cancel Button Color:</label>
                  <input
                    type="color"
                    value={modal1CancelClr}
                    onChange={(event) => setModalBCancelClr(event.target.value)}
                  />
                </div>
              </div>

              <div className={modal1}>
                <Text variant="heading4xl" as="h1">
                  Enter Points To Redeem Modal
                </Text>
                <div className={input}>
                  <label>Enter Points to Redeem</label>
                  <input
                    type="text"
                    value={modal2Text}
                    onChange={(event) => setModal2Text(event.target.value)}
                  />
                </div>
                <div className={input}>
                  <label>Submit Button Text:</label>
                  <input
                    type="text"
                    value={modal2SubmitText}
                    onChange={(event) =>
                      setModal2SubmitText(event.target.value)
                    }
                  />
                </div>
                <div className={input}>
                  <label>Submit Button Color:</label>
                  <input
                    type="color"
                    value={modal2SubmitClr}
                    onChange={(event) => setModal2SubmitClr(event.target.value)}
                  />
                </div>
                <div className={input}>
                  <label>Cancel Button Text:</label>
                  <input
                    type="text"
                    value={modal2CancelText}
                    onChange={(event) =>
                      setModal2CancelText(event.target.value)
                    }
                  />
                </div>
                <div className={input}>
                  <label>Cancel Button Color:</label>
                  <input
                    type="color"
                    value={modal2CancelClr}
                    onChange={(event) => setModal2CancelClr(event.target.value)}
                  />
                </div>
              </div>

              <div className={modal1}>
                <Text variant="heading4xl" as="h1">
                  Confirm OTP Modal
                </Text>
                <div className={input}>
                  <label>Confirm OTP:</label>
                  <input
                    type="text"
                    value={modal3Text}
                    onChange={(event) => setModal3Text(event.target.value)}
                  />
                </div>
                <div className={input}>
                  <label>Submit Button Text:</label>
                  <input
                    type="text"
                    value={modal3SubmitText}
                    onChange={(event) =>
                      setModal3SubmitText(event.target.value)
                    }
                  />
                </div>
                <div className={input}>
                  <label>Submit Button Color:</label>
                  <input
                    type="color"
                    value={modal3SubmitClr}
                    onChange={(event) => setModal3SubmitClr(event.target.value)}
                  />
                </div>
                <div className={input}>
                  <label>Cancel Button Text:</label>
                  <input
                    type="text"
                    value={modal3CancelText}
                    onChange={(event) =>
                      setModal3CancelText(event.target.value)
                    }
                  />
                </div>
                <div className={input}>
                  <label>Cancel Button Color:</label>
                  <input
                    type="color"
                    value={modal3CancelClr}
                    onChange={(event) => setModal3CancelClr(event.target.value)}
                  />
                </div>
              </div>
              <div className={modal1}>
                <h3>Redeem Button</h3>
                <div className={input}>
                  <label>Button Color:</label>
                  <input
                    type="color"
                    value={redeemButtonClr}
                    onChange={(event) => setRedeemButtonClr(event.target.value)}
                  />
                </div>
                <div className={input}>
                  <label>Dom Selector:</label>
                  <input
                    type="text"
                    value={redeemButtonDomSelector}
                    onChange={(event) =>
                      setRedeemButtonDomSelector(event.target.value)
                    }
                    placeholder="Press Enter After Filling the details"
                    onKeyDown={handleEnterFunction}
                  />
                </div>

                <div style={{ marginLeft: "18%" }}>
                  {
                    <HorizontalStack gap={"2"}>
                      {domTag?.map((item, index) => {
                        return (
                          <Tag key={index} onRemove={removeTag(index)}>
                            {item}
                          </Tag>
                        );
                      })}
                    </HorizontalStack>
                  }
                </div>
              </div>
              <div className={modal1}>
                <Text variant="heading4xl" as="h1">
                  Custom Minified Css
                </Text>
                <div className={input}>
                  <label> Css: </label>
                  <textarea
                    type="text"
                    rows="18"
                    cols="60"
                    style={{ padding: "5px" }}
                    value={customCss}
                    onChange={(event) => setCustomCss(event.target.value)}
                  />
                </div>
              </div>

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
                        <br></br>
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
