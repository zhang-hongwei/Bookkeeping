import { Card, CardContent, Box, Typography } from "@mui/material";
import { subjectStrengths } from "../data";

export function StrengthChart() {
  const subjects = subjectStrengths;
  const centerX = 150;
  const centerY = 150;
  const maxRadius = 120;
  const levels = 5;

  // Calculate polygon points for data
  const dataPoints = subjects.map((subject, index) => {
    const angle = (Math.PI * 2 * index) / subjects.length - Math.PI / 2;
    const radius = (subject.score / 100) * maxRadius;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return { x, y, angle, subject: subject.subject };
  });

  // Create path for data polygon
  const dataPath = dataPoints.map((point, i) =>
    i === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`
  ).join(" ") + " Z";

  // Calculate label positions
  const labelPoints = subjects.map((subject, index) => {
    const angle = (Math.PI * 2 * index) / subjects.length - Math.PI / 2;
    const labelRadius = maxRadius + 30;
    const x = centerX + labelRadius * Math.cos(angle);
    const y = centerY + labelRadius * Math.sin(angle);
    return { x, y, label: subject.subject };
  });

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Strength
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <svg width="300" height="300" viewBox="0 0 300 300">
            {/* Background circles */}
            {[...Array(levels)].map((_, i) => {
              const radius = (maxRadius / levels) * (i + 1);
              return (
                <circle
                  key={i}
                  cx={centerX}
                  cy={centerY}
                  r={radius}
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="1"
                />
              );
            })}

            {/* Grid lines */}
            {subjects.map((_, index) => {
              const angle = (Math.PI * 2 * index) / subjects.length - Math.PI / 2;
              const x = centerX + maxRadius * Math.cos(angle);
              const y = centerY + maxRadius * Math.sin(angle);
              return (
                <line
                  key={index}
                  x1={centerX}
                  y1={centerY}
                  x2={x}
                  y2={y}
                  stroke="#E5E7EB"
                  strokeWidth="1"
                />
              );
            })}

            {/* Data polygon */}
            <path
              d={dataPath}
              fill="#8B5CF6"
              fillOpacity="0.5"
              stroke="#8B5CF6"
              strokeWidth="2"
            />

            {/* Data points */}
            {dataPoints.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="4"
                fill="#8B5CF6"
              />
            ))}

            {/* Labels */}
            {labelPoints.map((point, index) => (
              <text
                key={index}
                x={point.x}
                y={point.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#6B7280"
                fontSize="12"
                fontWeight="500"
              >
                {point.label}
              </text>
            ))}
          </svg>
        </Box>
      </CardContent>
    </Card>
  );
}
