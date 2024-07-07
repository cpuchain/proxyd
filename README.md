# Proxyd

Reverse proxy to socks5 or http proxy

## Install

See [releases](https://github.com/cpuchain/proxyd/releases/latest) or build your own binaries with `yarn docker` or `yarn build`.

## Usage

Starting a reverse proxy to upstream SOCKS5 or HTTP proxy (socks5://127.0.0.1:1080 as example)

```bash
proxyd -u socks5://127.0.0.1:1080
```

To test proxy connection

```bash
curl -x http://127.0.0.1:3128 https://ifconfig.la
```
