#!/usr/bin/env node
import os from 'os';
import process from 'process';
import cluster from 'cluster';
import { Command } from 'commander';
import { Logger, type LogLevel } from 'logger-chain';

import { pkgJson } from './pkgJson.js';
import { Config } from './config.js';
import Proxy from './proxy.js';

if (cluster.isWorker) {
    const config = JSON.parse(process.env.config as string) as Config;
    const forkId = Number(process.env.forkId);

    switch (process.env.workerType) {
        case 'proxy':
            new Proxy(config, forkId);
            break;
    }
}

function createProxyWorker(config: Config, logger: Logger, forkId: number) {
    const worker = cluster.fork({
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
    const { name, version, description } = pkgJson;

    const program = new Command();

    program.name(name).version(version).description(description);

    program
        .option('-h, --host <HOST>', 'Local Proxy HTTP HOST to listen to')
        .option('-p, --port <PORT>', 'Local Proxy HTTP PORT to listen to')
        .option(
            '-w, --workers <WORKERS>',
            'Number of threads to spawn the proxy (Default to max cores available)',
        )
        .option('-l, --log-level <LOG_LEVEL>', 'Level of logs to display, defaults to debug')
        .option('-c, --log-colors <LOG_COLORS>', 'Enable colors for logging, defauls to true')
        .option(
            '-u, --upstream-proxy <UPSTREAM_PROXY>',
            'Upstream proxy, should start with socks5:// or http://',
        )
        .action((options) => {
            if (!options.upstreamProxy) {
                const error = `Invalid upstream proxy ${options.upstreamProxy}`;
                throw new Error(error);
            }

            // Config object
            const config = {
                host: options.host || '0.0.0.0',
                port: Number(options.port) || 3128,
                workers: Number(options.workers) || os.cpus().length,
                logLevel: (options.logLevel as LogLevel) || 'debug',
                logColors: options.logColors !== 'false',
                upstreamProxy: options.upstreamProxy as string,
            } as Config;

            const logger = new Logger(config);

            // start workers
            let i = 0;

            while (i < config.workers) {
                createProxyWorker(config, logger, i);
                i++;
            }

            logger.debug(
                'Main',
                'Spawner',
                `Spawned ${i} proxy workers: ` +
                    `(local: http://${config.host}:${config.port}, upstream: ${config.upstreamProxy})`,
            );
        });

    program.parse();
}

if (cluster.isPrimary) {
    start();
}
