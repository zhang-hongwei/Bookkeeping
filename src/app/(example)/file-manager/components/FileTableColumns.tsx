import {
  Box,
  Typography,
  Stack,
  Checkbox,
  IconButton,
  Avatar,
  AvatarGroup,
} from "@mui/material";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import { ColumnItem } from "@/components/ui/Table/types";
import { FileData } from "./data";

interface UseFileColumnsProps {
  selectedFiles: string[];
  onSelectFile: (id: string, checked: boolean) => void;
  onToggleStar: (id: string) => void;
}

export function useFileColumns({
  selectedFiles,
  onSelectFile,
  onToggleStar,
}: UseFileColumnsProps): ColumnItem<FileData>[] {
  return [
    {
      key: "checkbox",
      dataIndex: "id",
      title: "",
      width: 50,
      render: (value, record) => (
        <Checkbox
          size="small"
          checked={selectedFiles.includes(record.id)}
          onChange={(e) => onSelectFile(record.id, e.target.checked)}
        />
      ),
    },
    {
      key: "name",
      dataIndex: "name",
      title: "Name",
      width: 400,
      render: (value, record) => (
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              bgcolor: "#00AB55",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ImageOutlinedIcon sx={{ color: "white", fontSize: 20 }} />
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {record.name}
          </Typography>
        </Stack>
      ),
    },
    {
      key: "size",
      dataIndex: "size",
      title: "Size",
      width: 120,
      render: (value) => (
        <Typography variant="body2" color="text.secondary">
          {value}
        </Typography>
      ),
    },
    {
      key: "type",
      dataIndex: "type",
      title: "Type",
      width: 100,
      render: (value) => (
        <Typography variant="body2" color="text.secondary">
          {value}
        </Typography>
      ),
    },
    {
      key: "modified",
      dataIndex: "modified",
      title: "Modified",
      width: 200,
      render: (value, record) => (
        <Box>
          <Typography variant="body2">{record.modified}</Typography>
          <Typography variant="caption" color="text.secondary">
            {record.modifiedTime}
          </Typography>
        </Box>
      ),
    },
    {
      key: "shared",
      dataIndex: "shared",
      title: "Shared",
      width: 150,
      align: "center",
      render: (value, record) => {
        if (!record.shared || record.shared.length === 0) return null;
        return (
          <AvatarGroup max={3} sx={{ justifyContent: "center" }}>
            {record.shared.map((user, index) => (
              <Avatar
                key={index}
                sx={{ width: 24, height: 24, fontSize: 12, bgcolor: "#00AB55" }}
              >
                {user.charAt(0).toUpperCase()}
              </Avatar>
            ))}
          </AvatarGroup>
        );
      },
    },
    {
      key: "actions",
      dataIndex: "actions",
      title: "",
      width: 100,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Stack direction="row" spacing={0.5} justifyContent="center">
          <IconButton
            size="small"
            onClick={() => onToggleStar(record.id)}
            sx={{ color: record.starred ? "#FFA726" : "#999" }}
          >
            {record.starred ? (
              <StarIcon fontSize="small" />
            ) : (
              <StarBorderIcon fontSize="small" />
            )}
          </IconButton>
          <IconButton size="small" sx={{ color: "#666" }}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];
}
