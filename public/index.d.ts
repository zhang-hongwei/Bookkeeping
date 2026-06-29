type Position = "right-bottom" | "left-bottom" | "right-top" | "left-top";
interface ThemeConfig {
    primaryColor?: string;
    mode?: "light" | "dark";
    position?: Position;
    iconUrl?: string;
    buttonStyle?: {
        backgroundColor?: string;
        borderColor?: string;
        size?: number;
    };
}
interface PageContext {
    currentPage?: string;
    activeModule?: string;
    selectedItems?: string[];
    metadata?: Record<string, unknown>;
}
interface SmartAIConfig {
    appId: string;
    apiBase: string;
    token: string;
    user: {
        id: string;
        name: string;
        [key: string]: unknown;
    };
    theme?: ThemeConfig;
    context?: PageContext;
    position?: Position;
    debug?: boolean;
    preload?: boolean;
    locale?: string;
}
type SDKState = "IDLE" | "LOADING" | "HANDSHAKE" | "AUTHENTICATING" | "READY" | "OPEN" | "CLOSED" | "ERROR" | "DESTROYED";
type EventCallback = (payload: unknown) => void;

declare class SmartAI {
    private config;
    private stateMachine;
    private messageBus;
    private iframeManager;
    private handshake;
    private floatingButton;
    private eventListeners;
    private actionQueue;
    init(config?: Partial<SmartAIConfig>): void;
    open(): void;
    close(): void;
    toggle(): void;
    updateContext(context: PageContext): void;
    setTheme(theme: ThemeConfig): void;
    setToken(token: string): void;
    on(event: string, callback: EventCallback): void;
    off(event: string, callback: EventCallback): void;
    getState(): SDKState;
    destroy(): void;
    private _setupNotificationListeners;
    private _enqueueOrExecute;
    private _flushActionQueue;
    private _createMessage;
}

declare global {
    interface Window {
        SmartAI: SmartAI;
        smartAIConfig?: Partial<SmartAIConfig>;
    }
}

export { type PageContext, type SDKState, SmartAI, type SmartAIConfig, type ThemeConfig };
