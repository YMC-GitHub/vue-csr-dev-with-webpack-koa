const path = require('path')

const webpack = require('webpack')
const merge = require('webpack-merge')
//const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
//const SWPrecachePlugin = require('sw-precache-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')

const config = require('../config')
const utils = require('./utils')
const base = require('./webpack.csr-bas.config')

if (process.env.NODE_ENV === undefined) {
  process.env.NODE_ENV = 'production'
}
const isProd = process.env.NODE_ENV === 'production'

const webpackClientDevConfig = merge(base, {
  module: {
    rules: utils.styleLoaders({
      sourceMap: isProd ? config.build.productionSourceMap : config.dev.cssSourceMap,
      extract: isProd
    })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: isProd
    ? (config.build.productionSourceMap ? '#source-map' : false)
    : '#cheap-module-eval-source-map',
  output: {
    path: config.build.assetsRoot,
    filename: isProd
      ? utils.assetsPath('js/[name].[chunkhash].js')
      : '[name].js',
    chunkFilename: isProd
      ? utils.assetsPath('js/[id].[chunkhash].js')
      : '[id].js'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': isProd
        ? '"production"'
        : JSON.stringify(process.env.NODE_ENV || 'production'),
      'process.env.VUE_ENV': JSON.stringify('client'),
    }),
    //new VueSSRClientPlugin()
  ]
})

webpackClientDevConfig.plugins.push(
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NamedModulesPlugin(),
  new webpack.NoEmitOnErrorsPlugin(),
  new FriendlyErrorsPlugin()
)
module.exports = webpackClientDevConfig
