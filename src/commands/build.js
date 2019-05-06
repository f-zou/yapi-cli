const path = require('path');
const fs = require('fs-extra');
const utils = require('../utils.js');
const shell = require('shelljs');
const axios = require('axios');
const _ = require('underscore');
let root, config;
module.exports = {
  setOptions: function () { 

  },
  run: function (argv) {
    try {

      root = process.cwd();
      let configFilepath = path.resolve(root, 'config.json');
      if (!utils.fileExist(configFilepath)) {
        throw new Error(utils.message.fount_project_path_error);
      }
      let name = argv.name;
      
      shell.cd('vendors');
      utils.log('installing dependencies...');
      shell.exec('npm install --registry https://registry.npm.taobao.org');
      utils.log('dependencies intalled，client in compiling')
      shell.exec('ykit pack -m')
      utils.log('compieled ，please restart server')
    } catch (e) {
      utils.log(e.message);
    }
  },
  desc: 'install plugin'
}