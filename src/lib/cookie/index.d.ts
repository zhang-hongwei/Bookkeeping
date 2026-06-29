export interface CookieType {
    
    setCookie: (name: string, value: string, days?: number) => void;
    getCookie: (name: string) => string | null;
    deleteCookie: (name: string) => void;

}