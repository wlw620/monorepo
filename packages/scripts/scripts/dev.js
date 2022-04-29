const path = require('path')
const fs = require('fs-extra')
const execa = require('execa')
const glob = require('glob')
const chalk = require('chalk')
const { Select } = require('enquirer')
const { processCancel } = require('./common')

const appPath = path.resolve(process.cwd(), `./apps`)

const runDev = (appName) => {
  if (appName === 'all') {
    execa.sync('turbo', ['run', 'dev', '--parallel'], {
      stdio: 'inherit',
    })
    return
  }
  const { name } = fs.readJSONSync(path.resolve(appPath, appName, 'package.json'))
  execa.sync('turbo', ['run', 'dev', '--parallel', `--filter=${name}`], {
    stdio: 'inherit',
  })
}

;(async () => {
  const appName = await new Select({
    name: 'template',
    message: chalk.bold.green('Select a app to start'),
    choices: ['all...', ...glob.sync('*', { cwd: appPath })],
  })
    .run()
    .catch(processCancel)

  runDev(appName)
})()
