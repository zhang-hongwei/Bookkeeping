"use client";

import { forwardRef, cloneElement, isValidElement } from "react";
import { usePopperContext } from "./context";

interface PopperTriggerProps {
  children: React.ReactElement;
}

const PopperTrigger = forwardRef<HTMLElement, PopperTriggerProps>(
  function PopperTrigger({ children }, ref) {
    const context = usePopperContext();

    if (!isValidElement(children)) {
      throw new Error("PopperTrigger children must be a valid React element");
    }

    // Clone child element and inject ref
    return cloneElement(children, {
      ref,
      "data-popper-open": context.open,
    } as any);
  }
);

export default PopperTrigger;
