import { Stack, Typography, Avatar } from "@mui/material";
import noDataPng from "./noData/noData.png";
import noData9Png from "./noData/noData9.png";
import noData9_darkPng from "./noData/noData9_dark.png";
import NextImage from "next/image";

const Empty = (props: any) => {
  const { sx = {}, type = "noData", text = "", textWidth } = props;

  const getImgByType = (type: string) => {
    let src = noDataPng;
    let msg = "暂无数据";
    switch (type) {
      case "noData":
        src = noData9Png;
        msg = "暂无数据";
        break;
      case "noData1":
        src = noDataPng;
        msg = "暂无数据";
        break;
      case "noData9_dark":
        src = noData9_darkPng;
        msg = "暂无数据";
        break;
      default:
        src = noDataPng;
        msg = "暂无数据";
        break;
    }
    return { src, msg };
  };

  return (
    <Stack
      className="no-data"
      spacing={1}
      sx={{
        justifyContent: "center",
        alignItems: "center",
        width: "fit-content",
        maxWidth: "100%",
        minWidth: 0,
        height: "100%",
        minHeight: "300px",
        flex: "none", // 防止flex容器无限增长
        display: "inline-flex",
        margin: "0 auto", // 水平居中
        ...sx,
      }}
    >
      <NextImage src={getImgByType(type).src} alt="" width={56} height={56} />
      <Typography
        variant="body2"
        sx={{
          textAlign: "center",
          width: textWidth || "auto",
          color: "rgba(255,255,255,0.5)",
        }}
      >
        {text || getImgByType(type).msg}
      </Typography>
    </Stack>
  );
};

export default Empty;
