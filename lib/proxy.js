"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyServer = void 0;
const proxy_chain_1 = require("proxy-chain");
const logger_1 = __importDefault(require("./logger"));
class ProxyServer extends proxy_chain_1.Server {
    constructor(options) {
        super({
            port: options.port,
            host: options.host,
            prepareRequestFunction: options.prepareRequestFunction,
        });
        this.logger = options.logger;
        this.whitelistedOrigin = new Set((options.whitelistedClients || '')
            .split(',')
            .filter((i) => i)
            .map((i) => i.replaceAll(' ', '')));
    }
    log(connectionId, str) {
        if (str.includes('Listening')) {
            return;
        }
        const logPrefix = connectionId ? `${String(connectionId)} | ` : '';
        this.logger.debug(`${logPrefix}${str}`);
    }
    prepareRequestHandling(request) {
        const _super = Object.create(null, {
            prepareRequestHandling: { get: () => super.prepareRequestHandling }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (this.whitelistedOrigin.size) {
                const remoteAddress = request.socket.remoteAddress;
                if (!this.whitelistedOrigin.has(remoteAddress)) {
                    const error = `${remoteAddress} is not on ip whitelist!`;
                    throw new proxy_chain_1.RequestError(error, 400);
                }
            }
            return _super.prepareRequestHandling.call(this, request);
        });
    }
}
exports.ProxyServer = ProxyServer;
class Proxy {
    constructor(config, forkId = 0) {
        this.config = config;
        this.logSystem = 'Proxy';
        this.logComponent = `Thread ${forkId}`;
        this.logger = (0, logger_1.default)(config, this.logSystem, this.logComponent);
        this.server = new ProxyServer({
            port: config.port,
            host: config.host,
            logger: this.logger,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            prepareRequestFunction: (options) => {
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
exports.default = Proxy;
