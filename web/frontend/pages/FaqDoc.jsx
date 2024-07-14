import React from "react";
import FaqComponent from "../components/FaqComponent";
import { AlphaCard, Page, Text, VerticalStack } from "@shopify/polaris";
import { useAppQuery } from "../hooks";

const FaqDoc = () => {
  const { data, isLoading } = useAppQuery({
    url: `/api/all-faq`,
    reactQueryOptions: {
      onSuccess: (responseData) => {
        // console.log("response DAta faq", responseData);
      },
    },
  });
  return (
    <Page fullWidth>
      <div style={{ margin: "15px 20px" }}>
        <Text variant="headingXl" as="h4">
          {"Most Frequently Asked"}
        </Text>
      </div>
      <AlphaCard>
        <VerticalStack gap={"1"}>
          {data?.map((item, index) => {
            return (
              <FaqComponent
                key={index}
                answerImage={item.answerImage}
                answerLink={item.answerLink}
                id={index + 1}
                que={item.question}
                ans={item.answer}
              />
            );
          })}
        </VerticalStack>
      </AlphaCard>

      {/* <div style={{ margin: "20px 0" }}>
        <iframe
          src="https://www.easyrewardz.com/company/contact-us/"
          width="100%"
          height="800px"
          style={{ border: "none" }}
        ></iframe>
      </div> */}
    </Page>
  );
};

export default FaqDoc;
