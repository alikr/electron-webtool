const spawn = require('child_process').spawn;
const fs = require('fs');
const electron = require('electron');
let mainWindow;
const {app,BrowserWindow,ipcMain,ipcRenderer} = electron;
const {dataDir,url2filename,createPage} = require('./phantom.js');

//页面请求
ipcMain.on('message', function (event,arg) {
  var {url,proxy_host} = arg;
  console.log(url,proxy_host);
  var {curl:cmdurl,furl} = url2filename(url);

  //生成.har，并回复页面数据
  createPage(true,{
    url:url,
    proxy_host:proxy_host
  },(har) => {
    event.sender.send('reply', har);
  });

  //ping
  var pingname=dataDir+furl+'_ping.txt';
  addFileProgress('ping',[cmdurl,"-n","10","-4"],pingname);

  //请求页面内容
  var curlname=dataDir+furl+'_curl.txt';
  addFileProgress('curl',[cmdurl],curlname);

  //访问连接速度
  var visitdns=dataDir+furl+'_visitdns.txt';
  var visitArg=[
    '-w',
    '\ncontent_type=%{content_type}\
    \nfilename_effective=%{filename_effective}\
    \nftp_entry_path=%{ftp_entry_path}\
    \nhttp_code=%{http_code}\
    \nhttp_connect=%{http_connect}\
    \nlocal_ip=%{local_ip}\
    \nlocal_port=%{local_port}\
    \nnum_connects=%{num_connects}\
    \nnum_redirects=%{num_redirects}\
    \nredirect_url=%{redirect_url}\
    \nremote_ip=%{remote_ip}\
    \nremote_port=%{remote_port}\
    \nsize_download=%{size_download}\
    \nsize_header=%{size_header}\
    \nsize_request=%{size_request}\
    \nsize_upload=%{size_upload}\
    \nspeed_download=%{speed_download}\
    \nspeed_upload=%{speed_upload}\
    \nssl_verify_result=%{ssl_verify_result}\
    \nurl_effective=%{url_effective}\
    \ntime_namelookup=%{time_namelookup}\
    \ntime_appconnect=%{time_appconnect}\
    \ntime_connect=%{time_connect}\
    \ntime_redirect=%{time_redirect}\
    \ntime_pretransfer=%{time_pretransfer}\
    \ntime_starttransfer=%{time_starttransfer}\
    \ntime_total=%{time_total}',
    '-o',
    '/dev/null',
    '-s',
    url,
  ];
  addFileProgress('curl',visitArg,visitdns);

  //本地网络运营商
  var curlname_myip=dataDir+'myip_curl.txt';
  addFileProgress('curl',['myip.ipip.net'],curlname_myip);

  //本地nslookup
  var nslookup=dataDir+'nslookup.txt';
  addFileProgress('nslookup',[url],nslookup);

  //本地DNS信息
  var curlname_dns=dataDir+'dns_curl.txt';
  createPage(false,{url:'http://nstool.netease.com'},(content)=>{
    var reg=/(http)s?:\/\/\S+/;
    //是否嵌入iframe
    var iframeSrc=reg.exec(content);
    if(iframeSrc){
      var dnsurl=iframeSrc[0].replace(/"|'/g,'');
      addFileProgress('curl',[dnsurl],curlname_dns);
    }
  });

});

//保存记录文件
function addFileProgress(cmd,cmdArg,filename){
  return new Promise((res,rej) => {
    var file = fs.createWriteStream(filename);
    var cmdSpawn = spawn(cmd, cmdArg);
    cmdSpawn.stdout.on('data',function(data){
      file.write(data);
    });
    cmdSpawn.stdout.on('end', function(data) {
      
    });
    cmdSpawn.on('exit', function(code) {
      file.end();
    });
  })
}

//自动加载更新js
require('electron-reload')(__dirname, {
  ignored: /node_modules|data|[\/\\]\./
});

//electron应用配置
function createWindow () {
  mainWindow = new BrowserWindow({width: 1200, height: 600,icon: './img/app.png'})
  mainWindow.loadURL(`file://${__dirname}/index.html`)
  mainWindow.on('closed', function () {
    mainWindow = null
  });
}

app.on('ready', createWindow)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
});