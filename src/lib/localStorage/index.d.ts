export interface LocalStorageType {
    setItem: (key: string, value: any) => void;
    getItem: (key: string) => string | null;
    removeItem: (key: string) => void;
    clear: () => void;
}
