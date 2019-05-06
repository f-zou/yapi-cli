# YApi cli tool
cli tool to deploy yapi-en server
## 环境要求
* nodejs（7.6+)
* mongodb（2.6+）
## install
run yapi-en server to deploy yapi-en server. after deployment run node/{path/server/app.js} to start the serve. default password is ymfe.org for login.。

    npm install -g yapi-cli --registry https://registry.npm.taobao.org
    yapi server 
## command
```
yapi --help // 查看 yapi-cli 命令
yapi --version //查看 yapi-cli 当前版本号
```
## update
Upgrading the project version is very easy and does not affect existing project data, only the source files in the vendors directory can be effected.
```
cd  {project}
yapi ls //list version
yapi update //update to current version
yapi update -v {Version} //update to a version
```
