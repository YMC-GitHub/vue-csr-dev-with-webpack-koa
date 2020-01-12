require('./check-versions')()

//include some lib
const Koa = require('koa')
const fs = require('fs')
const path = require('path')
const resolve = file => path.resolve(__dirname, file)
//include some config
const configServer = require('./config/server')
const hotMiddle = require('./setup-dev-server')

const app = new Koa()
// static serve
const serve = (filepath, cache) => require('koa-static')(resolve(filepath), {
  // set browser cache max-age in milliseconds.
  maxage: cache && isProd ? 60 * 60 * 24 * 30 : 0
})
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
app.use(favicon('./public/favicon.ico', {
  // set favicon cache max-age in milliseconds.
  maxAge: isProd ? 1 * 1000 * 60 * 60 * 60 * 24 : 1000
  // 1*1000*60*60*60*24
  // n*ms*s*m*h*d*
}))
app.use(router.routes()).use(router.allowedMethods())
hotMiddle(app)
// for static serve in public path
app.use(serve('public', true))
app.use(serve('dist', true))
// for static web serve in dist path
app.use(async (ctx, next) => {
  try {
    //read html index  file
    const template = fs.readFileSync(configServer.index, 'utf-8')
    ctx.body = template
    ctx.set('Content-Type', 'text/html')
    ctx.set('Server', 'Koa2 client side render')
  } catch (e) {
    next()
  }
})
//for other

const port = process.env.PORT || configServer.port || 3000
app.listen(port, '0.0.0.0', () => {
  console.log(`server started at localhost:${port}`)
}).on('listening', () => console.log('serve is running'))
  .on('error', err => console.log(err))
