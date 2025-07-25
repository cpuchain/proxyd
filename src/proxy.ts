import http from 'http';
import { PrepareRequestFunction, PrepareRequestFunctionOpts, RequestError, Server } from 'proxy-chain';
import { Logger } from 'logger-chain';
import type { Config } from './config.js';

export interface ProxyServerConstructor {
    port: number;
    host: string;
    prepareRequestFunction: PrepareRequestFunction;
    logger: Logger;
    // IP of whitelisted clients
    whitelistedClients?: string;
}

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async prepareRequestHandling(request: http.IncomingMessage): Promise<any> {
        if (this.whitelistedOrigin.size) {
            const remoteAddress = request.socket.remoteAddress as string;

            if (!this.whitelistedOrigin.has(remoteAddress)) {
                const error = `${remoteAddress} is not on ip whitelist!`;
                throw new RequestError(error, 400);
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return super.prepareRequestHandling(request) as Promise<any>;
    }
}

export default class Proxy {
    config: Config;
    logger: Logger;
    logSystem: string;
    logComponent: string;

    server: ProxyServer;

    constructor(config: Config, forkId = 0) {
        this.config = config;
        this.logSystem = 'Proxy';
        this.logComponent = `Thread ${forkId}`;
        this.logger = new Logger(config, this.logSystem, this.logComponent);

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
            this.logger.debug(`Listening on http://${config.host}:${config.port}`);
        });
    }
}
