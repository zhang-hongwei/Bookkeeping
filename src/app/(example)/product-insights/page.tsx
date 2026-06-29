"use client";

import { useState, useMemo } from "react";
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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import LinkIcon from "@mui/icons-material/Link";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import Table from "@/components/ui/Table";
import { ColumnItem } from "@/components/ui/Table/types";
import TrendChart from "./components/TrendChart";
import { ProductInsight, CountryCode } from "./types";
import { mockProducts, countries, categories, brands } from "./mockData";

export default function ProductInsightsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [brandFilter, setBrandFilter] = useState("All Brands");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter products based on all criteria
  const filteredProducts = useMemo(() => {
    let filtered = mockProducts;

    // Filter by country
    if (countryFilter !== "ALL") {
      filtered = filtered.filter((p) => p.country === countryFilter);
    }

    // Filter by category
    if (categoryFilter !== "All Categories") {
      filtered = filtered.filter((p) => p.category === categoryFilter);
    }

    // Filter by brand
    if (brandFilter !== "All Brands") {
      filtered = filtered.filter((p) => p.brand === brandFilter);
    }

    // Filter by search query (ASIN or name)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.asin.toLowerCase().includes(query) ||
          p.name.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [countryFilter, categoryFilter, brandFilter, searchQuery]);

  // Get country flag emoji
  const getCountryFlag = (countryCode: CountryCode): string => {
    const country = countries.find((c) => c.code === countryCode);
    return country?.flag || "🌎";
  };

  // Shipping method color mapping
  const getShippingColor = (method: string) => {
    switch (method) {
      case "AMZ":
        return { bg: "#FFF3E0", text: "#F57C00" };
      case "FBA":
        return { bg: "#E3F2FD", text: "#1976D2" };
      case "FBM":
        return { bg: "#F3E5F5", text: "#7B1FA2" };
      default:
        return { bg: "#F5F5F5", text: "#666" };
    }
  };

  // Table columns configuration
  const columns: ColumnItem[] = [
    {
      key: "product",
      dataIndex: "name",
      title: "产品信息",
      width: 350,

      render: (value, record) => (
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            variant="rounded"
            src={record.imageUrl}
            sx={{
              width: 56,
              height: 56,
              bgcolor: "#F5F5F5",
            }}
          >
            {record.name.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                mb: 0.5,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {record.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ASIN: {record.asin}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      key: "brand",
      dataIndex: "brand",
      title: "品牌",
      width: 120,
      render: (value) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {value}
        </Typography>
      ),
    },
    {
      key: "shipping",
      dataIndex: "shippingMethod",
      title: "配送方式",
      width: 120,
      align: "center",
      render: (value) => {
        const colors = getShippingColor(value);
        return (
          <Chip
            label={value}
            size="small"
            sx={{
              bgcolor: colors.bg,
              color: colors.text,
              fontWeight: 700,
              fontSize: 11,
              height: 24,
              minWidth: 56,
            }}
          />
        );
      },
    },
    {
      key: "country",
      dataIndex: "country",
      title: "发货国籍",
      width: 100,
      align: "center",
      render: (value) => (
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#F5F5F5",
            fontSize: 20,
            mx: "auto",
          }}
        >
          {getCountryFlag(value)}
        </Box>
      ),
    },
    {
      key: "sales",
      dataIndex: "annualSales",
      title: "年销量",
      width: 120,
      align: "right",
      render: (value) => (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: value > 0 ? "success.main" : "text.secondary",
          }}
        >
          {value > 0 ? value.toLocaleString() : "暂无销量"}
        </Typography>
      ),
    },
    {
      key: "trend",
      dataIndex: "salesTrend",
      title: "销量趋势",
      width: 150,
      align: "center",
      render: (value) => (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <TrendChart data={value} width={120} height={40} color="#1976d2" />
        </Box>
      ),
    },
    {
      key: "launchDate",
      dataIndex: "launchDate",
      title: "上架日期",
      width: 120,
      render: (value) => (
        <Typography variant="body2" color="text.secondary">
          {value}
        </Typography>
      ),
    },
    {
      key: "actions",
      dataIndex: "actions",
      title: "",
      width: 120,
      // fixed: "right",
      align: "center",
      render: (_, record) => (
        <Stack direction="row" spacing={0.5} justifyContent="center">
          <IconButton
            size="small"
            sx={{
              color: "primary.main",
              "&:hover": { bgcolor: "primary.lighter" },
            }}
          >
            <VisibilityOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            sx={{
              color: "info.main",
              "&:hover": { bgcolor: "info.lighter" },
            }}
          >
            <LinkIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            sx={{
              color: "warning.main",
              "&:hover": { bgcolor: "warning.lighter" },
            }}
          >
            <BookmarkBorderIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              产品管理
            </Typography>
            <Typography variant="body2" color="text.secondary">
              查看和管理类目中的产品数据
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            sx={{
              textTransform: "none",
              borderColor: "divider",
              color: "text.primary",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "primary.lighter",
              },
            }}
          >
            导出
          </Button>
        </Stack>

        <Card>
          {/* Filters */}
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ p: 3, borderBottom: "1px solid", borderColor: "divider" }}
          >
            {/* Country Filter */}
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <Select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                displayEmpty
                renderValue={(value) => {
                  const country = countries.find((c) => c.code === value);
                  return (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <span>{country?.flag || "🌎"}</span>
                      <span>{country?.name || "All Countries"}</span>
                    </Stack>
                  );
                }}
              >
                {countries.map((country) => (
                  <MenuItem key={country.code} value={country.code}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Category Filter */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                displayEmpty
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Brand Filter */}
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <Select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                displayEmpty
              >
                {brands.map((brand) => (
                  <MenuItem key={brand} value={brand}>
                    {brand}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Search */}
            <TextField
              size="small"
              placeholder="搜索或选择类..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flex: 1, maxWidth: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      sx={{ color: "text.secondary", fontSize: 20 }}
                    />
                  </InputAdornment>
                ),
              }}
            />

            {/* Results count */}
            <Box sx={{ flex: 1 }} />
            <Typography variant="body2" color="text.secondary">
              全部邮邮品类
            </Typography>
          </Stack>

          {/* Table */}

          <Table
            columns={columns}
            dataSource={filteredProducts}
            rowKey="id"
            pagination={{
              total: filteredProducts.length,
              currentPage: page + 1,
              pageSize: rowsPerPage,
              showSizeChanger: true,
            }}
            onPageChange={(newPage: number) => setPage(newPage - 1)}
            onPageSizeChange={(newPageSize: number) => {
              setRowsPerPage(newPageSize);
              setPage(0);
            }}
            height={600}
            sx={{
              "& .MuiTableCell-root": {
                borderBottom: "1px solid",
                borderColor: "divider",
              },
            }}
          />
        </Card>
      </Stack>
    </Container>
  );
}
