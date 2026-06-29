/**
 * WebSocket 错误边界组件
 */

import React, { Component, ReactNode } from 'react';
import { WebSocketErrorBoundaryProps, WebSocketErrorBoundaryState } from '../types/providers';

/**
 * WebSocket 错误边界组件
 * 捕获 WebSocket 相关的错误并提供优雅的降级处理
 */
export class WebSocketErrorBoundary extends Component<
    WebSocketErrorBoundaryProps,
    WebSocketErrorBoundaryState
> {
    private resetTimeoutId: number | null = null;

    constructor(props: WebSocketErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false
        };
    }

    static getDerivedStateFromError(error: Error): WebSocketErrorBoundaryState {
        return {
            hasError: true,
            error,
            errorInfo: {
                componentStack: error.stack
            }
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('WebSocket Error Boundary caught an error:', error, errorInfo);
        
        this.setState({
            hasError: true,
            error,
            errorInfo
        });

        // 调用错误回调
        this.props.onError?.(error, errorInfo);
    }

    componentDidUpdate(prevProps: WebSocketErrorBoundaryProps) {
        const { resetOnPropsChange, resetKeys } = this.props;
        const { hasError } = this.state;

        // 如果有错误且启用了属性变化重置
        if (hasError && resetOnPropsChange && resetKeys) {
            const hasResetKeyChanged = resetKeys.some(
                (key: any, index: number) => prevProps.resetKeys?.[index] !== key
            );

            if (hasResetKeyChanged) {
                this.resetErrorBoundary();
            }
        }
    }

    componentWillUnmount() {
        if (this.resetTimeoutId) {
            clearTimeout(this.resetTimeoutId);
        }
    }

    resetErrorBoundary = () => {
        this.setState({
            hasError: false,
            error: undefined,
            errorInfo: undefined
        });
    };

    // 自动重置（延迟重置）
    scheduleReset = (delay: number = 5000) => {
        if (this.resetTimeoutId) {
            clearTimeout(this.resetTimeoutId);
        }

        this.resetTimeoutId = window.setTimeout(() => {
            this.resetErrorBoundary();
        }, delay);
    };

    render() {
        const { hasError, error, errorInfo } = this.state;
        const { children, fallback } = this.props;

        if (hasError) {
            // 如果提供了自定义 fallback
            if (fallback) {
                if (typeof fallback === 'function') {
                    return fallback(error!);
                }
                return fallback;
            }

            // 默认错误 UI
            return (
                <DefaultErrorFallback
                    error={error!}
                    errorInfo={errorInfo}
                    onReset={this.resetErrorBoundary}
                    onScheduleReset={this.scheduleReset}
                />
            );
        }

        return children;
    }
}

/**
 * 默认错误回退组件
 */
interface DefaultErrorFallbackProps {
    error: Error;
    errorInfo?: any;
    onReset: () => void;
    onScheduleReset: (delay?: number) => void;
}

const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = ({
    error,
    errorInfo,
    onReset,
    onScheduleReset
}) => {
    const handleAutoRetry = () => {
        onScheduleReset(3000); // 3秒后自动重试
    };

    return (
        <div style={{
            padding: '20px',
            margin: '10px',
            border: '1px solid #ff6b6b',
            borderRadius: '8px',
            backgroundColor: '#fff5f5',
            color: '#c92a2a'
        }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#c92a2a' }}>
                🔌 WebSocket 连接出现问题
            </h3>
            
            <p style={{ margin: '0 0 15px 0', fontSize: '14px' }}>
                {error.message || '未知错误'}
            </p>

            <div style={{ marginBottom: '15px' }}>
                <button
                    onClick={onReset}
                    style={{
                        padding: '8px 16px',
                        marginRight: '10px',
                        backgroundColor: '#4dabf7',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    立即重试
                </button>
                
                <button
                    onClick={handleAutoRetry}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#51cf66',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    3秒后自动重试
                </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
                <details style={{ fontSize: '12px', marginTop: '10px' }}>
                    <summary style={{ cursor: 'pointer', marginBottom: '5px' }}>
                        错误详情 (开发模式)
                    </summary>
                    <pre style={{
                        backgroundColor: '#f8f9fa',
                        padding: '10px',
                        borderRadius: '4px',
                        overflow: 'auto',
                        maxHeight: '200px'
                    }}>
                        {error.stack}
                        {errorInfo && (
                            <>
                                {'\n\nComponent Stack:'}
                                {errorInfo.componentStack}
                            </>
                        )}
                    </pre>
                </details>
            )}
        </div>
    );
};

/**
 * 简化的错误边界 Hook
 */
export function useWebSocketErrorBoundary() {
    const [error, setError] = React.useState<Error | null>(null);

    const resetError = React.useCallback(() => {
        setError(null);
    }, []);

    const captureError = React.useCallback((error: Error) => {
        setError(error);
    }, []);

    // 如果有错误，抛出它以便错误边界捕获
    if (error) {
        throw error;
    }

    return {
        captureError,
        resetError
    };
}

/**
 * 创建自定义错误边界的工厂函数
 */
export function createWebSocketErrorBoundary(
    defaultFallback?: ReactNode | ((error: Error) => ReactNode)
) {
    return function CustomWebSocketErrorBoundary({
        children,
        fallback = defaultFallback,
        ...props
    }: Omit<WebSocketErrorBoundaryProps, 'fallback'> & {
        fallback?: ReactNode | ((error: Error) => ReactNode);
    }) {
        return (
            <WebSocketErrorBoundary
                {...props}
                fallback={fallback}
            >
                {children}
            </WebSocketErrorBoundary>
        );
    };
}

/**
 * 网络错误专用的错误边界
 */
export const NetworkErrorBoundary = createWebSocketErrorBoundary(
    (error: Error) => (
        <div style={{
            padding: '20px',
            textAlign: 'center',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '8px',
            color: '#856404'
        }}>
            <h4>🌐 网络连接问题</h4>
            <p>请检查您的网络连接并重试</p>
            <small>{error.message}</small>
        </div>
    )
);

/**
 * 认证错误专用的错误边界
 */
export const AuthErrorBoundary = createWebSocketErrorBoundary(
    (error: Error) => (
        <div style={{
            padding: '20px',
            textAlign: 'center',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '8px',
            color: '#721c24'
        }}>
            <h4>🔐 认证失败</h4>
            <p>请重新登录后再试</p>
            <small>{error.message}</small>
        </div>
    )
);
