// include some lib
const Koa = require('koa')
const path = require('path')
const favicon = require('koa-favicon')
const compression = require('koa-compress')
const logger = require('koa-logger')
const router = require('koa-router')()
const fs = require('fs')
const bluebird = require('bluebird')

global.Promise = bluebird

const config = require('../build/server.config')

const rootPath = path.resolve(__dirname, './')
const resolve = file => path.resolve(rootPath, file)

if (process.env.NODE_ENV === undefined) {
  process.env.NODE_ENV = 'production'
}
const isProd = process.env.NODE_ENV === 'production'

// static serve
const serve = (filepath, cache) => require('koa-static')(resolve(filepath), {
  // set browser cache max-age in milliseconds.
  maxage: cache && isProd ? 60 * 60 * 24 * 30 : 0
})

const app = new Koa()
if (!isProd) {
  // eslint-disable-next-line import/no-unresolved
  require('../build/setup-dev-server')(app)
}
// log serve
app.use(logger())
// zlib serve
app.use(compression({
  // checks the response content type to decide whether to compress
  // filter: function (content_type) {return /text/i.test(content_type)},
  // set minimum response size in bytes to compress
  threshold: 2048,
  flush: require('zlib').Z_SYNC_FLUSH
}))
app.use(favicon(isProd ? `${config.build.static}/favicon.ico` : `${config.dev.static}/favicon.ico`, {
  // set favicon cache max-age in milliseconds.
  maxAge: isProd ? 1 * 1000 * 60 * 60 * 60 * 24 : 1000
  // 1*1000*60*60*60*24
  // n*ms*s*m*h*d*
}))

// handle 404 for vue spa case04
// ok,but may be not the best
app.use(require('koa2-connect-history-api-fallback').historyApiFallback({ whiteList: ['/api'] }))

// static serve for public dir
app.use(serve(isProd ? config.build.static : config.dev.static, true))
// static serve for dist dir
app.use(serve(isProd ? config.build.www : config.dev.www, true))

router.get('/', (ctx, next) => {
  try {
    ctx.body = fs.readFileSync(isProd ? config.build.www : config.dev.www, 'utf-8')
    ctx.set('Content-Type', 'text/html')
    ctx.set('Server', 'Koa2 client side render')
  } catch (e) {
    next()
  }
})
app.use(router.routes()).use(router.allowedMethods())

// handle 404 for case01
app.use((ctx, next) => {
  ctx.type = 'html'
  ctx.body = '404 | Page Not Found'
})
module.exports = app
