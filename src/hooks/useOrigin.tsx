"use client"; // this is Next 13 App Router stuff
import { useEffect, useState } from "react";

const useLocation = () => {
    const [mounted, setMounted] = useState(false);
    const location =
        typeof window !== "undefined" && window.location ? window.location : "";

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return location;
};

const useOrigin = () => {
    const [mounted, setMounted] = useState(false);
    const origin =
        typeof window !== "undefined" && window.location.origin
            ? window.location.origin
            : "";

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return process.env.NEXT_PUBLIC_API_URL || origin;
};

export { useLocation };
export default useOrigin
