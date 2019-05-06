const path = require('path');
const fs = require('fs-extra');
const utils = require('../utils.js');
const shell = require('shelljs');
const axios = require('axios');
const _ = require('underscore');
let root, config;
module.exports = {
  setOptions: function (yargs) { 
    yargs.option('name', {
      alias: 'n',
      describe: 'plugin name，prefix need to be yapi-plugin- '
    })
  },
  run: function (argv) {
    try {

      root = process.cwd();
      let configFilepath = path.resolve(root, 'config.json');
      if (!utils.fileExist(configFilepath)) {
        throw new Error(utils.message.fount_project_path_error);
      }
      let name = argv.name;
      config = require(configFilepath);
      if (!config.plugins || !Array.isArray(config.plugins)) {
        throw new Error('plugin not installed');
      }

      if (!name) {
        throw new Error('please input the Name of plugin to uninstall, yapi-cli plugin uninstall --name yapi-plugin-*** ')
      }
      if (name.indexOf('yapi-plugin-') !== 0) {
        throw new Error('plugin name prefix must be yapi-plugin-')
      }

      if( !shell.which('ykit')){
        throw new Error('need to install ykit ');
      }

      let pluginName = name.substr('yapi-plugin-'.length);
      config.plugins = config.plugins.filter(plugin=>{
        if(typeof plugin === 'string'){
          return plugin !== pluginName;
        }else if(typeof plugin === 'object'){
          return plugin.name !== pluginName;
        }
        return true;

      })
      fs.writeFileSync(configFilepath, JSON.stringify(config, null, '   '));
      shell.cd('vendors');
      utils.log('compiling client')
      shell.exec('ykit pack -m')
      
      utils.log('plugin unintalled ，please restart server')
    } catch (e) {
      utils.log(e.message);
    }
  },
  desc: 'plugin uninstall'
}