import type { Components, Theme } from "@mui/material/styles";

/**
 * TypeScript 类型声明：添加自定义 variant
 */
declare module "@mui/material/Button" {
  interface ButtonPropsVariantOverrides {
    dashed: true;
  }
}

/**
 * MUI Button 组件的主题定制配置
 *
 * Button 组件属性（来自 Button.d.ts）：
 * - children: React.ReactNode - 按钮内容
 * - classes: Partial<ButtonClasses> - 自定义样式类
 * - color: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' - 颜色主题
 * - disabled: boolean - 是否禁用
 * - disableElevation: boolean - 是否禁用阴影
 * - disableFocusRipple: boolean - 是否禁用键盘焦点涟漪
 * - endIcon: React.ReactNode - 结束图标
 * - fullWidth: boolean - 是否占满容器宽度
 * - href: string - 链接地址（会渲染为 a 标签）
 * - loading: boolean | null - 是否显示加载状态
 * - loadingIndicator: React.ReactNode - 自定义加载指示器
 * - loadingPosition: 'start' | 'end' | 'center' - 加载指示器位置
 * - size: 'small' | 'medium' | 'large' - 按钮尺寸
 * - startIcon: React.ReactNode - 起始图标
 * - sx: SxProps<Theme> - MUI sx 样式属性
 * - variant: 'text' | 'outlined' | 'contained' - 按钮变体
 *
 * ButtonBase 继承属性（来自 ButtonBase.d.ts）：
 * - action: React.Ref<ButtonBaseActions> - 命令式操作引用
 * - centerRipple: boolean - 涟漪是否居中
 * - disableRipple: boolean - 是否禁用涟漪效果
 * - disableTouchRipple: boolean - 是否禁用触摸涟漪
 * - focusRipple: boolean - 是否启用焦点涟漪
 * - focusVisibleClassName: string - 键盘焦点可见时的类名
 * - LinkComponent: React.ElementType - 自定义链接组件
 * - onFocusVisible: React.FocusEventHandler - 键盘焦点事件
 * - tabIndex: number - Tab 键索引
 * - TouchRippleProps: Partial<TouchRippleProps> - 触摸涟漪属性
 * - touchRippleRef: React.Ref<TouchRippleActions> - 触摸涟漪引用
 */
export const MuiButton: Components<Theme>["MuiButton"] = {
  defaultProps: {
    // ===== Button 特有属性 =====

    // 颜色主题：'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning'
    // color: 'primary',

    // 是否禁用
    // disabled: false,

    // 是否禁用阴影（推荐设置为 true 以获得更扁平的设计）
    disableElevation: true,

    // 是否禁用键盘焦点涟漪
    // disableFocusRipple: false,

    // 结束图标（放在文本后面的图标）
    // endIcon: null,

    // 是否占满容器宽度
    // fullWidth: false,

    // 链接地址（设置后按钮会渲染为 <a> 标签）
    // href: undefined,

    // 加载状态
    // loading: null,

    // 自定义加载指示器（默认是 CircularProgress）
    // loadingIndicator: <CircularProgress color="inherit" size={16} />,

    // 加载指示器位置：'start' | 'end' | 'center'
    // loadingPosition: 'center',

    // 按钮尺寸：'small' | 'medium' | 'large'
    // size: 'medium',

    // 起始图标（放在文本前面的图标）
    // startIcon: null,

    // 按钮变体：'text' | 'outlined' | 'contained'
    // variant: 'text',

    // ===== ButtonBase 继承属性 =====

    // 涟漪是否从中心开始（而不是从点击位置）
    // centerRipple: false,

    // 是否禁用涟漪效果
    // disableRipple: false,

    // 是否禁用触摸涟漪
    // disableTouchRipple: false,

    // 是否启用键盘焦点涟漪
    // focusRipple: false,

    // Tab 键索引
    // tabIndex: 0,

    // 自定义链接组件（当使用 href 时）
    // LinkComponent: 'a',
  },

  styleOverrides: {
    root: ({ theme }) => ({
      variants: [
        {
          // 基础样式：所有 dashed variant 都应用
          props: { variant: "dashed" },
          style: {
            textTransform: "none",
            border: `2px dashed`,
            backgroundColor: "transparent",
          },
        },
        {
          // dashed + primary
          props: { variant: "dashed", color: "primary" },
          style: {
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.main,
            "&:hover": {
              backgroundColor: theme.palette.primary.main + "0A", // 4% opacity
              borderColor: theme.palette.primary.dark,
            },
          },
        },
        {
          // dashed + secondary
          props: { variant: "dashed", color: "secondary" },
          style: {
            borderColor: theme.palette.secondary.main,
            color: theme.palette.secondary.main,
            "&:hover": {
              backgroundColor: theme.palette.secondary.main + "0A",
              borderColor: theme.palette.secondary.dark,
            },
          },
        },
        {
          // dashed + error
          props: { variant: "dashed", color: "error" },
          style: {
            borderColor: theme.palette.error.main,
            color: theme.palette.error.main,
            "&:hover": {
              backgroundColor: theme.palette.error.main + "0A",
              borderColor: theme.palette.error.dark,
            },
          },
        },
        {
          // dashed + warning
          props: { variant: "dashed", color: "warning" },
          style: {
            borderColor: theme.palette.warning.main,
            color: theme.palette.warning.main,
            "&:hover": {
              backgroundColor: theme.palette.warning.main + "0A",
              borderColor: theme.palette.warning.dark,
            },
          },
        },
        {
          // dashed + info
          props: { variant: "dashed", color: "info" },
          style: {
            borderColor: theme.palette.info.main,
            color: theme.palette.info.main,
            "&:hover": {
              backgroundColor: theme.palette.info.main + "0A",
              borderColor: theme.palette.info.dark,
            },
          },
        },
        {
          // dashed + success
          props: { variant: "dashed", color: "success" },
          style: {
            borderColor: theme.palette.success.main,
            color: theme.palette.success.main,
            "&:hover": {
              backgroundColor: theme.palette.success.main + "0A",
              borderColor: theme.palette.success.dark,
            },
          },
        },
        {
          // dashed + inherit
          props: { variant: "dashed", color: "inherit" },
          style: {
            borderColor: "currentColor",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
            },
          },
        },
      ],
    }),
    // root: 按钮根元素样式
    // root: ({ theme, ownerState }) => ({
    //   // 可以根据 ownerState.variant, ownerState.color, ownerState.size 等属性定制样式
    // }),

    // text: text 变体样式
    // text: {},

    // outlined: outlined 变体样式
    // outlined: {},

    // contained: contained 变体样式
    // contained: {},

    // containedInherit: contained inherit 颜色样式
    // containedInherit: {},

    // containedPrimary: contained primary 颜色样式
    // containedPrimary: {},

    // containedSecondary: contained secondary 颜色样式
    // containedSecondary: {},

    // containedSuccess: contained success 颜色样式
    // containedSuccess: {},

    // containedError: contained error 颜色样式
    // containedError: {},

    // containedInfo: contained info 颜色样式
    // containedInfo: {},

    // containedWarning: contained warning 颜色样式
    // containedWarning: {},

    // outlinedInherit: outlined inherit 颜色样式
    // outlinedInherit: {},

    // outlinedPrimary: outlined primary 颜色样式
    // outlinedPrimary: {},

    // outlinedSecondary: outlined secondary 颜色样式
    // outlinedSecondary: {},

    // outlinedSuccess: outlined success 颜色样式
    // outlinedSuccess: {},

    // outlinedError: outlined error 颜色样式
    // outlinedError: {},

    // outlinedInfo: outlined info 颜色样式
    // outlinedInfo: {},

    // outlinedWarning: outlined warning 颜色样式
    // outlinedWarning: {},

    // textInherit: text inherit 颜色样式
    // textInherit: {},

    // textPrimary: text primary 颜色样式
    // textPrimary: {},

    // textSecondary: text secondary 颜色样式
    // textSecondary: {},

    // textSuccess: text success 颜色样式
    // textSuccess: {},

    // textError: text error 颜色样式
    // textError: {},

    // textInfo: text info 颜色样式
    // textInfo: {},

    // textWarning: text warning 颜色样式
    // textWarning: {},

    // sizeSmall: small 尺寸样式
    // sizeSmall: {},

    // sizeMedium: medium 尺寸样式
    // sizeMedium: {},

    // sizeLarge: large 尺寸样式
    // sizeLarge: {},

    // fullWidth: 全宽样式
    // fullWidth: {},

    // startIcon: 起始图标样式
    // startIcon: {},

    // endIcon: 结束图标样式
    // endIcon: {},

    // iconSizeSmall: small 尺寸图标样式
    // iconSizeSmall: {},

    // iconSizeMedium: medium 尺寸图标样式
    // iconSizeMedium: {},

    // iconSizeLarge: large 尺寸图标样式
    // iconSizeLarge: {},

    // disabled: 禁用状态样式
    // disabled: {},

    // loading: 加载状态样式
    // loading: {},

    // loadingIndicator: 加载指示器样式
    // loadingIndicator: {},

    // loadingIndicatorStart: start 位置加载指示器样式
    // loadingIndicatorStart: {},

    // loadingIndicatorCenter: center 位置加载指示器样式
    // loadingIndicatorCenter: {},

    // loadingIndicatorEnd: end 位置加载指示器样式
    // loadingIndicatorEnd: {},

    // endIconLoadingEnd: end 位置加载时的结束图标样式
    // endIconLoadingEnd: {},

    // startIconLoadingStart: start 位置加载时的起始图标样式
    // startIconLoadingStart: {},
  },
};
