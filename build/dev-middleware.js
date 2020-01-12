//tasks:
//use closure to save var expressMiddleware
//set ctx.body
const devMiddleware = (compiler, opts) => {
  const expressMiddleware = require('webpack-dev-middleware')(compiler, opts)
  return (ctx, next) => expressMiddleware(ctx.req, {
    end: (content) => {
      ctx.body = content
    },
    setHeader() {
      ctx.set.apply(ctx, arguments)
    }
  }, next)
}
module.exports = devMiddleware
