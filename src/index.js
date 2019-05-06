const fs = require('fs-extra');
const path = require('path');
const yargs = require('yargs');
const utils = require('./utils');
const commandsDir = path.resolve(__dirname, 'commands');
var commands = [];
var commandsFile = fs.readdirSync(commandsDir);
commandsFile.forEach(function (file) {
  if (path.extname(file) !== '.js') return null;
  let commandModule = require(path.resolve(commandsDir, file));
  if (!commandModule) {
    throw new Error(' module in ' + file + 'file can not be found' );
  }
  let commandName = path.basename(file, '.js');
  yargs.command(commandName, commandModule.desc, commandModule.setOptions, commandModule.run);
})

try {
  yargs.argv;
  if (yargs.argv._.length === 0 && !process.argv[2]) {
    const root = process.cwd();
    let configFilepath = path.resolve(root, 'config.json');
    if (!utils.fileExist(configFilepath)) {
      return console.log(' config.json in project can not be found');
    }
    let packageJson = require(path.resolve(root, './vendors/package.json'));
    console.log(`current version：${packageJson.version}`)
  }

} catch (e) {
  console.error(e);
}


