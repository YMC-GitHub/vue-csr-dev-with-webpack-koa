const chalk = require('chalk')
const app = require('./app-koa')

const configServer = require('../build/server.config')

const port = process.env.PORT || configServer.port || 3000
app.listen(port, '0.0.0.0', () => {
  console.log('\n--------- Started ---------')
  console.log(chalk.bold('NODE_ENV:'), chalk.keyword('orange').bold(process.env.NODE_ENV || 'development'))
  const url = `http://127.0.0.1:${port}`
  console.log(chalk.bold('SERVER:'), chalk.blue.bold(url))
  console.log('---------------------------\n')
})
