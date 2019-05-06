# YApi cli tool
cli tool to deploy yapi-en server
## environment need
* nodejs（7.6+)
* mongodb（2.6+）
## install
run yapi-en server to deploy yapi-en server. after deployment run node/{path/server/app.js} to start the serve. default password is ymfe.org for login.。

    npm install -g @stuttgarter/yapi-en-cli
    yapi-en server 
## command
```
yapi-en --help // list yapi-en-cli commands
yapi-en --version //list yapi-en-cli current version
```
## update
Upgrading the project version is very easy and does not affect existing project data, only the source files in the vendors directory can be effected.
```
cd  {project}
yapi-en ls //list version
yapi-en update //update to current version
yapi-en update -v {Version} //update to a version
```
