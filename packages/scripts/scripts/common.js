const chalk = require('chalk')

module.exports = {
  processCancel: () => {
    console.log(`${chalk.bold.yellow('Cancelled...')} 👋`)
    process.exit()
  },
}
