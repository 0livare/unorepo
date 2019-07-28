const webpack = require('webpack')
var nodeExternals = require('webpack-node-externals')

module.exports = {
  mode: 'none', // "none" for debugging
  entry: ['./node_modules/regenerator-runtime/runtime', './src/monorepo.js'],
  target: 'node',
  externals: [nodeExternals()],
  output: {
    path: __dirname + '/lib',
    filename: 'monorepo.js',
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
