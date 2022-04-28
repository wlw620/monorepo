const path = require('path')
const fs = require('fs-extra')
const execa = require('execa')
const glob = require('glob')
const chalk = require('chalk')
const _ = require('lodash')
const {Input, Select} = require('enquirer')

const templatePath = path.resolve(__dirname, `../templates`)
const appPath = path.resolve(process.cwd(), `./apps`)

// lodash template compiled
const createCompiled = content => {
  _.templateSettings.interpolate = /<%=([\s\S]+?)%>/g
  return _.template(content)
}

const install = appName => {
  const {name} = fs.readJSONSync(path.resolve(appPath, appName, 'package.json'))
  execa.sync('pnpm', ['install', '--filter', `${name}`], {
    stdio: 'inherit',
  })
}

const create = (appName, template) => {
  const files = glob.sync(`${template}/**/@(.*|*.*)`, {
    dot: true,
    nodir: true,
  })

  for (const file of files) {
    const relativePath = file.replace(`${template}/`, '')
    const dist = path.resolve(appPath, appName, relativePath)
    const content = fs.readFileSync(file, 'utf-8')
    const compiled = createCompiled(content)

    fs.outputFileSync(dist, compiled({name: appName}), {
      encoding: 'utf-8',
      flag: 'w+',
    })
  }
  // 安装依赖
  install(appName)
}

const checkAppName = appName => {
  if (!appName) {
    console.log(chalk.bold.red('Please specify the project name'))
    process.exit()
  }

  if (glob.sync('*', {cwd: appPath}).includes(appName)) {
    console.log(
      chalk.bold.red(
        `The directory ${appName} contains files that could conflict`
      )
    )
    process.exit()
  }
}

// create start
;(async () => {
  const appName = await new Input({
    message: chalk.bold.green('Please enter a name for the application'),
    initial: '',
  }).run()

  checkAppName(appName)

  const templateName = await new Select({
    name: 'template',
    message: chalk.bold.green('Please pick a template'),
    choices: glob.sync('*', {cwd: templatePath}),
  }).run()

  // 创建项目文件
  create(appName, path.resolve(templatePath, templateName))
})()
