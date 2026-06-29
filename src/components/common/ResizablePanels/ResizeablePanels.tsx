
import React from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { ResizeablePanelsProps } from "./types";

const ResizeablePanels: React.FC<ResizeablePanelsProps> = (props) => {
    const { left, right, center, slotProps } = props;

    return (
        <PanelGroup autoSaveId="example" direction="horizontal"
            style={{
                padding: '8px',  // 缝隙的宽度
            }}
        >
            <Panel
                defaultSize={slotProps?.left?.defaultSize ?? 5}
                minSize={slotProps?.left?.minSize ?? 5}
                maxSize={slotProps?.left?.maxSize ?? 5}
                style={{
                    border: '1px solid red'
                }}
            >
                {left}
            </Panel>
            <PanelResizeHandle
                style={{
                    width: '8px',  // 缝隙的宽度
                }}
            />
            <Panel
                style={{
                    border: '1px solid red'
                }}
                defaultSize={slotProps?.center?.defaultSize ?? 75}
                minSize={slotProps?.center?.minSize}
                maxSize={slotProps?.center?.maxSize}
            >
                {center}
            </Panel>
            <PanelResizeHandle
                style={{
                    width: '8px',  // 缝隙的宽度
                }}
            />
            <Panel
                defaultSize={slotProps?.right?.defaultSize}
                minSize={slotProps?.right?.minSize}
                maxSize={slotProps?.right?.maxSize}
                style={{
                    border: '1px solid red'
                }}
            >
                {right}
            </Panel>
        </PanelGroup>
    )
}

export default ResizeablePanels