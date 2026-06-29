'use client';

import React from 'react';
import { toast as SToast, Toaster } from 'sonner';
import ReactDOM from 'react-dom/client';
import type {
    ToastOptions,
    ToastInstance,
    ToastConfig,
    CustomToastRenderer,
} from './types';

class ToastComponent {
    private root: ReactDOM.Root | null = null;
    private containerId = 'global-toast-root';
    private config: ToastConfig = { position: 'top-center', expand: true, richColors: true };

    constructor() {
        this.init();
    }

    private init() {
        if (typeof window === 'undefined') return;
        let container = document.getElementById(this.containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = this.containerId;
            document.body.appendChild(container);
        }
        if (!this.root) {
            this.root = ReactDOM.createRoot(container);
            this.root.render(<Toaster {...this.config} />);
        }
    }

    public configUpdate(config: Partial<ToastConfig>) {
        this.config = { ...this.config, ...config };
        this.init();
    }

    public success(msg: string, options?: ToastOptions): ToastInstance {
        return SToast.success(msg, options);
    }
    public error(msg: string, options?: ToastOptions): ToastInstance {
        return SToast.error(msg, options);
    }
    public info(msg: string, options?: ToastOptions): ToastInstance {
        return SToast.info(msg, options);
    }
    public warning(msg: string, options?: ToastOptions): ToastInstance {
        return SToast.warning(msg, options);
    }
    public loading(msg: string, options?: ToastOptions): ToastInstance {
        return SToast.loading(msg, options);
    }
    public custom(node: React.ReactNode | CustomToastRenderer, options?: ToastOptions): ToastInstance {
        if (typeof node === 'function') {
            return SToast.custom(node as CustomToastRenderer, options);
        }
        return SToast.custom(() => node as React.ReactElement, options);
    }
    public dismiss(id?: ToastInstance) {
        SToast.dismiss(id);
    }
    public dismissAll() {
        SToast.dismiss();
    }
}

const Toast = new ToastComponent();
export default Toast;