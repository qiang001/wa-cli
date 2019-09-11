#!/usr/bin/env node
const fs = require('fs');
const program = require('commander');
const { exec } = require('child_process');
const handlebars = require('handlebars');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const symbols = require('log-symbols');


function deleteall(path) {
    var files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) { // recurse
                deleteall(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}


program.version('1.6.0', '-v, --version')
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
                        deleteall(`${name}/.git`)
                        fs.unlinkSync(`${name}/.gitignore`)
                        fs.unlinkSync(`${name}/README.md`)
                        const spinner1 = ora('🕑  正在安装项目依赖...');
                        spinner1.start();
                        exec(`cd ${name} & npm install`,(err)=>{
                            if (err) {
                                spinner1.fail();
                                console.log(symbols.error, chalk.red(err));
                            }else{
                                spinner1.succeed();
                                console.log(symbols.success, chalk.green('🚩  项目初始化完成,请参考以下命令启动项目'))
                                console.log(`     1.进入项目：cd ${name}`)
                                console.log('     2.启动项目：npm start')
                            }
                        })
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
            exec(`git clone https://github.com/qiang001/koa2-server-component api/${name}`, (err) => {
                if (err) {
                    spinner.fail();
                    console.log(symbols.error, chalk.red(err));
                } else {
                    spinner.succeed()
                    //调整model.js中的名称
                    const fileName_model = `api/${name}/model.js`;
                    const meta_model = {
                        name,
                        name_upper_first: name.charAt(0).toUpperCase() + name.slice(1)
                    }
                    if (fs.existsSync(fileName_model)) {
                        const content = fs.readFileSync(fileName_model).toString();
                        const result = handlebars.compile(content)(meta_model);
                        fs.writeFileSync(fileName_model, result);
                    }
                    //移动model.js => db文件夹 并且重命名
                    fs.renameSync(fileName_model,`db/models/${name}.js`)
                    //调整controllers.js中的名称
                    const fileName_controllers = `api/${name}/controllers.js`;
                    const meta_controllers = {
                        name
                    }
                    if (fs.existsSync(fileName_controllers)) {
                        const content = fs.readFileSync(fileName_controllers).toString();
                        const result = handlebars.compile(content)(meta_controllers);
                        fs.writeFileSync(fileName_controllers, result);
                    }
                    //调整services.js中的名称
                    const fileName_services = `api/${name}/services.js`;
                    const meta_services = {
                        name_upper_first: name.charAt(0).toUpperCase() + name.slice(1),
                        name:name
                    }
                    if (fs.existsSync(fileName_services)) {
                        const content = fs.readFileSync(fileName_services).toString();
                        const result = handlebars.compile(content)(meta_services);
                        fs.writeFileSync(fileName_services, result);
                    }
                    //调整routes.js中的名称
                    const fileName_routes = `api/${name}/routes.js`;
                    const meta_routes = {
                        names: `${name}s`
                    }
                    if (fs.existsSync(fileName_routes)) {
                        const content = fs.readFileSync(fileName_routes).toString();
                        const result = handlebars.compile(content)(meta_routes);
                        fs.writeFileSync(fileName_routes, result);
                    }
                    deleteall(`api/${name}/.git`)
                    console.log(symbols.success, chalk.green('🌈  新业务文件夹已成功添加'))
                }
            })
        } else {
            // 错误提示文件夹已存在，避免覆盖原有业务文件夹
            console.log(symbols.error, chalk.red('文件夹已存在'));
        }
    })


program.parse(process.argv);