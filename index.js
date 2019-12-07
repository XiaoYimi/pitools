#!/usr/bin/env node

const fs = require('fs') // node 内置文件模块
const program = require('commander') // 处理命令
const download = require('download-git-repo') // 实现对资源的下载
const inquirer = require('inquirer') // 采集用户输入,与用户实现一问一答的控制台窗口
const handlebars = require('handlebars') // 对文件 package.json 的中的插值进行替换
const ora = require('ora') // 下载时 loading 的转动效果
const chalk = require('chalk') // 对控制台输出的文字进行样式渲染
const logSymbols = require('log-symbols')  // 输出图标(成功/警告/失败/消息)

const templates = {
  vue: {
    need: {
      node: '8.12.0',
      npm: '6.4.1',
      webpack: '4.19.1'
    },
    version: '2.6.10',
    github: 'https://github.com/vuejs/vue/releases/tag/v2.6.10',
    down: 'direct:https://github.com/XiaoYimi/pitools-template-vue.git'
  }
}

program.version('0.0.1')

program
  .command('init <template-name> <project-name>')
  .description('基于选择的模板快速初始化项目')
  .action((templatename, projectname) => {
    const spinner = ora(`Loaing template (${templatename} ${templates[templatename].version}) ...`).start()
    const downurl = templates[templatename].down
    download(downurl, projectname, { clone: true }, (err) => {
      if (err) {
        spinner.fail()
        console.log(logSymbols.error, 'Project initialization failed !')
        return console.log(chalk.red(err))
      }
      spinner.succeed()
      inquirer
        .prompt([{
          type: 'input',
          name: 'name',
          message: 'Project name '
        }, {
          type: 'input',
          name: 'description',
          message: 'Project description '
        }, {
          type: 'input',
          name: 'author',
          message: 'Project author '
        }])
        .then(answers => {
          if (answers.name === '') { answers.name = projectname }
          if (answers.description === '') { answers.description = 'A Vue project.' }
          const packagePath = `${projectname}/package.json`
          const packageContent = fs.readFileSync(packagePath, 'utf8')
          const packageResult = handlebars.compile(packageContent)(answers)
          fs.writeFileSync(packagePath, packageResult)
          console.log('')
          console.log(chalk.green('Your project was initialized successfully.'))
          console.log('')
          console.log('Please execute the following command to start your project !')
          console.log('')
          console.log(`  ${chalk.blue(`cd ${projectname}`)}`)
          switch (templatename) {
            case 'vue':
              console.log(`
  Before running the project, you must install some dependent modules;
  Please execute the command 'npm install'

    ${chalk.blue('npm install')}

  Select the corresponding command according to the mode.

    ${chalk.blue('npm run serve')}
    ${chalk.blue('npm run build')}
`)

console.log('')
console.log('')
console.log(`
  If you don't want errors caused by the output code ${chalk.yellow('console')}, go to the file package.json, add this option ${chalk.yellow('"no-console": "off"')} in the ${chalk.yellow('eslintConfig')} field property ${chalk.yellow('rules')}.

  If you have any questions you don't understand, please go to ${chalk.yellow('https://github.com/xiaoyimi/pitools-template-vue')}

  `)

              break
            default: break
          }
        })
    })
  })

program
  .command('list')
  .description('查看当前可初始化的模板')
  .action(() => {
    console.log('The following templates are currently available.')
    console.log('')
    for (let key in templates) {
      console.log(`  ${key}  =>  ${key} 模板 (${templates[key].version})`)
    }
    console.log('')
    console.log(`You can initialize a project with the command 'pitools init <template-name> <project-name>'.`)
  })

program
.command('*')
.action((env) => {
  console.log('deploying "%s"', env)
})

program.parse(process.argv)
