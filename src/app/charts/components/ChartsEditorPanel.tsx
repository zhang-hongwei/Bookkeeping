"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Stack,
  Alert,
  Divider,
  Typography,
  TextField,
  Button,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
} from "@mui/material";
import { ExpandMore, Upload, Download, ContentCopy } from "@mui/icons-material";
import { Controller } from "react-hook-form";
import { useChartStore } from "@/stores/charts/chart-store";
import { useChartForms } from "../hooks/useChartForms";
import { ChartsAdvancedConfig } from "./ChartsAdvancedConfig";
import Toast from "@/components/ui/Toast";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`chart-tabpanel-${index}`}
      aria-labelledby={`chart-tab-${index}`}
      style={{
        height: '100%',
        overflow: 'hidden'
      }}
      {...other}
    >
      {value === index && (
        <Box sx={{
          p: 3,
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export function ChartsEditorPanel() {
  const [tabValue, setTabValue] = useState(0);
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [importError, setImportError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { exportConfig, importConfig, updateTitle, updateSeriesData, updateXAxisData, updateLegend, updateGrid, updateTooltip, updateAnimation } = useChartStore();
  const { basicForm, dataForm, advancedForm } = useChartForms();

  // Real-time update for basic form
  useEffect(() => {
    const subscription = basicForm.watch((value) => {
      updateTitle(value.title || '', value.subtitle);
    });

    return () => subscription.unsubscribe();
  }, [basicForm, updateTitle]);

  // Real-time update for data form
  useEffect(() => {
    const subscription = dataForm.watch((value) => {
      try {
        const xAxisData = value.xAxisData ? value.xAxisData.split(",").map((item: string) => item.trim()) : [];
        const seriesData = value.seriesData ? value.seriesData.split(",").map((item: string) => {
          const num = parseFloat(item.trim());
          return isNaN(num) ? 0 : num;
        }) : [];

        updateXAxisData(xAxisData);
        updateSeriesData(seriesData);
      } catch (error) {
        console.error("Data format error:", error);
      }
    });

    return () => subscription.unsubscribe();
  }, [dataForm, updateXAxisData, updateSeriesData]);

  // Real-time update for advanced form
  useEffect(() => {
    const subscription = advancedForm.watch((value) => {
      // Update legend
      updateLegend({
        show: value.legendShow,
        orient: value.legendOrient,
        [value.legendPosition || 'bottom']:
          value.legendPosition === "top" || value.legendPosition === "bottom"
            ? "center"
            : 10,
      });

      // Update grid
      updateGrid({
        left: value.gridLeft,
        right: value.gridRight,
        top: value.gridTop,
        bottom: value.gridBottom,
        containLabel: value.gridContainLabel,
      });

      // Update tooltip
      updateTooltip({
        show: value.tooltipShow,
        trigger: value.tooltipTrigger,
      });

      // Update animation
      updateAnimation(value.animation, value.animationDuration);
    });

    return () => subscription.unsubscribe();
  }, [advancedForm, updateLegend, updateGrid, updateTooltip, updateAnimation]);

  const handleTabChange = useCallback(
    (_: React.SyntheticEvent, newValue: number) => {
      setTabValue(newValue);
    },
    []
  );

  const handleCopyConfig = useCallback(() => {
    const config = exportConfig();
    navigator.clipboard
      .writeText(config)
      .then(() => {
        setCopiedConfig(true);
        setTimeout(() => setCopiedConfig(false), 2000);
        Toast.success("Configuration copied to clipboard");
      })
      .catch(() => {
        Toast.error("Failed to copy configuration");
      });
  }, [exportConfig]);

  const handleDownloadConfig = useCallback(() => {
    try {
      const config = exportConfig();
      const blob = new Blob([config], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "chart-config.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      Toast.success("Configuration downloaded successfully");
    } catch (error) {
      Toast.error("Failed to download configuration");
    }
  }, [exportConfig]);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            const success = importConfig(content);
            if (success) {
              setImportError("");
              Toast.success("Configuration imported successfully");
            } else {
              setImportError(
                "Invalid configuration file format, please check JSON format"
              );
              Toast.error("Failed to import configuration");
            }
          } catch (error) {
            setImportError("Error reading configuration file");
            Toast.error("Error reading configuration file");
          }
        };
        reader.onerror = () => {
          Toast.error("Failed to read file");
        };
        reader.readAsText(file);
      }
    },
    [importConfig]
  );

  return (
    <Paper sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        minHeight: 0 // 确保可以收缩
      }}>
      <Box sx={{
        borderBottom: 1,
        borderColor: "divider",
        flexShrink: 0 // 防止标签页被压缩
      }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Basic Config" />
          <Tab label="Data Config" />
          <Tab label="Advanced Config" />
          <Tab label="Export" />
        </Tabs>
      </Box>

      <Box sx={{
        flex: 1,
        overflow: "hidden",
        minHeight: 0, // 确保内容可以收缩
        position: "relative"
      }}>
        <TabPanel value={tabValue} index={0}>
          <Stack spacing={3}>
              <Controller
                name="title"
                control={basicForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Chart Title"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="subtitle"
                control={basicForm.control}
                render={({ field }) => (
                  <TextField {...field} label="Chart Subtitle" fullWidth />
                )}
              />

              </Stack>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Stack spacing={3}>
              <Alert severity="info">
                Data format: Comma-separated, X-axis as text, Y-axis as numbers
              </Alert>

              <Controller
                name="xAxisData"
                control={dataForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="X-axis Data (comma separated)"
                    placeholder="e.g: Jan,Feb,Mar,Apr,May"
                    fullWidth
                    multiline
                    rows={2}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="seriesData"
                control={dataForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Y-axis Data (comma separated)"
                    placeholder="e.g: 120,200,150,80,70"
                    fullWidth
                    multiline
                    rows={2}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />

              </Stack>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <ChartsAdvancedConfig />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Stack spacing={3}>
            <Typography variant="h6">Export and Import</Typography>

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<ContentCopy />}
                onClick={handleCopyConfig}
                fullWidth
              >
                {copiedConfig ? "Copied!" : "Copy Config"}
              </Button>

              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleDownloadConfig}
                fullWidth
              >
                Download Config
              </Button>
            </Stack>

            <Divider />

            <Button
              variant="outlined"
              component="label"
              startIcon={<Upload />}
              fullWidth
            >
              Upload Config File
              <input
                type="file"
                accept=".json"
                hidden
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
            </Button>

            {importError && <Alert severity="error">{importError}</Alert>}

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>View Current Config</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  value={exportConfig()}
                  multiline
                  rows={10}
                  fullWidth
                  variant="outlined"
                  slotProps={{
                    input: {
                      readOnly: true,
                      sx: { fontFamily: "monospace", fontSize: 12 },
                    },
                  }}
                />
              </AccordionDetails>
            </Accordion>
          </Stack>
        </TabPanel>
      </Box>
    </Paper>
  );
}