import { mergeClasses } from '@/utils/classes';

import { styled } from '@mui/material/styles';

import { layoutClasses } from './classes';

import Stack from '@mui/material/Stack';

// ----------------------------------------------------------------------

export type MainSectionProps = React.ComponentProps<typeof MainRoot>;

export function MainSection({ children, className, sx, ...other }: MainSectionProps) {
  return (
    <MainRoot
      className={mergeClasses([layoutClasses.main, className])}
      sx={sx}
      px={4}
      py={2}
      {...other}>
      {children}
    </MainRoot>
  );
}

// ----------------------------------------------------------------------

const MainRoot = styled(Stack)();
