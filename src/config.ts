import packageRaw from '../package.json';
import type { severityKeys } from './logger';

export interface packageJson {
    name: string;
    version: string;
    description: string;
}

export const pkgJson = packageRaw as unknown as packageJson;

export interface Config {
    host: string;
    port: number;
    workers: number;
    logLevel: severityKeys;
    logColors: boolean;
    upstreamProxy: string;
}
