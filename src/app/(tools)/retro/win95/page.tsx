"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

// ── Types ──────────────────────────────────────────────────────

interface DesktopIcon {
  id: string;
  label: string;
  emoji: string;
  x: number;
  y: number;
}

interface WindowState {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
  type: "my-computer" | "notepad" | "about" | "recycle-bin" | "ie" | "minesweeper";
}

// ── Constants ──────────────────────────────────────────────────

const WIN95_BG = "#008080";
const WIN95_GRAY = "#c0c0c0";
const WIN95_DARK = "#808080";
const WIN95_LIGHT = "#dfdfdf";
const WIN95_WHITE = "#ffffff";
const WIN95_TITLE_START = "#000080";
const WIN95_TITLE_END = "#1084D0";
const WIN95_FONT = "'MS Sans Serif', 'Microsoft Sans Serif', Tahoma, Geneva, sans-serif";

const DESKTOP_ICONS: DesktopIcon[] = [
  { id: "my-computer", label: "My Computer", emoji: "\uD83D\uDDA5\uFE0F", x: 16, y: 16 },
  { id: "recycle-bin", label: "Recycle Bin", emoji: "\uD83D\uDDD1\uFE0F", x: 16, y: 96 },
  { id: "ie", label: "Internet\nExplorer", emoji: "\uD83C\uDF10", x: 16, y: 176 },
  { id: "notepad", label: "Notepad", emoji: "\uD83D\uDCDD", x: 16, y: 256 },
  { id: "minesweeper", label: "Minesweeper", emoji: "\uD83D\uDEA3", x: 16, y: 336 },
];

const START_MENU_ITEMS = [
  { label: "Programs", id: "programs", hasSubmenu: true },
  { label: "Documents", id: "documents", hasSubmenu: false },
  { label: "Settings", id: "settings", hasSubmenu: false },
  { label: "Find", id: "find", hasSubmenu: false },
  { label: "Help", id: "help", hasSubmenu: false },
  { label: "Run...", id: "run", hasSubmenu: false },
  { label: "Shut Down...", id: "shutdown", hasSubmenu: false },
];

const PROGRAMS_SUBMENU = [
  { label: "Accessories", id: "accessories", hasSubmenu: true },
];

const ACCESSORIES_SUBMENU = [
  { label: "Notepad", id: "notepad", hasSubmenu: false },
  { label: "Paint", id: "paint", hasSubmenu: false },
  { label: "Calculator", id: "calculator", hasSubmenu: false },
];

const CONTEXT_MENU_ITEMS = [
  "Arrange Icons",
  "Line up Icons",
  "Refresh",
  "Paste",
  "Properties",
];

// ── Helper: 3D Beveled Styles ─────────────────────────────────

function outsetBorder() {
  return {
    borderTop: `2px solid ${WIN95_WHITE}`,
    borderLeft: `2px solid ${WIN95_WHITE}`,
    borderBottom: `2px solid ${WIN95_DARK}`,
    borderRight: `2px solid ${WIN95_DARK}`,
  };
}

function insetBorder() {
  return {
    borderTop: `2px solid ${WIN95_DARK}`,
    borderLeft: `2px solid ${WIN95_DARK}`,
    borderBottom: `2px solid ${WIN95_WHITE}`,
    borderRight: `2px solid ${WIN95_WHITE}`,
  };
}

// ── Window Content Components ─────────────────────────────────

function MyComputerContent() {
  return (
    <Box sx={{ p: 1, height: "100%", overflow: "auto" }}>
      <Typography sx={{ fontFamily: WIN95_FONT, fontSize: 11, mb: 1, fontWeight: "bold" }}>
        My Computer
      </Typography>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        {[
          { label: "3.5 Floppy (A:)", emoji: "\uD83D\uDCBE" },
          { label: "(C:)", emoji: "\uD83D\uDDA5\uFE0F" },
          { label: "(D:)", emoji: "\uD83D\uDCBF" },
          { label: "Control Panel", emoji: "\u2699\uFE0F" },
          { label: "Printers", emoji: "\uD83D\uDDA8\uFE0F" },
        ].map((item) => (
          <Box
            key={item.label}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: 70,
              cursor: "pointer",
              p: 0.5,
              "&:hover": { bgcolor: "rgba(0,0,128,0.15)" },
            }}
          >
            <Typography sx={{ fontSize: 28, lineHeight: 1 }}>{item.emoji}</Typography>
            <Typography sx={{ fontFamily: WIN95_FONT, fontSize: 10, textAlign: "center", mt: 0.25 }}>
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function RecycleBinContent() {
  return (
    <Box sx={{ p: 1, height: "100%", overflow: "auto" }}>
      <Typography sx={{ fontFamily: WIN95_FONT, fontSize: 11, mb: 1, fontWeight: "bold" }}>
        Recycle Bin
      </Typography>
      <Typography sx={{ fontFamily: WIN95_FONT, fontSize: 11, color: WIN95_DARK }}>
        (empty)
      </Typography>
    </Box>
  );
}

function IEContent() {
  return (
    <Box sx={{ p: 1, height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          ...insetBorder(),
          bgcolor: WIN95_WHITE,
          p: 0.5,
          mb: 1,
          display: "flex",
          alignItems: "center",
          gap: 0.5,
        }}
      >
        <Typography sx={{ fontFamily: WIN95_FONT, fontSize: 11, fontWeight: "bold", flexShrink: 0 }}>
          Address
        </Typography>
        <Box
          sx={{
            flex: 1,
            ...insetBorder(),
            bgcolor: WIN95_WHITE,
            px: 0.5,
          }}
        >
          <Typography sx={{ fontFamily: WIN95_FONT, fontSize: 11 }}>
            http://www.microsoft.com/
          </Typography>
        </Box>
        <button
          style={{
            fontFamily: WIN95_FONT,
            fontSize: 11,
            ...outsetBorder(),
            bgcolor: WIN95_GRAY,
            padding: "1px 6px",
            cursor: "pointer",
          }}
        >
          Go
        </button>
      </Box>
      <Box
        sx={{
          flex: 1,
          ...insetBorder(),
          bgcolor: WIN95_WHITE,
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Typography sx={{ fontSize: 40 }}>\uD83C\uDF10</Typography>
          <Typography sx={{ fontFamily: WIN95_FONT, fontSize: 14, fontWeight: "bold", mt: 1 }}>
            Welcome to the Internet!
          </Typography>
          <Typography sx={{ fontFamily: WIN95_FONT, fontSize: 11, color: WIN95_DARK, mt: 0.5 }}>
            Internet Explorer 3.0
          </Typography>
          <Typography sx={{ fontFamily: WIN95_FONT, fontSize: 11, color: WIN95_DARK }}>
            Your connection has timed out. Please try again later.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

function NotepadContent() {
  const [text, setText] = useState(
    "Welcome to Notepad!\r\n\r\nThis is a simulation of the classic Windows 95 Notepad.\r\nFeel free to type here...\r\n\r\n:-)"
  );

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          display: "flex",
          gap: 0,
          bgcolor: WIN95_GRAY,
          px: 0.5,
          pt: 0.25,
        }}
      >
        {["File", "Edit", "Search", "Help"].map((menu) => (
          <button
            key={menu}
            style={{
              fontFamily: WIN95_FONT,
              fontSize: 11,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: "1px 6px",
            }}
          >
            {menu}
          </button>
        ))}
      </Box>
      <Box sx={{ flex: 1, ...insetBorder(), m: 0.5 }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            outline: "none",
            resize: "none",
            fontFamily: WIN95_FONT,
            fontSize: 12,
            padding: "2px 4px",
            background: WIN95_WHITE,
          }}
        />
      </Box>
    </Box>
  );
}

function MinesweeperContent() {
  return (
    <Box sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Box
        sx={{
          ...insetBorder(),
          bgcolor: WIN95_GRAY,
          p: 1,
          mb: 1,
          display: "flex",
          gap: 2,
          alignItems: "center",
          justifyContent: "center",
          minWidth: 160,
        }}
      >
        <Box sx={{ ...insetBorder(), bgcolor: "black", color: "red", px: 1, fontFamily: WIN95_FONT, fontSize: 14 }}>
          010
        </Box>
        <button
          style={{
            fontSize: 18,
            width: 28,
            height: 28,
            ...outsetBorder(),
            bgcolor: WIN95_GRAY,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          \uD83D\uDE42
        </button>
        <Box sx={{ ...insetBorder(), bgcolor: "black", color: "red", px: 1, fontFamily: WIN95_FONT, fontSize: 14 }}>
          000
        </Box>
      </Box>
      <Box
        sx={{
          ...insetBorder(),
          display: "grid",
          gridTemplateColumns: "repeat(9, 20px)",
          gridTemplateRows: "repeat(9, 20px)",
          bgcolor: WIN95_GRAY,
        }}
      >
        {Array.from({ length: 81 }).map((_, i) => {
          const row = Math.floor(i / 9);
          const col = i % 9;
          const mineRow = [2, 4, 5];
          const mineCol = [1, 3, 7];
          const isMine = mineRow.includes(row) && mineCol.includes(col);
          const revealed = row === 0 && col === 0;
          return (
            <button
              key={i}
              style={{
                width: 20,
                height: 20,
                ...outsetBorder(),
                bgcolor: WIN95_GRAY,
                fontSize: 10,
                fontFamily: WIN95_FONT,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                padding: 0,
                border: revealed ? "1px solid #808080" : undefined,
              }}
            >
              {revealed ? "1" : isMine ? "" : ""}
            </button>
          );
        })}
      </Box>
    </Box>
  );
}

function AboutContent() {
  return (
    <Box sx={{ p: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Typography sx={{ fontSize: 36, mb: 1 }}>
        \uD83D\uDDA5\uFE0F
      </Typography>
      <Typography sx={{ fontFamily: WIN95_FONT, fontSize: 14, fontWeight: "bold", textAlign: "center" }}>
        Microsoft Windows 95
      </Typography>
      <Typography sx={{ fontFamily: WIN95_FONT, fontSize: 11, textAlign: "center", mt: 0.5 }}>
        Version 4.00.950
      </Typography>
      <Typography sx={{ fontFamily: WIN95_FONT, fontSize: 10, textAlign: "center", mt: 1, color: WIN95_DARK }}>
        Copyright &copy; 1981-1996 Microsoft Corp.
      </Typography>
      <Box sx={{ mt: 1, width: "100%", borderTop: `1px solid ${WIN95_DARK}` }} />
      <Typography sx={{ fontFamily: WIN95_FONT, fontSize: 10, textAlign: "center", mt: 1, color: WIN95_DARK }}>
        This product is licensed to:
      </Typography>
      <Typography sx={{ fontFamily: WIN95_FONT, fontSize: 11, textAlign: "center", fontWeight: "bold" }}>
        Retro PC User
      </Typography>
      <Typography sx={{ fontFamily: WIN95_FONT, fontSize: 11, textAlign: "center" }}>
        48 MB RAM
      </Typography>
    </Box>
  );
}

// ── Window Component ───────────────────────────────────────────

interface WindowProps {
  win: WindowState;
  onFocus: (id: string) => void;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onDragStart: (id: string, e: React.MouseEvent) => void;
}

function Win95Window({ win, onFocus, onClose, onMinimize, onMaximize, onDragStart }: WindowProps) {
  if (win.minimized) return null;

  const windowStyle = win.maximized
    ? { position: "absolute" as const, top: 0, left: 0, width: "100%", height: "calc(100% - 36px)" }
    : { position: "absolute" as const, top: win.y, left: win.x, width: win.width, height: win.height };

  const renderContent = () => {
    switch (win.type) {
      case "my-computer":
        return <MyComputerContent />;
      case "notepad":
        return <NotepadContent />;
      case "about":
        return <AboutContent />;
      case "recycle-bin":
        return <RecycleBinContent />;
      case "ie":
        return <IEContent />;
      case "minesweeper":
        return <MinesweeperContent />;
      default:
        return (
          <Box sx={{ p: 1 }}>
            <Typography sx={{ fontFamily: WIN95_FONT, fontSize: 11 }}>
              Window content for {win.title}
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Box
      onMouseDown={() => onFocus(win.id)}
      sx={{
        ...windowStyle,
        zIndex: win.zIndex,
        display: "flex",
        flexDirection: "column",
        ...outsetBorder(),
        bgcolor: WIN95_GRAY,
        boxShadow: "2px 2px 0px rgba(0,0,0,0.3)",
      }}
    >
      {/* Title Bar */}
      <Box
        onMouseDown={(e) => {
          if (!win.maximized) {
            onDragStart(win.id, e);
          }
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: `linear-gradient(to right, ${WIN95_TITLE_START}, ${WIN95_TITLE_END})`,
          px: 0.5,
          py: 0.25,
          cursor: win.maximized ? "default" : "grab",
          userSelect: "none",
          flexShrink: 0,
        }}
      >
        <Typography
          sx={{
            fontFamily: WIN95_FONT,
            fontSize: 11,
            fontWeight: "bold",
            color: WIN95_WHITE,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {win.title}
        </Typography>
        <Box sx={{ display: "flex", gap: "2px" }}>
          {[
            { label: "_", action: () => onMinimize(win.id), title: "Minimize" },
            { label: "\u25A1", action: () => onMaximize(win.id), title: "Maximize" },
            { label: "\u2715", action: () => onClose(win.id), title: "Close" },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={(e) => {
                e.stopPropagation();
                btn.action();
              }}
              title={btn.title}
              style={{
                width: 18,
                height: 16,
                ...outsetBorder(),
                bgcolor: WIN95_GRAY,
                fontFamily: WIN95_FONT,
                fontSize: btn.label === "\u2715" ? 10 : 9,
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                lineHeight: 1,
              }}
            >
              {btn.label}
            </button>
          ))}
        </Box>
      </Box>

      {/* Menu Bar (for some windows) */}
      {(win.type === "my-computer" || win.type === "ie" || win.type === "notepad") && win.type !== "notepad" && (
        <Box
          sx={{
            display: "flex",
            gap: 0,
            bgcolor: WIN95_GRAY,
            px: 0.5,
            borderBottom: `1px solid ${WIN95_DARK}`,
            flexShrink: 0,
          }}
        >
          {["File", "Edit", "View", "Help"].map((menu) => (
            <button
              key={menu}
              style={{
                fontFamily: WIN95_FONT,
                fontSize: 11,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                padding: "1px 6px",
              }}
            >
              {menu}
            </button>
          ))}
        </Box>
      )}

      {/* Content Area */}
      <Box
        sx={{
          flex: 1,
          m: 0.5,
          ...insetBorder(),
          bgcolor: WIN95_WHITE,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {renderContent()}
      </Box>
    </Box>
  );
}

// ── Main Page Component ────────────────────────────────────────

export default function Win95Page() {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [programsHover, setProgramsHover] = useState(false);
  const [accessoriesHover, setAccessoriesHover] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [shutDownDialog, setShutDownDialog] = useState(false);
  const [aboutDialog, setAboutDialog] = useState(false);
  const [nextZIndex, setNextZIndex] = useState(100);
  const [clock, setClock] = useState(new Date());

  const dragRef = useRef<{
    windowId: string;
    startX: number;
    startY: number;
    windowStartX: number;
    windowStartY: number;
  } | null>(null);

  // Clock tick
  useEffect(() => {
    const interval = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClick = () => {
      setStartMenuOpen(false);
      setProgramsHover(false);
      setAccessoriesHover(false);
      setContextMenu(null);
    };
    if (startMenuOpen || contextMenu) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [startMenuOpen, contextMenu]);

  // Global mouse move / up for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setWindows((prev) =>
        prev.map((w) =>
          w.id === dragRef.current!.windowId
            ? { ...w, x: dragRef.current!.windowStartX + dx, y: dragRef.current!.windowStartY + dy }
            : w
        )
      );
    };

    const handleMouseUp = () => {
      dragRef.current = null;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const getNextZIndex = useCallback(() => {
    setNextZIndex((prev) => prev + 1);
    return nextZIndex;
  }, [nextZIndex]);

  const openWindow = useCallback(
    (type: WindowState["type"], title: string, width = 420, height = 320) => {
      const id = `${type}-${Date.now()}`;
      const offsetCount = windows.length % 5;
      const newZ = nextZIndex;
      setNextZIndex((prev) => prev + 1);

      const newWindow: WindowState = {
        id,
        title,
        x: 80 + offsetCount * 30,
        y: 40 + offsetCount * 30,
        width,
        height,
        minimized: false,
        maximized: false,
        zIndex: newZ,
        type,
      };
      setWindows((prev) => [...prev, newWindow]);
    },
    [windows.length, nextZIndex]
  );

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized: true } : w)));
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, maximized: !w.maximized } : w))
    );
  }, []);

  const focusWindow = useCallback(
    (id: string) => {
      setNextZIndex((prev) => prev + 1);
      setWindows((prev) =>
        prev.map((w) =>
          w.id === id ? { ...w, zIndex: nextZIndex + 1, minimized: false } : w
        )
      );
    },
    [nextZIndex]
  );

  const handleDragStart = useCallback((id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const win = windows.find((w) => w.id === id);
    if (!win) return;
    dragRef.current = {
      windowId: id,
      startX: e.clientX,
      startY: e.clientY,
      windowStartX: win.x,
      windowStartY: win.y,
    };
  }, [windows]);

  const handleDesktopIconDblClick = useCallback(
    (iconId: string) => {
      switch (iconId) {
        case "my-computer":
          openWindow("my-computer", "My Computer");
          break;
        case "recycle-bin":
          openWindow("recycle-bin", "Recycle Bin", 320, 240);
          break;
        case "ie":
          openWindow("ie", "Internet Explorer", 480, 380);
          break;
        case "notepad":
          openWindow("notepad", "Untitled - Notepad", 440, 340);
          break;
        case "minesweeper":
          openWindow("minesweeper", "Minesweeper", 250, 320);
          break;
      }
    },
    [openWindow]
  );

  const handleStartMenuItem = useCallback(
    (id: string) => {
      setStartMenuOpen(false);
      setProgramsHover(false);
      setAccessoriesHover(false);

      switch (id) {
        case "notepad":
          openWindow("notepad", "Untitled - Notepad", 440, 340);
          break;
        case "paint":
          openWindow("about", "Paint", 400, 300);
          break;
        case "calculator":
          openWindow("about", "Calculator", 240, 280);
          break;
        case "shutdown":
          setShutDownDialog(true);
          break;
        case "help":
          openWindow("about", "About Windows 95", 340, 280);
          break;
      }
    },
    [openWindow]
  );

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        bgcolor: WIN95_BG,
        position: "relative",
        overflow: "hidden",
        fontFamily: WIN95_FONT,
        userSelect: "none",
      }}
      onContextMenu={handleContextMenu}
    >
      {/* Desktop Icons */}
      <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 36 }}>
        {DESKTOP_ICONS.map((icon) => (
          <Box
            key={icon.id}
            onDoubleClick={() => handleDesktopIconDblClick(icon.id)}
            sx={{
              position: "absolute",
              top: icon.y,
              left: icon.x,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: 64,
              cursor: "pointer",
              p: 0.5,
              "&:hover": {
                "& .icon-label": {
                  bgcolor: "rgba(0,0,128,0.3)",
                  color: WIN95_WHITE,
                },
              },
            }}
          >
            <Typography sx={{ fontSize: 28, lineHeight: 1, mb: 0.25 }}>{icon.emoji}</Typography>
            <Typography
              className="icon-label"
              sx={{
                fontFamily: WIN95_FONT,
                fontSize: 10,
                color: WIN95_WHITE,
                textAlign: "center",
                px: 0.5,
                lineHeight: 1.2,
                whiteSpace: "pre-line",
              }}
            >
              {icon.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Windows */}
      {windows.map((win) => (
        <Win95Window
          key={win.id}
          win={win}
          onFocus={focusWindow}
          onClose={closeWindow}
          onMinimize={minimizeWindow}
          onMaximize={maximizeWindow}
          onDragStart={handleDragStart}
        />
      ))}

      {/* Context Menu */}
      {contextMenu && (
        <Box
          sx={{
            position: "absolute",
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 9999,
            ...outsetBorder(),
            bgcolor: WIN95_GRAY,
            minWidth: 160,
            py: 0.25,
          }}
        >
          {CONTEXT_MENU_ITEMS.map((item) => (
            <button
              key={item}
              onClick={() => setContextMenu(null)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                border: "none",
                background: "transparent",
                fontFamily: WIN95_FONT,
                fontSize: 11,
                padding: "3px 24px",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.background = "#000080";
                (e.target as HTMLElement).style.color = WIN95_WHITE;
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.background = "transparent";
                (e.target as HTMLElement).style.color = "inherit";
              }}
            >
              {item}
            </button>
          ))}
        </Box>
      )}

      {/* Shut Down Dialog */}
      {shutDownDialog && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10000,
            ...outsetBorder(),
            bgcolor: WIN95_GRAY,
            p: 0,
            width: 380,
          }}
        >
          {/* Title Bar */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: `linear-gradient(to right, ${WIN95_TITLE_START}, ${WIN95_TITLE_END})`,
              px: 0.5,
              py: 0.25,
            }}
          >
            <Typography sx={{ fontFamily: WIN95_FONT, fontSize: 11, fontWeight: "bold", color: WIN95_WHITE }}>
              Shut Down Windows
            </Typography>
          </Box>
          <Box sx={{ p: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Typography sx={{ fontSize: 36, mb: 1 }}>\uD83D\uDDA5\uFE0F</Typography>
            <Typography sx={{ fontFamily: WIN95_FONT, fontSize: 14, fontWeight: "bold", textAlign: "center", mb: 2 }}>
              It is now safe to turn off
              <br />
              your computer.
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <button
                onClick={() => setShutDownDialog(false)}
                style={{
                  fontFamily: WIN95_FONT,
                  fontSize: 11,
                  ...outsetBorder(),
                  bgcolor: WIN95_GRAY,
                  padding: "2px 20px",
                  cursor: "pointer",
                }}
              >
                OK
              </button>
            </Box>
          </Box>
        </Box>
      )}

      {/* Start Menu */}
      {startMenuOpen && (
        <Box
          sx={{
            position: "absolute",
            bottom: 36,
            left: 0,
            zIndex: 5000,
            ...outsetBorder(),
            bgcolor: WIN95_GRAY,
            minWidth: 180,
            display: "flex",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Windows banner on left */}
          <Box
            sx={{
              width: 24,
              bgcolor: WIN95_DARK,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              pb: 1,
            }}
          >
            <Typography
              sx={{
                fontFamily: WIN95_FONT,
                fontSize: 14,
                fontWeight: "bold",
                color: WIN95_WHITE,
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
                letterSpacing: 2,
              }}
            >
              Windows95
            </Typography>
          </Box>

          {/* Menu Items */}
          <Box sx={{ flex: 1, py: 0.5 }}>
            {START_MENU_ITEMS.map((item) => (
              <Box key={item.id} sx={{ position: "relative" }}>
                <button
                  onClick={() => {
                    if (!item.hasSubmenu) handleStartMenuItem(item.id);
                  }}
                  onMouseEnter={() => {
                    if (item.id === "programs") setProgramsHover(true);
                    else setProgramsHover(false);
                  }}
                  onMouseLeave={() => {
                    if (item.id === "programs") {
                      // Allow time for submenu hover
                      setTimeout(() => {
                        setProgramsHover((prev) => {
                          return false;
                        });
                      }, 200);
                    }
                  }}
                  style={{
                    display: "flex",
                    width: "100%",
                    textAlign: "left",
                    border: "none",
                    background: "transparent",
                    fontFamily: WIN95_FONT,
                    fontSize: 11,
                    padding: "4px 24px",
                    cursor: "pointer",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                  onMouseEnterCapture={(e) => {
                    (e.target as HTMLElement).style.background = "#000080";
                    (e.target as HTMLElement).style.color = WIN95_WHITE;
                  }}
                  onMouseLeaveCapture={(e) => {
                    (e.target as HTMLElement).style.background = "transparent";
                    (e.target as HTMLElement).style.color = "inherit";
                  }}
                >
                  <span>{item.label}</span>
                  {item.hasSubmenu && <span style={{ fontSize: 8 }}>\u25B6</span>}
                </button>

                {/* Programs Submenu */}
                {item.id === "programs" && programsHover && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: "100%",
                      ...outsetBorder(),
                      bgcolor: WIN95_GRAY,
                      minWidth: 160,
                      py: 0.25,
                      zIndex: 5001,
                    }}
                    onMouseEnter={() => setProgramsHover(true)}
                    onMouseLeave={() => setProgramsHover(false)}
                  >
                    {PROGRAMS_SUBMENU.map((prog) => (
                      <Box key={prog.id} sx={{ position: "relative" }}>
                        <button
                          onMouseEnter={() => {
                            if (prog.id === "accessories") setAccessoriesHover(true);
                          }}
                          onMouseLeave={() => {
                            if (prog.id === "accessories") {
                              setTimeout(() => setAccessoriesHover(false), 200);
                            }
                          }}
                          style={{
                            display: "flex",
                            width: "100%",
                            textAlign: "left",
                            border: "none",
                            background: "transparent",
                            fontFamily: WIN95_FONT,
                            fontSize: 11,
                            padding: "4px 24px",
                            cursor: "pointer",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                          onMouseEnterCapture={(e) => {
                            (e.target as HTMLElement).style.background = "#000080";
                            (e.target as HTMLElement).style.color = WIN95_WHITE;
                          }}
                          onMouseLeaveCapture={(e) => {
                            (e.target as HTMLElement).style.background = "transparent";
                            (e.target as HTMLElement).style.color = "inherit";
                          }}
                        >
                          <span>{prog.label}</span>
                          {prog.hasSubmenu && <span style={{ fontSize: 8 }}>\u25B6</span>}
                        </button>

                        {/* Accessories Submenu */}
                        {prog.id === "accessories" && accessoriesHover && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: "100%",
                              ...outsetBorder(),
                              bgcolor: WIN95_GRAY,
                              minWidth: 140,
                              py: 0.25,
                              zIndex: 5002,
                            }}
                            onMouseEnter={() => {
                              setAccessoriesHover(true);
                              setProgramsHover(true);
                            }}
                            onMouseLeave={() => setAccessoriesHover(false)}
                          >
                            {ACCESSORIES_SUBMENU.map((acc) => (
                              <button
                                key={acc.id}
                                onClick={() => {
                                  handleStartMenuItem(acc.id);
                                  setAccessoriesHover(false);
                                  setProgramsHover(false);
                                }}
                                style={{
                                  display: "block",
                                  width: "100%",
                                  textAlign: "left",
                                  border: "none",
                                  background: "transparent",
                                  fontFamily: WIN95_FONT,
                                  fontSize: 11,
                                  padding: "4px 24px",
                                  cursor: "pointer",
                                }}
                                onMouseEnter={(e) => {
                                  (e.target as HTMLElement).style.background = "#000080";
                                  (e.target as HTMLElement).style.color = WIN95_WHITE;
                                }}
                                onMouseLeave={(e) => {
                                  (e.target as HTMLElement).style.background = "transparent";
                                  (e.target as HTMLElement).style.color = "inherit";
                                }}
                              >
                                {acc.label}
                              </button>
                            ))}
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Taskbar */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 36,
          ...outsetBorder(),
          borderTop: `2px solid ${WIN95_WHITE}`,
          borderLeft: "none",
          borderRight: "none",
          borderBottom: "none",
          bgcolor: WIN95_GRAY,
          display: "flex",
          alignItems: "center",
          px: 0.25,
          gap: 0.25,
          zIndex: 4000,
        }}
      >
        {/* Start Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setStartMenuOpen((prev) => !prev);
            setContextMenu(null);
          }}
          style={{
            fontFamily: WIN95_FONT,
            fontSize: 11,
            fontWeight: "bold",
            ...outsetBorder(),
            bgcolor: WIN95_GRAY,
            padding: "2px 6px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 3,
            height: 28,
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              width: 16,
              height: 14,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gridTemplateRows: "1fr 1fr",
              border: "1px solid black",
              overflow: "hidden",
            }}
          >
            <Box sx={{ bgcolor: "#FF0000" }} />
            <Box sx={{ bgcolor: "#00FF00" }} />
            <Box sx={{ bgcolor: "#0000FF" }} />
            <Box sx={{ bgcolor: "#FFFF00" }} />
          </Box>
          Start
        </button>

        {/* Separator */}
        <Box sx={{ width: "2px", height: 24, bgcolor: WIN95_DARK, borderRight: `1px solid ${WIN95_WHITE}`, mx: 0.25 }} />

        {/* Running Window Buttons */}
        <Box sx={{ flex: 1, display: "flex", gap: "2px", overflow: "hidden" }}>
          {windows.map((win) => (
            <button
              key={win.id}
              onClick={() => {
                if (win.minimized) {
                  focusWindow(win.id);
                } else {
                  minimizeWindow(win.id);
                }
              }}
              style={{
                fontFamily: WIN95_FONT,
                fontSize: 10,
                ...(win.minimized ? outsetBorder() : { ...insetBorder(), bgcolor: WIN95_LIGHT }),
                bgcolor: win.minimized ? WIN95_GRAY : WIN95_LIGHT,
                padding: "2px 8px",
                cursor: "pointer",
                height: 26,
                maxWidth: 160,
                minWidth: 60,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                textAlign: "left",
              }}
            >
              {win.title}
            </button>
          ))}
        </Box>

        {/* System Tray */}
        <Box
          sx={{
            ...insetBorder(),
            bgcolor: WIN95_GRAY,
            px: 1,
            py: 0.25,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            height: 28,
            flexShrink: 0,
          }}
        >
          <Typography sx={{ fontFamily: WIN95_FONT, fontSize: 11 }}>
            {formatTime(clock)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
