//Theme Prev.jsx
import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  HorizontalStack,
  LegacyStack,
  Modal,
  Spinner,
  Text,
  VerticalStack,
} from "@shopify/polaris";
import { useAppQuery } from "../hooks/useAppQuery";
import style from "./Tab1.module.css";
import { useAuthenticatedFetch } from "@shopify/app-bridge-react";
import { getShopNameFromUrl } from "../utils/frontendUtils.js";

const ThemePrev = (props) => {
  const [showThemeModal, setShowThemeModal] = useState(props.value);
  const [Themes, setThemes] = useState([]);
  const [testThemeId, setTestThemeId] = useState(props.testThemeId);
  const [isLoading, setIsLoading] = useState(false);
  const [checked, setChecked] = useState({});

  const fetch = useAuthenticatedFetch();

  const shopName =
    //sessionStorage.getItem("store-url-check") ||
    getShopNameFromUrl(location.href);

  console.log("shopName ", shopName, location.href);

  const handleChooseTheme = () => {
    props.setTestThemeId();
  };
  // console.log("test Theme id ::::", props.testThemeId);
  const getThemeById = async () => {
    setIsLoading(true);
    const response = await fetch(
      `/api/getTheme?themeId=${testThemeId}&shopName=${shopName}`
    );
    const themeData = await response.json();
    setThemes((prev) => [themeData.data.theme, ...prev]);

    // console.log("theme id response", themeData.data);
    // console.log("theme id themeData", Themes);
    setIsLoading(false);
  };

  const getAllThemes = async () => {
    setIsLoading(true);
    const response = await fetch(
      `/api/getShopfiyTheme?themeId=&shopName=${shopName}`
    );
    const themeData = await response.json();
    console.log("theme id response", themeData.data);
    setThemes(themeData.data?.themes);

    setIsLoading(false);
  };
  useEffect(() => {
    testThemeId ? getThemeById() : getAllThemes();
  }, [testThemeId, showThemeModal]);

  //handlePreviewButton
  const handlePreviwButton = (id) => {
    const shopName = getShopNameFromUrl(location.href);
    const getShopifyDomain = async (shopName) => {
      try {
        /*  if (sessionStorage.getItem("shop-domain")) {
          return sessionStorage.getItem("shop-domain");
        } */

        let shop_domain_res = await fetch(
          `/api/getShopifyShopDetails?shopName=${shopName}`
        );

        // console.log("shop_domain_res==", shop_domain_res);
        // console.log("shop_domain_res==", await shop_domain_res.json());
        let { domain } = await shop_domain_res.json();

        /*  if (domain) {
          sessionStorage.setItem("shop-domain", domain);
        } */
        return domain;
      } catch (err) {
        console.log(err);
      }
    };

    getShopifyDomain(shopName).then((res) => {
      // console.log("domain", res);
      const newPageUrl = `https://${res}/?_ab=0&_fd=0&_sc=1&preview_theme_id=${id}`;
      window.open(newPageUrl, "_blank");
    });
  };
  const handleOpenModal = () => {
    setShowThemeModal(true);
  };

  const handleCloseModal = () => {
    // console.log("testThemeId", testThemeId);
    if (!testThemeId && showThemeModal) {
      setShowThemeModal(false);
      props.setIsTestMode(false);
    } else if (testThemeId) {
      props.setIsTestMode(true);
    }
  };

  const LoadingMarkUp = () => {
    return <>{isLoading ? <Spinner /> : null}</>;
  };

  return isLoading ? (
    <Spinner />
  ) : testThemeId ? (
    <div className={style.themeMainDiv}>
      <HorizontalStack columns={"2"} gap={"2"} align="space-between">
        <VerticalStack gap={"2"}>
          <Text variant="bodyMd" fontWeight="bold" as="h3">
            {Themes[0]?.name}
          </Text>
          <Text>{`${Themes[0]?.name}/${Themes[0]?.id}`}</Text>
        </VerticalStack>
        <Box style={{ margin: "15px 0" }}>
          <span
            className={style.buttonSpan}
            onClick={() => handlePreviwButton(Themes[0]?.id)}
          >
            Preview
          </span>
          <span
            className={style.buttonSpan}
            onClick={() => setTestThemeId(null)}
          >
            Select Another Theme
          </span>
        </Box>
      </HorizontalStack>
    </div>
  ) : (
    <>
      {showThemeModal && (
        <Modal
          open={handleOpenModal}
          onClose={handleCloseModal}
          title="Please Select Your Theme"
        >
          <Modal.Section>
            <VerticalStack>
              <LoadingMarkUp />
              {Themes?.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    padding: "10px",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <h1>
                    {item.name}/{item.id}
                  </h1>
                  <input
                    style={{
                      padding: "10px",
                      width: "20px",
                      height: "20px",
                      cursor: "pointer",
                    }}
                    type="checkbox"
                    id={idx}
                    checked={checked[item.id]}
                    onChange={(e) => {
                      setChecked({
                        [item.id]: e.target.checked,
                      });

                      setTestThemeId(item.id);
                      props.setTestThemeId(item.id);
                    }}
                  />
                </div>
              ))}
            </VerticalStack>
          </Modal.Section>
        </Modal>
      )}
    </>
  );
};

export default ThemePrev;
