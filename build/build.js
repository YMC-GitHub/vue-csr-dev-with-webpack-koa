'use strict'
//check node and npm version
require('./check-versions')()
//set the node env to production mode
process.env.NODE_ENV = 'production'

//include some lib
const ora = require('ora')
const rm = require('rimraf')
const path = require('path')
const chalk = require('chalk')
const webpack = require('webpack')

//include some config
const config = require('../config')
const webpackConfig = require('./webpack.csr-pro.config')

const spinner = ora('building for production...')
spinner.start()

//remove the old build dir
rm(path.join(config.build.assetsRoot, config.build.assetsSubDirectory.to), err => {
  //case:err
  if (err) throw err
  //case:ok
  //use webpack to do
  webpack(webpackConfig, (err, stats) => {
    spinner.stop()
    //case:err
    if (err) throw err
    //case:ok
    process.stdout.write(stats.toString({
      colors: true,
      modules: false,
      children: false, // If you are using ts-loader, setting this to true will make TypeScript errors show up during build.
      chunks: false,
      chunkModules: false
    }) + '\n\n')

    if (stats.hasErrors()) {
      console.log(chalk.red('  Build failed with errors.\n'))
      process.exit(1)
    }

    console.log(chalk.cyan('  Build complete.\n'))
    console.log(chalk.yellow(
      '  Tip: built files are meant to be served over an HTTP server.\n' +
      '  Opening index.html over file:// won\'t work.\n'
    ))
  })
})
