import { useMemo, useState } from "react";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  useHover,
  safePolygon,
} from "@floating-ui/react";
import { PopoverOptions } from "../index.d";
import { PopoverContext } from "./context";

export function usePopover({
  initialOpen = false,
  placement = "bottom",
  modal,
  trigger = "click",
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: PopoverOptions = {}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(initialOpen);
  const [labelId, setLabelId] = useState<string | undefined>();
  const [descriptionId, setDescriptionId] = useState<string | undefined>();

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;
  const data = useFloating({
    placement,
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(5),
      flip({
        crossAxis: placement.includes("-"),
        fallbackAxisSideDirection: "end",
        padding: 5,
      }),
      shift({ padding: 5 }),
    ],
  });

  const context = data.context;

  const click = useClick(context, {
    enabled: controlledOpen == null && trigger === "click",
  });

  const hover = useHover(context, {
    handleClose: safePolygon({
      buffer: 1,
      blockPointerEvents: true,
    }),
    enabled: trigger === "hover",
  });

  const dismiss = useDismiss(context);
  const role = useRole(context);

  const memoInteractions: any = useMemo(() => {
    if (trigger === "hover") {
      return [hover]; // 如果是 hover，使用 hover 和 focus
    } else {
      return [click, dismiss, role]; // 如果是 click，使用 click
    }
  }, [trigger, hover, click]);

  const interactions = useInteractions(memoInteractions);

  return useMemo(
    () => ({
      open,
      setOpen,
      ...interactions,
      ...data,
      modal,
      labelId,
      descriptionId,
      setLabelId,
      setDescriptionId,
    }),
    [open, setOpen, interactions, data, modal, labelId, descriptionId]
  );
}

export function Popover({
  children,
  modal = false,
  ...restOptions
}: {
  children: React.ReactNode;
} & PopoverOptions) {
  const popover = usePopover({ modal, ...restOptions });
  return (
    <PopoverContext.Provider value={popover}>
      {children}
    </PopoverContext.Provider>
  );
}
