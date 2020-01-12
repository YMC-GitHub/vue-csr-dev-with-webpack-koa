module.exports = function (compiler, expressMiddleware) {
  compiler.plugin('compilation', function (compilation) {
    compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
      expressMiddleware.publish({ action: 'reload' })
      cb()
    })
  })
}
