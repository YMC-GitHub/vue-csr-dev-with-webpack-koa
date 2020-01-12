const webpack = require('webpack')
const clientConfig = require('./webpack.csr-dev.config')
const hotMiddleware = (compiler, opts) => {
  const expressMiddleware = require('webpack-hot-middleware')(compiler, opts)
  return (ctx, next) => {
    const stream = new require('stream').PassThrough()
    ctx.body = stream
    return expressMiddleware(ctx.req, {
      write: stream.write.bind(stream),
      writeHead: (state, headers) => {
        ctx.state = state
        ctx.set(headers)
      },
    }, next)
  }
}


module.exports = function setupDevServer(app, cb) {
  let bundle
  let clientManifest
  let resolve
  const readyPromise = new Promise(r => { resolve = r })
  const ready = (...args) => {
    resolve()
    cb(...args)
  }


  // modify client config to work with hot middleware
  // use
  clientConfig.entry.app = [require('./dev-client'), clientConfig.entry.app]

  // dev middleware
  const clientCompiler = webpack(clientConfig)
  const devMiddleware = require('webpack-dev-middleware')(clientCompiler, {
    publicPath: clientConfig.output.publicPath,
    noInfo: true,
    quiet: true,
    stats: {
      colors: true,
      chunks: false,
      modules: false,
      assets: false
    }
  })

  app.use((ctx, next) => devMiddleware(ctx.req, {
    end: (content) => {
      ctx.body = content
    },
    setHeader() {
      ctx.set.apply(ctx, arguments)
    }
  }, next)
  )
  /*
  clientCompiler.plugin('done', (stats) => {
    stats = stats.toJson()
    stats.errors.forEach(err => console.error(err))
    stats.warnings.forEach(err => console.warn(err))
    if (stats.errors.length) return
    hotMiddleware.publish({ action: 'reload' });
  })
  */
  clientCompiler.plugin('compilation', function (compilation) {
    compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
      hotMiddleware.publish({ action: 'reload' })
      cb()
    })
  })

  // hot middleware
  app.use(hotMiddleware(clientCompiler, { heartbeat: 5000 }))
  return readyPromise
}
