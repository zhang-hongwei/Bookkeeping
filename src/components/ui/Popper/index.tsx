"use client";

import { useRef, cloneElement, isValidElement } from "react";
import { PopperContext } from "./components/context";
import PopperContent from "./components/PopperContent";
import type { PopperPropsType } from "./index.d";

const Popper: React.FC<PopperPropsType> = ({
  open,
  onClose,
  content,
  children,
  placement = "bottom-end",
  disablePortal = false,
  transition = true,
  offset = [0, 8],
  modifiers,
  TransitionComponent,
  transitionDuration = 300,
  elevation = 16,
  sx,
}) => {
  const anchorRef = useRef<HTMLElement>(null);

  // Clone children to inject ref
  const trigger = isValidElement(children)
    ? cloneElement(children as React.ReactElement, {
        ref: anchorRef,
      } as any)
    : children;

  return (
    <PopperContext.Provider value={{ open, anchorEl: anchorRef.current, onClose }}>
      {trigger}
      <PopperContent
        placement={placement}
        transition={transition}
        disablePortal={disablePortal}
        offset={offset}
        modifiers={modifiers}
        TransitionComponent={TransitionComponent}
        transitionDuration={transitionDuration}
        elevation={elevation}
        sx={sx}
      >
        {content}
      </PopperContent>
    </PopperContext.Provider>
  );
};

export default Popper;
