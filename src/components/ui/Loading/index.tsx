import React, { useState, useEffect } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Backdrop,
  keyframes,
  styled,
} from "@mui/material";
import { LoadingPropsType, LoadingVariant, LoadingSize } from "./index.d";

// 动画定义
const pulseAnimation = keyframes`
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.7; }
    100% { transform: scale(1); opacity: 1; }
`;

const dotsAnimation = keyframes`
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
`;

const barsAnimation = keyframes`
    0%, 40%, 100% { transform: scaleY(0.4); }
    20% { transform: scaleY(1.0); }
`;

const rippleAnimation = keyframes`
    0% { transform: scale(0); opacity: 1; }
    100% { transform: scale(4); opacity: 0; }
`;

// 样式化组件
const DotsContainer = styled(Box)({
  display: "flex",
  gap: "4px",
  alignItems: "center",
});

const Dot = styled(Box)<{ delay: number; color: string; size: number }>(
  ({ delay, color, size }) => ({
    width: size,
    height: size,
    borderRadius: "50%",
    backgroundColor: color,
    animation: `${dotsAnimation} 1.4s ease-in-out ${delay}s infinite both`,
  })
);

const BarsContainer = styled(Box)({
  display: "flex",
  gap: "2px",
  alignItems: "center",
  height: "40px",
});

const Bar = styled(Box)<{ delay: number; color: string; width: number }>(
  ({ delay, color, width }) => ({
    width: width,
    height: "100%",
    backgroundColor: color,
    animation: `${barsAnimation} 1.2s ease-in-out ${delay}s infinite`,
  })
);

const PulseContainer = styled(Box)<{ color: string; size: number }>(
  ({ color, size }) => ({
    width: size,
    height: size,
    borderRadius: "50%",
    backgroundColor: color,
    animation: `${pulseAnimation} 2s ease-in-out infinite`,
  })
);

const RippleContainer = styled(Box)({
  position: "relative",
  display: "inline-block",
});

const RippleCircle = styled(Box)<{
  delay: number;
  color: string;
  size: number;
}>(({ delay, color, size }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  width: size,
  height: size,
  borderRadius: "50%",
  border: `2px solid ${color}`,
  animation: `${rippleAnimation} 2s ease-out ${delay}s infinite`,
}));

// 获取尺寸数值
const getSizeValue = (size: LoadingSize): number => {
  if (typeof size === "number") return size;
  switch (size) {
    case "small":
      return 20;
    case "medium":
      return 40;
    case "large":
      return 60;
    default:
      return 40;
  }
};

// 加载器组件
const LoaderComponent: React.FC<{
  variant: LoadingVariant;
  size: LoadingSize;
  color: string;
}> = ({ variant, size, color }) => {
  const sizeValue = getSizeValue(size);

  switch (variant) {
    case "dots":
      const dotSize = Math.max(4, sizeValue / 6);
      return (
        <DotsContainer>
          <Dot delay={0} color={color} size={dotSize} />
          <Dot delay={0.16} color={color} size={dotSize} />
          <Dot delay={0.32} color={color} size={dotSize} />
        </DotsContainer>
      );

    case "bars":
      const barWidth = Math.max(3, sizeValue / 8);
      return (
        <BarsContainer sx={{ height: sizeValue }}>
          <Bar delay={0} color={color} width={barWidth} />
          <Bar delay={0.1} color={color} width={barWidth} />
          <Bar delay={0.2} color={color} width={barWidth} />
          <Bar delay={0.3} color={color} width={barWidth} />
        </BarsContainer>
      );

    case "pulse":
      return <PulseContainer color={color} size={sizeValue} />;

    case "ripple":
      return (
        <RippleContainer sx={{ width: sizeValue, height: sizeValue }}>
          <RippleCircle delay={0} color={color} size={sizeValue} />
          <RippleCircle delay={1} color={color} size={sizeValue} />
        </RippleContainer>
      );

    case "spinner":
    default:
      return <CircularProgress size={sizeValue} sx={{ color: color }} />;
  }
};

const Loading: React.FC<LoadingPropsType> = ({
  loading = false,
  children,
  variant = "spinner",
  size = "medium",
  color = "#1976d2",
  text,
  textPosition = "bottom",
  position = "center",
  backgroundMode = "overlay",
  fullscreen = false,
  minHeight = 100,
  delay = 0,
  sx,
  customLoader,
}) => {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      if (delay > 0) {
        timer = setTimeout(() => setShowLoading(true), delay);
      } else {
        setShowLoading(true);
      }
    } else {
      setShowLoading(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [loading, delay]);

  // 获取 Backdrop 样式
  const getBackdropStyles = () => {
    const baseStyles = {
      display: "flex",
      alignItems:
        position === "center"
          ? "center"
          : position === "top"
            ? "flex-start"
            : "flex-end",
      justifyContent: "center",
      paddingTop: position === "top" ? 2 : 0,
      paddingBottom: position === "bottom" ? 2 : 0,
      zIndex: fullscreen ? undefined : 1000,
    };

    switch (backgroundMode) {
      case "overlay":
        return {
          ...baseStyles,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        };
      case "blur":
        return {
          ...baseStyles,
          backdropFilter: "blur(4px)",
          backgroundColor: "rgba(0, 0, 0, 0.3)",
        };
      case "transparent":
        return {
          ...baseStyles,
          backgroundColor: "transparent",
        };
      case "none":
        return {
          ...baseStyles,
          backgroundColor: "transparent",
        };
      default:
        return {
          ...baseStyles,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        };
    }
  };

  // 加载器内容
  const LoaderContent = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection:
          textPosition === "top" || textPosition === "bottom"
            ? "column"
            : "row",
        alignItems: "center",
        gap: 1,
      }}
    >
      {text && textPosition === "top" && (
        <Typography variant="body2" color="text.secondary">
          {text}
        </Typography>
      )}
      {textPosition === "left" && text && (
        <Typography variant="body2" color="text.secondary">
          {text}
        </Typography>
      )}

      {customLoader || (
        <LoaderComponent variant={variant} size={size} color={color} />
      )}

      {textPosition === "right" && text && (
        <Typography variant="body2" color="text.secondary">
          {text}
        </Typography>
      )}
      {text && textPosition === "bottom" && (
        <Typography variant="body2" color="text.secondary">
          {text}
        </Typography>
      )}
    </Box>
  );

  // 全屏模式
  if (fullscreen) {
    return (
      <Backdrop open={showLoading} sx={getBackdropStyles()}>
        <LoaderContent />
      </Backdrop>
    );
  }

  // 普通模式 - 使用局部 Backdrop
  return (
    <Box
      sx={{
        position: "relative",
        minHeight: showLoading ? minHeight : "auto",
        height: "100%",
        ...sx,
      }}
    >
      {showLoading && (
        <Backdrop
          open={showLoading}
          sx={{
            position: "absolute",
            ...getBackdropStyles(),
          }}
        >
          <LoaderContent />
        </Backdrop>
      )}
      {children}
    </Box>
  );
};

export default Loading;