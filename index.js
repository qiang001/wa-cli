#!/usr/bin/env node
const fs = require('fs');
const program = require('commander');
const { exec } = require('child_process');
const handlebars = require('handlebars');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const symbols = require('log-symbols');

program.version('1.0.0', '-v, --version')
    .command('init <name>')
    .action((name) => {
        if (!fs.existsSync(name)) {
            inquirer.prompt([
                {
                    name: 'description',
                    message: '请输入项目描述'
                },
                {
                    name: 'author',
                    message: '请输入作者名称'
                }
            ]).then((answers) => {
                const spinner = ora('🕑  正在下载模板...');
                spinner.start();
                exec(`git clone https://github.com/qiang001/koa2-server-template ${name}`, (err) => {
                    if (err) {
                        spinner.fail();
                        console.log(symbols.error, chalk.red(err));
                    } else {
                        spinner.succeed();
                        const fileName = `${name}/package.json`;
                        const meta = {
                            name,
                            description: answers.description,
                            author: answers.author
                        }
                        if (fs.existsSync(fileName)) {
                            const content = fs.readFileSync(fileName).toString();
                            const result = handlebars.compile(content)(meta);
                            fs.writeFileSync(fileName, result);
                        }
                        console.log(symbols.success, chalk.green('🚩  项目初始化完成,请参考以下命令启动项目'));
                        console.log(`     1.进入项目：cd ${name}`)
                        console.log(`     2.安装项目依赖：npm install`)
                        console.log('     3.启动项目：npm run dev / node app')
                        console.log(symbols.info, chalk.green('强烈推荐安装 nodemon ( npm install nodemon -g ), 然后启动项目命令：npm start / nodemon app'))
                    }
                })
            })
        } else {
            // 错误提示项目已存在，避免覆盖原有项目
            console.log(symbols.error, chalk.red('项目已存在'));
        }
    })
program.parse(process.argv);