// small plugin modified from http://www.zhangxinxu.com/

var getCss = function(o, key) {
	return o.currentStyle ? o.currentStyle[key] : document.defaultView.getComputedStyle(o,false)[key]; 	
};

var startDrag = function(bar, target, callback){
	var params = {
		left: 0,
		top: 0,
		currentX: 0,
		currentY: 0,
		flag: false
	};

	params.left = getCss(target, "left") == "auto" ? 0 : getCss(target, "left");
	params.top = getCss(target, "top") == "auto" ? 0 : getCss(target, "top");

	bar.onmousedown = function(event){
		params.flag = true;
		if(!event){
			event = window.event;
			//防止IE文字选中
			bar.onselectstart = function(){
				return false;
			}  
		}
		var e = event;
		params.currentX = e.clientX;
		params.currentY = e.clientY;
	};

	bar.onmouseup = function(){
		params.flag = false;
		params.left = getCss(target, "left") == "auto" ? 0 : getCss(target, "left");
		params.top = getCss(target, "top") == "auto" ? 0 : getCss(target, "top");
	};
	
	bar.onmousemove = function(event){
		var e = event ? event : window.event;
		if (params.flag) {
			var disX = e.clientX - params.currentX, disY = e.clientY - params.currentY;
			target.style.left = parseInt(params.left) + disX + "px";
			target.style.top = parseInt(params.top) + disY + "px";
		}
		
		if (typeof callback == "function") {
			callback(parseInt(params.left) + disX, parseInt(params.top) + disY);
		}
	}	
};