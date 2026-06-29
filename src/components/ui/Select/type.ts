import type { SxProps } from '@mui/material/styles';
import type { AutocompleteProps } from '@mui/material/Autocomplete';
import type { ReactNode } from 'react';

export interface SelectOption {
  label: string;
  value: string | number;
  [key: string]: any;
}

export interface SelectPropsType<Multiple extends boolean = false> {
  type?: 'text' | 'number' | 'date' | string;
  options?: readonly SelectOption[] | SelectOption[];
  onChange?: (value: Multiple extends true ? (string | number)[] : string | number | null) => void;
  onBlur?: (value: Multiple extends true ? (string | number)[] : string | number | null) => void;
  placeholder?: string;
  value?: Multiple extends true ? (string | number)[] : string | number | null;
  sx?: SxProps;
  errorText?: string | ReactNode;
  label?: string | ReactNode;
  required?: boolean;
  customLabel?: string;
  customKey?: string;
  error?: boolean;
  name?: string;
  url?: string;
  id?: string;
  field?: string;
  disabled?: boolean;
  refresh?: boolean;
  defaultValue?: any;
  multiple?: Multiple;
  disablePortal?: boolean;
  disableclearable?: boolean;
  componentsProps?: any;
  customSlotProps?: any;
  limitTags?: number;
  color?: string;
  className?: string;
  dark?: boolean;
}