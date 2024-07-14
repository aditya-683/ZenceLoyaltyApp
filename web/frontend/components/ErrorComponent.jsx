import { Button, InlineError, Stack, VerticalStack } from "@shopify/polaris";
import React from "react";

export function  ErrorComponent ({ error, refresh }){
  return (
    <VerticalStack alignment="center">
      <InlineError
        message={`${error.code}: ${error.message}`}
        fieldID="myFieldID"
      />

      <Button primary onClick={refresh}>
        Reload
      </Button>
    </VerticalStack>
  );
};

// export default ErrorComponent;
