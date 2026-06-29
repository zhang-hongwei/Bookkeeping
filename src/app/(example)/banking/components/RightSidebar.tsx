import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  Avatar,
  AvatarGroup,
  Slider,
  Button,
  TextField,
  IconButton,
  Chip,
} from "@mui/material";
import { MoreVertOutlined, ArrowForwardOutlined } from "@mui/icons-material";
import { contacts, quickTransferAvatars } from "../data";

export function RightSidebar() {
  return (
    <Box
      sx={{
        width: 380,
        height: "100%",
        borderLeft: "1px solid",
        borderColor: "divider",
        overflowY: "auto",
        p: 3,
      }}
    >
      {/* Current Balance Card */}
      <Card
        sx={{
          mb: 3,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Current balance
            </Typography>
            <IconButton size="small" sx={{ color: "white" }}>
              <MoreVertOutlined fontSize="small" />
            </IconButton>
          </Stack>

          <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
            23 432,03 €
          </Typography>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.7, display: "block" }}>
                Card holder
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Deja Brady
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="caption" sx={{ opacity: 0.7, display: "block" }}>
                Expiration date
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                11/22
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ mt: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                borderRadius: 1,
                px: 1.5,
                py: 0.5,
              }}
            >
              <Typography variant="body2" sx={{ fontFamily: "monospace", letterSpacing: 2 }}>
                **** **** **** 3640
              </Typography>
            </Box>
            <Box
              component="img"
              src="/assets/icons/mastercard.svg"
              sx={{ width: 40, height: 24 }}
              onError={(e) => {
                // Fallback to a colored rectangle if image doesn't exist
                e.currentTarget.style.display = "none";
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Quick Transfer */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Quick transfer
        </Typography>

        <Card>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
              RECENT
            </Typography>

            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <AvatarGroup
                max={10}
                sx={{
                  "& .MuiAvatar-root": {
                    width: 32,
                    height: 32,
                    fontSize: 14,
                    border: "2px solid white",
                  },
                }}
              >
                {quickTransferAvatars.map((avatar, index) => (
                  <Avatar
                    key={index}
                    src={avatar}
                    sx={{
                      cursor: "pointer",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        transition: "transform 0.2s ease",
                      },
                    }}
                  />
                ))}
              </AvatarGroup>
              <IconButton size="small" sx={{ bgcolor: "action.hover" }}>
                <ArrowForwardOutlined fontSize="small" />
              </IconButton>
            </Stack>

            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
              INSERT AMOUNT
            </Typography>

            <Box sx={{ px: 2, mb: 2 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  textAlign: "center",
                  mb: 1,
                }}
              >
                $ 200
              </Typography>
              <Slider
                defaultValue={200}
                min={0}
                max={1000}
                sx={{
                  "& .MuiSlider-thumb": {
                    bgcolor: "#8B5CF6",
                  },
                  "& .MuiSlider-track": {
                    bgcolor: "#8B5CF6",
                  },
                  "& .MuiSlider-rail": {
                    bgcolor: "action.hover",
                  },
                }}
              />
            </Box>

            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Your balance
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                34 212 €
              </Typography>
            </Stack>

            <Button
              variant="contained"
              fullWidth
              sx={{
                bgcolor: "#1A202C",
                color: "white",
                textTransform: "none",
                py: 1.5,
                "&:hover": {
                  bgcolor: "#2D3748",
                },
              }}
            >
              Transfer now
            </Button>
          </CardContent>
        </Card>
      </Box>

      {/* Contacts */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Contacts
          </Typography>
          <Button
            variant="text"
            size="small"
            sx={{
              textTransform: "none",
              color: "text.secondary",
              minWidth: "auto",
            }}
          >
            View all →
          </Button>
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: "block" }}>
          You have 122 contacts
        </Typography>

        <Stack spacing={1.5}>
          {contacts.map((contact) => (
            <Stack
              key={contact.id}
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{
                p: 1.5,
                borderRadius: 1,
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <Avatar src={contact.avatar} sx={{ width: 40, height: 40 }}>
                {contact.name.charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                  {contact.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {contact.email}
                </Typography>
              </Box>
              <IconButton size="small">
                <ArrowForwardOutlined fontSize="small" />
              </IconButton>
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* Invite Friends */}
      <Card
        sx={{
          background: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
          color: "white",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              position: "relative",
              mb: 2,
            }}
          >
            <Box
              component="img"
              src="/assets/illustrations/invite.png"
              sx={{
                position: "absolute",
                right: -16,
                top: -40,
                width: 120,
                height: 120,
                opacity: 0.9,
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Invite friends
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            $50
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mb: 3 }}>
            Praesent egestas tristique nibh. Duis lobortis massa imperdiet quam.
          </Typography>

          <TextField
            placeholder="Email"
            size="small"
            fullWidth
            sx={{
              bgcolor: "rgba(255,255,255,0.1)",
              borderRadius: 1,
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": {
                  borderColor: "rgba(255,255,255,0.2)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(255,255,255,0.3)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "rgba(255,255,255,0.5)",
                },
              },
              "& .MuiInputBase-input::placeholder": {
                color: "rgba(255,255,255,0.7)",
                opacity: 1,
              },
            }}
            InputProps={{
              endAdornment: (
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    bgcolor: "#FFAB00",
                    color: "#1A202C",
                    textTransform: "none",
                    fontWeight: 700,
                    minWidth: 70,
                    "&:hover": {
                      bgcolor: "#FF8F00",
                    },
                  }}
                >
                  Invite
                </Button>
              ),
            }}
          />
        </CardContent>
      </Card>
    </Box>
  );
}
