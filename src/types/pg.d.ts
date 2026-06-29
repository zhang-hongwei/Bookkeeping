declare module "pg" {
  export class Pool {
    constructor(config?: any);
    connect(): Promise<any>;
    end(): Promise<void>;
    query: (...args: any[]) => Promise<any>;
  }
}
