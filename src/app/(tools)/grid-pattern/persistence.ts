/**
 * Grid Pattern Generator - Persistence Utilities
 * JSON 导入/导出工具
 */

import type { GridPatternConfig } from "./types";

/**
 * 将配置转换为 JSON 字符串
 */
export function configToJson(config: GridPatternConfig): string {
  return JSON.stringify(config, null, 2);
}

/**
 * 从 JSON 字符串解析配置
 */
export function jsonToConfig(jsonString: string): GridPatternConfig {
  try {
    const parsed = JSON.parse(jsonString);

    // 验证基本结构
    if (!parsed || typeof parsed !== "object") {
      throw new Error("无效的配置格式");
    }

    // 确保 background 存在
    if (typeof parsed.background !== "string") {
      parsed.background = "#ffffff";
    }

    // 确保 layers 是数组
    if (!Array.isArray(parsed.layers)) {
      throw new Error("配置缺少 layers 数组");
    }

    // 验证每个图层的基本结构
    parsed.layers = parsed.layers.filter((layer: any) => {
      return (
        layer &&
        typeof layer === "object" &&
        typeof layer.id === "string" &&
        typeof layer.name === "string" &&
        typeof layer.visible === "boolean" &&
        typeof layer.type === "string"
      );
    });

    return parsed as GridPatternConfig;
  } catch (error) {
    throw new Error(`JSON 解析失败: ${error instanceof Error ? error.message : "未知错误"}`);
  }
}

/**
 * 下载配置为 JSON 文件
 */
export function downloadConfigJson(config: GridPatternConfig, filename = "grid-pattern.json"): void {
  const json = configToJson(config);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 从文件读取配置
 */
export async function readConfigFromFile(file: File): Promise<GridPatternConfig> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const config = jsonToConfig(content);
        resolve(config);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("文件读取失败"));
    };

    reader.readAsText(file);
  });
}

/**
 * 生成 URL 状态参数
 */
export function configToUrlParams(config: GridPatternConfig): string {
  const json = configToJson(config);
  return encodeURIComponent(json);
}

/**
 * 从 URL 参数解析配置
 */
export function urlParamsToConfig(params: string): GridPatternConfig {
  const decoded = decodeURIComponent(params);
  return jsonToConfig(decoded);
}
