/**
 * 后端服务层统一导出
 * 处理业务逻辑和数据库操作
 */

export { authService } from './auth.service';
export { userService } from './user.service';
export { paletteService } from './palette.service';

// 导出所有服务的类型
export type * from './auth.service';
export type * from './user.service';
export type * from './palette.service';