import React from "react";
import { Stack } from "@mui/material";
import type { ModalContentProps } from "../type";

const ModalContent: React.FC<ModalContentProps> = ({ sx = {}, children }) => {
  return (
    <Stack
      sx={{
        ...sx,
        flexGrow: 1,
      }}
    >
      {children}
    </Stack>
  );
};

export default ModalContent;
