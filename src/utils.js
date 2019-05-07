const download = require('download');
const fs = require('fs');
const semver = require('semver')
const axios = require('axios')

function oldVersion(){
    return [
        "0.1.6",
        "0.1.5",
        "0.1.4"
    ]
}


function github(version, type = 'npm') {
    let url;
    if(version[0] === 'v' || version[0] === 'V'){
        version = version.substr(1)
    }

    if(oldVersion().indexOf(version) !== -1){
        type = 'qunar'
    }
    url = `https://registry.npmjs.org/@stuttgarter/yapi-en/-/yapi-en-${version}.tgz`;

    return url;
}
module.exports ={
    message:{
        'fount_project_path_error': ' config.json is not existed in project'
    },

    getVersions: async function(){
        //let info = await axios.get('https://www.easy-mock.com/mock/5c2851e3d84c733cb500c3b9/yapi/versions');
        //let versions = info.data.data;
        //console.log(versions)
        //return [].concat(versions, oldVersion())
        return [
            "0.1.6"
        ];
    },

    log: function(msg){
        console.log(msg);
    },
    error: function(error){
        console.error(error);
    },
    wget: function ( dest, v, type) {
        const url = github(v, type);
        const cmd = download(url, dest, { extract: true, strip: 1 });
        console.log(url)
        cmd.stdout = process.stdout;
        return cmd;
    },
    fileExist: function (filePath) {
        try {
            return fs.statSync(filePath).isFile();
        } catch (err) {
            return false;
        }
    },
    compareVersion: function compareVersion(version, bigVersion){
        version = version.split(".");
        bigVersion = bigVersion.split(".");
        for(let i = 0; i< version.length; i++){
            version[i] = +version[i];
            bigVersion[i] = +bigVersion[i];
            if(version[i] > bigVersion[i]){
                return false;
            }else if(version[i] < bigVersion[i]){
                return true;
            }
        }
        return true;
    },
    handleVersion: function(version){
        if(!version) return version;
        version = version  + '';
        if(version[0] === 'v'){
            return version.substr(1);
        }
        return version;
    }
}