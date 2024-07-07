import dns from 'dns';
import http from 'http';
import {
    PrepareRequestFunction,
    PrepareRequestFunctionOpts,
    RequestError,
    Server,
} from 'proxy-chain';

import { HandlerOpts as CustomResponseOpts } from 'proxy-chain/dist/custom_response';
import type { Config } from './config';
import LoggerFactory, { type Logger } from './logger';

// https://github.com/apify/proxy-chain/blob/master/src/server.ts#L45
export type HandlerOpts = {
    server: Server;
    id: number;
    srcRequest: http.IncomingMessage;
    srcResponse: http.ServerResponse | null;
    srcHead: Buffer | null;
    trgParsed: URL | null;
    upstreamProxyUrlParsed: URL | null;
    isHttp: boolean;
    customResponseFunction?:
        | CustomResponseOpts['customResponseFunction']
        | null;
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
    // IP of whitelisted clients
    whitelistedClients?: string;
};

export class ProxyServer extends Server {
    logger: Logger;
    whitelistedOrigin: Set<string>;

    constructor(options: ProxyServerConstructor) {
        super({
            port: options.port,
            host: options.host,
            prepareRequestFunction: options.prepareRequestFunction,
        });

        this.logger = options.logger;
        this.whitelistedOrigin = new Set(
            (options.whitelistedClients || '')
                .split(',')
                .filter((i) => i)
                .map((i) => i.replaceAll(' ', '')),
        );
    }

    log(connectionId: unknown, str: string): void {
        if (str.includes('Listening')) {
            return;
        }
        const logPrefix = connectionId ? `${String(connectionId)} | ` : '';
        this.logger.debug(`${logPrefix}${str}`);
    }

    async prepareRequestHandling(
        request: http.IncomingMessage,
    ): Promise<HandlerOpts> {
        if (this.whitelistedOrigin.size) {
            const remoteAddress = request.socket.remoteAddress as string;

            if (!this.whitelistedOrigin.has(remoteAddress)) {
                const error = `${remoteAddress} is not on ip whitelist!`;
                throw new RequestError(error, 400);
            }
        }

        return super.prepareRequestHandling(request);
    }
}

export default class Proxy {
    config: Config;
    logger: Logger;
    logSystem: string;
    logComponent: string;

    server: ProxyServer;

    constructor(config: Config, forkId: number = 0) {
        this.config = config;
        this.logSystem = 'Proxy';
        this.logComponent = `Thread ${forkId}`;
        this.logger = LoggerFactory(config, this.logSystem, this.logComponent);

        this.server = new ProxyServer({
            port: config.port,
            host: config.host,
            logger: this.logger,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            prepareRequestFunction: (options: PrepareRequestFunctionOpts) => {
                return {
                    upstreamProxyUrl: config.upstreamProxy,
                };
            },
        });

        this.server.listen(() => {
            this.logger.debug(
                `Listening on http://${config.host}:${config.port}`,
            );
        });
    }
}
