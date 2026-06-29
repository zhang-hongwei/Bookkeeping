import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
} from "@mui/material";
import type { Specification } from "../data";

interface SpecificationsTableProps {
  specifications: Specification[];
}

export function SpecificationsTable({
  specifications,
}: SpecificationsTableProps) {
  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ borderRadius: 2 }}
    >
      <Table>
        <TableBody>
          {specifications.map((spec, index) => (
            <TableRow
              key={index}
              sx={{
                "&:last-child td": { border: 0 },
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <TableCell
                component="th"
                scope="row"
                sx={{
                  width: "40%",
                  fontWeight: 500,
                  color: "text.secondary",
                }}
              >
                {spec.label}
              </TableCell>
              <TableCell sx={{ color: "text.primary" }}>
                {spec.value}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
