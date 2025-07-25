'use strict';

var proxyChain = require('proxy-chain');
require('logger-chain');

class ProxyServer extends proxyChain.Server {
  logger;
  whitelistedOrigin;
  constructor(options) {
    super({
      port: options.port,
      host: options.host,
      prepareRequestFunction: options.prepareRequestFunction
    });
    this.logger = options.logger;
    this.whitelistedOrigin = new Set(
      (options.whitelistedClients || "").split(",").filter((i) => i).map((i) => i.replaceAll(" ", ""))
    );
  }
  log(connectionId, str) {
    if (str.includes("Listening")) {
      return;
    }
    const logPrefix = connectionId ? `${String(connectionId)} | ` : "";
    this.logger.debug(`${logPrefix}${str}`);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async prepareRequestHandling(request) {
    if (this.whitelistedOrigin.size) {
      const remoteAddress = request.socket.remoteAddress;
      if (!this.whitelistedOrigin.has(remoteAddress)) {
        const error = `${remoteAddress} is not on ip whitelist!`;
        throw new proxyChain.RequestError(error, 400);
      }
    }
    return super.prepareRequestHandling(request);
  }
}

exports.ProxyServer = ProxyServer;
