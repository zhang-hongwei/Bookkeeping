"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

// ── Types ──────────────────────────────────────────────
interface TerminalLine {
  id: number;
  type: "output" | "input" | "error" | "system";
  text: string;
}

interface FileSystem {
  [key: string]: string | FileSystem;
}

// ── Fake file system ───────────────────────────────────
const fileSystem: FileSystem = {
  home: {
    user: {
      "readme.txt":
        "Welcome to the Retro Terminal v1.0\n\nThis is a simulated Linux terminal built with React.\nType 'help' to see available commands.",
      "about.txt":
        "This project is part of the Dev Tools collection.\nBuilt with Next.js 16 + MUI v7 + TypeScript.",
      projects: {
        "design-tool.ts":
          "// Design tool for web developers\nexport const name = 'dev-tools';\nexport const version = '1.0.0';",
        notes: {
          "todo.md":
            "# TODO\n- [x] Build retro terminal\n- [ ] Add more easter eggs\n- [ ] Take over the world",
        },
      },
      ".bash_history": "ls\ncd projects\ncat design-tool.ts\n",
      ".secret": "Nice try! The real secrets are in /etc/passwd... just kidding 😄",
    },
  },
  etc: {
    hostname: "retro-terminal",
    "os-release":
      'NAME="RetroOS"\nVERSION="1.0"\nID=retro\nPRETTY_NAME="RetroOS 1.0 (Vintage Viper)"',
    passwd: "root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:user:/home/user:/bin/bash",
  },
  var: {
    log: {
      "syslog":
        "Apr 24 12:00:01 retro-terminal systemd[1]: Started Retro Terminal Service.\nApr 24 12:00:02 retro-terminal kernel: All systems nominal.",
    },
  },
};

// ── Helper ─────────────────────────────────────────────
let lineId = 0;
const nextId = () => ++lineId;

function resolvePath(cwd: string, target: string): string {
  if (target.startsWith("/")) return normalizePath(target);
  if (target === "~" || target.startsWith("~/"))
    return normalizePath("/home/user" + target.slice(1));
  return normalizePath(cwd + "/" + target);
}

function normalizePath(p: string): string {
  const parts = p.split("/").filter(Boolean);
  const stack: string[] = [];
  for (const part of parts) {
    if (part === "..") stack.pop();
    else if (part !== ".") stack.push(part);
  }
  return "/" + stack.join("/");
}

function getNode(path: string): string | FileSystem | null {
  if (path === "/") return fileSystem;
  const parts = path.split("/").filter(Boolean);
  let node: string | FileSystem = fileSystem;
  for (const part of parts) {
    if (typeof node === "string") return null;
    if (!(part in node)) return null;
    node = node[part];
  }
  return node;
}

function cwdToDisplay(cwd: string): string {
  return cwd.replace(/^\/home\/user/, "~") || "/";
}

// ── Commands ───────────────────────────────────────────
type CmdResult = { lines: Omit<TerminalLine, "id">[]; newCwd?: string };

function processCommand(input: string, cwd: string): CmdResult {
  const tokens = input.trim().split(/\s+/);
  const cmd = tokens[0];
  const args = tokens.slice(1);

  switch (cmd) {
    case "help":
      return {
        lines: [
          { type: "system", text: "Available commands:" },
          { type: "output", text: "  help          Show this help message" },
          { type: "output", text: "  ls [path]     List directory contents" },
          { type: "output", text: "  cd <path>     Change directory" },
          { type: "output", text: "  cat <file>    Display file contents" },
          { type: "output", text: "  pwd           Print working directory" },
          { type: "output", text: "  echo <text>   Print text" },
          { type: "output", text: "  whoami        Print current user" },
          { type: "output", text: "  date          Print current date" },
          { type: "output", text: "  uname -a      Print system info" },
          { type: "output", text: "  neofetch      System information" },
          { type: "output", text: "  cowsay <msg>  Moo!" },
          { type: "output", text: "  matrix        Enter the Matrix" },
          { type: "output", text: "  clear         Clear the terminal" },
          { type: "output", text: "  history       Command history" },
          { type: "output", text: "  fortune       Random fortune cookie" },
        ],
      };

    case "ls": {
      const target = args[0] ? resolvePath(cwd, args[0]) : cwd;
      const node = getNode(target);
      if (node === null || typeof node === "string")
        return {
          lines: [
            { type: "error", text: `ls: cannot access '${args[0] || "."}': No such file or directory` },
          ],
        };
      const entries = Object.keys(node).sort((a, b) => {
        const aDir = typeof (node as FileSystem)[a] !== "string";
        const bDir = typeof (node as FileSystem)[b] !== "string";
        if (aDir && !bDir) return -1;
        if (!aDir && bDir) return 1;
        return a.localeCompare(b);
      });
      const display = entries.map((e) =>
        typeof (node as FileSystem)[e] !== "string" ? `\x1b[34m${e}/\x1b[0m` : e
      );
      // We'll render colors via spans, so return raw entries with type info
      return {
        lines: entries.map((e) => {
          const isDir = typeof (node as FileSystem)[e] !== "string";
          return { type: isDir ? ("system" as const) : ("output" as const), text: isDir ? `  ${e}/` : `  ${e}` };
        }),
      };
    }

    case "cd": {
      if (!args[0] || args[0] === "~") return { lines: [], newCwd: "/home/user" };
      const target = resolvePath(cwd, args[0]);
      const node = getNode(target);
      if (node === null || typeof node === "string")
        return { lines: [{ type: "error", text: `cd: no such directory: ${args[0]}` }] };
      return { lines: [], newCwd: target };
    }

    case "cat": {
      if (!args[0]) return { lines: [{ type: "error", text: "cat: missing file operand" }] };
      const target = resolvePath(cwd, args[0]);
      const node = getNode(target);
      if (node === null)
        return { lines: [{ type: "error", text: `cat: ${args[0]}: No such file or directory` }] };
      if (typeof node !== "string")
        return { lines: [{ type: "error", text: `cat: ${args[0]}: Is a directory` }] };
      return { lines: node.split("\n").map((l) => ({ type: "output" as const, text: l })) };
    }

    case "pwd":
      return { lines: [{ type: "output", text: cwd }] };

    case "echo":
      return { lines: [{ type: "output", text: args.join(" ") }] };

    case "whoami":
      return { lines: [{ type: "output", text: "user" }] };

    case "date":
      return { lines: [{ type: "output", text: new Date().toString() }] };

    case "uname": {
      if (args.includes("-a"))
        return {
          lines: [
            {
              type: "output",
              text: "RetroOS retro-terminal 1.0.0-vintage #1 SMP PREEMPT x86_64 GNU/Linux",
            },
          ],
        };
      return { lines: [{ type: "output", text: "RetroOS" }] };
    }

    case "clear":
      return { lines: [{ type: "system" as const, text: "__CLEAR__" }] };

    case "history":
      return { lines: [{ type: "error", text: "history: not implemented in this demo — use ↑/↓ keys instead!" }] };

    case "neofetch":
      return {
        lines: [
          { type: "system", text: "        .--.         user@retro-terminal" },
          { type: "system", text: "       |o_o |        -----------------" },
          { type: "system", text: "       |:_/ |        OS: RetroOS 1.0 (Vintage Viper)" },
          { type: "output", text: "      //   \\ \\       Host: Dev Tools Workstation" },
          { type: "output", text: "     (|     | )      Kernel: 1.0.0-vintage" },
          { type: "output", text: "    /'\\_   _/`\\      Uptime: since you opened this page" },
          { type: "output", text: "    \\___)=(___/      Shell: retrosh 1.0" },
          { type: "output", text: "                     Terminal: Retro Terminal v1.0" },
          { type: "output", text: "                     Resolution: your browser window" },
          { type: "output", text: "                     Theme: Phosphor Amber [VT220]" },
          { type: "output", text: "                     CPU: Your imagination" },
          { type: "output", text: "                     Memory: ∞ MB / ∞ MB" },
        ],
      };

    case "cowsay": {
      const msg = args.join(" ") || "Moo!";
      const border = "-".repeat(msg.length + 2);
      return {
        lines: [
          { type: "output", text: ` ${border}` },
          { type: "output", text: `< ${msg} >` },
          { type: "output", text: ` ${border}` },
          { type: "output", text: "        \\   ^__^" },
          { type: "output", text: "         \\  (oo)\\_______" },
          { type: "output", text: "            (__)\\       )\\/\\" },
          { type: "output", text: "                ||----w |" },
          { type: "output", text: "                ||     ||" },
        ],
      };
    }

    case "matrix":
      return {
        lines: [
          { type: "system", text: "Wake up, Neo..." },
          { type: "system", text: "The Matrix has you..." },
          { type: "system", text: "Follow the white rabbit." },
          { type: "output", text: "" },
          { type: "system", text: "Knock, knock, Neo." },
        ],
      };

    case "fortune": {
      const fortunes = [
        "You will be fortunate in everything you put your hands to.",
        "A ship in harbor is safe, but that's not why ships are built.",
        "The best way to predict the future is to invent it. — Alan Kay",
        "There are only 10 types of people: those who understand binary and those who don't.",
        "It works on my machine. ¯\\_(ツ)_/¯",
        "To err is human; to really foul things up requires a computer.",
        "The cloud is just someone else's computer.",
        "There is no place like 127.0.0.1",
      ];
      return {
        lines: [{ type: "output", text: fortunes[Math.floor(Math.random() * fortunes.length)] }],
      };
    }

    case "sudo":
      return {
        lines: [
          { type: "error", text: "[sudo] password for user: " },
          { type: "error", text: "Nice try! This is a sandboxed terminal. 😏" },
        ],
      };

    case "exit":
      return {
        lines: [
          { type: "system", text: "logout" },
          { type: "output", text: "Connection to retro-terminal closed." },
          { type: "system", text: "Just kidding, you can't leave that easily. Type 'help' to continue." },
        ],
      };

    default:
      if (!cmd) return { lines: [] };
      return {
        lines: [
          { type: "error", text: `${cmd}: command not found. Type 'help' for available commands.` },
        ],
      };
  }
}

// ── Scanline overlay ───────────────────────────────────
function Scanlines() {
  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)",
        zIndex: 2,
      }}
    />
  );
}

// ── Flicker animation keyframes (injected once) ────────
const FLICKER_CSS = `
@keyframes terminal-flicker {
  0%   { opacity: 0.97; }
  5%   { opacity: 0.95; }
  10%  { opacity: 0.98; }
  15%  { opacity: 0.96; }
  20%  { opacity: 0.99; }
  50%  { opacity: 0.97; }
  80%  { opacity: 0.98; }
  90%  { opacity: 0.96; }
  100% { opacity: 0.98; }
}
@keyframes cursor-blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}
@keyframes boot-text {
  from { opacity: 0; }
  to   { opacity: 1; }
}
`;

// ── Component ──────────────────────────────────────────
export default function TerminalPage() {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState("");
  const [cwd, setCwd] = useState("/home/user");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [booted, setBooted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [lines, scrollToBottom]);

  // Boot sequence
  useEffect(() => {
    if (booted) return;
    const bootLines: Omit<TerminalLine, "id">[] = [
      { type: "system", text: "BIOS v3.14 — Memory Test: 640K OK" },
      { type: "system", text: "Loading RetroOS 1.0 (Vintage Viper)..." },
      { type: "output", text: "[  OK  ] Started system logger." },
      { type: "output", text: "[  OK  ] Started network manager." },
      { type: "output", text: "[  OK  ] Reached target graphical interface." },
      { type: "output", text: "" },
      { type: "system", text: "╔══════════════════════════════════════════════╗" },
      { type: "system", text: "║        Retro Terminal v1.0 — Phosphor       ║" },
      { type: "system", text: "║     Type 'help' for available commands       ║" },
      { type: "system", text: "╚══════════════════════════════════════════════╝" },
      { type: "output", text: "" },
    ];

    let i = 0;
    const timer = setInterval(() => {
      if (i < bootLines.length) {
        setLines((prev) => [...prev, { ...bootLines[i], id: nextId() }]);
        i++;
      } else {
        clearInterval(timer);
        setBooted(true);
      }
    }, 180);
    return () => clearInterval(timer);
  }, [booted]);

  // Focus input on click
  const focusInput = () => inputRef.current?.focus();

  // Handle command
  const handleSubmit = () => {
    const trimmed = input.trim();
    const newLines: TerminalLine[] = [
      { id: nextId(), type: "input", text: `${cwdToDisplay(cwd)} $ ${trimmed}` },
    ];

    if (trimmed) {
      const result = processCommand(trimmed, cwd);
      if (result.lines.length === 1 && result.lines[0].text === "__CLEAR__") {
        setLines([]);
      } else {
        for (const l of result.lines) {
          newLines.push({ ...l, id: nextId() });
        }
        if (result.newCwd) setCwd(result.newCwd);
      }
      setHistory((prev) => [...prev, trimmed]);
    }

    setLines((prev) => [...prev, ...newLines]);
    setInput("");
    setHistoryIdx(-1);
  };

  // Key handling
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const next = historyIdx < history.length - 1 ? historyIdx + 1 : historyIdx;
      setHistoryIdx(next);
      setInput(history[history.length - 1 - next]);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx <= 0) {
        setHistoryIdx(-1);
        setInput("");
        return;
      }
      const next = historyIdx - 1;
      setHistoryIdx(next);
      setInput(history[history.length - 1 - next]);
    }
    if (e.key === "Tab") {
      e.preventDefault();
      // Basic tab completion for commands
      const commands = [
        "help", "ls", "cd", "cat", "pwd", "echo", "whoami", "date",
        "uname", "neofetch", "cowsay", "matrix", "clear", "fortune",
        "history", "sudo", "exit",
      ];
      const match = commands.find((c) => c.startsWith(input.trim()));
      if (match) setInput(match);
    }
    if (e.ctrlKey && e.key === "l") {
      e.preventDefault();
      setLines([]);
    }
  };

  const lineColor = (type: TerminalLine["type"]) => {
    switch (type) {
      case "error":
        return "#ff6b6b";
      case "system":
        return "#00e676";
      case "input":
        return "#ffd54f";
      default:
        return "#ffb300";
    }
  };

  return (
    <>
      <style>{FLICKER_CSS}</style>
      <Box
        onClick={focusInput}
        sx={{
          width: "100vw",
          height: "100vh",
          bgcolor: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'Courier New', 'Lucida Console', monospace",
          position: "relative",
          cursor: "text",
          overflow: "hidden",
          animation: "terminal-flicker 4s infinite",
        }}
      >
        {/* Title bar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: 2,
            py: 0.5,
            bgcolor: "#1a1a1a",
            borderBottom: "1px solid #333",
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: "flex", gap: 0.75, mr: 2 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#ff5f56" }} />
            <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#ffbd2e" }} />
            <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#27c93f" }} />
          </Box>
          <Typography
            sx={{
              fontFamily: "inherit",
              color: "#ffb300",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 1,
              textShadow: "0 0 8px rgba(255,179,0,0.6)",
            }}
          >
            user@retro-terminal:~
          </Typography>
        </Box>

        {/* CRT bezel */}
        <Box
          sx={{
            flex: 1,
            position: "relative",
            p: { xs: 1, sm: 2, md: 4 },
            overflow: "hidden",
          }}
        >
          {/* CRT curvature / vignette effect */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              boxShadow: "inset 0 0 120px rgba(0,0,0,0.7), inset 0 0 40px rgba(0,0,0,0.3)",
              borderRadius: 8,
              zIndex: 3,
            }}
          />
          <Scanlines />

          {/* Terminal content */}
          <Box
            ref={containerRef}
            sx={{
              height: "100%",
              overflowY: "auto",
              pr: 1,
              pl: 1,
              position: "relative",
              zIndex: 1,
              // Custom scrollbar
              "&::-webkit-scrollbar": { width: 6 },
              "&::-webkit-scrollbar-track": { background: "transparent" },
              "&::-webkit-scrollbar-thumb": {
                background: "#333",
                borderRadius: 3,
              },
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
                  fontSize: { xs: 13, sm: 15 },
                  lineHeight: 1.6,
                  color: lineColor(line.type),
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                  textShadow:
                    line.type === "system"
                      ? "0 0 6px rgba(0,230,118,0.5)"
                      : line.type === "error"
                        ? "0 0 6px rgba(255,107,107,0.5)"
                        : "0 0 6px rgba(255,179,0,0.4)",
                  animation: "boot-text 0.15s ease-in",
                }}
              >
                {line.text || "\u00A0"}
              </Box>
            ))}

            {/* Input line */}
            {booted && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  fontFamily: "inherit",
                  fontSize: { xs: 13, sm: 15 },
                  lineHeight: 1.6,
                  color: "#ffd54f",
                  textShadow: "0 0 6px rgba(255,213,79,0.5)",
                }}
              >
                <Box component="span" sx={{ whiteSpace: "pre" }}>
                  {cwdToDisplay(cwd)} $&nbsp;
                </Box>
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
                    color: "#ffb300",
                    fontFamily: "inherit",
                    fontSize: "inherit",
                    lineHeight: "inherit",
                    caretColor: "#ffb300",
                    p: 0,
                    m: 0,
                    textShadow: "0 0 6px rgba(255,179,0,0.4)",
                    "&::selection": {
                      bgcolor: "rgba(255,179,0,0.3)",
                      color: "#fff",
                    },
                  }}
                />
                <Box
                  component="span"
                  sx={{
                    width: 8,
                    height: 18,
                    bgcolor: "#ffb300",
                    animation: "cursor-blink 1s step-end infinite",
                    boxShadow: "0 0 6px rgba(255,179,0,0.6)",
                    flexShrink: 0,
                    ml: "1px",
                  }}
                />
              </Box>
            )}
          </Box>
        </Box>

        {/* Status bar */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            px: 2,
            py: 0.3,
            bgcolor: "#1a1a1a",
            borderTop: "1px solid #333",
            flexShrink: 0,
          }}
        >
          <Typography
            sx={{
              fontFamily: "inherit",
              color: "#555",
              fontSize: 11,
            }}
          >
            RetroSH v1.0 — Phosphor Amber CRT
          </Typography>
          <Typography
            sx={{
              fontFamily: "inherit",
              color: "#555",
              fontSize: 11,
            }}
          >
            {new Date().toLocaleDateString()}
          </Typography>
        </Box>
      </Box>
    </>
  );
}
