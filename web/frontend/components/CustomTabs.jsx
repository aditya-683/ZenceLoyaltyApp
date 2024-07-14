import React, { useState } from "react";
import { Tab1 } from "./Tab1";
import { Tab2 } from "./Tab2";
import { Tab3 } from "./Tab3";
import { AlphaCard, LegacyCard, Tabs } from "@shopify/polaris";
import { useCallback } from "react";
import { FtpsettingsPage } from "./FTPSettings/FtpsettingsPage";
import { CartAttributeTables } from "./CartAttributeTables";
import { getShopNameFromUrl } from "../utils/frontendUtils";
import AdminSetting from "../pages/AdminSetting";
import { useAppQuery } from "../hooks/useAppQuery";

export function CustomTabs() {
  const [selected, setSelected] = useState(0);
  const handleTabChange = useCallback(
    (selectedTabIndex) => setSelected(selectedTabIndex),
    []
  );
  
  const storeUrl = getShopNameFromUrl(location.href);
  
  console.log("Store details ",location.href);
  const bodyData = { url: storeUrl };
  const { data, isLoading } = useAppQuery({
    url: "/api/GetStoreDetails",
    fetchInit: {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify(bodyData),
    },
    reactQueryOptions: {
      onSuccess: (res) => {
        // console.log("custome res ::", res);
      },
    },
  });

  const tabs = [
    {
      id: 0,
      content: "API Details",
    },
    {
      id: 1,
      content: "App Settings",
    },
    {
      id: 2,
      content: "UI Customization",
    },
    {
      id: 3,
      content: "Cart Attributes",
    },
    {
      id: 4,
      content: "FTP Settings",
    },
  ];

  const plusAppTabs = [
    {
      id: 0,
      content: "Admin Setting",
    },
    {
      id: 1,
      content: "API Details",
    },
    {
      id: 2,
      content: "App Settings",
    },
    {
      id: 3,
      content: "Cart Attributes",
    },
  ];

  return (
    <LegacyCard>
      {data?.isPlusStore && data?.isUser === "plus" ? (
        <Tabs tabs={plusAppTabs} selected={selected} onSelect={handleTabChange}>
          <AlphaCard title={plusAppTabs[selected].content}>
            {selected === 0 && <AdminSetting />}
            {selected === 1 && <Tab1 />}
            {selected === 2 && <Tab2 />}
            {selected === 3 && <CartAttributeTables />}
          </AlphaCard>
        </Tabs>
      ) : (
        <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
          <AlphaCard title={tabs[selected].content}>
            {selected === 0 && <Tab1 />}

            {selected === 1 && <Tab2 />}

            {selected === 2 && <Tab3 />}
            {selected === 3 && <CartAttributeTables />}
            {selected === 4 && <FtpsettingsPage />}
          </AlphaCard>
        </Tabs>
      )}
    </LegacyCard>
  );
}

// export default CustomTabs;
