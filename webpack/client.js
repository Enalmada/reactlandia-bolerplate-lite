const path = require('path')
const webpack = require('webpack')
const ExtractCssChunks = require('extract-css-chunks-webpack-plugin')

const { IS_DEVELOPMENT, IS_PRODUCTION, IS_TESTING, MODE } = require('../lib/mode')

module.exports = {
  name: 'client',
  target: 'web',
  mode: MODE,
  devtool: IS_DEVELOPMENT ? 'inline-source-map' : 'source-map',

  entry: [
    IS_DEVELOPMENT && 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=false&quiet=true&noInfo=true',
    IS_DEVELOPMENT && 'react-hot-loader/patch',
    path.resolve(__dirname, '../src/index.js'),
  ].filter(Boolean),

  output: {
    filename: IS_DEVELOPMENT ? '[name].js' : '[name].[chunkhash:5].js',
    chunkFilename: IS_DEVELOPMENT ? '[name].js' : '[name].[chunkhash:5].js',
    path: path.resolve(__dirname, '..', IS_DEVELOPMENT ? '.dev' : '.prod', 'client'),
    publicPath: '/static/',
  },

  module: {
    // WORKAROUND to silent 'Critical dependency' warnings on webpack > 4.16.2.
    // Requires investigation.
    // https://github.com/ivan-aksamentov/reactlandia-bolerplate-lite/issues/5
    exprContextCritical: false,

    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        exclude: /node_modules/,
        loader: 'eslint-loader', options: {
          configFile: path.resolve(__dirname, '..', '.eslintrc'),
          quiet: true,
        },
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: false,
              plugins: [IS_DEVELOPMENT && 'react-hot-loader/babel'].filter(Boolean),
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          ExtractCssChunks.loader,
          'css-loader',
        ].filter(Boolean),
      },
    ],
  },

  resolve: { extensions: ['.js'] },

  plugins: [
    new webpack.EnvironmentPlugin({
      BABEL_ENV: process.env.BABEL_ENV,
      NODE_ENV: process.env.NODE_ENV,
      IS_SERVER: false,
      DEBUG: IS_DEVELOPMENT,
      IS_DEVELOPMENT,
      IS_PRODUCTION,
      IS_TESTING,
      MODE,
    }),

    new ExtractCssChunks({
      filename: IS_DEVELOPMENT ? '[name].css' : '[name].[chunkhash:5].css',
      chunkFilename: IS_DEVELOPMENT ? '[name].css' : '[name].[chunkhash:5].css',
    }),

    IS_DEVELOPMENT && new webpack.HotModuleReplacementPlugin(),
    IS_DEVELOPMENT && new webpack.NoEmitOnErrorsPlugin(),

    IS_PRODUCTION && new webpack.optimize.ModuleConcatenationPlugin(),
    IS_PRODUCTION && new webpack.optimize.OccurrenceOrderPlugin(),
    IS_PRODUCTION && new webpack.HashedModuleIdsPlugin(),
  ].filter(Boolean),
}
