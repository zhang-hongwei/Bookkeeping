"use client";

import {
  Container,
  Card,
  Box,
  Typography,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Select,
  MenuItem,
  FormControl,
  Avatar,
  Button,
  LinearProgress,
  Checkbox,
} from "@mui/material";
import Table from "@/components/ui/Table";
import { ColumnItem } from "@/components/ui/Table/types";
import SearchIcon from "@mui/icons-material/Search";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import FilterListIcon from "@mui/icons-material/FilterList";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import SettingsIcon from "@mui/icons-material/Settings";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useState } from "react";

// Product data interface
interface ProductData {
  id: string;
  name: string;
  category: string;
  image: string;
  createAt: string;
  createTime: string;
  stock: number;
  stockStatus: "out of stock" | "low stock" | "in stock";
  price: string;
  publish: "Draft" | "Published";
}

// Mock data
const mockProducts: ProductData[] = [
  {
    id: "1",
    name: "Urban Explorer Sneakers",
    category: "Accessories",
    image: "/products/1.jpg",
    createAt: "19 oct. 2025",
    createTime: "10:15 pm",
    stock: 0,
    stockStatus: "out of stock",
    price: "83,74 €",
    publish: "Draft",
  },
  {
    id: "2",
    name: "Classic Leather Loafers",
    category: "Shose",
    image: "/products/2.jpg",
    createAt: "18 oct. 2025",
    createTime: "9:15 pm",
    stock: 72,
    stockStatus: "in stock",
    price: "97,14 €",
    publish: "Published",
  },
  {
    id: "3",
    name: "Mountain Trekking Boots",
    category: "Apparel",
    image: "/products/3.jpg",
    createAt: "17 oct. 2025",
    createTime: "8:15 pm",
    stock: 10,
    stockStatus: "low stock",
    price: "68,71 €",
    publish: "Published",
  },
  {
    id: "4",
    name: "Elegance Stiletto Heels",
    category: "Shose",
    image: "/products/4.jpg",
    createAt: "16 oct. 2025",
    createTime: "7:15 pm",
    stock: 72,
    stockStatus: "in stock",
    price: "85,21 €",
    publish: "Draft",
  },
  {
    id: "5",
    name: "Comfy Running Shoes",
    category: "Apparel",
    image: "/products/5.jpg",
    createAt: "15 oct. 2025",
    createTime: "6:15 pm",
    stock: 10,
    stockStatus: "low stock",
    price: "52,17 €",
    publish: "Published",
  },
  {
    id: "6",
    name: "Chic Ballet Flats",
    category: "Shose",
    image: "/products/6.jpg",
    createAt: "14 oct. 2025",
    createTime: "5:15 pm",
    stock: 72,
    stockStatus: "in stock",
    price: "25,18 €",
    publish: "Published",
  },
  {
    id: "7",
    name: "Vintage Oxford Shoes",
    category: "Accessories",
    image: "/products/7.jpg",
    createAt: "13 oct. 2025",
    createTime: "4:15 pm",
    stock: 0,
    stockStatus: "out of stock",
    price: "43,84 €",
    publish: "Draft",
  },
  {
    id: "8",
    name: "Waterproof Hiking Boots",
    category: "Shose",
    image: "/products/8.jpg",
    createAt: "12 oct. 2025",
    createTime: "3:15 pm",
    stock: 72,
    stockStatus: "in stock",
    price: "60,98 €",
    publish: "Published",
  },
  {
    id: "9",
    name: "Casual Slip-On Sneakers",
    category: "Apparel",
    image: "/products/9.jpg",
    createAt: "11 oct. 2025",
    createTime: "2:15 pm",
    stock: 10,
    stockStatus: "low stock",
    price: "98,42 €",
    publish: "Published",
  },
];

export default function ProductPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [stockFilter, setStockFilter] = useState("Stock");
  const [publishFilter, setPublishFilter] = useState("Publish");

  // Filter products
  const getFilteredProducts = () => {
    let filtered = mockProducts;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by stock
    if (stockFilter !== "Stock") {
      filtered = filtered.filter(
        (product) => product.stockStatus === stockFilter
      );
    }

    // Filter by publish status
    if (publishFilter !== "Publish") {
      filtered = filtered.filter(
        (product) => product.publish === publishFilter
      );
    }

    return filtered;
  };

  const filteredProducts = getFilteredProducts();

  // Handle select all
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = filteredProducts.map((product) => product.id);
      setSelectedRows(newSelected);
    } else {
      setSelectedRows([]);
    }
  };

  // Handle individual row selection
  const handleSelectRow = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  // Is all selected
  const isAllSelected =
    filteredProducts.length > 0 &&
    selectedRows.length === filteredProducts.length;

  // Is some selected
  const isSomeSelected =
    selectedRows.length > 0 && selectedRows.length < filteredProducts.length;

  // Stock status component
  const StockStatus = ({
    status,
    count,
  }: {
    status: string;
    count: number;
  }) => {
    if (status === "out of stock") {
      return (
        <Typography variant="caption" color="text.secondary">
          out of stock
        </Typography>
      );
    }

    if (status === "low stock") {
      return (
        <Stack spacing={0.5}>
          <LinearProgress
            variant="determinate"
            value={30}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: "#FFF3E0",
              "& .MuiLinearProgress-bar": {
                bgcolor: "#FFA726",
                borderRadius: 3,
              },
            }}
          />
          <Typography variant="caption" color="text.secondary">
            {count} low stock
          </Typography>
        </Stack>
      );
    }

    return (
      <Stack spacing={0.5}>
        <LinearProgress
          variant="determinate"
          value={80}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: "#E8F5E9",
            "& .MuiLinearProgress-bar": {
              bgcolor: "#66BB6A",
              borderRadius: 3,
            },
          }}
        />
        <Typography variant="caption" color="text.secondary">
          {count} in stock
        </Typography>
      </Stack>
    );
  };

  // Table columns configuration
  const columns: ColumnItem<ProductData>[] = [
    {
      key: "checkbox",
      dataIndex: "id",
      title: "",
      width: 60,
      render: (value, record) => (
        <Checkbox
          size="small"
          checked={selectedRows.includes(record.id)}
          onChange={() => handleSelectRow(record.id)}
        />
      ),
    },
    {
      key: "name",
      dataIndex: "name",
      title: "Product",
      width: 300,
      render: (value, record) => (
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            variant="rounded"
            src={record.image}
            sx={{
              width: 48,
              height: 48,
              bgcolor: "#E0E0E0",
            }}
          >
            {record.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {record.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {record.category}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      key: "createAt",
      dataIndex: "createAt",
      title: "Create at",
      width: 150,
      render: (value, record) => (
        <Box>
          <Typography variant="body2">{record.createAt}</Typography>
          <Typography variant="caption" color="text.secondary">
            {record.createTime}
          </Typography>
        </Box>
      ),
    },
    {
      key: "stock",
      dataIndex: "stock",
      title: "Stock",
      width: 150,
      render: (value, record) => (
        <StockStatus status={record.stockStatus} count={record.stock} />
      ),
    },
    {
      key: "price",
      dataIndex: "price",
      title: "Price",
      width: 100,
      render: (value) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {value}
        </Typography>
      ),
    },
    {
      key: "publish",
      dataIndex: "publish",
      title: "Publish",
      width: 120,
      render: (value) => (
        <Chip
          label={value}
          size="small"
          sx={{
            bgcolor: value === "Published" ? "#E0F2F1" : "#F5F5F5",
            color: value === "Published" ? "#00695C" : "#757575",
            fontWeight: 600,
            fontSize: 12,
          }}
        />
      ),
    },
    {
      key: "actions",
      dataIndex: "actions",
      title: "",
      width: 80,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <IconButton size="small" sx={{ color: "#666" }}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (

    <Stack spacing={3}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            List
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              •
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Product
            </Typography>
            <Typography variant="body2" color="text.secondary">
              •
            </Typography>
            <Typography variant="body2">List</Typography>
          </Stack>
        </Box>
        <Button
          variant="contained"
          startIcon={<Typography>+</Typography>}
          sx={{
            bgcolor: "#212121",
            color: "#fff",
            textTransform: "none",
            "&:hover": { bgcolor: "#333" },
          }}
        >
          Add product
        </Button>
      </Stack>

      <Card>
        {/* Filters */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          sx={{ p: 3, borderBottom: "1px solid #F5F5F5" }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                displayEmpty
              >
                <MenuItem value="Stock">Stock</MenuItem>
                <MenuItem value="in stock">In stock</MenuItem>
                <MenuItem value="low stock">Low stock</MenuItem>
                <MenuItem value="out of stock">Out of stock</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={publishFilter}
                onChange={(e) => setPublishFilter(e.target.value)}
                displayEmpty
              >
                <MenuItem value="Publish">Publish</MenuItem>
                <MenuItem value="Published">Published</MenuItem>
                <MenuItem value="Draft">Draft</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ width: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#999", fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>

          <Stack direction="row" spacing={1}>
            <IconButton size="small" sx={{ border: "1px solid #E0E0E0" }}>
              <ViewColumnIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" sx={{ border: "1px solid #E0E0E0" }}>
              <FilterListIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" sx={{ border: "1px solid #E0E0E0" }}>
              <FileDownloadIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" sx={{ border: "1px solid #E0E0E0" }}>
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>

        {/* Table */}
        <Box sx={{ p: 3 }}>
          <Table<ProductData>
            columns={columns}
            dataSource={filteredProducts}
            rowKey="id"
            pagination={{
              total: filteredProducts.length,
              currentPage: page + 1,
              pageSize: rowsPerPage,
              showSizeChanger: true,
              onPageChange: (newPage) => setPage(newPage - 1),
              onRowsPerPageChange: (newPageSize) => {
                setRowsPerPage(newPageSize);
                setPage(0);
              },
            }}
            height={500}
          />
        </Box>
      </Card>
    </Stack>

  );
}
