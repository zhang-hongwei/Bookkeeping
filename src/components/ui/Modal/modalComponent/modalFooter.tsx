import React from "react";
import { Stack, Button } from "@mui/material";
import type { ModalFooterProps } from "../type";

const ModalFooter: React.FC<ModalFooterProps> = (props) => {
  const {
    onClose,
    onOk,
    sx = {},
    showOk = true,
    okText = "确认",
    isSubmitting = false,
  } = props;
  const handleClose = (type?: string) => {
    onClose && onClose(type);
  };

  const handleOk = () => {
    onOk && onOk();
  };

  return (
    <Stack
      direction="row"
      sx={{
        justifyContent: "flex-end",
        borderTop: "1px solid",
        borderColor: "divider",
        ...sx,
      }}
      spacing={".5rem"}
    >
      {showOk ? (
        <Button
          variant="contained"
          sx={{
            padding: ".3125rem 2.125rem",
          }}
          onClick={handleOk}
          disabled={isSubmitting}
        >
          {okText}
        </Button>
      ) : null}
      <Button
        variant="outlined"
        onClick={() => handleClose("cancel")}
        sx={{
          padding: ".3125rem 2.125rem",
        }}
      >
        取消
      </Button>
    </Stack>
  );
};
export default ModalFooter;
