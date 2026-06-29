"use client";

import { forwardRef } from "react";
import { Popper, Paper, ClickAwayListener, Fade } from "@mui/material";
import type { PopperContentProps } from "../index.d";
import { usePopperContext } from "./context";

const PopperContent = forwardRef<HTMLDivElement, PopperContentProps>(
  function PopperContent(
    {
      children,
      transition = true,
      disablePortal = false,
      TransitionComponent,
      transitionDuration = 300,
      elevation = 16,
      sx,
      placement = "bottom-end",
      offset = [0, 8],
      modifiers,
    },
    ref
  ) {
    const { open, anchorEl, onClose } = usePopperContext();

    if (!open) return null;

    // Default to Fade if transition is enabled but no component specified
    const DefaultTransition = TransitionComponent || Fade;

    const content = (
      <Paper ref={ref} elevation={elevation} sx={sx}>
        {children}
      </Paper>
    );

    const popperModifiers = modifiers || [
      {
        name: "offset",
        options: {
          offset,
        },
      },
    ];

    const renderContent = () => (
      <ClickAwayListener
        onClickAway={() => {
          if (onClose) onClose();
        }}
      >
        {content}
      </ClickAwayListener>
    );

    return (
      <Popper
        open={open}
        anchorEl={anchorEl}
        placement={placement}
        disablePortal={disablePortal}
        modifiers={popperModifiers}
        transition
      >
        {({ TransitionProps }) =>
          transition ? (
            <DefaultTransition {...TransitionProps} timeout={transitionDuration}>
              <div>{renderContent()}</div>
            </DefaultTransition>
          ) : (
            renderContent()
          )
        }
      </Popper>
    );
  }
);

export default PopperContent;
