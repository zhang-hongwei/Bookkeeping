"use client";

import { useState, useEffect } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/zh-cn";
import { HiCalendarDays } from "react-icons/hi2";

// Set dayjs to Chinese locale
dayjs.locale("zh-cn");

interface DatePickerProps {
  value?: string;
  onChange?: (date: string) => void;
  placement?:
    | "bottom"
    | "bottom-end"
    | "bottom-start"
    | "top"
    | "top-end"
    | "top-start";
}

const CustomDatePicker = ({
  value,
  onChange,
  placement = "bottom-end",
}: DatePickerProps) => {
  const [selected, setSelected] = useState<Dayjs | null>(null);
  const [tempSelected, setTempSelected] = useState<Dayjs | null>(null);
  const [open, setOpen] = useState(false);

  // Sync external value to internal state
  useEffect(() => {
    if (value) {
      const date = dayjs(value);
      if (date.isValid()) {
        setSelected(date);
        setTempSelected(date);
      }
    } else {
      setSelected(null);
      setTempSelected(null);
    }
  }, [value]);

  const handleDateChange = (newValue: Dayjs | null) => {
    setTempSelected(newValue);
  };

  const handleCancel = () => {
    setTempSelected(selected);
    setOpen(false);
  };

  const handleOpen = () => {
    setTempSelected(selected);
    setOpen(true);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-cn">
      <DatePicker
        value={open ? tempSelected : selected}
        onChange={handleDateChange}
        open={open}
        onOpen={handleOpen}
        onClose={handleCancel}
        onAccept={(value) => {
          console.log("onAccept called", value?.format("YYYY-MM-DD"));
          setTempSelected(value);
          setSelected(value);
          if (onChange && value) {
            const dateString = value.format("YYYY-MM-DD");
            onChange(dateString);
          } else if (onChange) {
            onChange("");
          }
          setOpen(false);
        }}
        closeOnSelect={false}
        format="YYYY/MM/DD"
        slotProps={{
          textField: {
            onClick: handleOpen,
            placeholder: "请选择日期",
            InputProps: {
              readOnly: true,
              endAdornment: (
                <HiCalendarDays
                  size={20}
                  color="#00ABFF"
                  style={{ cursor: "pointer" }}
                />
              ),
              sx: {
                height: "1.75rem",
                width: "11.875rem",
                background:
                  "linear-gradient( 322deg, rgba(0,33,130,0.18) 0%, rgba(0,20,71,0.09) 100%), linear-gradient( 180deg, rgba(0,115,250,0.2) 0%, rgba(1,45,97,0.08) 54%, rgba(2,13,25,0.02) 100%, rgba(2,6,6,0.01) 100%), rgba(12,5,21,0.8)",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(0,103,250,0.4) !important",
                },
                "& .MuiOutlinedInput-input::placeholder": {
                  color: "#9AA6BA",
                  opacity: 1,
                },
              },
            },
          },
          actionBar: {
            actions: ["today", "cancel", "accept"],
            sx: {
              borderTop: "1px solid rgba(255,255,255,0.08)",
            },
          },
          day: {
            sx: {
              borderRadius: "1px", // 设置为方形，而不是圆形
            },
          },
          calendarHeader: {
            sx: {
              position: "relative", // 为绝对定位的子元素提供定位上下文
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingLeft: "1rem",
              paddingRight: "1rem",
              paddingTop: ".5rem",
              paddingBottom: ".5rem",
              "& .MuiPickersCalendarHeader-labelContainer": {
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)", // 真正的居中

                zIndex: 1, // 确保在箭头按钮之上
              },
              "& .MuiPickersArrowSwitcher-root": {
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                margin: 0,
                position: "relative",
                zIndex: 0,
              },
            },
          },
          popper: {
            placement: placement,
            modifiers: [
              {
                name: "offset",
                options: {
                  offset: [0, 8],
                },
              },
              {
                name: "preventOverflow",
                options: {
                  boundary: "viewport",
                  padding: "1rem",
                },
              },
              {
                name: "flip",
                options: {
                  fallbackPlacements: placement.startsWith("bottom")
                    ? ["top", "top-start", "top-end"]
                    : ["bottom", "bottom-start", "bottom-end"],
                },
              },
            ],
          },
        }}
        localeText={{
          cancelButtonLabel: "取消",
          okButtonLabel: "确定",
          todayButtonLabel: "今天",
        }}
      />
    </LocalizationProvider>
  );
};

export default CustomDatePicker;
