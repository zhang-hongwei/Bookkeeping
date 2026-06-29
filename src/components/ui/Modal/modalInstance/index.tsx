'use client'

import { useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import CustomizedModal from "../modalComponent";
import ConfirmContent from "./confirmContent";
import Footer from "./footer";
import clsx from "clsx";
import type { ModalInstanceProps } from '../type';

interface ModalInstanceInternalProps extends ModalInstanceProps {
    onDestroy?: () => void;
}

// 关闭动画时长（与 MUI Modal backdrop timeout 300ms 对齐，留余量）
const CLOSE_ANIMATION_DURATION = 400;

function ModalInstance({
    content,
    onOk,
    mode = 'light',
    type = 'confirm',
    icon,
    okText,
    cancelText,
    footerProps = {},
    confirmContentProps = {},
    sx = {},
    className,
    onDestroy,
}: ModalInstanceInternalProps) {
    const [open, setOpen] = useState(true);
    const clickRef = useRef(false);
    const [loading, setLoading] = useState(false);

    const scheduleDestroy = () => {
        setTimeout(() => {
            onDestroy?.();
        }, CLOSE_ANIMATION_DURATION);
    };

    const handleClose = () => {
        setOpen(false);
        scheduleDestroy();
    };

    const handleOnOk = async () => {
        if (clickRef.current) return;
        clickRef.current = true;
        setLoading(true);

        try {
            if (onOk) await onOk();
            setOpen(false);
            scheduleDestroy();
        } catch {
            // 出错时保持弹窗打开，允许重试
        } finally {
            setLoading(false);
            setTimeout(() => {
                clickRef.current = false;
            }, 500);
        }
    };

    return (
        <CustomizedModal
            className={clsx(className, { 'dark-modal': mode === 'dark' })}
            sx={{ minWidth: '360px', maxWidth: '600px', padding: '40px 0 0 40px', ...sx }}
            open={open}
            onClose={handleClose}
            footer={
                <Footer
                    mode={mode}
                    loading={loading}
                    onOk={handleOnOk}
                    onClose={handleClose}
                    okText={okText}
                    cancelText={cancelText}
                    {...footerProps}
                />
            }
        >
            <ConfirmContent
                mode={mode}
                content={content}
                icon={icon}
                {...confirmContentProps}
            />
        </CustomizedModal>
    );
}

// 每次调用创建独立容器和 root，关闭时 unmount 并移除 DOM
const createModalInstance = (params: ModalInstanceProps, type: string) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    const destroy = () => {
        root.unmount();
        container.remove();
    };

    root.render(
        <ThemeProvider>
            <ModalInstance
                {...params}
                type={type}
                onDestroy={destroy}
            />
        </ThemeProvider>
    );
};

export const successModal = (params: ModalInstanceProps) => createModalInstance(params, "success");
export const confirmModal = (params: ModalInstanceProps) => createModalInstance(params, "confirm");
