import { useEffect } from "react";
import axios from "axios";
import { useState } from "react";
import { BASEURL } from "../../utils/apiKeys.js";
import { ShopName } from "@shopify/app-bridge/actions";
import { form1, left, input } from "./Tab1.module.css";
import {
  Modal,
  TextField,
  Button,
  Toast,
  Label,
  Text,
  VerticalStack,
  Link,
  HorizontalStack,
} from "@shopify/polaris";
import { useAppQuery } from "../hooks/useAppQuery.js";
import { useCallback } from "react";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch.js";
import LoadingComponent from "./LoadingComponent.jsx";
import { getShopNameFromUrl } from "../utils/frontendUtils.js";

export function Tab1() {
  const [data, setData] = useState("");
  const [shopName, setShopName] = useState("");
  const [UserName, setUserName] = useState("");
  const [UserName2, setUserName2] = useState("");
  const [UserPassword, setUserPassword] = useState("");
  const [AppId, setAppId] = useState("");
  const [DevId, setDevId] = useState("");
  const [ActivityCode, setACode] = useState("");
  const [ProgramCode, setPCode] = useState("");
  const [Status, setStatus] = useState("");
  const [StoreCode, setStoreCode] = useState("");
  const [Shop, setShop] = useState("");
  const [isActive, setIsActive] = useState("InActive");
  const [PointRate, setPointRate] = useState("");
  const [DomSelector, setDomSelector] = useState("");
  const [CustomMessage, setCustomMessage] = useState("");
  const [ErBaseUrl, setErBaseUrl] = useState("");
  const [CountryCode, setCountryCode] = useState("");
  const [MultiPassSecret, setMultiPassSecret] = useState("");
  const [active, setActive] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const fetch = useAuthenticatedFetch();
  const [isPlusStore, setIsPlusStore] = useState(false);
  const [isUserComingFrom, setIsUserComingFrom] = useState("");
  const [showChangeModal, setShowChangeModal] = useState(false);

  const toggleActive = useCallback(() => setActive((active) => !active), []);

  const handleOpenModal = () => {
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleOpenChangeModal = () => {
    setShowChangeModal(true);
  };

  const handleCloseChangeModal = () => {
    setShowChangeModal(false);
  };

  const url = location.href;
  const storeUrl = getShopNameFromUrl(url);
  console.log("storeUrl==", storeUrl);

  // console.log("storeUrl ..............", storeUrl,"url",url);
  const bodyData = { url: storeUrl };

  const { isSuccess: ok } = useAppQuery({
    url: "/api/okay",
    fetchInit: {
      method: "GET",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
    },
  });
  console.log("Server is alive ", ok);

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
      onSuccess: (res) => {
        // console.log("dataaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa----res", res);
        if (!res || res.Status == "InActive") {
          setIsActive("InActive");
        }
        setData(res);
        setUserName(res?.UserName);
        setUserName2(res?.UserName2);
        setUserPassword(res?.UserPassword);
        setAppId(res?.AppId);
        setDevId(res?.DevId);
        setPCode(res?.ProgramCode);
        setACode(res?.ActivityCode);
        setStoreCode(res?.StoreCode);
        setPointRate(res?.PointRate);
        setDomSelector(res?.PointRate);
        setShop(location.href);
        setStatus(res?.Status);
        setIsActive(res?.Status);
        setErBaseUrl(res?.ErBaseUrl);
        setCountryCode(res?.CountryCode);
        setMultiPassSecret(res?.MultiPassSecret);
        setIsPlusStore(res?.isPlusStore);
        setIsUserComingFrom(res?.isUser);
        // setIsLoading(false);
      },
    },
  });

  console.log("isError ",isError);
  
  console.log("shopData ",shopData);

  const submitHandler = (e) => {
    e.preventDefault();

    // console.log("---------------- inside submit handler");

    if (
      !UserName ||
      !UserPassword ||
      !ActivityCode ||
      !UserName2 ||
      !StoreCode ||
      !AppId ||
      !ErBaseUrl ||
      !CountryCode ||
      !DevId
    ) {
      setCustomMessage("Please Fill the Api Details");
      setIsActive("InActive");
      return;
    }
    const bodyData = {
      UserName,
      UserPassword,
      AppId,
      DevId,
      ActivityCode,
      ProgramCode,
      StoreCode,
      UserName2,
      Shop,
      PointRate,
      ErBaseUrl,
      CountryCode,
      MultiPassSecret,
      // DomSelector,
      Status,
    };

    fetch(`/api/CheckApiStatus`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...bodyData,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        // console.log("CheckApiStatusCall result:", data);

        if (data.status != 200) {
          setIsActive("InActive");
          setStatus("InActive");
          setCustomMessage("");
          // console.log("inside status != 200");
          handleCloseModal();
          toggleActive();
        } else {
          setCustomMessage("Details Updated ...");
          setIsActive(data.Status);
          setStatus(data.Status);
          // console.log(
          //   "---------------- inside submit handler after inside confirm else condn "
          // );

          handleCloseModal();
          toggleActive();
        }
      })
      .catch((err) => {
        // console.error("CheckApiStatusCall Error:", err);
      });
    // } // confirm if ends here

    // else if(confirm == false){
    //   handleCloseModal()
    // }
  };

  const toastMarkup = active ? (
    <Toast
      content={CustomMessage || "Details Updated"}
      onDismiss={toggleActive}
    />
  ) : null;

  //changePlanIfUserComeToPlus
  const handleChangePlanToPlus = () => {
    const updateData = {
      StoreName: storeUrl,
      value: true,
    };
    fetch("/api/changeToPlus", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    })
      .then((res) => {
        // console.log("res", res);
        if (res?.status == "200" || res?.status == 200) {
          window.location.reload();
        }
      })
      .catch((err) => console.log("err", err));
  };
  const getShop = async () => {
    try {
      let shp = await fetch("/api/okay");
      shp = await shp.json();
      console.log("shp==", shp);

      const url = `https://${shp.shop}/admin/themes/current/editor?context=apps&activateAppId=${process.env.APP_EXTENSION_ID}/app-embed`;
      window.open(url, "_blank");
      return shp;
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {isLoading ? (
        <LoadingComponent isLoading={isLoading} tabCount={5} />
      ) : (
        <>
          {toastMarkup}
          <div className={form1}>
            <div className={left}>
              {isPlusStore != true ? (
                <div>
                  <Link onClick={getShop}>
                    Please Enable Our Plugin in Your Theme
                  </Link>
                </div>
              ) : (
                <></>
              )}

              <div className={input}>
                <label>UserName:</label>
                <input
                  type="text"
                  defaultValue={UserName}
                  onChange={(event) => setUserName(event.target.value)}
                  placeholder="To be used in GenerateSecurityToken"
                  required
                />
              </div>
              <div className={input}>
                <label>User Password:</label>
                <input
                  type="text"
                  defaultValue={UserPassword}
                  onChange={(event) => setUserPassword(event.target.value)}
                  placeholder="To be used in GenerateSecurityToken"
                  required
                />
              </div>
              <div className={input}>
                <label>DevId:</label>
                <input
                  type="text"
                  defaultValue={DevId}
                  onChange={(event) => setDevId(event.target.value)}
                  placeholder="To be used in GenerateSecurityToken"
                  required
                />
              </div>
              <div className={input}>
                <label>AppId:</label>
                <input
                  type="text"
                  defaultValue={AppId}
                  onChange={(event) => setAppId(event.target.value)}
                  placeholder="To be used in GenerateSecurityToken"
                  required
                />
              </div>
              <div className={input}>
                <label>Program Code:</label>
                <input
                  type="text"
                  defaultValue={ProgramCode}
                  onChange={(event) => setPCode(event.target.value)}
                  placeholder="To be used in GenerateSecurityToken"
                  required
                />
              </div>
              <div className={input}>
                <label>UserName 2:</label>
                <input
                  type="text"
                  defaultValue={UserName2}
                  onChange={(event) => setUserName2(event.target.value)}
                  placeholder="To be used in all APIs (API Username)"
                  required
                />
              </div>
              <div className={input}>
                <label>Store Code:</label>
                <input
                  type="text"
                  defaultValue={StoreCode}
                  onChange={(event) => setStoreCode(event.target.value)}
                  placeholder="Dummy used during integration,It will be dyna..."
                  required
                />
              </div>
              <div className={input}>
                <label>Activity Code:</label>
                <input
                  type="text"
                  defaultValue={ActivityCode}
                  onChange={(event) => setACode(event.target.value)}
                  placeholder="To be used as ActivityCode in CheckForEasy....."
                  required
                />
              </div>
              <div className={input}>
                <label>CountryCode:</label>
                <input
                  type="text"
                  defaultValue={CountryCode}
                  onChange={(event) => setCountryCode(event.target.value)}
                  placeholder="Country Code (91)"
                  required
                />
              </div>
              <div className={input}>
                <input
                  type="hidden"
                  defaultValue={MultiPassSecret}
                  onChange={(event) => setMultiPassSecret(event.target.value)}
                  required
                />
              </div>
              <div className={input}>
                <label>Er Api BaseUrl:</label>
                <input
                  type="text"
                  defaultValue={ErBaseUrl}
                  onChange={(event) => setErBaseUrl(event.target.value)}
                  placeholder="API Base URL"
                  required
                />
              </div>

              <div className={"test"}>
                {/* <label>Status:</label> */}
                <input
                  type="hidden"
                  defaultValue={Status}
                  onChange={(event) => setDomSelector(event.target.value)}
                  required
                />
              </div>
              <HorizontalStack>
                <Button
                  primary
                  size="large"
                  // disabled={isActive == "InActive" ? true : false}
                  onClick={handleOpenModal}
                >
                  Update Api Details
                </Button>

                {isPlusStore === false && isUserComingFrom == "non-plus" ? (
                  <>
                    <span style={{ margin: "10px 20px" }}>OR</span>
                    <Button
                      primary
                      size="large"
                      onClick={handleOpenChangeModal}
                    >
                      Change Plan
                    </Button>
                  </>
                ) : (
                  <></>
                )}
              </HorizontalStack>
            </div>

            <div>
              {showChangeModal ? (
                <Modal
                  open={handleOpenChangeModal}
                  onClose={handleCloseChangeModal}
                  title="Please Confirm Update"
                  primaryAction={{
                    content: "Confirm",
                    onAction: handleChangePlanToPlus,
                  }}
                  secondaryActions={[
                    {
                      content: "Cancel",
                      onAction: handleCloseChangeModal,
                    },
                  ]}
                >
                  <Modal.Section>
                    <VerticalStack>
                      <p>Are You Confirm To Change Your Plan</p>
                    </VerticalStack>
                  </Modal.Section>
                </Modal>
              ) : (
                <div></div>
              )}
            </div>

            {/* modal div */}
            <div>
              {showModal ? (
                <Modal
                  open={handleOpenModal}
                  onClose={handleCloseModal}
                  title="Please Confirm Update"
                  primaryAction={{
                    content: "Confirm",
                    onAction: submitHandler,
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
                        You're about to make changes to the details provided.
                        Please review the updated details before confirming.
                      </p>
                    </VerticalStack>
                  </Modal.Section>
                </Modal>
              ) : (
                <div></div>
              )}
            </div>
            {/* ends */}
          </div>
        </>
      )}
    </>
  );
}
