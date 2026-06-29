export enum BasicStatus {
  DISABLE = 0,
  ENABLE = 1,
}

export enum ResultStuts {
  SUCCESS = 0,
  ERROR = -1,
  TIMEOUT = 401,
}

export enum StorageEnum {
  UserInfo = "userInfo",
  UserToken = "userToken",
  Settings = "settings",
  I18N = "i18nextLng",
}

export enum ThemeMode {
  Light = "light",
  Dark = "dark",
}

export enum ThemeLayout {
  Vertical = "vertical",
  Horizontal = "horizontal",
  Mini = "mini",
}

export enum ThemeColorPresets {
  Default = "default",
  Cyan = "cyan",
  Purple = "purple",
  Blue = "blue",
  Orange = "orange",
  Red = "red",
}

export enum LocalEnum {
  en_US = "en_US",
  zh_CN = "zh_CN",
}

export enum MultiTabOperation {
  FULLSCREEN = "fullscreen",
  REFRESH = "refresh",
  CLOSE = "close",
  CLOSEOTHERS = "closeOthers",
  CLOSEALL = "closeAll",
  CLOSELEFT = "closeLeft",
  CLOSERIGHT = "closeRight",
}

export enum PermissionType {
  GROUP = 0,
  CATALOGUE = 1,
  MENU = 2,
  COMPONENT = 3,
}

export enum HtmlDataAttribute {
  ColorPalette = "data-color-palette",
  ThemeMode = "data-theme-mode",
}

/** 处理状态枚举 */
export enum AuditStatus {
  /** 未处理 */
  PENDING = 0,
  /** 审核中 */
  REVIEWING = 1,
  /** 通过 */
  APPROVED = 2,
  /** 驳回 */
  REJECTED = 3,
}

/** 方案审核状态枚举 */
export enum CheckStatus {
  /** 未提交审核 */
  NOT_SUBMITTED = 0,
  /** 审核中 */
  REVIEWING = 1,
  /** 审核通过 */
  APPROVED = 2,
  /** 审核失败 */
  FAILED = 3,
}

/** 审核类型枚举 */
export enum CheckType {
  /** 首轮 */
  FIRST_ROUND = 0,
  /** 方案变更 */
  SCHEME_CHANGE = 1,
}

/** 处理状态选项 */
export const AUDIT_STATUS_OPTIONS = [
  { label: "未处理", value: AuditStatus.PENDING },
  { label: "审核中", value: AuditStatus.REVIEWING },
  { label: "通过", value: AuditStatus.APPROVED },
  { label: "驳回", value: AuditStatus.REJECTED },
];

/** 方案审核状态选项 */
export const CHECK_STATUS_OPTIONS = [
  { label: "未提交审核", value: CheckStatus.NOT_SUBMITTED },
  { label: "审核中", value: CheckStatus.REVIEWING },
  { label: "审核通过", value: CheckStatus.APPROVED },
  { label: "审核失败", value: CheckStatus.FAILED },
];

/** 审核类型选项 */
export const CHECK_TYPE_OPTIONS = [
  { label: "首轮", value: CheckType.FIRST_ROUND },
  { label: "方案变更", value: CheckType.SCHEME_CHANGE },
];

// ===== 人员管理相关枚举 =====

/** 性别枚举 */
export enum Gender {
  FEMALE = 0,
  MALE = 1,
}

export const genderMap: Record<number, string> = {
  [Gender.MALE]: "男",
  [Gender.FEMALE]: "女",
};

/** 人证比对结果枚举 */
export enum CertificateAudit {
  FAIL = 0,
  PASS = 1,
}

export const certificateAuditMap: Record<number, { text: string; variant: "success" | "danger" }> = {
  [CertificateAudit.PASS]: { text: "认证比对通过", variant: "success" },
  [CertificateAudit.FAIL]: { text: "未开启认证比对或失败", variant: "danger" },
};

/** 人员审核状态枚举 */
export enum PersonnelCheckStatus {
  FAIL = 0,
  PASS = 1,
  PENDING = 2,
}

export const personnelCheckStatusMap: Record<number, { text: string; variant: "success" | "warning" | "danger" }> = {
  [PersonnelCheckStatus.PASS]: { text: "审核通过", variant: "success" },
  [PersonnelCheckStatus.PENDING]: { text: "审核中", variant: "warning" },
  [PersonnelCheckStatus.FAIL]: { text: "审核不通过", variant: "danger" },
};

/** 是否需调整枚举 */
export enum NeedAdjust {
  NO = 0,
  YES = 1,
}

export const needAdjustMap: Record<number, string> = {
  [NeedAdjust.YES]: "需要",
  [NeedAdjust.NO]: "不需要",
};
