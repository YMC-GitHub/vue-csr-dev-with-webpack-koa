//tasks:
//use closure to save var expressMiddleware
//set ctx.body
const hotMiddleware = (compiler, opts) => {
  //https://www.npmjs.com/package/webpack-hot-middleware#middleware
  const expressMiddleware = require('webpack-hot-middleware')(compiler, opts)
  //delete next line for koa
  require('./page-reload')(compiler, expressMiddleware)
  return (ctx, next) => {
    const stream = new require('stream').PassThrough()
    //set ctx.body
    ctx.body = stream
    return expressMiddleware(ctx.req, {
      write: stream.write.bind(stream),
      writeHead: (state, headers) => {
        //set ctx.state
        ctx.state = state
        ctx.set(headers)
      },
    }, next)
  }
}
module.exports = hotMiddleware
