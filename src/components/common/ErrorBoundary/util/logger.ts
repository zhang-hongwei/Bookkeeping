import type { ErrorLoggerConfig, ErrorInfo, ErrorReportData } from "../types";

class ErrorLogger {
  private config: Required<ErrorLoggerConfig>;
  private queue: ErrorReportData[] = [];
  private isProcessing = false;

  constructor(config: ErrorLoggerConfig = {}) {
    this.config = {
      enableConsoleLog: true,
      enableRemoteLog: false,
      remoteLogUrl: "",
      apiKey: "",
      maxRetries: 3,
      retryDelay: 1000,
      ...config,
    };
  }

  updateConfig(newConfig: Partial<ErrorLoggerConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  async logError(errorInfo: ErrorInfo) {
    const reportData: ErrorReportData = {
      message: errorInfo.error.message,
      stack: errorInfo.error.stack,
      componentStack: errorInfo.errorInfo.componentStack || "",
      timestamp: errorInfo.timestamp.toISOString(),
      userAgent: errorInfo.userAgent,
      url: errorInfo.url,
      userId: errorInfo.userId,
      sessionId: errorInfo.sessionId,
      buildVersion:
        process.env.NEXT_PUBLIC_BUILD_VERSION || process.env.BUILD_VERSION,
      environment: process.env.NODE_ENV,
    };

    if (this.config.enableConsoleLog) {
      this.logToConsole(reportData);
    }

    if (this.config.enableRemoteLog && this.config.remoteLogUrl) {
      this.queue.push(reportData);
      if (!this.isProcessing) {
        this.processQueue();
      }
    }
  }

  private logToConsole(data: ErrorReportData) {
    console.group("🚨 Error Boundary Caught Error");
    console.error("Error:", data.message);
    console.error("Stack:", data.stack);
    console.error("Component Stack:", data.componentStack);
    console.info("Timestamp:", data.timestamp);
    console.info("User Agent:", data.userAgent);
    console.info("URL:", data.url);
    if (data.userId) console.info("User ID:", data.userId);
    if (data.sessionId) console.info("Session ID:", data.sessionId);
    console.groupEnd();
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const errorData = this.queue.shift()!;
      await this.sendToRemote(errorData);
    }

    this.isProcessing = false;
  }

  private async sendToRemote(
    data: ErrorReportData,
    retryCount = 0
  ): Promise<void> {
    try {
      const response = await fetch(this.config.remoteLogUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.config.apiKey && {
            Authorization: `Bearer ${this.config.apiKey}`,
          }),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.debug("Error successfully logged to remote server");
    } catch (error) {
      console.error("Failed to log error to remote server:", error);

      if (retryCount < this.config.maxRetries) {
        console.log(
          `Retrying in ${this.config.retryDelay}ms... (${retryCount + 1}/${this.config.maxRetries})`
        );
        setTimeout(() => {
          this.sendToRemote(data, retryCount + 1);
        }, this.config.retryDelay);
      } else {
        console.error("Max retries exceeded. Error data lost:", data);
      }
    }
  }

  clearQueue() {
    this.queue = [];
  }

  getQueueLength() {
    return this.queue.length;
  }
}

export default ErrorLogger;
