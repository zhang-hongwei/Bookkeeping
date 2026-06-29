import * as React from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import { TreeViewBaseItem } from "@mui/x-tree-view/models";
import FigmaTreeView from "./FigmaTreeView";
import FigmaCard from "./FigmaCard";
import NodeInfoCard from "./NodeInfoCard";
import { IdType, ExtendedTreeItemProps, ITEMS } from "./items";

// 原始节点的 ID 列表（paper 及其所有子节点）
const ORIGINAL_NODE_IDS: IdType[] = [
  "paper",
  "header",
  "avatar",
  "avatar_initial",
  "header_title",
  "header_caption",
  "action_button",
  "media",
  "content",
  "text_content",
  "actions",
  "favorite",
  "share",
];

// 检查树中是否有自定义节点（非原始节点）
const hasCustomNodes = (
  nodes: TreeViewBaseItem<ExtendedTreeItemProps>[],
): boolean => {
  for (const node of nodes) {
    if (!ORIGINAL_NODE_IDS.includes(node.id as IdType)) {
      return true;
    }
    if (node.children && hasCustomNodes(node.children)) {
      return true;
    }
  }
  return false;
};

export default function FigmaExample() {
  const [selectedItem, setSelectedItem] = React.useState<IdType | null>(null);
  const [items, setItems] =
    React.useState<TreeViewBaseItem<ExtendedTreeItemProps>[]>(ITEMS);
  const docsTheme = useTheme();
  const isMd = useMediaQuery(docsTheme.breakpoints.up("md"), {
    defaultMatches: true,
  });

  // 判断是否是原始节点
  const isOriginalNode = (id: string | null): id is IdType => {
    return id !== null && ORIGINAL_NODE_IDS.includes(id as IdType);
  };

  // 检查是否有自定义节点
  const hasCustom = hasCustomNodes(items);

  // 获取根节点（始终是第一个节点）
  const rootNode = items[0];

  return (
    <Stack sx={{ width: "100%", height: "100%" }} direction="row">
      <Stack
        pl={1}
        py={1}
        sx={(theme) => ({
          borderRight: { xs: "none", md: `1px solid ${theme.palette.divider}` },
          height: "100%",
          minWidth: { xs: "100%", md: "fit-content" },
          alignItems: "center",
        })}
      >
        <FigmaTreeView
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          items={items}
          setItems={setItems}
        />
      </Stack>
      {isMd && (
        <Stack
          justifyContent="center"
          alignItems="center"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundImage: `linear-gradient(${theme.palette.divider} 1px, transparent 1px), linear-gradient(to right,${theme.palette.divider} 1px, ${theme.palette.background.paper} 1px)`,
            backgroundSize: "20px 20px",
            display: { xs: "none", md: "flex" },
          })}
        >
          {hasCustom ? (
            <NodeInfoCard rootNode={rootNode} selectedItemId={selectedItem} />
          ) : (
            <FigmaCard selectedItem={isOriginalNode(selectedItem) ? selectedItem : null} />
          )}
        </Stack>
      )}
    </Stack>
  );
}
