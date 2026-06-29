// Common API types shared across the app

/** 标准 API 响应结构 */
export interface ApiResponse<T = any> {
  /** 返回code码 */
  code: string;
  /** 返回数据 */
  data: T;
  /** 返回错误信息 */
  msg: string;
  /** 请求处理是否成功 */
  success: boolean;
}

/** 分页查询参数 */
export interface PageParams {
  /** 页码 */
  page?: number;
  /** 页大小 */
  pageSize?: number;
}

/** 分页响应数据 */
export interface PageData<T = any> {
  /** 数据列表 */
  records: T[];
  /** 总数 */
  total: number;
  /** 当前页 */
  current: number;
  /** 页大小 */
  size: number;
}
