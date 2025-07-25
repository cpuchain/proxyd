import { LogLevel, Logger } from 'logger-chain';
import { PrepareRequestFunction, Server } from 'proxy-chain';

export interface Config {
	host: string;
	port: number;
	workers: number;
	logLevel: LogLevel;
	logColors: boolean;
	upstreamProxy: string;
}
export interface ProxyServerConstructor {
	port: number;
	host: string;
	prepareRequestFunction: PrepareRequestFunction;
	logger: Logger;
	whitelistedClients?: string;
}
export declare class ProxyServer extends Server {
	logger: Logger;
	whitelistedOrigin: Set<string>;
	constructor(options: ProxyServerConstructor);
	log(connectionId: unknown, str: string): void;
	prepareRequestHandling(request: http.IncomingMessage): Promise<any>;
}

export {};
