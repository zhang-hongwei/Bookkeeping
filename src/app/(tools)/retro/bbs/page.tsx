"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

// ── Types ──────────────────────────────────────────────
type ScreenState =
  | "dialing"
  | "connecting"
  | "login"
  | "password"
  | "welcome"
  | "main_menu"
  | "messages"
  | "read_msg"
  | "files"
  | "downloading"
  | "games"
  | "game_intro"
  | "art_gallery"
  | "sysop"
  | "users"
  | "logoff";

interface TermLine {
  id: number;
  text: string;
  color?: string;
}

let _id = 0;
const nid = () => ++_id;

// ── Color helpers ──────────────────────────────────────
const C = {
  white: "#c0c0c0",
  cyan: "#55ffff",
  yellow: "#ffff55",
  green: "#55ff55",
  magenta: "#ff55ff",
  red: "#ff5555",
  blue: "#5555ff",
  dim: "#666666",
};

// ── Fake data ──────────────────────────────────────────
const MESSAGES = [
  { from: "CyberPunk", to: "All", date: "04-23-26", subj: "Anyone remember 2400 baud?", body: "Man those were the days... Waiting 5 minutes for a single ANSI art to load. Kids today with their broadband don't know the meaning of patience!" },
  { from: "NeonRider", to: "All", date: "04-22-26", subj: "TradeWars 2002 strategies", body: "I've found a killer route through sector 789. You can make 50K credits in a single day run. Anyone want to team up?" },
  { from: "SysOp", to: "All", date: "04-21-26", subj: "System maintenance notice", body: "BBS will be down Saturday 2-4am for hard drive maintenance. Back up your downloads. Current uptime: 47 days." },
  { from: "DarkFiber", to: "All", date: "04-20-26", subj: "New file uploads", body: "Uploaded some new ANSI art packs to the file library. Check the /art/new directory. Some real masterpieces in there." },
];

const FILES = [
  { name: "ANSI_ART_PACK_47.ZIP", size: "2.4 MB", desc: "Latest ANSI art collection - 50 pieces" },
  { name: "TRADEWARS_2002_V3.EXE", size: "1.1 MB", desc: "TradeWars 2002 door game (BBS door)" },
  { name: "LORD_V3.10.ZIP", size: "890 KB", desc: "Legend of the Red Dragon - classic RPG door" },
  { name: "TERMINAL_FROST_DEMO.MOD", size: "340 KB", desc: "Module music file - chill vibes" },
  { name: "PKZIP_204G.EXE", size: "200 KB", desc: "PKZIP 2.04g - essential compression tool" },
  { name: "ASCII_EDITOR_12.ZIP", size: "560 KB", desc: "TheDraw ASCII/ANSI editor v1.2" },
];

const USERS = [
  { handle: "CyberPunk", lastLogin: "04-23-26 22:14", calls: 342 },
  { handle: "NeonRider", lastLogin: "04-23-26 19:30", calls: 891 },
  { handle: "DarkFiber", lastLogin: "04-22-26 16:45", calls: 156 },
  { handle: "PhreakShow", lastLogin: "04-22-26 11:20", calls: 78 },
  { handle: "ZeroCool", lastLogin: "04-21-26 23:55", calls: 1204 },
  { handle: "AcidBurn", lastLogin: "04-21-26 08:10", calls: 567 },
  { handle: "CrashOver", lastLogin: "04-20-26 20:33", calls: 234 },
  { handle: "SysOp", lastLogin: "04-24-26 00:01", calls: 9999 },
];

const ANSI_ARTS = [
  { title: "Sunset", art: ["  \\|/       \\|/  "," --*--  ~  --*-- ","  /|\\  ~~~  /|\\  "," ~~~   ~~~   ~~~ ","~~~~~=====~~~~~~"], color: C.yellow },
  { title: "Mountain", art: ["     /\\      ","    /  \\     ","   / ~~ \\    ","  / ~~   \\   "," /________\\  "], color: C.green },
  { title: "Heart", art: ["  ***   ***  "," ***** ***** "," *********** ","  *********  ","   *******   ","    *****    ","     ***     "], color: C.red },
  { title: "Robot", art: ["   [_]      ","  /ooo\\     "," |\\___/|    ","  || ||     "," /|   |\\    "], color: C.cyan },
];

const GAMES = [
  { key: "1", name: "TradeWars 2002", desc: "Explore the universe, trade goods, build empires!" },
  { key: "2", name: "Legend of the Red Dragon", desc: "Slay monsters, find treasure, flirt with Violet." },
  { key: "3", name: "Food Fight!", desc: "Throw virtual food at other BBS users." },
  { key: "4", name: "Zorgon's Palace", desc: "Text adventure in a mysterious alien structure." },
];

// ── Play dial-up sound ─────────────────────────────────
function playDialupSound() {
  try {
    const ctx = new AudioContext();
    const dur = 2.5;
    const sampleRate = ctx.sampleRate;
    const buf = ctx.createBuffer(1, sampleRate * dur, sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      // Mix of tones to simulate dial-up handshake
      const f1 = Math.sin(2 * Math.PI * (800 + t * 600) * t);
      const f2 = Math.sin(2 * Math.PI * 1400 * t);
      const f3 = Math.sin(2 * Math.PI * 2100 * t) * 0.5;
      const noise = (Math.random() - 0.5) * 0.3;
      const envelope = t < 0.2 ? t / 0.2 : t > dur - 0.3 ? (dur - t) / 0.3 : 1;
      data[i] = envelope * (f1 * 0.2 + f2 * 0.15 + f3 * 0.1 + noise * 0.15);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    gain.gain.value = 0.15;
    src.connect(gain).connect(ctx.destination);
    src.start();
  } catch {
    // Audio not available, skip
  }
}

// ── Component ──────────────────────────────────────────
export default function BBSPage() {
  const [lines, setLines] = useState<TermLine[]>([]);
  const [input, setInput] = useState("");
  const [screen, setScreen] = useState<ScreenState>("dialing");
  const [handle, setHandle] = useState("");
  const [msgIdx, setMsgIdx] = useState(0);
  const [fileIdx, setFileIdx] = useState(0);
  const [gameIdx, setGameIdx] = useState(0);
  const [artIdx, setArtIdx] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addLines = useCallback((newLines: Array<{ text: string; color?: string }>) => {
    setLines((prev) => [...prev, ...newLines.map((l) => ({ ...l, id: nid() }))]);
  }, []);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight });
    });
  }, []);

  useEffect(() => { scrollToBottom(); }, [lines, scrollToBottom]);

  // ── Boot sequence ────────────────────────────────────
  useEffect(() => {
    const seq: Array<{ text: string; color?: string; delay: number }> = [
      { text: "ATDT 1-800-555-BBS1", color: C.green, delay: 500 },
      { text: "", delay: 300 },
      { text: "DIALING............", color: C.yellow, delay: 1500 },
      { text: "", delay: 200 },
      { text: "CONNECT 2400", color: C.cyan, delay: 800 },
      { text: "", delay: 400 },
    ];

    playDialupSound();

    let total = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (const item of seq) {
      total += item.delay;
      timers.push(setTimeout(() => addLines([item]), total));
    }

    // After dialing, show banner
    total += 600;
    const banner = [
      { text: "+=========================================================+", color: C.cyan },
      { text: "|                                                         |", color: C.cyan },
      { text: "|    R E T R O   B B S   v2.4                             |", color: C.yellow },
      { text: "|    \"Your connection to the digital frontier\"            |", color: C.white },
      { text: "|                                                         |", color: C.cyan },
      { text: "|    Node: 1/4   Speed: 2400 baud   Time: 60 min         |", color: C.green },
      { text: "|                                                         |", color: C.cyan },
      { text: "+=========================================================+", color: C.cyan },
      { text: "", delay: 0 },
    ];
    for (let i = 0; i < banner.length; i++) {
      timers.push(setTimeout(() => addLines([banner[i]]), total + i * 100));
    }

    total += banner.length * 100 + 300;
    timers.push(setTimeout(() => {
      addLines([{ text: "ENTER YOUR HANDLE: ", color: C.cyan }]);
      setScreen("login");
    }, total));

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Focus ────────────────────────────────────────────
  const focus = () => inputRef.current?.focus();

  // ── Handle input ─────────────────────────────────────
  const handleSubmit = useCallback(() => {
    const val = input.trim();
    const lower = val.toLowerCase();

    const showMainMenu = () => {
      const menu = [
        { text: "", color: C.white },
        { text: "+==========================================+", color: C.cyan },
        { text: "|        RETRO BBS - MAIN MENU            |", color: C.yellow },
        { text: "+==========================================+", color: C.cyan },
        { text: "|                                          |", color: C.cyan },
        { text: "|  [M] Message Boards                      |", color: C.white },
        { text: "|  [F] File Library                        |", color: C.white },
        { text: "|  [G] Games & Doors                       |", color: C.white },
        { text: "|  [A] ANSI Art Gallery                    |", color: C.white },
        { text: "|  [S] SysOp Info                          |", color: C.white },
        { text: "|  [U] User List                           |", color: C.white },
        { text: "|  [L] Logoff                              |", color: C.white },
        { text: "|                                          |", color: C.cyan },
        { text: "+==========================================+", color: C.cyan },
        { text: "", color: C.white },
        { text: "Command [M/F/G/A/S/U/L]: ", color: C.green },
      ];
      addLines(menu);
      setScreen("main_menu");
    };

    switch (screen) {
      case "login": {
        addLines([{ text: val, color: C.white }]);
        setHandle(val || "Anonymous");
        addLines([{ text: "PASSWORD: ", color: C.cyan }]);
        setScreen("password");
        setInput("");
        return;
      }

      case "password": {
        addLines([{ text: "********", color: C.white }]);
        addLines([{ text: "", color: C.white }]);
        addLines([
          { text: `Welcome, ${handle}!`, color: C.yellow },
          { text: "Last login: 04-23-26 22:14 from 28.8K modem", color: C.dim },
          { text: "NEW MAIL: 3 messages    TIME LEFT: 60 min", color: C.green },
          { text: "", color: C.white },
          { text: "Checking for new messages...", color: C.dim },
          { text: "You have 4 new messages in your inbox.", color: C.green },
        ]);
        setTimeout(() => showMainMenu(), 600);
        setInput("");
        return;
      }

      case "main_menu": {
        addLines([{ text: val, color: C.white }]);
        const ch = lower.charAt(0);
        if (ch === "m") {
          const hdr = [
            { text: "", color: C.white },
            { text: "+==========================================+", color: C.magenta },
            { text: "|        MESSAGE BOARDS                    |", color: C.yellow },
            { text: "+==========================================+", color: C.magenta },
            { text: "", color: C.white },
          ];
          addLines(hdr);
          MESSAGES.forEach((m, i) => {
            addLines([
              { text: `  [${i + 1}] ${m.subj}`, color: C.cyan },
              { text: `      From: ${m.from}  Date: ${m.date}`, color: C.dim },
            ]);
          });
          addLines([
            { text: "", color: C.white },
            { text: "Enter message # to read, [B] Back: ", color: C.green },
          ]);
          setScreen("messages");
        } else if (ch === "f") {
          const hdr = [
            { text: "", color: C.white },
            { text: "+==========================================+", color: C.magenta },
            { text: "|        FILE LIBRARY                      |", color: C.yellow },
            { text: "+==========================================+", color: C.magenta },
            { text: "", color: C.white },
          ];
          addLines(hdr);
          FILES.forEach((f, i) => {
            addLines([
              { text: `  [${i + 1}] ${f.name}`, color: C.cyan },
              { text: `      ${f.size} - ${f.desc}`, color: C.dim },
            ]);
          });
          addLines([
            { text: "", color: C.white },
            { text: "Enter file # to download, [B] Back: ", color: C.green },
          ]);
          setScreen("files");
        } else if (ch === "g") {
          const hdr = [
            { text: "", color: C.white },
            { text: "+==========================================+", color: C.magenta },
            { text: "|        GAMES & DOORS                     |", color: C.yellow },
            { text: "+==========================================+", color: C.magenta },
            { text: "", color: C.white },
          ];
          addLines(hdr);
          GAMES.forEach((g) => {
            addLines([
              { text: `  [${g.key}] ${g.name}`, color: C.cyan },
              { text: `      ${g.desc}`, color: C.dim },
            ]);
          });
          addLines([
            { text: "", color: C.white },
            { text: "Select game #, [B] Back: ", color: C.green },
          ]);
          setScreen("games");
        } else if (ch === "a") {
          showArtGallery();
        } else if (ch === "s") {
          addLines([
            { text: "", color: C.white },
            { text: "+==========================================+", color: C.magenta },
            { text: "|        SYSOP INFORMATION                 |", color: C.yellow },
            { text: "+==========================================+", color: C.magenta },
            { text: "", color: C.white },
            { text: "  BBS Name    : Retro BBS", color: C.white },
            { text: "  SysOp       : The Archivist", color: C.white },
            { text: "  Location    : Somewhere in Cyberspace", color: C.white },
            { text: "  Nodes       : 4", color: C.white },
            { text: "  Max Speed   : 28.8K baud", color: C.white },
            { text: "  Uptime      : 47 days, 12 hours", color: C.green },
            { text: "  Total Calls : 15,847", color: C.white },
            { text: "  Files       : 2,341 (628 MB)", color: C.white },
            { text: "  Messages    : 34,218", color: C.white },
            { text: "", color: C.white },
            { text: "  \"Keeping the BBS spirit alive since 1993\"", color: C.yellow },
            { text: "", color: C.white },
            { text: "Press [B] to go back, any other key for menu: ", color: C.green },
          ]);
          setScreen("sysop");
        } else if (ch === "u") {
          addLines([
            { text: "", color: C.white },
            { text: "+==========================================+", color: C.magenta },
            { text: "|        USER LIST                         |", color: C.yellow },
            { text: "+==========================================+", color: C.magenta },
            { text: "", color: C.white },
          ]);
          USERS.forEach((u) => {
            addLines([
              { text: `  ${u.handle.padEnd(14)} Calls: ${String(u.calls).padStart(5)}  Last: ${u.lastLogin}`, color: C.white },
            ]);
          });
          addLines([
            { text: "", color: C.white },
            { text: "Press [B] to go back, any other key for menu: ", color: C.green },
          ]);
          setScreen("users");
        } else if (ch === "l") {
          addLines([
            { text: "", color: C.white },
            { text: "Are you sure you want to logoff? [Y/N]: ", color: C.yellow },
          ]);
          setScreen("logoff");
        } else {
          addLines([{ text: "Invalid selection. Try again.", color: C.red }]);
          addLines([{ text: "Command [M/F/G/A/S/U/L]: ", color: C.green }]);
        }
        setInput("");
        return;
      }

      case "messages": {
        addLines([{ text: val, color: C.white }]);
        if (lower === "b") {
          // back to main menu
        } else {
          const idx = parseInt(val) - 1;
          if (idx >= 0 && idx < MESSAGES.length) {
            const m = MESSAGES[idx];
            addLines([
              { text: "", color: C.white },
              { text: `  From: ${m.from}    To: ${m.to}`, color: C.cyan },
              { text: `  Date: ${m.date}`, color: C.dim },
              { text: `  Subj: ${m.subj}`, color: C.yellow },
              { text: "  " + "-".repeat(40), color: C.dim },
              { text: `  ${m.body}`, color: C.white },
              { text: "", color: C.white },
            ]);
          } else {
            addLines([{ text: "  Invalid message number.", color: C.red }]);
          }
        }
        addLines([{ text: "Command [M/F/G/A/S/U/L]: ", color: C.green }]);
        setScreen("main_menu");
        setInput("");
        return;
      }

      case "files": {
        addLines([{ text: val, color: C.white }]);
        if (lower === "b") {
          // back
        } else {
          const idx = parseInt(val) - 1;
          if (idx >= 0 && idx < FILES.length) {
            const f = FILES[idx];
            addLines([
              { text: "", color: C.white },
              { text: `  Downloading: ${f.name}`, color: C.yellow },
            ]);
            // Fake progress bar
            const barChars = 30;
            for (let i = 0; i <= barChars; i++) {
              const bar = "#".repeat(i) + "-".repeat(barChars - i);
              const pct = Math.round((i / barChars) * 100);
              addLines([{ text: `  [${bar}] ${pct}%`, color: i % 2 === 0 ? C.green : C.cyan }]);
            }
            addLines([
              { text: `  Download complete! (${f.size})`, color: C.green },
              { text: "  (File saved to your local disk... just kidding)", color: C.dim },
              { text: "", color: C.white },
            ]);
          } else {
            addLines([{ text: "  Invalid file number.", color: C.red }]);
          }
        }
        addLines([{ text: "Command [M/F/G/A/S/U/L]: ", color: C.green }]);
        setScreen("main_menu");
        setInput("");
        return;
      }

      case "games": {
        addLines([{ text: val, color: C.white }]);
        if (lower === "b") {
          // back
        } else {
          const idx = parseInt(val) - 1;
          if (idx >= 0 && idx < GAMES.length) {
            const g = GAMES[idx];
            addLines([
              { text: "", color: C.white },
              { text: `  Loading ${g.name}...`, color: C.yellow },
              { text: "  Initializing door game connection...", color: C.dim },
              { text: "", color: C.white },
              { text: `  *** ${g.name.toUpperCase()} ***`, color: C.magenta },
              { text: `  ${g.desc}`, color: C.white },
              { text: "", color: C.white },
              { text: "  (Game simulation not available in this demo)", color: C.dim },
              { text: "  Imagine epic adventures happening here!", color: C.green },
              { text: "", color: C.white },
            ]);
          } else {
            addLines([{ text: "  Invalid selection.", color: C.red }]);
          }
        }
        addLines([{ text: "Command [M/F/G/A/S/U/L]: ", color: C.green }]);
        setScreen("main_menu");
        setInput("");
        return;
      }

      case "art_gallery": {
        addLines([{ text: val, color: C.white }]);
        if (lower === "b") {
          addLines([{ text: "Command [M/F/G/A/S/U/L]: ", color: C.green }]);
          setScreen("main_menu");
        } else {
          const idx = parseInt(val) - 1;
          if (idx >= 0 && idx < ANSI_ARTS.length) {
            showArt(idx);
          } else {
            addLines([{ text: "  Invalid selection.", color: C.red }]);
            addLines([{ text: "Select art #, [B] Back: ", color: C.green }]);
          }
        }
        setInput("");
        return;
      }

      case "sysop":
      case "users": {
        addLines([{ text: val, color: C.white }]);
        addLines([{ text: "Command [M/F/G/A/S/U/L]: ", color: C.green }]);
        setScreen("main_menu");
        setInput("");
        return;
      }

      case "logoff": {
        addLines([{ text: val, color: C.white }]);
        if (lower === "y") {
          addLines([
            { text: "", color: C.white },
            { text: "  Thanks for calling Retro BBS!", color: C.yellow },
            { text: "  Connect time: 12 min 34 sec", color: C.dim },
            { text: "", color: C.white },
            { text: "NO CARRIER", color: C.red },
            { text: "", color: C.white },
            { text: "  [ Connection terminated ]", color: C.dim },
            { text: "", color: C.white },
            { text: "  Refresh the page to reconnect.", color: C.dim },
          ]);
          setScreen("dialing");
        } else {
          addLines([{ text: "Command [M/F/G/A/S/U/L]: ", color: C.green }]);
          setScreen("main_menu");
        }
        setInput("");
        return;
      }

      default:
        break;
    }

    setInput("");
  }, [input, screen, handle, addLines]);

  const showArtGallery = useCallback(() => {
    addLines([
      { text: "", color: C.white },
      { text: "+==========================================+", color: C.magenta },
      { text: "|        ANSI ART GALLERY                  |", color: C.yellow },
      { text: "+==========================================+", color: C.magenta },
      { text: "", color: C.white },
    ]);
    ANSI_ARTS.forEach((a, i) => {
      addLines([{ text: `  [${i + 1}] "${a.title}" by RetroArtist`, color: C.cyan }]);
    });
    addLines([
      { text: "", color: C.white },
      { text: "Select art # to view, [B] Back: ", color: C.green },
    ]);
    setScreen("art_gallery");
  }, [addLines]);

  const showArt = useCallback((idx: number) => {
    const art = ANSI_ARTS[idx];
    addLines([
      { text: "", color: C.white },
      { text: `  --- "${art.title}" ---`, color: C.yellow },
      { text: "", color: C.white },
    ]);
    art.art.forEach((line) => {
      addLines([{ text: `  ${line}`, color: art.color }]);
    });
    addLines([
      { text: "", color: C.white },
      { text: "Select art # to view, [B] Back: ", color: C.green },
    ]);
  }, [addLines]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const showInput = screen !== "dialing" && screen !== "connecting";

  return (
    <Box
      onClick={focus}
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
      }}
    >
      {/* Scanlines */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)",
          zIndex: 2,
        }}
      />

      {/* Title bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 0.5,
          bgcolor: "#111",
          borderBottom: "1px solid #333",
          flexShrink: 0,
        }}
      >
        <Typography sx={{ fontFamily: "inherit", color: C.cyan, fontSize: 12, fontWeight: 700 }}>
          RETRO BBS v2.4 — 2400 Baud
        </Typography>
        <Typography sx={{ fontFamily: "inherit", color: C.dim, fontSize: 11 }}>
          Node 1/4
        </Typography>
      </Box>

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          position: "relative",
          p: { xs: 1, sm: 2 },
          overflow: "hidden",
        }}
      >
        {/* Vignette */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            boxShadow: "inset 0 0 100px rgba(0,0,0,0.6)",
            zIndex: 3,
          }}
        />

        {/* Terminal output */}
        <Box
          ref={containerRef}
          sx={{
            height: "100%",
            overflowY: "auto",
            position: "relative",
            zIndex: 1,
            "&::-webkit-scrollbar": { width: 6 },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": { background: "#333", borderRadius: 3 },
          }}
        >
          {lines.map((line) => (
            <Box
              key={line.id}
              component="pre"
              sx={{
                m: 0,
                p: 0,
                fontFamily: "inherit",
                fontSize: { xs: 12, sm: 14 },
                lineHeight: 1.5,
                color: line.color || C.white,
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                textShadow: `0 0 4px ${line.color || C.white}44`,
              }}
            >
              {line.text || "\u00A0"}
            </Box>
          ))}

          {/* Input */}
          {showInput && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                fontFamily: "inherit",
                fontSize: { xs: 12, sm: 14 },
                lineHeight: 1.5,
                color: C.white,
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
                  color: C.green,
                  fontFamily: "inherit",
                  fontSize: "inherit",
                  lineHeight: "inherit",
                  caretColor: C.green,
                  p: 0,
                  m: 0,
                  textShadow: `0 0 4px ${C.green}44`,
                  "&::selection": { bgcolor: "rgba(85,255,85,0.25)" },
                }}
              />
              <Box
                sx={{
                  width: 7,
                  height: 16,
                  bgcolor: C.green,
                  animation: "cursor-blink 1s step-end infinite",
                  boxShadow: `0 0 4px ${C.green}88`,
                  flexShrink: 0,
                  ml: "1px",
                  "@keyframes cursor-blink": {
                    "0%, 49%": { opacity: 1 },
                    "50%, 100%": { opacity: 0 },
                  },
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
          bgcolor: "#111",
          borderTop: "1px solid #333",
          flexShrink: 0,
        }}
      >
        <Typography sx={{ fontFamily: "inherit", color: C.dim, fontSize: 11 }}>
          {handle ? `Logged in as: ${handle}` : "Not connected"}
        </Typography>
        <Typography sx={{ fontFamily: "inherit", color: C.dim, fontSize: 11 }}>
          {new Date().toLocaleTimeString()}
        </Typography>
      </Box>
    </Box>
  );
}
