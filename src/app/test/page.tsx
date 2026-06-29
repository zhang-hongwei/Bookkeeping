import React from "react";
import { Container, Box } from "@mui/material";

const Test = () => {
  return (
    <Container
      sx={{
        border: "1px solid red",
      }}
      maxWidth={false}
    >
      <Box>1</Box>
    </Container>
  );
};

export default Test;
