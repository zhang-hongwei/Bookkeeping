'use client'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from "nprogress";

// 配置 NProgress
NProgress.configure({
    showSpinner: true,
    minimum: 0.08,
    easing: 'ease',
    speed: 500,
});

const NProgressProvider = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        return () => {
            NProgress.done();
        };
    }, [pathname, searchParams]);

    return null;
}

export default NProgressProvider;