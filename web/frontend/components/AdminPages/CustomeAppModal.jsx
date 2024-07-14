import React from "react";
import { Button, Modal, Text, VerticalStack } from "@shopify/polaris";
import { useState, useCallback } from "react";
import step1 from "../../assets/STEP_1.png";
import step2 from "../../assets/STEP_2.png";
import step3 from "../../assets/STEP_4.png";
import step4 from "../../assets/STEP_3.png";
import step5 from "../../assets/STEP_5.png";
import step6 from "../../assets/STEP_6.png";

const CustomeAppModal = () => {
  const [active, setActive] = useState(false);
  const handleChange = useCallback(() => setActive(!active), [active]);
  const activator = (
    <div style={{ width: "300px" }}>
      <Button onClick={handleChange}>Check Document</Button>
    </div>
  );
  const dataObj = [
    {
      id: 1,
      text: "Go to the settings, then click on Apps and sales channels.",
      img: step1,
    },
    {
      id: 2,
      text: "Next, select the Develop apps button located at the top of the header within this pop-up box.",
      img: step2,
    },
    {
      id: 3,
      text: "Now, enable custom app development.",
      img: step3,
    },
    {
      id: 4,
      text: `Click on the "Create an app" button, provide a name for your app, and then save the information.`,
      img: step4,
    },
    {
      id: 5,
      text: `Next, select "Configure Admin API scopes," search for "gift," grant the necessary permission, and then click the save button.`,
      img: step5,
    },
    {
      id: 6,
      text: "Install the app, and you will receive an Admin API access token. Copy the token and save it.",
      img: step6,
    },
  ];

  return (
    <div style={{ width: "10%" }}>
      <Modal
        large
        activator={activator}
        open={active}
        onClose={handleChange}
        title="How To Make a Custom App Through Store"
        primaryAction={{
          content: "Cancel",
          onAction: handleChange,
        }}
      >
        <Modal.Section>
          <VerticalStack gap={"4"} align="center">
            {dataObj?.map((item) => {
              return (
                <VerticalStack
                  key={item.id}
                  align="center"
                  inlineAlign="center"
                >
                  <div
                    style={{
                      border: "1px solid black",
                      borderRadius: "9px",
                      padding: "10px",
                      margin: "5px 0",
                    }}
                  >
                    <Text variant="headingLg" as="h5">
                      STEP {item.id}
                    </Text>
                  </div>
                  <Text variant="headingMd" as="h6">
                    {item.text}
                  </Text>
                  <img
                    src={item.img}
                    alt={`STEP_${item.id}`}
                    width={"100%"}
                    style={{ margin: "15px 0" }}
                  />
                </VerticalStack>
              );
            })}
          </VerticalStack>
        </Modal.Section>
      </Modal>
    </div>
  );
};
export default CustomeAppModal;
