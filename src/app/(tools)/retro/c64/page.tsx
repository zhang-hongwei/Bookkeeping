"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

// ── C64 Color Palette ──────────────────────────────────────────

const C64 = {
  border: "#6C5EB5",
  background: "#40318D",
  text: "#7C70DA",
  lightBlue: "#7C70DA",
  white: "#FFFFFF",
  red: "#9F4E44",
  cyan: "#6C5EB5",
  purple: "#A0547E",
  green: "#5CAB5E",
  yellow: "#C9D487",
  orange: "#9F4E44",
  lightRed: "#CB7E75",
  darkCyan: "#4B4B4B",
  darkPurple: "#6C5EB5",
  darkGreen: "#5CAB5E",
  darkYellow: "#C9D487",
  caseColor: "#C4A67A",
  caseColorDark: "#A88E64",
  caseColorLight: "#D4B88A",
  caseBadge: "#B89860",
} as const;

// C64 color values for POKE commands (simplified subset)
const BORDER_COLORS: Record<number, string> = {
  0: "#000000", // black
  1: "#FFFFFF", // white
  2: "#9F4E44", // red
  3: "#6C5EB5", // cyan (default-ish)
  4: "#A0547E", // purple
  5: "#5CAB5E", // green
  6: "#4B4B4B", // blue (dark)
  7: "#C9D487", // yellow
  8: "#9F4E44", // orange
  9: "#CB7E75", // light red
  10: "#5C5496", // dark grey
  11: "#8B8B8B", // grey
  12: "#5CAB5E", // light green
  13: "#7C70DA", // light blue
  14: "#A0547E", // light purple
  15: "#C4A67A", // light yellow
};

// ── Types ──────────────────────────────────────────────────────

interface ScreenLine {
  id: number;
  text: string;
}

interface ProgramLine {
  num: number;
  code: string;
}

// ── Helpers ────────────────────────────────────────────────────

let lineIdCounter = 0;
const nextLineId = () => ++lineIdCounter;

function playBootBeep(audioCtxRef: React.RefObject<AudioContext | null>) {
  try {
    const ctx = audioCtxRef.current ?? (audioCtxRef.current = new AudioContext());
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(1000, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch {
    // Web Audio not available, skip beep
  }
}

function playKeyClick(audioCtxRef: React.RefObject<AudioContext | null>) {
  try {
    const ctx = audioCtxRef.current ?? (audioCtxRef.current = new AudioContext());
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.02, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.03);
  } catch {
    // Web Audio not available
  }
}

// ── BASIC Interpreter ──────────────────────────────────────────

function evaluatePrintExpression(expr: string): string {
  // Handle string literals
  const strMatch = expr.match(/^"(.*)"$/);
  if (strMatch) return strMatch[1];

  // Handle semicolon-separated items
  if (expr.includes(";") || expr.includes(",")) {
    return expr
      .split(/([;,])/)
      .map((part) => {
        const trimmed = part.trim();
        if (trimmed === ";" || trimmed === ",") return trimmed === "," ? "\t" : "";
        return evaluatePrintExpression(trimmed);
      })
      .join("");
  }

  // Handle simple string concatenation with +
  if (expr.includes("+") && !expr.match(/[\d]/)) {
    return expr
      .split("+")
      .map((p) => evaluatePrintExpression(p.trim()))
      .join("");
  }

  // Handle numeric expression (very simple eval)
  try {
    const numericExpr = expr.replace(/\s/g, "");
    if (/^[\d+\-*/().]+$/.test(numericExpr)) {
      const fn = new Function(`return ${numericExpr}`);
      return String(fn());
    }
  } catch {
    // Not a valid numeric expression
  }

  return expr;
}

interface BasicResult {
  output: string[];
  clear?: boolean;
  reset?: boolean;
  borderColor?: string;
}

function executeBasic(
  input: string,
  program: ProgramLine[],
  setProgram: React.Dispatch<React.SetStateAction<ProgramLine[]>>
): BasicResult {
  const trimmed = input.trim();
  const upper = trimmed.toUpperCase();

  // Empty input
  if (!trimmed) return { output: [] };

  // Line number -> store in program memory
  const lineMatch = trimmed.match(/^(\d+)\s*(.*)/);
  if (lineMatch) {
    const lineNum = parseInt(lineMatch[1], 10);
    const code = lineMatch[2];
    if (!code) {
      // Delete line
      setProgram((prev) => prev.filter((p) => p.num !== lineNum));
    } else {
      setProgram((prev) => {
        const filtered = prev.filter((p) => p.num !== lineNum);
        return [...filtered, { num: lineNum, code }].sort((a, b) => a.num - b.num);
      });
    }
    return { output: [] };
  }

  // HELP
  if (upper === "HELP") {
    return {
      output: [
        "",
        "AVAILABLE COMMANDS:",
        "  PRINT \"text\"  - DISPLAY TEXT",
        "  ? \"text\"      - SHORTHAND FOR PRINT",
        "  LIST          - SHOW PROGRAM",
        "  RUN           - RUN PROGRAM",
        "  NEW           - CLEAR ALL",
        "  CLR           - CLEAR PROGRAM MEMORY",
        "  LOAD \"*\",8,1  - SIMULATE DISK LOAD",
        "  SYS 64738     - WARM RESET",
        "  PEEK(53280)   - READ MEMORY",
        "  POKE 53280,N  - CHANGE BORDER COLOR (0-15)",
        "  <line> <code> - STORE BASIC LINE",
        "  F1            - THIS HELP",
        "  HOME          - CLEAR SCREEN",
        "",
      ],
    };
  }

  // PRINT or ? command
  if (upper.startsWith("PRINT ") || upper.startsWith("? ")) {
    const prefix = upper.startsWith("PRINT ") ? "PRINT " : "? ";
    const expr = trimmed.slice(prefix.length);
    return { output: [evaluatePrintExpression(expr)] };
  }

  // LIST
  if (upper === "LIST") {
    if (program.length === 0) return { output: [] };
    return {
      output: program.map((p) => `${p.num} ${p.code}`),
    };
  }

  // RUN
  if (upper === "RUN") {
    if (program.length === 0) return { output: [] };
    const output: string[] = [];
    for (const line of program) {
      const lineUpper = line.code.toUpperCase().trim();
      if (lineUpper.startsWith("PRINT ") || lineUpper.startsWith("? ")) {
        const prefix = lineUpper.startsWith("PRINT ") ? "PRINT " : "? ";
        const expr = line.code.trim().slice(prefix.length);
        output.push(evaluatePrintExpression(expr));
      } else if (lineUpper.startsWith("GOTO ")) {
        // Simple GOTO support - create a loop warning
        output.push("?SYNTAX  ERROR");
        break;
      } else if (lineUpper === "END") {
        break;
      } else if (lineUpper === "RETURN" || lineUpper === "NEXT" || lineUpper === "GOSUB") {
        // Limited: just note unsupported
        output.push("?SYNTAX  ERROR");
        break;
      }
    }
    return { output };
  }

  // NEW
  if (upper === "NEW") {
    setProgram([]);
    return { output: [], clear: true };
  }

  // CLR
  if (upper === "CLR") {
    setProgram([]);
    return { output: [] };
  }

  // LOAD
  if (upper.startsWith("LOAD")) {
    return {
      output: ["SEARCHING FOR *", "LOADING", "READY."],
    };
  }

  // SYS 64738 (warm reset)
  if (upper === "SYS 64738") {
    return { output: [], reset: true };
  }

  // PEEK
  const peekMatch = upper.match(/^PEEK\((\d+)\)$/);
  if (peekMatch) {
    const addr = parseInt(peekMatch[1], 10);
    if (addr === 53280) return { output: ["6"] }; // default border color index
    if (addr === 53281) return { output: ["6"] }; // default background color index
    return { output: [String(Math.floor(Math.random() * 256))] };
  }

  // POKE
  const pokeMatch = upper.match(/^POKE\s+(\d+)\s*,\s*(\d+)$/);
  if (pokeMatch) {
    const addr = parseInt(pokeMatch[1], 10);
    const val = parseInt(pokeMatch[2], 10);
    if (addr === 53280 && val >= 0 && val <= 15) {
      return {
        output: [],
        borderColor: BORDER_COLORS[val] ?? C64.border,
      };
    }
    return { output: [] };
  }

  // Unknown command
  return { output: ["?SYNTAX  ERROR", "READY."] };
}

// ── Injected CSS keyframes ─────────────────────────────────────

const C64_CSS = `
@keyframes c64-cursor-blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}
@keyframes c64-boot-char {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes c64-loading-bar {
  0%   { background-position: 0 0; }
  100% { background-position: 40px 0; }
}
@keyframes c64-screen-glow {
  0%, 100% { text-shadow: 0 0 2px rgba(124,112,218,0.3); }
  50%      { text-shadow: 0 0 4px rgba(124,112,218,0.5); }
}
`;

// ── Loading Animation Component ────────────────────────────────

function LoadingAnimation({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 800);
    const t2 = setTimeout(() => setPhase(2), 1600);
    const t3 = setTimeout(() => onComplete(), 2800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <Box>
      {phase >= 0 && (
        <Box
          component="pre"
          sx={{
            m: 0,
            fontFamily: "inherit",
            fontSize: "inherit",
            lineHeight: "inherit",
            color: C64.text,
          }}
        >
          SEARCHING FOR *
        </Box>
      )}
      {phase >= 1 && (
        <Box
          component="pre"
          sx={{
            m: 0,
            fontFamily: "inherit",
            fontSize: "inherit",
            lineHeight: "inherit",
            color: C64.text,
          }}
        >
          LOADING
        </Box>
      )}
      {phase >= 2 && (
        <Box
          sx={{
            width: "100%",
            height: 6,
            my: 0.5,
            background:
              "repeating-linear-gradient(90deg, #7C70DA 0px, #5CAB5E 5px, #C9D487 10px, #CB7E75 15px, #9F4E44 20px, #7C70DA 25px, #5CAB5E 30px, #FFFFFF 35px, #7C70DA 40px)",
            backgroundSize: "40px 6px",
            animation: "c64-loading-bar 0.3s linear infinite",
          }}
        />
      )}
    </Box>
  );
}

// ── Main Component ─────────────────────────────────────────────

export default function C64Page() {
  const [lines, setLines] = useState<ScreenLine[]>([]);
  const [input, setInput] = useState("");
  const [program, setProgram] = useState<ProgramLine[]>([]);
  const [borderColor, setBorderColor] = useState(C64.border);
  const [loading, setLoading] = useState(false);
  const [booted, setBooted] = useState(false);
  const [clock, setClock] = useState(new Date());

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Auto-scroll
  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [lines, scrollToBottom]);

  // Clock tick (updates the invisible state, used for potential display)
  useEffect(() => {
    const interval = setInterval(() => setClock(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Boot sequence with typewriter effect
  useEffect(() => {
    if (booted) return;

    // Play boot beep
    playBootBeep(audioCtxRef);

    const bootText = [
      "",
      "    **** COMMODORE 64 BASIC V2 ****",
      "",
      " 64K RAM SYSTEM  38911 BASIC BYTES FREE",
      "",
      "READY.",
    ];

    // Type each line with delay, then characters within
    let currentLineIndex = 0;
    let currentCharIndex = 0;
    let currentDisplay = "";

    const typeNext = () => {
      if (currentLineIndex >= bootText.length) {
        setBooted(true);
        return;
      }

      const lineText = bootText[currentLineIndex];

      if (currentCharIndex < lineText.length) {
        currentDisplay += lineText[currentCharIndex];
        currentCharIndex++;

        setLines((prev) => {
          const updated = [...prev];
          // Find or create the current line
          const existingIdx = updated.findIndex(
            (l) => l.id === `boot-${currentLineIndex}`
          );
          if (existingIdx >= 0) {
            updated[existingIdx] = {
              ...updated[existingIdx],
              text: currentDisplay,
            };
          } else {
            updated.push({
              id: `boot-${currentLineIndex}` as unknown as number,
              text: currentDisplay,
            });
          }
          return updated;
        });

        setTimeout(typeNext, 15 + Math.random() * 20);
      } else {
        // Line complete, move to next
        currentLineIndex++;
        currentCharIndex = 0;
        currentDisplay = "";
        setTimeout(typeNext, 150);
      }
    };

    const startTimer = setTimeout(typeNext, 400);
    return () => clearTimeout(startTimer);
  }, [booted]);

  // Focus input on click
  const focusInput = () => inputRef.current?.focus();

  // Handle loading complete
  const handleLoadingComplete = useCallback(() => {
    setLoading(false);
    setLines((prev) => [
      ...prev,
      { id: nextLineId(), text: "READY." },
    ]);
  }, []);

  // Handle command
  const handleCommand = useCallback(() => {
    const trimmed = input.trim();
    const upper = trimmed.toUpperCase();

    // Add the typed input as a screen line
    setLines((prev) => [...prev, { id: nextLineId(), text: trimmed }]);

    if (trimmed) {
      // Special: LOAD triggers loading animation
      if (upper.startsWith("LOAD")) {
        setLoading(true);
        setInput("");
        return;
      }

      const result = executeBasic(trimmed, program, setProgram);

      if (result.reset) {
        // Warm reset
        setLines([]);
        setProgram([]);
        setInput("");
        setBooted(false);
        lineIdCounter = 0;
        return;
      }

      if (result.clear) {
        setLines([]);
        setInput("");
        return;
      }

      if (result.borderColor) {
        setBorderColor(result.borderColor);
      }

      const newLines: ScreenLine[] = [];
      for (const text of result.output) {
        newLines.push({ id: nextLineId(), text });
      }
      setLines((prev) => [...prev, ...newLines]);
    }

    setInput("");
  }, [input, program]);

  // Key handling
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCommand();
      return;
    }

    if (e.key === "F1") {
      e.preventDefault();
      // Show help
      setLines((prev) => [
        ...prev,
        { id: nextLineId(), text: "HELP" },
      ]);
      const result = executeBasic("HELP", program, setProgram);
      const newLines = result.output.map((text) => ({ id: nextLineId(), text }));
      setLines((prev) => [...prev, ...newLines]);
      return;
    }

    if (e.key === "Home") {
      e.preventDefault();
      setLines([]);
      return;
    }

    // Key click sound
    if (e.key.length === 1) {
      playKeyClick(audioCtxRef);
    }
  };

  return (
    <>
      <style>{C64_CSS}</style>
      <Box
        onClick={focusInput}
        sx={{
          width: "100vw",
          height: "100vh",
          bgcolor: "#1a1a1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Courier New', 'Lucida Console', monospace",
          overflow: "hidden",
        }}
      >
        {/* C64 Computer Case */}
        <Box
          sx={{
            width: { xs: "95vw", sm: "85vw", md: "75vw", lg: "65vw" },
            maxWidth: 900,
            bgcolor: C64.caseColor,
            borderRadius: "12px 12px 8px 8px",
            boxShadow: `
              0 8px 32px rgba(0,0,0,0.6),
              0 2px 8px rgba(0,0,0,0.4),
              inset 0 1px 0 ${C64.caseColorLight},
              inset 0 -1px 0 ${C64.caseColorDark}
            `,
            p: { xs: 1.5, sm: 2.5, md: 3 },
            position: "relative",
          }}
        >
          {/* Top ridge / ventilation */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 0.4,
              mb: 1.5,
              height: 4,
            }}
          >
            {Array.from({ length: 30 }).map((_, i) => (
              <Box
                key={i}
                sx={{
                  width: "8px",
                  height: "3px",
                  bgcolor: C64.caseColorDark,
                  borderRadius: "1px",
                }}
              />
            ))}
          </Box>

          {/* Screen bezel */}
          <Box
            sx={{
              bgcolor: "#2a2a2a",
              borderRadius: "8px",
              p: { xs: 0.75, sm: 1 },
              boxShadow: `
                inset 0 2px 6px rgba(0,0,0,0.8),
                inset 0 0 2px rgba(0,0,0,0.6)
              `,
            }}
          >
            {/* Screen area with C64 border color */}
            <Box
              sx={{
                bgcolor: borderColor,
                borderRadius: "4px",
                p: { xs: "8px", sm: "12px", md: "16px" },
                position: "relative",
              }}
            >
              {/* Inner screen (dark blue background) */}
              <Box
                sx={{
                  bgcolor: C64.background,
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: "2px",
                  boxShadow: "inset 0 0 60px rgba(0,0,0,0.3)",
                }}
              >
                {/* CRT Scanlines */}
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    background:
                      "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.12) 1px, rgba(0,0,0,0.12) 2px)",
                    zIndex: 2,
                  }}
                />

                {/* CRT curvature / vignette */}
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    boxShadow:
                      "inset 0 0 80px rgba(0,0,0,0.4), inset 0 0 20px rgba(0,0,0,0.2)",
                    borderRadius: "2px",
                    zIndex: 3,
                  }}
                />

                {/* Screen content */}
                <Box
                  ref={containerRef}
                  sx={{
                    height: { xs: "45vh", sm: "50vh", md: "55vh" },
                    minHeight: 280,
                    overflowY: "auto",
                    p: { xs: 1, sm: 1.5 },
                    position: "relative",
                    zIndex: 1,
                    animation: "c64-screen-glow 4s ease-in-out infinite",
                    // Scrollbar
                    "&::-webkit-scrollbar": { width: 0 },
                    scrollbarWidth: "none",
                  }}
                >
                  {/* Output lines */}
                  {lines.map((line) => (
                    <Box
                      key={line.id}
                      component="pre"
                      sx={{
                        m: 0,
                        p: 0,
                        fontFamily: "inherit",
                        fontSize: { xs: "11px", sm: "13px", md: "14px" },
                        lineHeight: 1.5,
                        color: C64.text,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-all",
                        textShadow: "0 0 2px rgba(124,112,218,0.4)",
                      }}
                    >
                      {line.text || "\u00A0"}
                    </Box>
                  ))}

                  {/* Loading animation */}
                  {loading && (
                    <LoadingAnimation onComplete={handleLoadingComplete} />
                  )}

                  {/* Input line with cursor */}
                  {booted && !loading && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        fontFamily: "inherit",
                        fontSize: { xs: "11px", sm: "13px", md: "14px" },
                        lineHeight: 1.5,
                        color: C64.text,
                        textShadow: "0 0 2px rgba(124,112,218,0.4)",
                      }}
                    >
                      <Box
                        component="input"
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        spellCheck={false}
                        autoComplete="off"
                        autoCapitalize="off"
                        sx={{
                          flex: 1,
                          border: "none",
                          outline: "none",
                          bgcolor: "transparent",
                          color: C64.text,
                          fontFamily: "inherit",
                          fontSize: "inherit",
                          lineHeight: "inherit",
                          caretColor: "transparent",
                          p: 0,
                          m: 0,
                          textShadow: "0 0 2px rgba(124,112,218,0.4)",
                          "&::selection": {
                            bgcolor: "rgba(124,112,218,0.3)",
                            color: "#fff",
                          },
                        }}
                      />
                      {/* Blinking block cursor */}
                      <Box
                        component="span"
                        sx={{
                          display: "inline-block",
                          width: { xs: "7px", sm: "8px", md: "9px" },
                          height: { xs: "13px", sm: "15px", md: "16px" },
                          bgcolor: C64.text,
                          animation: "c64-cursor-blink 0.5s step-end infinite",
                          boxShadow: "0 0 4px rgba(124,112,218,0.5)",
                          flexShrink: 0,
                          ml: "1px",
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Bottom section: badge + F-keys */}
          <Box
            sx={{
              mt: 1.5,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.75,
            }}
          >
            {/* COMMODORE 64 badge */}
            <Box
              sx={{
                bgcolor: C64.caseBadge,
                borderRadius: "3px",
                px: 3,
                py: 0.3,
                boxShadow: `
                  inset 0 1px 0 rgba(255,255,255,0.2),
                  inset 0 -1px 0 rgba(0,0,0,0.15),
                  0 1px 2px rgba(0,0,0,0.2)
                `,
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: { xs: "10px", sm: "12px", md: "14px" },
                  fontWeight: "bold",
                  color: "#3a3020",
                  letterSpacing: 3,
                  textAlign: "center",
                }}
              >
                COMMODORE 64
              </Typography>
            </Box>

            {/* F-key strip */}
            <Box
              sx={{
                display: "flex",
                gap: { xs: 0.25, sm: 0.5 },
                justifyContent: "center",
              }}
            >
              {["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8"].map((key) => (
                <Box
                  key={key}
                  sx={{
                    bgcolor: C64.caseColorDark,
                    borderRadius: "2px",
                    px: { xs: 0.5, sm: 1 },
                    py: 0.15,
                    minWidth: { xs: 24, sm: 32 },
                    textAlign: "center",
                    boxShadow:
                      "inset 0 -1px 0 rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "'Courier New', monospace",
                      fontSize: { xs: "7px", sm: "8px" },
                      color: "rgba(255,255,255,0.4)",
                      textAlign: "center",
                    }}
                  >
                    {key}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Power LED indicator */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                mt: 0.25,
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: "#ff3333",
                  boxShadow: "0 0 6px rgba(255,51,51,0.6), 0 0 12px rgba(255,51,51,0.3)",
                }}
              />
              <Typography
                sx={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: { xs: "7px", sm: "8px" },
                  color: C64.caseColorDark,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                POWER
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
