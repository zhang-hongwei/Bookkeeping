'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Snackbar,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Download,
  FileCopy,
  Share,
  FileDownload,
  Description,
  PictureAsPdf,
  TableChart,
  ContentCopy,
  X as Twitter,
  LinkedIn,
  Facebook,
  IosShare,
  ArrowDropDown,
} from '@mui/icons-material';
import { WeeklyReport } from '@/types/report';
import {
  exportMarkdown,
  exportText,
  copyToClipboard,
  shareToSocial,
  shareNative,
  generateReportSummary,
} from '@/lib/export/markdown';

interface ExportButtonsProps {
  report: WeeklyReport;
  size?: 'small' | 'medium' | 'large';
  variant?: 'contained' | 'outlined' | 'text';
  orientation?: 'horizontal' | 'vertical';
}

export default function ExportButtons({
  report,
  size = 'medium',
  variant = 'outlined',
  orientation = 'horizontal',
}: ExportButtonsProps) {
  const [downloadAnchor, setDownloadAnchor] = useState<null | HTMLElement>(null);
  const [shareAnchor, setShareAnchor] = useState<null | HTMLElement>(null);
  const [copyAnchor, setCopyAnchor] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const showMessage = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleDownload = (format: 'markdown' | 'text') => {
    try {
      switch (format) {
        case 'markdown':
          exportMarkdown(report);
          showMessage('Markdown 文件下载成功！');
          break;
        case 'text':
          exportText(report);
          showMessage('文本文件下载成功！');
          break;
      }
    } catch (error) {
      showMessage('下载失败，请重试', 'error');
    }
    setDownloadAnchor(null);
  };

  const handleCopy = async (type: 'content' | 'summary') => {
    try {
      const content = type === 'content' ? report.content : generateReportSummary(report);
      const success = await copyToClipboard(content);

      if (success) {
        showMessage(type === 'content' ? '周报内容已复制到剪贴板！' : '周报摘要已复制到剪贴板！');
      } else {
        showMessage('复制失败，请手动复制', 'error');
      }
    } catch (error) {
      showMessage('复制失败，请重试', 'error');
    }
    setCopyAnchor(null);
  };

  const handleShare = async (platform: 'native' | 'twitter' | 'linkedin' | 'facebook') => {
    try {
      if (platform === 'native') {
        const success = await shareNative(report);
        if (success) {
          showMessage('分享成功！');
        } else {
          showMessage('设备不支持原生分享', 'error');
        }
      } else {
        shareToSocial(platform, report);
        showMessage('正在打开分享页面...');
      }
    } catch (error) {
      showMessage('分享失败，请重试', 'error');
    }
    setShareAnchor(null);
  };

  const buttonProps = {
    size,
    variant,
  };

  const isHorizontal = orientation === 'horizontal';

  return (
    <Box>
      {isHorizontal ? (
        <ButtonGroup variant={variant} size={size}>
        {/* 下载按钮 */}
        <Button
          {...buttonProps}
          startIcon={<Download />}
          endIcon={orientation === 'horizontal' ? <ArrowDropDown /> : undefined}
          onClick={(e) => setDownloadAnchor(e.currentTarget)}
        >
          下载
        </Button>

        {/* 复制按钮 */}
        <Button
          {...buttonProps}
          startIcon={<FileCopy />}
          endIcon={orientation === 'horizontal' ? <ArrowDropDown /> : undefined}
          onClick={(e) => setCopyAnchor(e.currentTarget)}
        >
          复制
        </Button>

        {/* 分享按钮 */}
        <Button
          {...buttonProps}
          startIcon={<Share />}
          endIcon={orientation === 'horizontal' ? <ArrowDropDown /> : undefined}
          onClick={(e) => setShareAnchor(e.currentTarget)}
        >
          分享
        </Button>
      </ButtonGroup>
      ) : (
        <Box display="flex" flexDirection="column" gap={1}>
        {/* 下载按钮 */}
        <Button
          {...buttonProps}
          startIcon={<Download />}
          onClick={(e) => setDownloadAnchor(e.currentTarget)}
        >
          下载
        </Button>

        {/* 复制按钮 */}
        <Button
          {...buttonProps}
          startIcon={<FileCopy />}
          onClick={(e) => setCopyAnchor(e.currentTarget)}
        >
          复制
        </Button>

        {/* 分享按钮 */}
        <Button
          {...buttonProps}
          startIcon={<Share />}
          onClick={(e) => setShareAnchor(e.currentTarget)}
        >
          分享
        </Button>
      </Box>
      )}

      {/* 下载菜单 */}
      <Menu
        anchorEl={downloadAnchor}
        open={Boolean(downloadAnchor)}
        onClose={() => setDownloadAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <MenuItem onClick={() => handleDownload('markdown')}>
          <ListItemIcon>
            <Description />
          </ListItemIcon>
          <ListItemText
            primary="Markdown (.md)"
            secondary="保留格式的 Markdown 文件"
          />
        </MenuItem>

        <MenuItem onClick={() => handleDownload('text')}>
          <ListItemIcon>
            <TableChart />
          </ListItemIcon>
          <ListItemText
            primary="纯文本 (.txt)"
            secondary="去除格式的纯文本文件"
          />
        </MenuItem>

        <Divider />

        <MenuItem disabled>
          <ListItemIcon>
            <PictureAsPdf />
          </ListItemIcon>
          <ListItemText
            primary="PDF (.pdf)"
            secondary="即将支持"
          />
        </MenuItem>
      </Menu>

      {/* 复制菜单 */}
      <Menu
        anchorEl={copyAnchor}
        open={Boolean(copyAnchor)}
        onClose={() => setCopyAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <MenuItem onClick={() => handleCopy('content')}>
          <ListItemIcon>
            <ContentCopy />
          </ListItemIcon>
          <ListItemText
            primary="复制完整内容"
            secondary="复制整个周报的 Markdown 内容"
          />
        </MenuItem>

        <MenuItem onClick={() => handleCopy('summary')}>
          <ListItemIcon>
            <Description />
          </ListItemIcon>
          <ListItemText
            primary="复制摘要"
            secondary="复制周报的简要摘要"
          />
        </MenuItem>
      </Menu>

      {/* 分享菜单 */}
      <Menu
        anchorEl={shareAnchor}
        open={Boolean(shareAnchor)}
        onClose={() => setShareAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        {'share' in navigator && (
          <>
            <MenuItem onClick={() => handleShare('native')}>
              <ListItemIcon>
                <IosShare />
              </ListItemIcon>
              <ListItemText
                primary="系统分享"
                secondary="使用系统默认分享方式"
              />
            </MenuItem>
            <Divider />
          </>
        )}

        <MenuItem onClick={() => handleShare('twitter')}>
          <ListItemIcon>
            <Twitter />
          </ListItemIcon>
          <ListItemText primary="分享到 Twitter" />
        </MenuItem>

        <MenuItem onClick={() => handleShare('linkedin')}>
          <ListItemIcon>
            <LinkedIn />
          </ListItemIcon>
          <ListItemText primary="分享到 LinkedIn" />
        </MenuItem>

        <MenuItem onClick={() => handleShare('facebook')}>
          <ListItemIcon>
            <Facebook />
          </ListItemIcon>
          <ListItemText primary="分享到 Facebook" />
        </MenuItem>
      </Menu>

      {/* 消息提示 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}