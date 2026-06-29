/**
 * GridControls Component
 * Control panel for columns, rows, gaps, and code generation
 */

import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Code as CodeIcon, Refresh as RefreshIcon, Lock as LockIcon, LockOpen as LockOpenIcon } from "@mui/icons-material";
import { useGridGeneratorStore } from "../../store/gridGeneratorStore";
import CodeOutput from "../CodeOutput";

export default function GridControls() {
  const [showCodeModal, setShowCodeModal] = useState(false);

  const {
    columns,
    rows,
    columnGap,
    rowGap,
    gapLinked,
    updateColumns,
    updateRows,
    updateColumnGap,
    updateRowGap,
    toggleGapLink,
    resetGrid,
  } = useGridGeneratorStore();

  return (
    <Box
      sx={{
        p: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="h6" gutterBottom>
        Grid Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure your grid structure
      </Typography>

      <Stack spacing={2.5}>
        {/* Columns & Rows */}
        <Stack direction="row" spacing={2}>
          <TextField
            label="Columns"
            type="number"
            slotProps={{ htmlInput: { min: 0, max: 12 } }}
            value={columns}
            onChange={(e) => updateColumns(Number(e.target.value))}
            size="small"
            fullWidth
          />
          <TextField
            label="Rows"
            type="number"
            slotProps={{ htmlInput: { min: 0, max: 12 } }}
            value={rows}
            onChange={(e) => updateRows(Number(e.target.value))}
            size="small"
            fullWidth
          />
        </Stack>

        {/* Column Gap & Row Gap with link lock */}
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            label="Column Gap (px)"
            type="number"
            slotProps={{ htmlInput: { min: 0, max: 50 } }}
            value={columnGap}
            onChange={(e) => updateColumnGap(Number(e.target.value))}
            size="small"
            fullWidth
          />
          <Tooltip title={gapLinked ? "Unlink gaps" : "Link gaps"} arrow>
            <IconButton
              size="small"
              onClick={toggleGapLink}
              sx={{ color: gapLinked ? "primary.main" : "text.disabled" }}
            >
              {gapLinked ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <TextField
            label="Row Gap (px)"
            type="number"
            slotProps={{ htmlInput: { min: 0, max: 50 } }}
            value={rowGap}
            onChange={(e) => updateRowGap(Number(e.target.value))}
            size="small"
            fullWidth
            disabled={gapLinked}
          />
        </Stack>
      </Stack>

      {/* Action Buttons */}
      <Box sx={{ mt: "auto", pt: 3 }}>
        <Stack spacing={1.5}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CodeIcon />}
            onClick={() => setShowCodeModal(true)}
            fullWidth
          >
            Generate Code
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={resetGrid}
            fullWidth
          >
            Reset
          </Button>
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 3,
            cursor: "pointer",
            "&:hover": {
              color: "primary.main",
            },
          }}
          onClick={() =>
            alert(
              "CSS Grid Generator - A tool for creating CSS Grid layouts visually. Original by Sarah Drasner."
            )
          }
        >
          What is this project?
        </Typography>
      </Box>

      {/* Code Modal */}
      <CodeOutput
        open={showCodeModal}
        onClose={() => setShowCodeModal(false)}
      />
    </Box >
  );
}
