import React from "react";
import { AlphaCard, Loading, SkeletonTabs } from "@shopify/polaris";
const LoadingComponent = ({ isLoading, tabCount }) => {
  return (
    <>
      {isLoading ? (
        <AlphaCard>
          <Loading />
          <SkeletonTabs count={tabCount} />
        </AlphaCard>
      ) : null}
    </>
  );
};

export default LoadingComponent;
