import { createContext, useContext } from "react";

interface PopperContextType {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose?: () => void;
}

export const PopperContext = createContext<PopperContextType | null>(null);

export const usePopperContext = () => {
  const context = useContext(PopperContext);
  if (!context) {
    throw new Error("Popper components must be wrapped in <Popper />");
  }
  return context;
};
