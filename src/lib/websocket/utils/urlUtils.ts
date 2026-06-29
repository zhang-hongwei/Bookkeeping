/**
 * URL 处理工具函数
 */

/**
 * 验证 WebSocket URL 格式
 */
export function isValidWebSocketUrl(url: string): boolean {
    try {
        const urlObj = new URL(url);
        return urlObj.protocol === 'ws:' || urlObj.protocol === 'wss:';
    } catch {
        return false;
    }
}

/**
 * 标准化 WebSocket URL
 * 自动处理协议转换和格式化
 */
export function normalizeWebSocketUrl(url: string): string {
    if (!url) {
        throw new Error('WebSocket URL cannot be empty');
    }

    // 如果已经是完整的 WebSocket URL，直接返回
    if (/^wss?:\/\//.test(url)) {
        return url;
    }

    // 处理 HTTP/HTTPS 协议转换
    if (url.startsWith('http://')) {
        return url.replace('http://', 'ws://');
    }
    
    if (url.startsWith('https://')) {
        return url.replace('https://', 'wss://');
    }

    // 处理相对路径和域名
    if (url.startsWith('//')) {
        // 协议相对 URL
        const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        return protocol + url;
    }

    if (url.startsWith('/')) {
        // 绝对路径
        if (typeof window !== 'undefined') {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            return `${protocol}//${window.location.host}${url}`;
        } else {
            throw new Error('Cannot resolve absolute path in non-browser environment');
        }
    }

    // 处理纯域名或 IP
    if (!url.includes('/')) {
        const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss://' : 'ws://';
        return protocol + url;
    }

    // 默认添加协议
    const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    return protocol + url;
}

/**
 * 解析 WebSocket URL 组件
 */
export interface ParsedWebSocketUrl {
    protocol: 'ws' | 'wss';
    host: string;
    port?: number;
    pathname: string;
    search: string;
    hash: string;
    origin: string;
    href: string;
}

export function parseWebSocketUrl(url: string): ParsedWebSocketUrl {
    const normalizedUrl = normalizeWebSocketUrl(url);
    const urlObj = new URL(normalizedUrl);

    return {
        protocol: urlObj.protocol.slice(0, -1) as 'ws' | 'wss',
        host: urlObj.hostname,
        port: urlObj.port ? parseInt(urlObj.port, 10) : undefined,
        pathname: urlObj.pathname,
        search: urlObj.search,
        hash: urlObj.hash,
        origin: urlObj.origin,
        href: urlObj.href
    };
}

/**
 * 构建 WebSocket URL
 */
export interface WebSocketUrlOptions {
    protocol?: 'ws' | 'wss';
    host: string;
    port?: number;
    path?: string;
    query?: Record<string, string | number | boolean>;
    fragment?: string;
}

export function buildWebSocketUrl(options: WebSocketUrlOptions): string {
    const {
        protocol = 'ws',
        host,
        port,
        path = '/',
        query,
        fragment
    } = options;

    let url = `${protocol}://${host}`;
    
    if (port) {
        url += `:${port}`;
    }
    
    if (path && !path.startsWith('/')) {
        url += '/';
    }
    url += path || '/';

    if (query && Object.keys(query).length > 0) {
        const searchParams = new URLSearchParams();
        Object.entries(query).forEach(([key, value]) => {
            searchParams.append(key, String(value));
        });
        url += '?' + searchParams.toString();
    }

    if (fragment) {
        url += '#' + fragment;
    }

    return url;
}

/**
 * 检查 URL 是否为安全连接 (WSS)
 */
export function isSecureWebSocketUrl(url: string): boolean {
    try {
        const normalizedUrl = normalizeWebSocketUrl(url);
        return normalizedUrl.startsWith('wss://');
    } catch {
        return false;
    }
}

/**
 * 获取 WebSocket URL 的域名
 */
export function getWebSocketDomain(url: string): string {
    try {
        const normalizedUrl = normalizeWebSocketUrl(url);
        const urlObj = new URL(normalizedUrl);
        return urlObj.hostname;
    } catch {
        return '';
    }
}

/**
 * 获取 WebSocket URL 的端口
 */
export function getWebSocketPort(url: string): number | null {
    try {
        const normalizedUrl = normalizeWebSocketUrl(url);
        const urlObj = new URL(normalizedUrl);
        
        if (urlObj.port) {
            return parseInt(urlObj.port, 10);
        }
        
        // 返回默认端口
        return urlObj.protocol === 'wss:' ? 443 : 80;
    } catch {
        return null;
    }
}

/**
 * 比较两个 WebSocket URL 是否相同
 */
export function compareWebSocketUrls(url1: string, url2: string): boolean {
    try {
        const normalized1 = normalizeWebSocketUrl(url1);
        const normalized2 = normalizeWebSocketUrl(url2);
        return normalized1 === normalized2;
    } catch {
        return false;
    }
}

/**
 * 从 WebSocket URL 中提取查询参数
 */
export function extractQueryParams(url: string): Record<string, string> {
    try {
        const normalizedUrl = normalizeWebSocketUrl(url);
        const urlObj = new URL(normalizedUrl);
        const params: Record<string, string> = {};
        
        urlObj.searchParams.forEach((value, key) => {
            params[key] = value;
        });
        
        return params;
    } catch {
        return {};
    }
}

/**
 * 向 WebSocket URL 添加查询参数
 */
export function addQueryParams(url: string, params: Record<string, string | number | boolean>): string {
    try {
        const normalizedUrl = normalizeWebSocketUrl(url);
        const urlObj = new URL(normalizedUrl);
        
        Object.entries(params).forEach(([key, value]) => {
            urlObj.searchParams.set(key, String(value));
        });
        
        return urlObj.toString();
    } catch {
        return url;
    }
}

/**
 * 从 WebSocket URL 中移除查询参数
 */
export function removeQueryParams(url: string, paramNames: string[]): string {
    try {
        const normalizedUrl = normalizeWebSocketUrl(url);
        const urlObj = new URL(normalizedUrl);
        
        paramNames.forEach(name => {
            urlObj.searchParams.delete(name);
        });
        
        return urlObj.toString();
    } catch {
        return url;
    }
}

/**
 * 检查 URL 是否为本地地址
 */
export function isLocalWebSocketUrl(url: string): boolean {
    try {
        const domain = getWebSocketDomain(url);
        return domain === 'localhost' || 
               domain === '127.0.0.1' || 
               domain === '::1' ||
               domain.startsWith('192.168.') ||
               domain.startsWith('10.') ||
               domain.startsWith('172.');
    } catch {
        return false;
    }
}
