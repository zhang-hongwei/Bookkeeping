"use client";

import { Card, CardContent, Box, Typography, Stack } from "@mui/material";

export const CurrentSubject = () => {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Current subject
        </Typography>

        {/* Radar Chart */}
        <Box
          sx={{
            height: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <svg width="300" height="300" viewBox="0 0 300 300">
            {/* Background hexagons */}
            {[1, 0.75, 0.5, 0.25].map((scale, index) => (
              <g key={index} transform="translate(150, 135)">
                <polygon
                  points={`0,${-105 * scale} ${90 * scale},${-52.5 * scale} ${
                    90 * scale
                  },${52.5 * scale} 0,${105 * scale} ${-90 * scale},${
                    52.5 * scale
                  } ${-90 * scale},${-52.5 * scale}`}
                  fill="none"
                  stroke="#E0E0E0"
                  strokeWidth="1"
                />
              </g>
            ))}

            {/* Grid lines from center */}
            {Array.from({ length: 6 }).map((_, index) => {
              const angle = (index * 60 * Math.PI) / 180;
              const x = 150 + Math.sin(angle) * 105;
              const y = 135 - Math.cos(angle) * 105;
              return (
                <line
                  key={index}
                  x1="150"
                  y1="135"
                  x2={x}
                  y2={y}
                  stroke="#E0E0E0"
                  strokeWidth="1"
                />
              );
            })}

            {/* Data polygons */}
            {/* Series 1 - Blue */}
            <polygon
              points="150,35 230,75 220,185 150,210 80,175 90,65"
              fill="#00B8D9"
              fillOpacity="0.2"
              stroke="#00B8D9"
              strokeWidth="2"
            />

            {/* Series 2 - Orange */}
            <polygon
              points="150,55 215,85 200,170 150,200 100,165 115,75"
              fill="#FFAB00"
              fillOpacity="0.2"
              stroke="#FFAB00"
              strokeWidth="2"
            />

            {/* Series 3 - Green */}
            <polygon
              points="150,45 225,80 210,180 150,205 90,170 105,70"
              fill="#00AB55"
              fillOpacity="0.2"
              stroke="#00AB55"
              strokeWidth="2"
            />

            {/* Labels */}
            <text x="150" y="20" fontSize="12" fill="#666" textAnchor="middle">
              English
            </text>
            <text x="250" y="90" fontSize="12" fill="#666" textAnchor="start">
              History
            </text>
            <text x="250" y="195" fontSize="12" fill="#666" textAnchor="start">
              Physics
            </text>
            <text x="150" y="260" fontSize="12" fill="#666" textAnchor="middle">
              Geography
            </text>
            <text x="50" y="195" fontSize="12" fill="#666" textAnchor="end">
              Chinese
            </text>
            <text x="50" y="90" fontSize="12" fill="#666" textAnchor="end">
              Math
            </text>
          </svg>
        </Box>

        {/* Legend */}
        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          sx={{ mt: 2 }}
        >
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Box
              sx={{
                width: 12,
                height: 12,
                bgcolor: "#00AB55",
                borderRadius: "50%",
              }}
            />
            <Typography variant="caption">Series 1</Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Box
              sx={{
                width: 12,
                height: 12,
                bgcolor: "#FFAB00",
                borderRadius: "50%",
              }}
            />
            <Typography variant="caption">Series 2</Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Box
              sx={{
                width: 12,
                height: 12,
                bgcolor: "#00B8D9",
                borderRadius: "50%",
              }}
            />
            <Typography variant="caption">Series 3</Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};
