'use client'
import {
    Popover as FloatingPopover,
} from "./components/basic"
import PopoverTrigger from "./components/popoverTrigger"
import PopoverContent from "./components/popoverContent"
import { PopoverPropsType } from "./index.d"

const Popover: React.FC<PopoverPropsType> = ({ onOpenChange, open, content, children, trigger, borderRadius = 10, placement = 'bottom-end', boxShadow }) => {
    return (
        <FloatingPopover placement={placement} open={open} onOpenChange={onOpenChange} trigger={trigger}  >
            <PopoverTrigger
                onClick={() => {
                    onOpenChange && onOpenChange((v: any) => !v)
                }}
            >
                {children}
            </PopoverTrigger>
            <PopoverContent className="Popover" borderRadius={borderRadius} boxShadow={boxShadow}>
                {content}
            </PopoverContent>
        </FloatingPopover >
    )
}

export default Popover