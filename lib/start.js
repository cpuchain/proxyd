"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = __importDefault(require("os"));
const process_1 = __importDefault(require("process"));
const cluster_1 = __importDefault(require("cluster"));
const commander_1 = require("commander");
const config_1 = require("./config");
const logger_1 = __importDefault(require("./logger"));
const proxy_1 = __importDefault(require("./proxy"));
if (cluster_1.default.isWorker) {
    const config = JSON.parse(process_1.default.env.config);
    const forkId = Number(process_1.default.env.forkId);
    switch (process_1.default.env.workerType) {
        case 'proxy':
            new proxy_1.default(config, forkId);
            break;
    }
}
function createProxyWorker(config, logger, forkId) {
    const worker = cluster_1.default.fork({
        workerType: 'proxy',
        forkId,
        config: JSON.stringify(config),
    });
    worker.on('exit', (code) => {
        logger.debug('Main', 'Spawner', `Proxy worker ${forkId} exit with ${code}, spawning replacement...`);
        setTimeout(() => {
            createProxyWorker(config, logger, forkId);
        }, 2000);
    });
}
function start() {
    const { name, version, description } = config_1.pkgJson;
    const program = new commander_1.Command();
    program.name(name).version(version).description(description);
    program
        .option('-h, --host <HOST>', 'Local Proxy HTTP HOST to listen to')
        .option('-p, --port <PORT>', 'Local Proxy HTTP PORT to listen to')
        .option('-w, --workers <WORKERS>', 'Number of threads to spawn the proxy (Default to max cores available)')
        .option('-ll, --log-level <LOG_LEVEL>', 'Level of logs to display, defaults to debug')
        .option('-lc, --log-colors <LOG_COLORS>', 'Enable colors for logging, defauls to true')
        .option('-u, --upstream-proxy <UPSTREAM_PROXY>', 'Upstream proxy, should start with socks5:// or http://')
        .action((options) => {
        if (!options.upstreamProxy) {
            const error = `Invalid upstream proxy ${options.upstreamProxy}`;
            throw new Error(error);
        }
        // Config object
        const config = {
            host: options.host || '0.0.0.0',
            port: Number(options.port) || 3128,
            workers: Number(options.workers) || os_1.default.cpus().length,
            logLevel: options.logLevel || 'debug',
            logColors: options.logColors !== 'false',
            upstreamProxy: options.upstreamProxy,
        };
        const logger = (0, logger_1.default)(config);
        // start workers
        let i = 0;
        while (i < config.workers) {
            createProxyWorker(config, logger, i);
            i++;
        }
        logger.debug('Main', 'Spawner', `Spawned ${i} proxy workers: ` +
            `(local: http://${config.host}:${config.port}, upstream: ${config.upstreamProxy})`);
    });
    program.parse();
}
if (cluster_1.default.isPrimary) {
    start();
}
