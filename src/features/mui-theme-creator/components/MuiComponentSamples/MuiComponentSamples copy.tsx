import React from "react";
import { Typography, Button, Grid } from "@mui/material";
import { styled } from "@mui/material/styles";

import componentSamples from "./Samples";

// 优化：使用 React.memo 防止不必要的重渲染
const SampleItem = React.memo(
  styled("div")(({ theme }) => ({
    marginBottom: theme.spacing(10),
    width: "100%",
    maxWidth: 1000,
    paddingLeft: theme.spacing(4),
    margin: "auto",
  }))
);

const SampleContainer = React.memo(
  styled("div")(({ theme }) => ({
    maxWidth: 1000,
    padding: theme.spacing(),
    margin: "auto",
  }))
);

// 优化：使用 React.memo 包装整个组件
const MuiComponentSamples = React.memo(() => {
  return (
    <SampleContainer
      sx={{
        border: "1px solid red",
      }}
    >
      <Typography variant="h4" gutterBottom>
        Material-UI Components
      </Typography>
      {componentSamples.map(({ id, title, component, docs }) => (
        <div key={id} id={id}>
          <Grid container justifyContent="space-between" alignItems="center">
            <Typography variant="h5" gutterBottom>
              {title}
            </Typography>
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              href={docs}
              target="_blank"
              rel="noreferrer"
            >
              Docs
            </Button>
          </Grid>
          <SampleItem>{component}</SampleItem>
        </div>
      ))}
    </SampleContainer>
  );
});

export default MuiComponentSamples;
