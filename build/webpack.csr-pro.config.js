const webpack = require('webpack')
const merge = require('webpack-merge')
//const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
//const nodeExternals = require('webpack-node-externals')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const SWPrecachePlugin = require('sw-precache-webpack-plugin')

const utils = require('./utils')
const base = require('./webpack.csr-bas.config')
const config = require('../config')

const webpackClientProConfig = merge(base, {
  output: {
    path: config.build.assetsRoot,
    //use custom utils set output file name and chunk file name for webpack
    filename: utils.assetsPath('js/[name].[chunkhash].js'),
    chunkFilename: utils.assetsPath('js/[id].[chunkhash].js')
  },
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
      'process.env.VUE_ENV': JSON.stringify('client'),
    }),

    // extract css into its own file
    new ExtractTextPlugin({
      filename: utils.assetsPath('css/[name].[contenthash].css'),
      allChunks: true,
    }),
    // minify css after extract
    new OptimizeCSSPlugin({
      cssProcessorOptions: config.build.productionSourceMap
        ? { safe: true, map: { inline: false } }
        : { safe: true }
    }),

    // minify JS
    new webpack.optimize.UglifyJsPlugin({
      workers: require('os').cpus().length,
      mangle: true,
      compress: {
        warnings: false,
        drop_console: true
      },
      sourceMap: true
    }),
    // keep module.id stable when vender modules does not change
    new webpack.HashedModuleIdsPlugin(),
    // Scope Hositing
    new webpack.optimize.ModuleConcatenationPlugin(),
    //new VueSSRServerPlugin()
  ]
})

webpackClientProConfig.plugins.push(
  // split vendor js into its own file
  new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor',
    minChunks: function (module) {
      // any required modules inside node_modules are extracted to vendor
      return (
        // it's inside node_modules
        /node_modules/.test(module.context) &&
        // and not a CSS file (due to extract-text-webpack-plugin limitation)
        !/\.css$/.test(module.request)
      )
    }
  }),
  // extract webpack runtime and module manifest to its own file in order to
  // prevent vendor hash from being updated whenever app bundle is updated
  new webpack.optimize.CommonsChunkPlugin({
    name: 'manifest',
    minChunks: Infinity
    //chunks: ['vendor']
  }),
  // This instance extracts shared chunks from code splitted chunks and bundles them
  // in a separate chunk, similar to the vendor chunk
  // see: https://webpack.js.org/plugins/commons-chunk-plugin/#extra-async-commons-chunk
  new webpack.optimize.CommonsChunkPlugin({
    name: 'app',
    async: 'vendor-async',
    children: true,
    minChunks: 3
  }),
  //copy custom static asset
  new CopyWebpackPlugin([
    {
      from: config.build.assetsSubDirectory.from,
      to: config.build.assetsSubDirectory.to,
    }
  ]),
  // auto generate service worker
  new SWPrecachePlugin({
    cacheId: 'maybeul',
    filename: utils.assetsPath('js/service-worker.js'),
    minify: true,
    dontCacheBustUrlsMatching: /./,
    staticFileGlobsIgnorePatterns: [/index\.html$/, /\.map$/, /\.json$/],
    /*runtimeCaching: [
      {
        urlPattern: '/',
        handler: 'networkFirst'
      },
      {
        urlPattern: /\/(top|new|show|ask|jobs)/,
        handler: 'networkFirst'
      },
      {
        urlPattern: '/item/:id',
        handler: 'networkFirst'
      },
      {
        urlPattern: '/user/:id',
        handler: 'networkFirst'
      }
    ]*/
  })
)
if (config.build.productionGzip) {
  const CompressionWebpackPlugin = require('compression-webpack-plugin')
  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' +
        config.build.productionGzipExtensions.join('|') +
        ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}
if (config.build.bundleAnalyzerReport) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackClientProConfig.plugins.push(new BundleAnalyzerPlugin())
}
module.exports = webpackClientProConfig
