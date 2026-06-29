"use client";

import React, { useEffect, useState } from "react";
import { Autocomplete, TextField } from "@mui/material";
import type { SelectPropsType, SelectOption } from "./type";
import { ArrowFilled } from "../icons";

function useSelectValue(
  options: SelectOption[],
  value: any,
  customKey: string,
  multiple: boolean
) {
  const [optionsValue, setOptionsValue] = useState<any>(multiple ? [] : null);

  useEffect(() => {
    if (options && options.length) {
      if (multiple && Array.isArray(value)) {
        setOptionsValue(
          options.filter((opt) => value.includes(opt[customKey]))
        );
      } else {
        setOptionsValue(
          options.find((opt) => opt[customKey] === value) || null
        );
      }
    } else {
      setOptionsValue(multiple ? [] : null);
    }
  }, [options, value, customKey, multiple]);

  return [optionsValue, setOptionsValue] as const;
}

const CustomizedSelect = <Multiple extends boolean = false>(
  props: SelectPropsType<Multiple>
) => {
  const {
    options = [],
    value,
    onChange,
    onBlur,
    placeholder = "",
    sx = {},
    errorText,
    required,
    customKey = "value",
    customLabel = "label",
    error,
    disabled,
    refresh,
    multiple = false as Multiple,
    disablePortal = true,
    disableclearable = false,
    color,
    customSlotProps = {},
    slotProps,
    label,
    ...rest
  } = props;

  const [optionsValue, setOptionsValue] = useSelectValue(
    options,
    value,
    customKey,
    multiple as boolean
  );

  const handleChange = (_: any, option: any) => {
    setOptionsValue(option);
    if (onChange) {
      onChange(
        multiple
          ? option.map((item: any) => item[customKey])
          : option?.[customKey] ?? null
      );
    }
  };

  const handleBlur = () => {
    if (onBlur) {
      onBlur(
        multiple
          ? optionsValue.map((item: any) => item[customKey])
          : optionsValue?.[customKey] ?? null
      );
    }
  };

  return (
    <Autocomplete
      id={rest.id}
      multiple={multiple as boolean}
      disablePortal={disablePortal}
      disableClearable={disableclearable}
      options={options}
      value={optionsValue}
      onChange={handleChange}
      onBlur={handleBlur}
      getOptionLabel={(option) => option?.[customLabel] ?? ""}
      renderOption={customSlotProps?.renderOption}
      popupIcon={<ArrowFilled sx={{ fontSize: '10px', color: 'rgba(99, 115, 129,0.5)' }} />}
      renderInput={
        customSlotProps?.renderInput ||
        ((params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            error={error}
            label={label}
          />
        ))
      }
      fullWidth
      disabled={disabled}
      sx={sx}
      slotProps={{
        paper: {
          sx: {
            boxShadow: 10,
          },
        },
        ...slotProps,
      }}
      {...rest}
    />
  );
};

export default CustomizedSelect;
