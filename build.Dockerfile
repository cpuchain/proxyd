FROM node:20-alpine

RUN apk update && apk add zip

WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn

COPY . .

CMD ["sh", \
    "-c", \
    "yarn build && \
    cd lib && \
    rm -f *.zip && \
    zip proxyd-linux.zip proxyd-linux && \
    zip proxyd-macos.zip proxyd-macos && \
    zip proxyd-win.zip proxyd-win.exe && \
    sha256sum proxyd-* > SHA256SUMS.txt"]
