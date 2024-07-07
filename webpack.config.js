const path = require('path');
const { BannerPlugin } = require('webpack');

module.exports = [
    {
        mode: 'production',
        module: {
            rules: [{
                test: /\.ts?$/,
                loader: 'esbuild-loader',
                options: {
                    loader: 'ts',
                    target: 'es2016',
                }
            }]
        },
        entry: './src/start.ts',
        output: {
            filename: 'proxyd.js',
            path: path.resolve(__dirname, './lib'),
        },
        target: 'node',
        plugins: [
            new BannerPlugin({
                banner: '#!/usr/bin/env node\n',
                raw: true
            })
        ],
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        optimization: {
            minimize: false,
        }
    }
];
