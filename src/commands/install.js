const path = require('path');
const fs = require('fs-extra');
const mongoose = require('mongoose');
const utils = require('../utils.js');
const shell = require('shelljs');

var root, config;
const wget = utils.wget;
const fileExist = utils.fileExist;
function connect(config) {
  mongoose.Promise = global.Promise;
  let options = {
    useMongoClient: true,
    connectTimeoutMS: 3000
  };
  if (config.db.user) {
      options.user = config.db.user;
      options.pass = config.db.pass;
  }
  
  return mongoose.connect(`mongodb://${config.db.servername}:${config.db.port}/${config.db.DATABASE}`, options);
}

function ensureFilepaths(root) {
  let filepaths = [
    root,
    path.resolve(root, 'vendors'),
    path.resolve(root, 'log')
  ]
  filepaths.forEach(function (dir) {
    fs.ensureDirSync(dir);
  })
}




async function verifyConfig(config){
  if(!config.port){
    throw new Error('please config the port in config.json')
  }
  if(!config.adminAccount){
    throw new Error('please config the admin account in config.json ');
  }
  if(!config.db || typeof config.db !== 'object'){
    throw new Error('please config the db in  config.json')
  }
  try{
    await connect(config);
    utils.log('db success connected!');
  }catch(e){
    throw new Error('db connect failed, '+ e.message)
  }
}

function handleNpmInstall(){
  return new Promise(function(resolve, reject){
    let child = shell.exec('npm install -q --production --registry https://registry.npm.taobao.org', {async: true, silent: true});
    child.stdout.on('data', (data) => {
      console.log(` ${data}`);
    });
    
    child.stderr.on('data', (data) => {
      console.log(` ${data}`);
    });
    
    child.on('close', (code) => {
      resolve(true);
    });
  })
}

function handleServerInstall(){
  return new Promise(function(resolve, reject){
    let child = shell.exec(`npm run install-server`,{async: true, silent: true});
    child.stdout.on('data', (data) => {
      console.log(` ${data}`);
    });
    
    child.stderr.on('data', (data) => {
      reject({
        message: data
      });
    });
    
    child.on('close', (code) => {
      resolve(true);
    });

  })
}

async function run(argv){
  root = argv.dir;
  let configFilepath = path.resolve(root, 'config.json');
  
  if(!shell.which('node') || !shell.which('npm')){
    throw new Error('need to config the enviroment of node 和 npm ');
  }
  let nodeVersion = shell.exec('node -v', {silent: true}).substr(1);
  
  if(!utils.compareVersion('7.6', nodeVersion)){
      throw new Error('need node version >= 7.6 ')
  }

  if(!fileExist(configFilepath)){
    throw new Error(utils.message.fount_project_path_error);
  }
  config = require(configFilepath);
  if (!config || typeof config !== 'object') {
    throw new Error('config is wrong configured');
  }  
  if(fileExist(path.resolve(root, 'init.lock'))){
    throw new Error('system already existed. please clear db and delete init.lock to reinstall');
  }
  let v = argv.v;

  if(!v || typeof v !== 'string'){
    throw new Error('version must not be empty');
  }
  utils.log(`current version： ${v}`)
  ensureFilepaths(root);
  let domain = config.port == '80' ? 'http://127.0.0.1' : 'http://127.0.0.1:' + config.port
  try{
    await verifyConfig(config);
    let yapiPath = path.resolve(root, 'vendors');
    utils.log('start to download intall package...')
    await wget(yapiPath, v);  
    utils.log('deployed finished, start to install dependencies...')
    shell.cd(yapiPath);
    await handleNpmInstall();
    utils.log('install dependecnies finished，start to init mongodb正...')
    await handleServerInstall();
    utils.log(`deployed successfully，please go to the deploy path to run the server with this command： "node vendors/server/app.js" and visit ${domain} `);
  }catch(e){
    throw new Error(e.message)
  }
  
}

module.exports = {
  setOptions: function (yargs) {
    yargs.option('dir', {
      describe: 'path of deployment，default current folder',
      default: process.cwd()
    })
    yargs.option('v', {
      alias: 'v',
      describe: 'version'
    })
  },
  run: function (argv) {
    let result = run(argv);
    result.then(function(){
      process.exit(1);
    }).catch(function (err){
      console.log('Error: ', err.message);
      process.exit(1);
    })
  },
  desc: 'deploy YApi project,suguest to run yapi server to deploy'
}