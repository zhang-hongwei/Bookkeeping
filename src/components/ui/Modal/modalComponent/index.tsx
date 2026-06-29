import React, { useEffect, useMemo, useState } from "react";
import { Modal, Box, Backdrop, useMediaQuery, ModalProps } from "@mui/material";
import clsx from "clsx";
import ModalHeader from "./modalHeader";
import ModalContent from "./modalContent";
import ModalFooter from "./modalFooter";
import type { CustomizedModalProps } from "../type";

const defaultStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  borderRadius: "8px",
  flexDirection: "column",
  display: "flex",
  justifyContent: "space-between",
  outline: "none",
};

const CustomizedModal: React.FC<CustomizedModalProps> = ({
  open,
  onClose,
  title,
  onOk,
  okText = "确定",
  children,
  footer,
  showOk = true,
  className,
  width = "600px",
  sx = {},
  onOpen,
  customSlotProps = {},
  height = "auto",
  ...modalProps
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = (reason?: string) => {
    onClose?.({}, reason);
  };

  const handleOk = async () => {
    if (!isSubmitting && onOk) {
      setIsSubmitting(true);
      try {
        await onOk();
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  useEffect(() => {
    if (open && onOpen) onOpen();
  }, [open, onOpen]);

  return (
    <Modal
      className={clsx(className)}
      open={open}
      onClose={(_, reason) => handleClose(reason)}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: { timeout: 300 } }}
      aria-labelledby={title ? "modal-title" : undefined}
      aria-describedby="modal-content"
      role="dialog"
      {...modalProps}

    >
      <Box
        sx={{
          width: width,
          height: height,
          padding: "8px 16px",
          bgcolor: "background.paper",
          backdropFilter: "blur(3px)",

          boxShadow:
            "0px 16px 32px 0px rgba(0,0,0,0.12), 0px 0px 16px 0px rgba(0,0,0,0.2)",
          ...defaultStyle,
          ...sx,
        }}
      >
        {title && (
          <ModalHeader
            title={title}
            onClose={handleClose}
            {...customSlotProps.header}
          />
        )}
        <ModalContent {...customSlotProps.content}>{children}</ModalContent>
        {footer !== null &&
          (footer || (
            <ModalFooter
              onOk={handleOk}
              onClose={handleClose}
              showOk={showOk}
              okText={okText}
              isSubmitting={isSubmitting}
              {...customSlotProps.footer}
            />
          ))}
      </Box>
    </Modal>
  );
};

export default CustomizedModal;
