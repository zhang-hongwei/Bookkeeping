import * as React from "react";
import {
  useMergeRefs,
  FloatingPortal,
  FloatingFocusManager,
} from "@floating-ui/react";
import { usePopoverContext } from "./context";
import { Box } from "@mui/material";

interface PopoverContentProps
  extends Omit<React.HTMLProps<HTMLDivElement>, "ref"> {
  borderRadius?: number | string; // 支持数字或字符串类型
  boxShadow?: string;
}
const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  (props, propRef) => {
    const { context: floatingContext, ...context } = usePopoverContext();
    const ref = useMergeRefs([context.refs.setFloating, propRef]);
    const { borderRadius = 2, boxShadow, ...restProps } = props; // 将解构移到这里
    if (!floatingContext.open) return null;

    return (
      <FloatingPortal>
        <FloatingFocusManager context={floatingContext} modal={context.modal}>
          <Box
            ref={ref}
            style={{
              width: "auto",
              zIndex: 999999,
              boxShadow: boxShadow || "0px 6px 16px 8px rgba(0,0,0,0.08)",
              borderRadius:
                typeof borderRadius === "string"
                  ? borderRadius
                  : `${borderRadius}px`,
              padding: "0",
              outline: "none",
              overflow: "hidden",
              ...context.floatingStyles,
            }} // 合并样式
            aria-labelledby={context.labelId}
            aria-describedby={context.descriptionId}
            {...context.getFloatingProps(restProps)} // 将解构后的剩余 props 传递给 getFloatingProps
          >
            {props.children}
          </Box>
        </FloatingFocusManager>
      </FloatingPortal>
    );
  }
);

PopoverContent.displayName = "PopoverContent";

export default PopoverContent;
