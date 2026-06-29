"use client"; // this is Next 13 App Router stuff
import { useEffect, useState } from 'react';

const getDynamicContentHeight = (navbarHeight: any) => {
    if (typeof window !== "undefined") {
        // 获取视口的高度
        const viewportHeight = window.innerHeight;

        // 计算内容区的高度
        const contentHeight = viewportHeight - navbarHeight;

        // 返回内容区的高度
        return contentHeight;
    } else {
        return 0;
    }
};

function useDynamicContentHeight(navbarHeight: any) {
    // 创建状态来存储内容区的高度
    const [contentHeight, setContentHeight] = useState(100);

    // 当窗口大小改变时，更新内容区高度
    const handleResize = () => {
        setContentHeight(getDynamicContentHeight(navbarHeight));
    };

    // 添加resize事件监听器
    useEffect(() => {
        const _n = getDynamicContentHeight(navbarHeight)
        setContentHeight(_n)
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);
    return contentHeight;
}

export default useDynamicContentHeight;
