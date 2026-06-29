import {
  Card,
  CardContent,
  Typography,
  Stack,
  Avatar,
  Box,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

interface Author {
  name: string;
  followers: string;
  avatar: string;
  rank: number;
}

interface TopAuthorsCardProps {
  authors: Author[];
}

export function TopAuthorsCard({ authors }: TopAuthorsCardProps) {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Top authors
        </Typography>
        <Stack spacing={3}>
          {authors.map((author, index) => (
            <Stack
              key={index}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar src={author.avatar} sx={{ width: 48, height: 48 }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {author.name}
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      ❤️ {author.followers}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  bgcolor:
                    index === 0
                      ? "#FFD700"
                      : index === 1
                      ? "#C0C0C0"
                      : "#CD7F32",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <EmojiEventsIcon sx={{ color: "white", fontSize: 20 }} />
              </Box>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
