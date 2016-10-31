/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	const {ipcRenderer} = __webpack_require__(1);

	var $ = (ele) => {
		var dom=document.querySelector(ele);
		if(!dom)return ele;
		bindFun(dom);
		return dom;
	}
	function bindFun(dom){
		if(!dom)return dom;
		dom.find = (e) => {
			var d = document.querySelector(e);
			bindFun(d);
			return d;
		}
		dom.append = (e) => {
			if(e==''){
				dom.innerHTML = '';
				return;
			}
			var df = document.createDocumentFragment("div");
			df.innerHTML = e;
			dom.innerHTML = df.innerHTML;
			bindFun(dom);
			return dom.nextSibling;
		}
	}
	const show = (ele) => {
		ele.style.display="block";
	}

	const hide = (ele) => {
		ele.style.display="none";
	}

	$("input[name='proxy']").onclick = () => {
		var fun=$(this).is(":checked") ? "show" : "hide";
		[fun]($('.proxy'));
	};

	$(".submit").onclick = () => {
		var url=$('[name="url"]').value;
		var isProxy=$("input[name='proxy']").getAttribute("checked");
		var proxy_host=isProxy ? $('[name="proxy_host"]').value : '';
		var proxy_port=isProxy ? $('[name="proxy_port"]').value : '';

		ipcRenderer.send('message',{url});

		show($(".loading"));
		hide($(".resData"));
		hide($(".content"));
	};
	ipcRenderer.on('reply', (event, res) => {
		if(typeof res !=="object")return;
		hide($(".loading"));
		show($(".resData"));
		show($(".content"));
		if(res.res!=="error"){
			var resDataDom=$('.resData');
			var content=resDataDom.find('.content');
			var resources=resDataDom.find('.resources');
			var picView=content.find('.picView');
			var dataDom=content.find('.data');
			var isSetImg=picView.find("img");
			var screenImg='data:image/png;base64,'+res.screenIMGBase64;
			if(!isSetImg){
				picView.append('<img src="'+screenImg+'" alt="截图"/>');
			}else{
				isSetImg.src=screenImg;
			}
			dataDom.innerHTML = '';
			dataDom.append('<p>网址：'+res.log.pages[0].id+'</p>');
			dataDom.append('<p>网站标题：'+res.log.pages[0].title+'</p>');
			dataDom.append('<p>请求状态：<em class="'+res.status+'">'+res.status+'</em></p>');
			dataDom.append('<p>总加载时长：'+res.log.pages[0].pageTimings.onLoad+'</p>');

			resources.innerHTML = '';
			var resList=[];
			var lists=res.log.entries;
			for(var i=0,j=lists.length;i<j;i++){
				var d=lists[i];
				var res=d.response;
				var tim=d.timings;
				var tims='';
				for(var key in tim){
					tims+='<em>'+key+':</em>'+tim[key]+'&nbsp;&nbsp;&nbsp;&nbsp;';
				}
				var item='\
					<li><i>'+(i+1)+'</i><p>请求资源：'+d.request.url+'</p>\
					<p><em>mimeType：</em>'+res.content.mimeType+'\
					<p><em>status：</em>'+res.status+'</p>\
					<p><em>阶段时长(ms)：</em></p><p>'+tims+'</p></li>';
				resList.push(item);
			}
			resources.append(resList.join(''));
		}
	});


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = require("electron");

/***/ }
/******/ ]);