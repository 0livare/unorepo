const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')

const isProd = process.env.NODE_ENV === 'production'

module.exports = {
  mode: isProd ? 'production' : 'development',
  entry: ['./node_modules/regenerator-runtime/runtime', './src/unorepo.js'],
  target: 'node',
  externals: [nodeExternals()],
  output: {
    path: __dirname + '/dist',
    filename: 'unorepo.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {loader: 'babel-loader'},
      },
    ],
  },
  plugins: [
    new webpack.BannerPlugin({banner: '#!/usr/bin/env node', raw: true}), // I use this to insert the shebang
  ],
}
