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
      describe: 'plugin name，with prefix yapi-plugin- '
    })
    yargs.option('build', {
      alias: 'b',
      default: true,
      describe: 'wether to compile client code，default: true'
    })
  },
  run: function (argv) {
    try {

      root = process.cwd();
      let configFilepath = path.resolve(root, 'config.json');
      if (!utils.fileExist(configFilepath)) {
        throw new Error('config file config.json not found');
      }
      if( !shell.which('ykit')){
        throw new Error('need to install ykit ');
      }
      let name = argv.name;
      config = require(configFilepath);
      if (!config.plugins || !Array.isArray(config.plugins)) {
        config.plugins = [];
      }

      if (!name) {
        throw new Error('please input the plugin name to install, yapi-cli plugin --name yapi-plugin-*** ')
      }
      if (name.indexOf('yapi-plugin-') !== 0) {
        throw new Error('plugin name prefix need to be yapi-plugin-')
      }

      let pluginName = name.substr('yapi-plugin-'.length)
      if (_.find(config.plugins, plugin=>{
        if(!plugin) return null;
        if(typeof plugin === 'string'){
          return plugin == pluginName;
        }else if(typeof plugin === 'object'){
          return plugin.name == pluginName
        }
      })) {
        shell.cd('vendors');
        utils.log('downloading plugin...');
        shell.exec('npm install  --registry https://registry.npm.taobao.org ' + name);
        utils.log('plugin updated')
      }else{
        shell.cd('vendors');
        utils.log('plugin is in downloading...');
        shell.exec('npm install  --registry https://registry.npm.taobao.org ' + name);
        utils.log('plugin installed')
        config.plugins.push({
          name: pluginName
        }) 
      }
      
      fs.writeFileSync(configFilepath, JSON.stringify(config, null, '   '));
      if(argv.build === true){
        utils.log('intalling dependencies...');
        shell.exec('npm install --registry https://registry.npm.taobao.org');
        shell.exec('ykit pack -m')        
        utils.log('client compiled，please restart the server')
      }
      
    } catch (e) {
      utils.log(e.message);
    }
  },
  desc: 'plugin install'
}