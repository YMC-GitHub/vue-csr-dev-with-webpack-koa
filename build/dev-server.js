// include some lib
const Koa = require('koa')
const fs = require('fs')
const configServer = require('./server.config')

const app = new Koa()
require('./setup-dev-server')(app)
// for static serve in public path
app.use(require('koa-static')(configServer.static))
// for static web serve in dist path
app.use(async (ctx, next) => {
  try {
    const template = fs.readFileSync(configServer.index, 'utf-8')
    ctx.body = template
    ctx.set('Content-Type', 'text/html')
    ctx.set('Server', 'Koa2 client side render')
  } catch (e) {
    next()
  }
})

const port = process.env.PORT || configServer.port || 3000
app.listen(port, '0.0.0.0', () => {
  console.log(`server started at localhost:${port}`)
}).on('listening', () => console.log('serve is running'))
  .on('error', err => console.log(err))
