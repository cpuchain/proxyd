import type { LogLevel } from 'logger-chain';

export interface Config {
    host: string;
    port: number;
    workers: number;
    logLevel: LogLevel;
    logColors: boolean;
    upstreamProxy: string;
}
