"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Stack,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputAdornment,
  Avatar,
  Chip,
  IconButton,
  Menu,
  Button,
  Card,
} from "@mui/material";
import {
  SearchOutlined,
  EditOutlined,
  MoreHorizOutlined,
} from "@mui/icons-material";
import Table from "@/components/ui/Table";
import { ColumnItem } from "@/components/ui/Table/types";

// User status type
type UserStatus = "Active" | "Pending" | "Banned" | "Rejected";

// User data interface
interface UserData {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  company: string;
  role: string;
  status: UserStatus;
  avatar?: string;
}

// Mock data
const mockUsers: UserData[] = [
  {
    id: "1",
    name: "Angelique Morse",
    email: "benny98@yahoo.com",
    phoneNumber: "+46 8 123 456",
    company: "Wuckert Inc",
    role: "Content Creator",
    status: "Banned",
    avatar: "/avatars/user1.jpg",
  },
  {
    id: "2",
    name: "Ariana Lang",
    email: "avery.t3@hotmail.com",
    phoneNumber: "+54 11 1234-5678",
    company: "Feest Group",
    role: "IT Administrator",
    status: "Pending",
    avatar: "/avatars/user2.jpg",
  },
  {
    id: "3",
    name: "Aspen Schmitt",
    email: "mireya13@hotmail.com",
    phoneNumber: "+34 91 123 4567",
    company: "Kihn, Marquardt and Crist",
    role: "Financial Planner",
    status: "Banned",
    avatar: "/avatars/user3.jpg",
  },
  {
    id: "4",
    name: "Brycen Jimenez",
    email: "tyrel.greenholtz@gmail.com",
    phoneNumber: "+52 55 1234 5678",
    company: "Rempel, Hand and Herzog",
    role: "HR Recruiter",
    status: "Active",
    avatar: "/avatars/user4.jpg",
  },
  {
    id: "5",
    name: "Chase Day",
    email: "joana.simonis84@gmail.com",
    phoneNumber: "+86 10 1234 5678",
    company: "Mraz, Donnelly and Collins",
    role: "Graphic Designer",
    status: "Banned",
    avatar: "/avatars/user5.jpg",
  },
];

// Status badge component
const StatusBadge = ({ status }: { status: UserStatus }) => {
  const statusConfig: Record<
    UserStatus,
    { color: "success" | "warning" | "error" | "default"; label: string }
  > = {
    Active: { color: "success", label: "Active" },
    Pending: { color: "warning", label: "Pending" },
    Banned: { color: "error", label: "Banned" },
    Rejected: { color: "default", label: "Rejected" },
  };

  const config = statusConfig[status];

  return (
    <Chip
      label={config.label}
      color={config.color}
      size="small"
      sx={{ fontWeight: 500 }}
    />
  );
};

export default function UserListPage() {
  const [tabValue, setTabValue] = useState(0);
  const [roleFilter, setRoleFilter] = useState("Role");
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // Filter users based on tab and search
  const getFilteredUsers = () => {
    let filtered = mockUsers;

    // Filter by status tab
    if (tabValue === 1)
      filtered = filtered.filter((u) => u.status === "Active");
    if (tabValue === 2)
      filtered = filtered.filter((u) => u.status === "Pending");
    if (tabValue === 3)
      filtered = filtered.filter((u) => u.status === "Banned");
    if (tabValue === 4)
      filtered = filtered.filter((u) => u.status === "Rejected");

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.company.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  // Table columns configuration
  // ✅ 优化后：只需要 key，不需要 dataIndex（除非两者不同）
  const columns: ColumnItem<UserData>[] = [
    {
      key: "name",
      // dataIndex 已移除，会自动使用 key 作为 dataIndex
      title: "Name",
      width: 250,
      fixed: "left",
      render: (value, record) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            sx={{ width: 32, height: 32, bgcolor: "#f0f0f0", color: "#666" }}
          >
            {record.name.charAt(0)}
          </Avatar>
          <Stack>
            <Box sx={{ fontWeight: 500, fontSize: "14px" }}>{record.name}</Box>
            <Box sx={{ fontSize: "12px", color: "#666" }}>{record.email}</Box>
          </Stack>
        </Stack>
      ),
    },
    {
      key: "phoneNumber",
      // dataIndex 已移除
      title: "Phone number",
      width: 180,
    },
    {
      key: "company",
      // dataIndex 已移除
      title: "Company",
      width: 350,
    },
    {
      key: "phoneNumber1",
      // 注意：这个列的 key 是 phoneNumber1，但数据中没有这个字段
      // 如果数据中的字段名是 phoneNumber，应该删除这一列或者添加 dataIndex: "phoneNumber"
      title: "Phone number",
      width: 180,
    },
    {
      key: "company1",
      // 同上：如果数据中没有 company1 字段，应该删除或修正
      title: "Company",
      width: 250,
    },
    {
      key: "role",
      // dataIndex 已移除
      title: "Role",
      width: 200,
    },
    {
      key: "status",
      // dataIndex 已移除
      title: "Status",
      width: 120,
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: "actions",
      // dataIndex 已移除（actions 列通常不需要 dataIndex）
      title: "",
      width: 100,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Stack direction="row" spacing={0.5} justifyContent="center">
          <IconButton size="small" sx={{ color: "#666" }}>
            <EditOutlined fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            sx={{ color: "#666" }}
            onClick={(e) => {
              setAnchorEl(e.currentTarget);
              setSelectedUser(record.id);
            }}
          >
            <MoreHorizOutlined fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const filteredUsers = getFilteredUsers();

  // Get count for each status
  const statusCounts = {
    all: mockUsers.length,
    active: mockUsers.filter((u) => u.status === "Active").length,
    pending: mockUsers.filter((u) => u.status === "Pending").length,
    banned: mockUsers.filter((u) => u.status === "Banned").length,
    rejected: mockUsers.filter((u) => u.status === "Rejected").length,
  };

  return (
    <Stack >
      <Stack spacing={3}>
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box sx={{ fontSize: "24px", fontWeight: 600 }}>List</Box>
          <Button
            variant="contained"
            sx={{
              bgcolor: "#000",
              color: "#fff",
              textTransform: "none",
              "&:hover": { bgcolor: "#333" },
            }}
          >
            + Add user
          </Button>
        </Stack>

        <Card>
          {/* Tabs */}
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 500,
                minWidth: "auto",
                px: 2,
              },
            }}
          >
            <Tab label={`All ${statusCounts.all}`} />
            <Tab label={`Active ${statusCounts.active}`} />
            <Tab label={`Pending ${statusCounts.pending}`} />
            <Tab label={`Banned ${statusCounts.banned}`} />
            <Tab label={`Rejected ${statusCounts.rejected}`} />
          </Tabs>{" "}
          {/* Filters */}
          <Stack direction="row" spacing={2} my={3} px={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                displayEmpty
              >
                <MenuItem value="Role">Role</MenuItem>
                <MenuItem value="Content Creator">Content Creator</MenuItem>
                <MenuItem value="IT Administrator">IT Administrator</MenuItem>
                <MenuItem value="Financial Planner">Financial Planner</MenuItem>
                <MenuItem value="HR Recruiter">HR Recruiter</MenuItem>
                <MenuItem value="Graphic Designer">Graphic Designer</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flexGrow: 1, maxWidth: 400 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined sx={{ color: "#666", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Stack>
          {/* Table */}
          <Box sx={{ height: "calc(100vh - 350px)" }}>
            <Table<UserData>
              columns={columns}
              dataSource={filteredUsers}
              rowKey="id"
              pagination={{
                total: filteredUsers.length,
                currentPage: 1,
                pageSize: 5,
                showSizeChanger: true,
              }}
              height="100%"
            />
          </Box>
        </Card>
      </Stack>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => setAnchorEl(null)}>View Details</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Edit User</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Delete</MenuItem>
      </Menu>
    </Stack>
  );
}
