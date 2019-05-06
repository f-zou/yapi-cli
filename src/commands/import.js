const path = require('path');
const fs = require('fs-extra');
const utils = require('../utils.js');
const shell = require('shelljs');
const axios = require('axios');
const cwd = process.cwd()
const url = require('url')

module.exports = {
  setOptions: function (yargs) {
    yargs.option('config', {
      describe: 'config the path of file, default file is yapi-import.json under current folder ',
      default: path.resolve(cwd, 'yapi-import.json')
    })
  },
  run: async function (argv) {
    try{
      let config = require(argv.config)
      let content;
      if(config.file.indexOf('http') !== 0){
        content = require(path.resolve(cwd, config.file))
      }else{
        content = await axios(config.file)
        content = content.data;
      }
      if(typeof content === 'object' && content){
        content = JSON.stringify(content,null,2)
      }
      if(!content){
        return console.error('json must not be empty')
      }
      let params = {
        type: config.type,
        token: config.token,
        json: content,
        merge: config.merge
      }
      let apiUrl = url.resolve(config.server, '/api/open/import_data')
      let result = await axios.post(apiUrl, params)
      if(result.data.errcode){
        console.error(result.data.errmsg)
      }else{
        console.log(result.data.errmsg)
      }

    }catch(err){
      console.error(err.message)
    }
    
    
  },
  desc: 'import data for interface'
}