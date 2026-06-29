/**
 * 性能监控指标实现
 */

import { IMetrics } from '../types/core';
import { MetricName } from '../constants';

export class Metrics implements IMetrics {
    private metrics: Map<MetricName, number> = new Map();
    private startTime: number = Date.now();

    increment(metric: MetricName, value: number = 1): void {
        const current = this.metrics.get(metric) || 0;
        this.metrics.set(metric, current + value);
    }

    gauge(metric: MetricName, value: number): void {
        this.metrics.set(metric, value);
    }

    timing(metric: MetricName, duration: number): void {
        this.metrics.set(metric, duration);
    }

    getMetrics(): Record<MetricName, number> {
        const result: Record<string, number> = {};
        this.metrics.forEach((value, key) => {
            result[key] = value;
        });
        
        // 添加运行时间
        result.uptime = Date.now() - this.startTime;
        
        return result as Record<MetricName, number>;
    }

    getMetric(metric: MetricName): number {
        return this.metrics.get(metric) || 0;
    }

    reset(): void {
        this.metrics.clear();
        this.startTime = Date.now();
    }

    resetMetric(metric: MetricName): void {
        this.metrics.delete(metric);
    }

    hasMetric(metric: MetricName): boolean {
        return this.metrics.has(metric);
    }

    getMetricNames(): MetricName[] {
        return Array.from(this.metrics.keys());
    }
}

/**
 * 空指标收集器（用于禁用指标收集）
 */
export class NullMetrics implements IMetrics {
    increment(): void {}
    gauge(): void {}
    timing(): void {}
    getMetrics(): Record<MetricName, number> {
        return {} as Record<MetricName, number>;
    }
    reset(): void {}
}
