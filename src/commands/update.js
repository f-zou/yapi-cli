const path = require('path');
const fs = require('fs-extra');
const download = require('download');
const utils = require('../utils.js');
const shell = require('shelljs');
const axios = require('axios');
const _ = require('underscore');

var root, config;

const wget = utils.wget;
const fileExist = utils.fileExist;

async function run(argv) {
  root = process.cwd();
  let configFilepath = path.resolve(root, 'config.json');
  if (!fileExist(configFilepath)) {
    throw new Error(utils.message.fount_project_path_error);
  }
  if (!shell.which('node') || !shell.which('npm')) {
    throw new Error('need to config node and npm environment');
  }
  let nodeVersion = shell.exec('node -v', {silent: true}).substr(1);

  if(!utils.compareVersion('7.6', nodeVersion)){
    throw new Error('need node version >= 7.6 ')
  }


  let v = argv.v;
  v = v ? 'v' + utils.handleVersion(v) : null;
  let hasPlugin = false, downloadType = 'npm';

  let versions = await utils.getVersions();

  if (!v || typeof v !== 'string') {
    v = 'v' + versions[0];
  }else if (!_.find(versions, item => {
    return ('v' + item) === v
  })) {
    downloadType = 'github';
    utils.log('version not exist. please  Ctrl+C  to Interrupt');
  }
  utils.log('version updated to' + v);
  let config = require(configFilepath);
  let npmInstall = 'npm install --production --registry https://registry.npm.taobao.org';
  if (config.plugins && Array.isArray(config.plugins) && config.plugins.length > 0) {
    hasPlugin = true;
    npmInstall = 'npm install --registry https://registry.npm.taobao.org';
  }

  let yapiPath = path.resolve(root, 'vendors');
  utils.log('Start downloading the platform file compression package..')
  await wget(yapiPath, v, downloadType);
  utils.log('The deployment file is complete, executing npm install...')
  shell.cd(yapiPath);

  shell.exec(npmInstall);
  if (hasPlugin) {
    config.plugins.forEach(item => {
      if (!item) {
        return null;
      }
      if (typeof item === 'string') {
        shell.exec('npm install ' + 'yapi-plugin-' + item)
      } else if (typeof item === 'object') {
        shell.exec('npm install ' + 'yapi-plugin-' + item.name)
      }
    })
    utils.log('run ykit pack -m ...');
    if( !shell.which('ykit')){
      throw new Error('need to install ykit ');
    }
    shell.exec('ykit pack -m');
  }

  utils.log('updated，please restart the sever')
}

module.exports = {
  setOptions: function (yargs) {
    yargs.option('v', {
      alias: 'v',
      describe: 'deployed version'
    })
  },
  run: function (argv) {
    let result = run(argv);
    result.then(function () {
      process.exit(1);
    }).catch(function (err) {
      console.log('Error: ', err.message);
      process.exit(1);
    })
  },
  desc: 'update YApi version'
}