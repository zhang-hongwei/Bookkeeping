"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { TabPanel } from "./components/shared";
import { UseTransitionDemo } from "./components/use-transition-demo";
import { UseActionStateDemo } from "./components/use-action-state-demo";
import { ComparisonSection } from "./components/comparison-section";

export default function AsyncReactDemoPage() {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }}>
      <Container maxWidth="lg">
        {/* 页头 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" fontWeight={800} gutterBottom>
            Async React 19
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            <code>useTransition</code> 和 <code>useActionState</code> 交互式演示
          </Typography>
          <Typography variant="body2" color="text.secondary">
            基于{" "}
            <Box
              component="a"
              href="https://www.rubrik.com/blog/architecture/26/2/async-react-building-non-blocking-uis-with-usetransition-and-useactionstate"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: "primary.main", textDecoration: "underline" }}
            >
              Rubrik 工程博客
            </Box>
            {" "}— 探索 React 19 如何消除手动异步状态管理。
          </Typography>
        </Box>

        {/* 标签页 */}
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ borderBottom: 1, borderColor: "divider", mb: 1 }}
        >
          <Tab label="useTransition" icon={<SearchIcon />} iconPosition="start" />
          <Tab label="useActionState" icon={<ShoppingCartIcon />} iconPosition="start" />
          <Tab label="对比指南" />
        </Tabs>

        <TabPanel value={tab} index={0}>
          <UseTransitionDemo />
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <UseActionStateDemo />
        </TabPanel>
        <TabPanel value={tab} index={2}>
          <ComparisonSection />
        </TabPanel>
      </Container>
    </Box>
  );
}
