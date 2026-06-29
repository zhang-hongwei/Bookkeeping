import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Table from "@/components/ui/Table";
import { ColumnItem } from "@/components/ui/Table/types";

interface Invoice {
  id: string;
  category: string;
  price: string;
  status: "Paid" | "Progress" | "Out of date";
  statusColor: string;
}

interface NewInvoicesCardProps {
  invoices: Invoice[];
}

export function NewInvoicesCard({ invoices }: NewInvoicesCardProps) {
  // Table columns configuration
  const columns: ColumnItem[] = [
    {
      key: "id",
      dataIndex: "id",
      title: "Invoice ID",
      width: 150,
    },
    {
      key: "category",
      dataIndex: "category",
      title: "Category",
      width: 150,
    },
    {
      key: "price",
      dataIndex: "price",
      title: "Price",
      width: 120,
    },
    {
      key: "status",
      dataIndex: "status",
      title: "Status",
      width: 150,
      render: (value: string) => (
        <Chip
          label={value}
          size="small"
          sx={{
            bgcolor:
              value === "Paid"
                ? "#D8F5E6"
                : value === "Progress"
                  ? "#FFF4D9"
                  : "#FFE7D9",
            color:
              value === "Paid"
                ? "#00AB55"
                : value === "Progress"
                  ? "#FFAB00"
                  : "#FF5630",
            fontWeight: 600,
            borderRadius: 1,
          }}
        />
      ),
    },
    {
      key: "actions",
      dataIndex: "actions",
      title: "",
      width: 80,
      align: "right",
      render: () => (
        <IconButton size="small">
          <MoreVertIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <Card>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ px: 3, pt: 3, pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            New Invoices
          </Typography>
        </Box>
        <Box sx={{ px: 3 }}>
          <Table
            columns={columns}
            dataSource={invoices}
            rowKey="id"
            height="auto"
          />
        </Box>
        <Box sx={{ px: 3, py: 2, textAlign: "center" }}>
          <Button
            endIcon={<ArrowForwardIcon />}
            sx={{ textTransform: "none" }}
          >
            View all
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}