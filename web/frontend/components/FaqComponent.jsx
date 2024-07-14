import React, { useState } from "react";
import style from "./Tab2.module.css";
import {
  AlphaCard,
  Button,
  HorizontalStack,
  Text,
  VerticalStack,
} from "@shopify/polaris";

const FaqComponent = ({ id, que, ans, answerImage, answerLink }) => {
  const [isActive, setIsActive] = useState(false);
  const handleOpneAnswer = () => {
    setIsActive(!isActive);
  };

  return (
    <div className={style.FaqComponentMain}>
      <div
        style={{ width: "60%", cursor: "pointer" }}
        onClick={handleOpneAnswer}
      >
        <HorizontalStack align="space-between" className={style.question}>
          <Text as="h2" variant="headingMd">
            {"Q."}
            {id} {"   "}
            {que}
          </Text>
          <Button plain>
            <svg
              className={isActive ? style.active : ""}
              viewBox="0 0 320 512"
              width="10"
              title="angle-down"
            >
              <path d="M143 352.3L7 216.3c-9.4-9.4-9.4-24.6 0-33.9l22.6-22.6c9.4-9.4 24.6-9.4 33.9 0l96.4 96.4 96.4-96.4c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9l-136 136c-9.2 9.4-24.4 9.4-33.8 0z" />
            </svg>
          </Button>
        </HorizontalStack>
      </div>
      <div className={isActive ? style.showAnswer : style.HideAnswer}>
        <Text variant="headingSm" as="div" fontWeight="regular">
          {"Ans."} {ans}
        </Text>

        {answerImage ? (
          <img src={answerImage} width={"100%"} style={{ margin: "15px 0" }} />
        ) : (
          <></>
        )}
        {answerLink ? (
          <a href={answerLink} target="_blank">
            {answerLink}
          </a>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default FaqComponent;
