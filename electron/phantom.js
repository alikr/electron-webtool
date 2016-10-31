const phantom = require('phantom');
const fs = require('fs');

//数据目录
const dataDir='./data/';
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

function time2ISOString(Time){
  return new Date(Time).toISOString();
}

function getTime(t){
    return t ? new Date(t).getTime() : new Date().getTime();
}

function url2filename(url){
  var curl = url.replace(/(http)s?:\/\//g,'');//curl命令使用的名称
  var furl = url ? url.replace(/\./g,'_') : '';
  furl = furl.replace(/(http)s?:\/\//g,'');//保存文件名称
  return {url,furl,curl};
}

function createPage(flag,arg,callback){
    var url = arg.url;
    var proxy_host = arg.proxy_host;
    var redirectURL = null;

    var sitepage = null;
    var phInstance = null;

    var outObj={};
    var _data,_urls;
    let _ph, _page, _outObj,_status,_title;
    var proxy=[];
    if(proxy_host){
        proxy=['--proxy='+proxy_host];
    }
    phantom.create(proxy).then(ph => {
      _ph = ph;
      return _ph.createPage();
    })
    .then(page => {
        _page = page;
        _outObj = _ph.createOutObject();
        _outObj2 = _ph.createOutObject();
        _outObj2.data={};
        _outObj.urls={
            data:[],
            startTime:getTime()
        }
        page.property('onResourceRequested', function(requestData, networkRequest,out) {
            out.urls.data[requestData.id] = {
                request: requestData,
                startReply: null,
                endReply: null
            };
        },_outObj);

        page.property('onResourceReceived', function(req,out) {
            if (req.stage === 'start') {
                out.data[req.id]={
                    startReply : req,
                    endReply : null
                }
            }
            if (req.stage === 'end') {
                out.data[req.id].endReply = req;
            }
        },_outObj2);
        return _page.open(url);
    })
    .then((res) => {
        return _page.property('status');
     })
    .then(status => {
        console.log(status)
        _status=status!='fail' ? "ok" : status;
        return _outObj.property('urls');
    })
    .then(urls => {
        _urls=urls;
        return _outObj2.property('data');
    })
    .then(res => {
        _data=res;
        return _page.evaluate(function () {
            return document.title;
        })
    })
    .then(res => {
      _title=res;
      return _page.property('content');
    })
    .then(res => {
      if(typeof callback=="function")callback(res);
      if(!flag)return;
      for(var key in _data){
          _urls.data[key].startReply=_data[key].startReply;
          _urls.data[key].endReply=_data  [key].endReply;
      }
      var har = createHAR(url, _title, _urls.startTime, getTime(), _urls.data);
      var {furl} = url2filename(url);

      fs.writeFileSync(dataDir+furl+".har",JSON.stringify(har));

      _page.property('viewportSize',{width:1000,height:800})
      .then(() => {
          return _page.renderBase64();
      })
      .then(img => {
          console.log('end:'+url,"status:"+_status);
          har.screenIMGBase64=img;
          har.status=_status;
          callback(har);
          _page.close();
          _ph.exit();
      });
    });
}

function createHAR(address, title, startTime, endTime, resources){
    var cdata=resources.filter(resource => {
        var request = resource && resource.request,
            startReply = resource && resource.startReply,
            endReply = resource && resource.endReply;
        return resource && request && startReply && endReply;
    });
    var entries = cdata.map(function (resource) {
        var request = resource.request,
            startReply = resource.startReply,
            endReply = resource.endReply;
        return {
            startedDateTime: request.time,
            time: getTime(endReply.time) - getTime(request.time),
            request: {
                method: request.method,
                url: request.url,
                httpVersion: "HTTP/1.1",
                cookies: [],
                headers: request.headers,
                queryString: [],
                headersSize: -1,
                bodySize: -1
            },
            response: {
                status: endReply.status,
                statusText: endReply.statusText,
                httpVersion: "HTTP/1.1",
                cookies: [],
                headers: endReply.headers,
                redirectURL: "",
                headersSize: -1,
                bodySize: startReply.bodySize,
                content: {
                    size: startReply.bodySize,
                    mimeType: endReply.contentType
                }
            },
            cache: {},
            timings: {
                blocked: 0,
                dns: -1,
                connect: -1,
                send: 0,
                wait: getTime(startReply.time) - getTime(request.time),
                receive: getTime(endReply.time) - getTime(startReply.time),
                ssl: -1
            },
            pageref: address
        };
    });

    return {
        log: {
            version: '1.0',
            creator: {
                name: "PhantomJS",
                version: "1.0"
            },
            pages: [{
                startedDateTime: time2ISOString(startTime),
                id: address,
                title: title,
                pageTimings: {
                    onLoad: new Date(endTime)-new Date(startTime)
                }
            }],
            entries: entries
        }
    };
}
module.exports = {
	"dataDir":dataDir,
	"url2filename":url2filename,
    "createPage":createPage
}