#!/usr/bin/env node
const Handlebars = require("handlebars");
const program = require('commander');
const chalk = require('chalk');
const path = require('path');
const ora = require('ora');
const fs = require('fs-extra');
const download = require('download-git-repo');
var inquirer = require("inquirer");

const version = require('../package.json').version;
const { ELEMENT_UI, DOWN_URL, TEST_DOCKER, VUEX } = require('../config/constants');
const PROMPT_CONFIG = require('../config/inquirer-config');

program.version(version);
program.option('-E, --Element', 'add Element v2.15.1');
// 默认options 参数1是 代理api  name  参数2 是url地址
program.option('-p, --proxy [options...]', 'add proxy ');
program.option('-x, --vuex', 'add vuex');
program.command('init [projectName]')
  .action((projectName) => {
    if (!projectName) {
      console.log(chalk.red(`need a projectName`));
      return;
    }
    const cwd = process.cwd();
    if (fs.existsSync(path.join(cwd, projectName))) {
      console.log(chalk.red('The same directory already exists'))
      return;
    }
    const opts = program.opts();
    if (!Object.keys(opts).length) {
      inquirer.prompt(PROMPT_CONFIG).then(answers => {
        init(projectName, answers);
      })
    } else {
      init(projectName, opts);
    }
  });
const init = (projectName, opts) => {
  console.log(chalk.white('\n Start generating... \n'))
  // 出现加载图标
  const spinner = ora('Downloading...');
  spinner.start();

  download(DOWN_URL, projectName, (err) => {
    if (err) {
      spinner.fail();
      console.log(chalk.red(`Generation failed. ${err}`))
      return;
    } else {
      spinner.succeed();
      setOption(projectName, opts);
      console.log(chalk.green('succeed'));
    }
  })
}
const setOption = (projectName, opts) => {
  let mainJs_result = {};
  let package_Json = {};
  setEnvProduction(projectName);
  setVueRouter(package_Json);
  setProxy(projectName, opts);
  if (opts.vuex) {
    mainJs_result = { ...mainJs_result, ...VUEX};
    package_Json.dependencies = { ...(package_Json.dependencies || {}), ...{ 'vuex': '^3.1.0', } };
  } else {
    const filePath = path.join(process.cwd(), `${projectName}/src/store`);
    fs.remove(filePath);
  }
  if (opts.Element) {
    mainJs_result = { ...mainJs_result, ...ELEMENT_UI };
    package_Json.dependencies = { ...(package_Json.dependencies || {}), ...{ 'element-ui': '^2.15.1' } };
  }
  setMainJs(projectName,mainJs_result);
  setPackage(projectName, package_Json);
  setLocation(projectName);
  setBuild(projectName);
}

const setMainJs = (projectName,mainJs_config) => {
  const cwd = process.cwd();
  const filePath = path.join(cwd, `${projectName}/src/main.js`);
  const mainJs = fs.readFileSync(filePath).toString();
  const mainJs_result = Handlebars.compile(mainJs)(mainJs_config);
  fs.writeFileSync(filePath, mainJs_result);
}

const setPackage = (projectName, config_object ) => {
  const cwd = process.cwd();
  const packagePath = path.join(cwd, `${projectName}/package.json`);
  const package = fs.readFileSync(packagePath).toString();
  const packageJson = JSON.parse(package);
  for (const key in config_object) {
    packageJson[key] = { ...packageJson[key], ...config_object[key]};
  }
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
}
const setLocation = (projectName) => {
  const cwd = process.cwd();
  const filePath = path.join(cwd, `${projectName}/location.d/default.conf`);
  const mainJs = fs.readFileSync(filePath).toString();
  const mainJs_result = Handlebars.compile(mainJs)({APP_NAME: projectName});
  fs.writeFileSync(filePath, mainJs_result);
}

const setBuild = (projectName) => {
  const cwd = process.cwd();
  const filePath = path.join(cwd, `${projectName}/build.sh`);
  const mainJs = fs.readFileSync(filePath).toString();
  const mainJs_result = Handlebars.compile(mainJs)({APP_NAME: projectName});
  fs.writeFileSync(filePath, mainJs_result);
}

const setProxy = (projectName = '', options) => {
  const { proxy, name, url } = options;
  let OPTION = { projectName, proxy: true };
  if (typeof proxy === 'boolean' && proxy && !name && !url) {
    OPTION = { ...OPTION, name: projectName, url: TEST_DOCKER};
  } else if (proxy.length) {
    OPTION = { ...OPTION, name: options[0] || projectName, url: options[1] || TEST_DOCKER };
  } else if( name && url){
    OPTION = { ...OPTION, name: name || projectName, url: url || TEST_DOCKER };
  } else {
    OPTION.proxy = false;
  }
  const filePath = path.join(process.cwd(), `${projectName}/vue.config.js`);
  writeFileUseHandlebars(filePath, OPTION);
}

const setEnvProduction = (projectName) => {
  const filePath = path.join(process.cwd(), `${projectName}/.env.production`);
  writeFileUseHandlebars(filePath, { APP_NAME: projectName });
}
const writeFileUseHandlebars = (filePath, object_condig) => {
  const config_str = fs.readFileSync(filePath).toString();
  const config_result = Handlebars.compile(config_str)(object_condig);
  fs.writeFileSync(filePath, config_result);
}

const setVueRouter = (package_Json) => {
  package_Json.dependencies = { ...(package_Json.dependencies||{}), ...{ 'vue-router': '^3.0.6' }};
}

const emptyTips = () => {
  program.parse(process.argv);
  if (program.args.length < 1) return program.help();
}
emptyTips();
