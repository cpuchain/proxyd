import type { severityKeys } from './logger';
export interface packageJson {
    name: string;
    version: string;
    description: string;
}
export declare const pkgJson: packageJson;
export interface Config {
    host: string;
    port: number;
    workers: number;
    logLevel: severityKeys;
    logColors: boolean;
    upstreamProxy: string;
}
