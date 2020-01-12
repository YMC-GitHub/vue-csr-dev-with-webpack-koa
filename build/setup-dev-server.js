const webpack = require('webpack')
const hotMiddleware = require('./hot-middleware')
const devMiddleware = require('./dev-middleware')
const webpackConfig = require('./webpack.csr-dev.config')

module.exports = function setupDevServer(app, cb) {
  // modify client config to work with hot middleware
  Object.keys(webpackConfig.entry).forEach((name) => {
    webpackConfig.entry[name] = ['./build/dev-client.js'].concat(webpackConfig.entry[name]);
  });
  // use webpack with nodejs api
  const clientCompiler = webpack(webpackConfig)
  // dev middleware
  app.use(devMiddleware(clientCompiler, {
    publicPath: webpackConfig.output.publicPath,
    noInfo: true,
    quiet: true,
    stats: {
      colors: true,
      chunks: false,
      modules: false,
      assets: false
    }
  }))
  // hot middleware
  app.use(hotMiddleware(clientCompiler, { heartbeat: 5000 }))
}
