

import * as React from "react";
import {
    useId
} from "@floating-ui/react";
import { usePopoverContext } from "./context";

const PopoverClose = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(function PopoverClose(props, ref) {
    const { setOpen } = usePopoverContext();
    return (
        <button
            type="button"
            ref={ref}
            {...props}
            onClick={(event) => {
                props.onClick?.(event);
                setOpen(false);
            }}
        />
    );
});

export default PopoverClose 