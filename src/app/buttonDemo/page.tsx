import { Button, Stack, Typography, Divider } from "@mui/material";

const ButtonDemo = () => {
  return (
    <Stack
      sx={{
        width: "100vw",
        minHeight: "100vh",
        p: 4,
      }}
      spacing={3}
    >
      <Typography variant="h4">Button Variants Demo</Typography>

      <Divider />

      <Stack spacing={2}>
        <Typography variant="h6">自定义 Dashed Variant - 所有颜色</Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Button variant="dashed" color="primary">
            Primary
          </Button>
          <Button variant="dashed" color="secondary">
            Secondary
          </Button>
          <Button variant="dashed" color="success">
            Success
          </Button>
          <Button variant="dashed" color="error">
            Error
          </Button>
          <Button variant="dashed" color="info">
            Info
          </Button>
          <Button variant="dashed" color="warning">
            Warning
          </Button>
          <Button variant="dashed" color="inherit">
            Inherit
          </Button>
        </Stack>
      </Stack>

      <Divider />

      <Stack spacing={2}>
        <Typography variant="h6">Dashed vs Outlined 颜色对比</Typography>
        <Stack spacing={1}>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Button variant="outlined" color="primary">
              Outlined Primary
            </Button>
            <Button variant="dashed" color="primary">
              Dashed Primary
            </Button>
          </Stack>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Button variant="outlined" color="error">
              Outlined Error
            </Button>
            <Button variant="dashed" color="error">
              Dashed Error
            </Button>
          </Stack>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Button variant="outlined" color="info">
              Outlined Info
            </Button>
            <Button variant="dashed" color="info">
              Dashed Info
            </Button>
          </Stack>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Button variant="outlined" color="success">
              Outlined Success
            </Button>
            <Button variant="dashed" color="success">
              Dashed Success
            </Button>
          </Stack>
        </Stack>
      </Stack>

      <Divider />

      <Stack spacing={2}>
        <Typography variant="h6">标准 Variants</Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Button variant="contained">Contained</Button>
          <Button variant="outlined">Outlined</Button>
          <Button variant="text">Text</Button>
          <Button variant="dashed">Dashed (Custom)</Button>
        </Stack>
      </Stack>

      <Divider />

      <Stack spacing={2}>
        <Typography variant="h6">不同颜色</Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Button variant="contained" color="primary">
            Primary
          </Button>
          <Button variant="contained" color="secondary">
            Secondary
          </Button>
          <Button variant="contained" color="success">
            Success
          </Button>
          <Button variant="contained" color="error">
            Error
          </Button>
          <Button variant="contained" color="info">
            Info
          </Button>
          <Button variant="contained" color="warning">
            Warning
          </Button>
        </Stack>
      </Stack>

      <Divider />

      <Stack spacing={2}>
        <Typography variant="h6">不同尺寸</Typography>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <Button variant="contained" size="small">
            Small
          </Button>
          <Button variant="contained" size="medium">
            Medium
          </Button>
          <Button variant="contained" size="large">
            Large
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default ButtonDemo;
