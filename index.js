#!/usr/bin/env node
const fs = require('fs');
const program = require('commander');
const { exec } = require('child_process');
const handlebars = require('handlebars');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const symbols = require('log-symbols');

program.version('1.4.0', '-v, --version')
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

program.command('add <name>')
    .action((name) => {
        if (!fs.existsSync(name)) {
            const spinner = ora('📁  正在下载模板...');
            spinner.start();
            exec(`git clone https://github.com/qiang001/koa2-server-component ${name}`, (err) => {
                if (err) {
                    spinner.fail();
                    console.log(symbols.error, chalk.red(err));
                } else {
                    spinner.succeed()
                        //调整model.js中的名称
                        const fileName_model = `${name}/model.js`;
                        const meta_model = {
                            name,
                            name_upper_first: name.charAt(0).toUpperCase()+name.slice(1)
                        }
                        if (fs.existsSync(fileName_model)) {
                            const content = fs.readFileSync(fileName_model).toString();
                            const result = handlebars.compile(content)(meta_model);
                            fs.writeFileSync(fileName_model, result);
                        }
                        //调整controllers.js中的名称
                        const fileName_controllers = `${name}/controllers.js`;
                        const meta_controllers = {
                            name
                        }
                        if (fs.existsSync(fileName_controllers)) {
                            const content = fs.readFileSync(fileName_controllers).toString();
                            const result = handlebars.compile(content)(meta_controllers);
                            fs.writeFileSync(fileName_controllers, result);
                        }
                        //调整services.js中的名称
                        const fileName_services = `${name}/services.js`;
                        const meta_services = {
                            name_upper_first: name.charAt(0).toUpperCase()+name.slice(1)
                        }
                        if (fs.existsSync(fileName_services)) {
                            const content = fs.readFileSync(fileName_services).toString();
                            const result = handlebars.compile(content)(meta_services);
                            fs.writeFileSync(fileName_services, result);
                        }
                        //调整routes.js中的名称
                        const fileName_routes = `${name}/routes.js`;
                        const meta_routes = {
                            names: `${name}s`
                        }
                        if (fs.existsSync(fileName_routes)) {
                            const content = fs.readFileSync(fileName_routes).toString();
                            const result = handlebars.compile(content)(meta_routes);
                            fs.writeFileSync(fileName_routes, result);
                        }
                    console.log(symbols.success, chalk.green('🌈  新业务文件夹已成功添加'))
                }
            })
        } else {
            // 错误提示文件夹已存在，避免覆盖原有业务文件夹
            console.log(symbols.error, chalk.red('文件夹已存在'));
        }
    })


program.parse(process.argv);