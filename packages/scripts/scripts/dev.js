const path = require('path')
const fs = require('fs-extra')
const execa = require('execa')
const glob = require('glob')
const chalk = require('chalk')
const _ = require('lodash')
const {Input, Select} = require('enquirer')

const appPath = path.resolve(process.cwd(), `./apps`)

const runDev = appName => {
  const {name} = fs.readJSONSync(path.resolve(appPath, appName, 'package.json'))
  execa.sync('pnpm', ['run', 'start', '--filter', `${name}`], {
    stdio: 'inherit',
  })
}

;(async () => {
  const appName = await new Select({
    name: 'template',
    message: chalk.bold.green('Select a app to start'),
    choices: glob.sync('*', {cwd: appPath}),
  }).run()

  runDev(appName)
})()
