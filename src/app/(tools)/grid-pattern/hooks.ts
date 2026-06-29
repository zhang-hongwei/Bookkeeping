/**
 * Grid Pattern Generator - URL State Hook
 * URL 状态共享 Hook
 */

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { GridPatternConfig } from "./types";
import { DEFAULT_CONFIG } from "./types";
import { configToUrlParams, urlParamsToConfig } from "./persistence";

/**
 * 从 URL 读取/写入配置状态
 */
export function useUrlState() {
  const searchParams = useSearchParams();
  const [configFromUrl, setConfigFromUrl] = useState<GridPatternConfig | null>(
    null
  );
  const [isInitialized, setIsInitialized] = useState(false);

  // 从 URL 读取配置
  useEffect(() => {
    if (isInitialized) return;

    const configParam = searchParams.get("config");
    if (configParam) {
      try {
        const config = urlParamsToConfig(configParam);
        setConfigFromUrl(config);
      } catch {
        console.error("Failed to load config from URL");
      }
    }
    setIsInitialized(true);
  }, [searchParams, isInitialized]);

  /**
   * 生成分享链接
   */
  const generateShareUrl = (config: GridPatternConfig): string => {
    const params = configToUrlParams(config);
    const url = new URL(window.location.href);
    url.searchParams.set("config", params);
    return url.toString();
  };

  /**
   * 复制分享链接到剪贴板
   */
  const copyShareUrl = async (config: GridPatternConfig): Promise<boolean> => {
    try {
      const url = generateShareUrl(config);
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      return false;
    }
  };

  return {
    configFromUrl,
    hasUrlConfig: configFromUrl !== null,
    generateShareUrl,
    copyShareUrl,
  };
}
