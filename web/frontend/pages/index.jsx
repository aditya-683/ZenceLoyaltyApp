import { Page, Layout, Frame } from "@shopify/polaris";

import { CustomTabs } from "../components";
import ERTopBar from "../components/ERTopBar";
import erLogo from "../assets/erLogo.png";
export default function HomePage() {
  const logo = {
    width: 124,
    topBarSource:
      `${erLogo}` ||
      "https://drive.google.com/uc?export=view&id=1n09raGIA91tmplTaoJnRHtBUIpooiWOf",
    contextualSaveBarSource: `${erLogo}`,
    url: "#",
    accessibilityLabel: "App-logo",
  };

  return (
    <Frame topBar={<ERTopBar />} logo={logo}>
      <Page fullWidth>
        <CustomTabs />
      </Page>
    </Frame>
  );
}
