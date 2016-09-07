
export function getUrlParam (paras) {
    var url = location.href;
    var paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");
    var paraObj = {};
    var i , j;
    for (i = 0; i<paraString.length; i++) {
      j = paraString[i];
      paraObj[j.substring(0, j.indexOf("=")).toLowerCase()] = j.substring(j.indexOf("=") + 1, j.length).replace(/#(.+)/ig, '').replace(/\?(.+)/ig, '');
    }
		if(!paras) {
			return paraObj;
		}
		return paraObj[paras.toLowerCase()] || '';
}

let fileTypeMap = {
  'png': 'jpeg',
  'jpg': 'jpeg',
  'gif': 'jpeg',
  'jpeg': 'jpeg',
  'svg': 'jpeg',
  'doc': 'doc',
  'docx': 'doc',
  'txt': 'txt',
  'ppt': 'ppt',
  'excel': 'excel',
  'xls': 'excel',
  'xlsx': 'excel',
  'pdf': 'pdf',
  'mp4': 'mp4',
  'avi': 'mp4',
  'rmvb': 'mp4',
  'mpg': 'mp4',
  'wmv': 'mp4'
}

export function getFileTypeByName(name) {
  // 暂时简单的通过最后一个.后面的来判断
  // 所有不识别的默认为doc文件
  if(!name || name.indexOf('.') < 1) {
    return 'other';
  }
  var filePostFix = name.substr(name.lastIndexOf('.')+1, name.length-1);
  // 不区分大小写
  return fileTypeMap[filePostFix.toLowerCase()] || 'other';
}

export function getCookie(key) {
    var result = null;
		var cookies = document.cookie ? document.cookie.split('; ') : [];
		var i = 0;
		var l = cookies.length;

		for (; i < l; i++) {
			var parts = cookies[i].split('=');
      var name = parts[0];
      var value = decodeURIComponent(parts[1]);

			if (key === name) {
				result = value;
				break;
			}
		}
		return result;
}

export var datepickerOpt = {
  dateFormat: 'yy-mm-dd',
  closeText: '关闭',
  prevText: '<上月',
  nextText: '下月>',
  currentText: '今天',
  monthNames: ['一月','二月','三月','四月','五月','六月',
  '七月','八月','九月','十月','十一月','十二月'],
  monthNamesShort: ['一','二','三','四','五','六',
  '七','八','九','十','十一','十二'],
  dayNames: ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],
  dayNamesShort: ['周日','周一','周二','周三','周四','周五','周六'],
  dayNamesMin: ['日','一','二','三','四','五','六'],
  weekHeader: '周',
  dateFormat: 'yy-mm-dd',
  firstDay: 1,
  isRTL: false,
  showMonthAfterYear: true,
  yearSuffix: '年'
};
