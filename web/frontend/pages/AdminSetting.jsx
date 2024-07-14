import {
  AlphaCard,
  Button,
  HorizontalStack,
  Spinner,
  Text,
  VerticalStack,
  Modal,
  TextField,
  Icon,
  Toast,
} from "@shopify/polaris";
import React, { useState, useCallback } from "react";
import { ViewMajor, HideMinor } from "@shopify/polaris-icons";
import CustomeAppModal from "../components/AdminPages/CustomeAppModal";
import { useAppQuery } from "../hooks";
import styles from "../components/AdminPages/AdminSetting.module.css";
import { getShopNameFromUrl } from "../utils/frontendUtils.js";

const AdminSetting = () => {
  const [token, setToken] = useState("");
  const [buttonName, setButtonName] = useState("Generate API Key");
  const [isLoading, setIsLoading] = useState(null);
  const [IsPlusLoading, setIsPlusLoading] = useState(true);
  const [isCopy, setIsCopy] = useState(false);
  const [isDownload, setIsDownlad] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [value, setValue] = useState("www.example.com");
  const [appAccessToken, setAppAccessToken] = useState("");
  const [hidePassword, setHidePassword] = useState(false);
  const [hideMultiPass, setHideMultiPass] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [shopName, setShopName] = useState("");
  const [multiPassSecret, setMultiPassSecret] = useState("");
  const [toastActive, setToastActive] = useState(false);
  const [customMessage, setCustomMessage] = useState("");

  const storeUrl = getShopNameFromUrl(location.href);


  const toggleActive = useCallback(
    () => setToastActive((toastActive) => !toastActive),
    []
  );

  const { data } = useAppQuery({
    url: "/api/GetStoreDetails",
    fetchInit: {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({ url: storeUrl }),
    },
    reactQueryOptions: {
      onSuccess: (res) => {
        setValue(res?.StoreName);
        console.log("res?.jwtToken ",res?.jwtToken);
        setToken(res?.jwtToken);
        setShopName(res?.StoreName);
        setMultiPassSecret(res?.MultiPassSecret);
        setAppAccessToken(res?.appAccessToken);
        if (res?.jwtToken == null) {
          // console.log("res?.jwtToken",res?.jwtToken);
          return;
        }
        setButtonName("Re-Generate API Key");
        setIsLoading(true);
        setIsDownlad(true);

        if (localStorage.getItem("iskey") == "true") {
          // console.log("localStorage", localStorage.getItem("iskey"));
          setButtonName("Re-Generate API Key");
          setIsLoading(true);
          setIsDownlad(true);
          setShowPassword(true);
        }
      },
    },
  });

  const bodyData = {
    StoreName: shopName || storeUrl || value,
  };

  const handleGenerateApiKey = () => {
    if (buttonName == "Re-Generate API Key") {
      setShowModal(false);
      setIsLoading(false);
      fetch("/api/generateToken", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      })
        .then((res) => res.json())
        .then((res) => {
          console.log("token", res);
          setToken(res?.token);
          setIsLoading(true);
          setIsDownlad(true);
          setShowPassword(false);
          localStorage.setItem("iskey", false);
        })
        .catch((err) => setIsLoading(false));
      return;
    }

    setIsLoading(false);
    fetch("/api/generateToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyData),
    })
      .then((res) => res.json())
      .then((res) => {
          console.log("token", res);
        setToken(res?.token);
        setIsLoading(true);
        setIsDownlad(true);
      })
      .catch((err) => setIsLoading(false));
  };

  //handleDownloadApi
  const handleDownloadApi = (value) => {
    const customeToken = value;
    const blob = new Blob([customeToken], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "file.txt";
    link.click();

    setTimeout(() => {
      URL.revokeObjectURL(link.href);
    }, 100);

    setIsDownlad(true);
    setShowPassword(true);
    setButtonName("Re-Generate API Key");
    localStorage.setItem("iskey", true);
  };

  //handleChangePlan
  const handleChangePlan = () => {
    const updateData = {
      StoreName: storeUrl || shopName || value,
      value: false,
    };

    //   console.log("hi");
    setIsPlusLoading(false);
    fetch("/api/changeToNonPlus", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    })
      .then((res) => {
        //   console.log("res", res);
        if (res?.status == "200" || res?.status == 200) {
          setCustomMessage("Updating The Plan");
          toggleActive();
          window.location.reload();
        }
      })
      .catch((err) => {
        setIsPlusLoading(false);
        customMessage(err.message);
        toggleActive();
      });
  };

  //HandleCopyText
  const handleCopyToken = async (value) => {
    //   console.log("value", value);
    try {
      await navigator.clipboard.writeText(value);
      setIsCopy(true);
      setCustomMessage("Copied Text");
      toggleActive();
      setTimeout(() => {
        setIsCopy(false);
      }, 2000);
    } catch (err) {
      console.log("unbale to copy text : ", err);
      setIsCopy(false);
      setCustomMessage(err.message);
      toggleActive();
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setShowSaveModal(false);
    setShowDownloadModal(false);
  };

  // const handleChange = useCallback((newValue) => setValue(newValue), []);

  const submitDataHandler = () => {
    const postData = {
      appAccessToken: appAccessToken,
      allowOrigin: value,
      StoreName: storeUrl || shopName || value,
      MultiPassSecret: multiPassSecret,
    };

    fetch(`/api/saveAdminSetting`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...postData,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        // console.log("CheckApiStatusCall result:", data);
        setCustomMessage("Details Updated ...");
        toggleActive();
      })
      .catch((err) => {
        setCustomMessage(err.message);
        toggleActive();
      });
    setShowSaveModal(false);
  };

  const toastMarkup = toastActive ? (
    <Toast
      content={customMessage || "Details Updated"}
      onDismiss={toggleActive}
    />
  ) : null;

  return (
    <>
      {toastMarkup}
      <AlphaCard>
        <div className={styles.mainDivCss}>
          <VerticalStack gap={"4"}>
            <Button onClick={handleGenerateApiKey}>{buttonName}</Button>
            {isLoading ? (
              <div className={styles.divClass}>
                {isDownload ? (
                  showPassword ? (
                    <HorizontalStack align="space-between">
                      <Text variant="headingMd" as="h6">
                        {"Your Api key "}
                      </Text>
                      <Text variant="headingMd" as="h6">
                        {"****************************"}
                      </Text>
                    </HorizontalStack>
                  ) : (
                    <HorizontalStack align="space-between">
                      <Text variant="headingMd" as="h6">
                        {`${token?.substring(0, 12)}**************************`}
                      </Text>
                      <HorizontalStack gap={"4"}>
                        <Button onClick={() => handleCopyToken(token)}>
                          {isCopy ? "Copied" : "Copy"}
                        </Button>
                        <HorizontalStack>
                          {showDownloadModal ? (
                            <div style={{ height: "500px" }}>
                              <Modal
                                open={handleOpenModal}
                                onClose={handleCloseModal}
                                title="Please Save This Token "
                                primaryAction={{
                                  content: "Download API Key",
                                  onAction: () => handleDownloadApi(token),
                                }}
                              >
                                <Modal.Section>
                                  <VerticalStack>
                                    <Text>
                                      This is only one Time Token You have to
                                      save this token for calling API
                                    </Text>
                                  </VerticalStack>
                                </Modal.Section>
                              </Modal>
                            </div>
                          ) : (
                            <Button
                              onClick={() =>
                                setShowDownloadModal(!showDownloadModal)
                              }
                            >
                              Download Your API Key
                            </Button>
                          )}
                        </HorizontalStack>
                      </HorizontalStack>
                    </HorizontalStack>
                  )
                ) : (
                  <>{""}</>
                )}
              </div>
            ) : isLoading == null ? (
              <></>
            ) : (
              <Spinner accessibilityLabel="Spinner example" size="large" />
            )}

            {/* Change Plan Button */}
            <hr className={styles.hrClass} />
            <HorizontalStack align="space-between">
              <Text variant="headingMd" as="h6">
                You are using a plus Store
              </Text>

              {/* Modal */}
              {showModal ? (
                <div>
                  <Modal
                    open={handleOpenModal}
                    onClose={handleCloseModal}
                    title="Please Confirm Update"
                    primaryAction={{
                      content: "Confirm",
                      onAction: handleChangePlan,
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
                        <p>You Are Now Going to Change Your Plan</p>
                      </VerticalStack>
                    </Modal.Section>
                  </Modal>
                </div>
              ) : (
                <div></div>
              )}

              {setIsPlusLoading ? (
                <div className={styles.buttonClass}>
                  <Button onClick={() => setShowModal(!showModal)}>
                    Change Plan To Non-Plus
                  </Button>
                </div>
              ) : (
                <Button loading>Save product</Button>
              )}
            </HorizontalStack>

            <HorizontalStack gap={"6"} align="space-between">
              <Text variant="headingMd" as="h6">
                Store Name
              </Text>
              <div className={styles.buttonClass}>
                <Button>{data?.StoreName}</Button>
              </div>
            </HorizontalStack>

            <HorizontalStack gap={"6"} align="space-between">
              <Text variant="headingMd" as="h6">
                Enter Multipass Token
              </Text>
              <div className={styles.buttonClass}>
                <Button>
                  <HorizontalStack>
                    <input
                      className={styles.inputClass}
                      type={hideMultiPass ? "text" : "password"}
                      placeholder="Enter MultiPass Secret"
                      value={multiPassSecret}
                      onChange={(e) => setMultiPassSecret(e.target.value)}
                    />
                    <div
                      style={{ cursor: "pointer" }}
                      onClick={() => setHideMultiPass(!hideMultiPass)}
                    >
                      {hideMultiPass ? (
                        <div style={{ paddingLeft: "5px" }}>
                          <Icon source={HideMinor} color="base" />
                        </div>
                      ) : (
                        <div style={{ paddingLeft: "5px" }}>
                          <Icon source={ViewMajor} color="base" />
                        </div>
                      )}
                    </div>
                  </HorizontalStack>
                </Button>
              </div>
            </HorizontalStack>

            <HorizontalStack align="space-between">
              <Text variant="headingMd" as="h6">
                Gift Card App Access Token
              </Text>
              <div className={styles.buttonClassWithDocmentButton}>
                <HorizontalStack>
                  <Button>
                    <HorizontalStack>
                      <input
                        className={styles.inputClassWithDocumentButton}
                        type={hidePassword ? "text" : "password"}
                        placeholder="Enter App Access Token"
                        value={appAccessToken}
                        onChange={(e) => setAppAccessToken(e.target.value)}
                      />
                      <div
                        style={{ cursor: "pointer" }}
                        onClick={() => setHidePassword(!hidePassword)}
                      >
                        {hidePassword ? (
                          <div style={{ paddingLeft: "5px" }}>
                            <Icon source={HideMinor} color="base" />
                          </div>
                        ) : (
                          <div style={{ paddingLeft: "5px" }}>
                            <Icon source={ViewMajor} color="base" />
                          </div>
                        )}
                      </div>
                    </HorizontalStack>
                  </Button>
                    <CustomeAppModal />
                </HorizontalStack>
              </div>
            </HorizontalStack>

            {/* <HorizontalStack gap={"5"} align="space-between">
              <Text variant="headingMd" as="h6">
                How To Make App With GiftCard Access Scope(document)
              </Text>
              <div>
                <CustomeAppModal />
              </div>
            </HorizontalStack> */}
            <div>
              <Button
                primary
                size="large"
                onClick={() => setShowSaveModal(!showSaveModal)}
              >
                Save
              </Button>

              {showSaveModal ? (
                <div>
                  <Modal
                    open={handleOpenModal}
                    onClose={handleCloseModal}
                    title="Please Confirm Update"
                    primaryAction={{
                      content: "Confirm",
                      onAction: submitDataHandler,
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
                        <p>Please Confirm If You Want to Save the Details</p>
                      </VerticalStack>
                    </Modal.Section>
                  </Modal>
                </div>
              ) : (
                <div></div>
              )}
            </div>
          </VerticalStack>
        </div>
      </AlphaCard>
    </>
  );
};

export default AdminSetting;
