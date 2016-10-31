# 说明

## ./app
> web应用开发

## ./electron
> electron应用
> package.json 为应用配置（描述electron）

## ./tool
> curl模块或其它工具，打包后，将此文件夹复制到打包所在的目录

# 使用说明

> ./package.json 为electron开发环境的配置（打包编译等）

## 开发运行

```shell
npm run start
```

## 将web项目打包asar

> 将asar文件，替换electron程序的resources目录下默认asar文件(default_app.asar)

```shell
npm run asar
```

## 打包

```shell
npm run package
```

# 查看.har
[http-archive-viewer](https://chrome.google.com/webstore/detail/http-archive-viewer/ebbdbdmhegaoooipfnjikefdpeoaidml?utm_source=chrome-app-launcher-info-dialog)
