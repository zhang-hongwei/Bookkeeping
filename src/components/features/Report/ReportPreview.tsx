"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Tabs,
  Tab,
  TextField,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  AutoFixHigh as Generate,
  Save,
  Download,
  Edit,
  Visibility,
  History,
  Share,
  Refresh,
} from "@mui/icons-material";
import { useGitHubStore } from "@/store";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import dayjs from "dayjs";
import ExportButtons from "./ExportButtons";

interface ReportPreviewProps {
  onReportGenerated?: () => void;
}

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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}

export default function ReportPreview({
  onReportGenerated,
}: ReportPreviewProps) {
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");

  // 直接从 store 获取状态和方法
  const currentReport = useGitHubStore((state) => state.currentReport);
  const processedData = useGitHubStore((state) => state.processedData);
  const isGenerating = useGitHubStore((state) => state.isGenerating);
  const error = useGitHubStore((state) => state.error);
  const generateReport = useGitHubStore((state) => state.generateReport);
  const updateReportContent = useGitHubStore((state) => state.updateReportContent);
  const saveReport = useGitHubStore((state) => state.saveReport);
  const exportReport = useGitHubStore((state) => state.exportReport);
  const clearError = useGitHubStore((state) => state.clearError);

  // 当周报生成时，更新编辑内容
  useEffect(() => {
    if (currentReport && !isEditing) {
      setEditContent(currentReport.content);
    }
  }, [currentReport, isEditing]);

  // 生成完成回调 - 使用 useRef 避免依赖问题
  const onReportGeneratedRef = useRef(onReportGenerated);
  onReportGeneratedRef.current = onReportGenerated;

  useEffect(() => {
    if (currentReport && onReportGeneratedRef.current) {
      onReportGeneratedRef.current();
    }
  }, [currentReport]);

  const handleGenerateReport = async () => {
    clearError();
    await generateReport();
  };

  const handleSaveEdit = () => {
    if (editContent !== currentReport?.content) {
      updateReportContent(editContent);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(currentReport?.content || "");
    setIsEditing(false);
  };

  const handleSaveReport = () => {
    saveReport();
  };

  const handleExport = async (format: "markdown" | "pdf" | "docx") => {
    await exportReport(format);
  };

  const formatTimestamp = (timestamp: string) => {
    return dayjs(timestamp).format("YYYY-MM-DD HH:mm:ss");
  };

  // 如果没有提交数据，显示提示
  if (!processedData) {
    return <Alert severity="info">请先获取提交记录数据。</Alert>;
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* 操作按钮区域 */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="h6">周报预览</Typography>
            <Typography variant="body2" color="textSecondary">
              {processedData.totalCommits} 次提交 •{" "}
              {processedData.authorGroups.length} 位作者
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box
              display="flex"
              gap={1}
              justifyContent="flex-end"
              flexWrap="wrap"
            >
              <Button
                variant="contained"
                startIcon={
                  isGenerating ? <CircularProgress size={16} /> : <Generate />
                }
                onClick={handleGenerateReport}
                disabled={isGenerating}

              >
                {isGenerating
                  ? "生成中..."
                  : currentReport
                    ? "重新生成"
                    : "生成周报"}
              </Button>

              {currentReport && (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<Save />}
                    onClick={handleSaveReport}

                  >
                    保存
                  </Button>

                  <ExportButtons
                    report={currentReport}

                    variant="outlined"
                  />
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* 周报内容 */}
      {currentReport && (
        <Paper sx={{ overflow: "hidden" }}>
          {/* 标签页 */}
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
            >
              <Tab icon={<Visibility />} label="预览" iconPosition="start" />
              <Tab icon={<Edit />} label="编辑" iconPosition="start" />
              <Tab icon={<History />} label="信息" iconPosition="start" />
            </Tabs>
          </Box>

          {/* 预览标签页 */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ p: 3 }}>
              <Box
                sx={{
                  "& h1": { fontSize: "1.8rem", mb: 2 },
                  "& h2": { fontSize: "1.5rem", mb: 1.5, mt: 3 },
                  "& h3": { fontSize: "1.2rem", mb: 1, mt: 2 },
                  "& h4": { fontSize: "1.1rem", mb: 1, mt: 1.5 },
                  "& p": { mb: 1 },
                  "& ul, & ol": { mb: 1.5 },
                  "& li": { mb: 0.5 },
                  "& code": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                    padding: "2px 4px",
                    borderRadius: "4px",
                    fontSize: "0.875rem",
                  },
                  "& pre": {
                    backgroundColor: "#f5f5f5",
                    padding: 2,
                    borderRadius: 1,
                    overflow: "auto",
                  },
                  "& blockquote": {
                    borderLeft: "4px solid #ccc",
                    paddingLeft: 2,
                    margin: "1rem 0",
                    fontStyle: "italic",
                  },
                }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {currentReport.content}
                </ReactMarkdown>
              </Box>
            </Box>
          </TabPanel>

          {/* 编辑标签页 */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ p: 3 }}>
              {isEditing ? (
                <Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={20}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    variant="outlined"
                    placeholder="编辑周报内容..."
                    sx={{ mb: 2 }}
                  />
                  <Box display="flex" gap={1}>
                    <Button
                      variant="contained"
                      onClick={handleSaveEdit}
                      startIcon={<Save />}
                    >
                      保存修改
                    </Button>
                    <Button variant="outlined" onClick={handleCancelEdit}>
                      取消
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6">周报内容</Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={() => setIsEditing(true)}
                    >
                      编辑
                    </Button>
                  </Box>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      maxHeight: 500,
                      overflow: "auto",
                      backgroundColor: "#f9f9f9",
                    }}
                  >
                    <pre
                      style={{
                        whiteSpace: "pre-wrap",
                        margin: 0,
                        fontFamily: "inherit",
                      }}
                    >
                      {currentReport.content}
                    </pre>
                  </Paper>
                </Box>
              )}
            </Box>
          </TabPanel>

          {/* 信息标签页 */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        基本信息
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary="周报标题"
                            secondary={currentReport.title}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="周次"
                            secondary={currentReport.week}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="时间范围"
                            secondary={`${currentReport.timeRange.startDate} 至 ${currentReport.timeRange.endDate}`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="创建时间"
                            secondary={formatTimestamp(currentReport.createdAt)}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="更新时间"
                            secondary={formatTimestamp(currentReport.updatedAt)}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        统计数据
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary="提交总数"
                            secondary={`${processedData.totalCommits} 次`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="参与作者"
                            secondary={`${processedData.authorGroups.length} 人`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="涉及仓库"
                            secondary={`${processedData.repositoryGroups.length} 个`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="内容长度"
                            secondary={`${currentReport.content.length} 字符`}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        涉及仓库
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {currentReport.repositories.map((repo) => (
                          <Chip
                            key={repo}
                            label={repo}
                            variant="outlined"

                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        配置信息
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary="包含合并提交"
                            secondary={
                              currentReport.config.includeMergeCommits
                                ? "是"
                                : "否"
                            }
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="按作者分组"
                            secondary={
                              currentReport.config.groupByAuthor ? "是" : "否"
                            }
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="按日期分组"
                            secondary={
                              currentReport.config.groupByDate ? "是" : "否"
                            }
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>
        </Paper>
      )}
    </Box>
  );
}
