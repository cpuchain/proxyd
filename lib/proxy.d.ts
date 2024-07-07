import dns from 'dns';
import http from 'http';
import { PrepareRequestFunction, Server } from 'proxy-chain';
import { HandlerOpts as CustomResponseOpts } from 'proxy-chain/dist/custom_response';
import type { Config } from './config';
import { type Logger } from './logger';
export type HandlerOpts = {
    server: Server;
    id: number;
    srcRequest: http.IncomingMessage;
    srcResponse: http.ServerResponse | null;
    srcHead: Buffer | null;
    trgParsed: URL | null;
    upstreamProxyUrlParsed: URL | null;
    isHttp: boolean;
    customResponseFunction?: CustomResponseOpts['customResponseFunction'] | null;
    customConnectServer?: http.Server | null;
    localAddress?: string;
    ipFamily?: number;
    dnsLookup?: (typeof dns)['lookup'];
    customTag?: unknown;
};
export type ProxyServerConstructor = {
    port: number;
    host: string;
    prepareRequestFunction: PrepareRequestFunction;
    logger: Logger;
    whitelistedClients?: string;
};
export declare class ProxyServer extends Server {
    logger: Logger;
    whitelistedOrigin: Set<string>;
    constructor(options: ProxyServerConstructor);
    log(connectionId: unknown, str: string): void;
    prepareRequestHandling(request: http.IncomingMessage): Promise<HandlerOpts>;
}
export default class Proxy {
    config: Config;
    logger: Logger;
    logSystem: string;
    logComponent: string;
    server: ProxyServer;
    constructor(config: Config, forkId?: number);
}
