// const BASE_PATH = 'http://localhost:8080/gov-admin/v1/';
export const BASE_PATH = '/gov-admin/v1/'

import $ from 'jquery'


function addRandomKey(url) {
  url = '' + url;
  let splitStr = '?'
  if(url.indexOf('?') > -1) {
    splitStr = '&';
  }
  url = url + splitStr + '_rd=' + (+new Date()) + Math.floor(Math.random() * 1000);
  return url;
}

/**
 * 所有请求的配置
 * @type {Array}
 * @param funcName 注册到Request对象上的方法名，不可重复
 * @param url 请求的接口地址
 * @param type 请求类型。GET POST PUT DELETE
 * @param requiredKeys 必填项，需要校验
 * @param optionalKeys 选填项，只做记录
 */
const API_LIST = [{
  funcName: 'doLogin',
  url: BASE_PATH + 'login',
  type: 'POST',
  requiredKeys: ['userName', 'password']
}, {
  // 获取院所列表
  funcName: 'getSchoolList',
  url: BASE_PATH + 'schoolList',
  type: 'GET',
  // 必须项，前端做校验，不满足则抛出错误
  requiredKeys: ['curPage', 'pageSize'],
  // 选填项
  optionalKeys: ['procinceCode', 'pityCode', 'areaCode', 'schoolName', 'schoolNature', 'mobile', 'leaderName']
}, {
  // 获取用户可操作省市区
  funcName: 'getUserPrivilege',
  url: BASE_PATH + 'userPrivilege',
  type: 'GET'
}, {
  // 获取通知列表
  funcName: 'getNoticeList',
  url: BASE_PATH + 'noticeList',
  type: 'GET',
  requiredKeys: ['curPage', 'pageSize'],
  optionalKeys: ['startDate', 'endDate', 'title', 'userName']
}, {
  // 获取材料列表
  funcName: 'getMaterialList',
  url: BASE_PATH + 'materialList',
  type: 'GET',
  requiredKeys: ['curPage', 'pageSize'],
  optionalKeys:  ['provinceCode', 'cityCode', 'areaCode', 'title', 'schooName', 'userName', 'startDate', 'endDate']
}, {
  // 获取材料详情
  funcName: 'getMaterialDetail',
  url: BASE_PATH + 'materialDetail',
  type: 'GET',
  requiredKeys: ['materialId'],
}, {
  // 删除材料
  funcName: 'deleteMaterial',
  url: BASE_PATH + 'deleteMaterial',
  type: 'GET',
  requiredKeys: ['materialId']
}, {
  // 下载附件
  funcName: 'downloadAccessory',
  url: BASE_PATH + 'download',
  type: 'GET',
  requiredKeys: ['id', 'mainType', 'mainId']
}, {
  // 获取通知详情
  funcName: 'getNoticeDetail',
  url: BASE_PATH + 'noticeDetail',
  type: 'GET',
  requiredKeys: ['noticeId']
}, {
  // 删除通知
  funcName: 'deleteNotice',
  url: BASE_PATH + 'deleteNotice',
  type: 'GET',
  requiredKeys: ['noticeId']
}, {
  funcName: 'addNotice',
  url: BASE_PATH + 'addNotice',
  type: 'POST',
  requiredKeys: ['title', 'range', 'accessoryList'],
  optionalKeys: ['context']
}, {
  // 再次提醒
  funcName: 'remindAgain',
  url: BASE_PATH + 'againRemind',
  type: 'GET',
  requiredKeys: ['noticeId']
}, {
  // 修改密码
  funcName: 'changePwd',
  url: BASE_PATH + 'changePwd',
  type: 'POST',
  requiredKeys: ['oldPassword', 'newPassword']
}, {
  funcName: 'logout',
  url: BASE_PATH + 'logout',
  type: 'GET'
}];

function redirectToLogin() {
  window.location.href = '/dist/pages/login.html';
}

function send(url, type, data, opts={}, successCb=()=>{}, errorCb=()=>{}) {
  url = addRandomKey(url);
  console.log('send url: ', url)
  $.ajax({
    url: url,
    type: type,
    dataType: 'json',
    data: data,
    // 默认30秒超时
    timeout: 30 * 1000,
    success: (jsonData) => {
      const { code, data, message } = jsonData;
      switch (code) {
        case 0:
          successCb(data);
          break;
        case 600:
          redirectToLogin();
          break;
        default:
          errorCb(message)
      }
    },
    error: (jqXHR, status, err) => {
      console.log(`send ajax url:${url}error`);
      var status = jqXHR.status;
      console.log(err)
      if (302 === status) {
        // 302什么都不操作
      } else {
        errorCb('网络错误，请稍候。');
      }
    }
  })
}
/**
 * 发送请求之前，先在本地校验数据，如果满足了再发送请求否则抛错(抛错影响主流程，所以暂时先打印出错误，方便日后调试)
 * @TODO 暂时只是简单的校验参数是否存在，不做类型的校验。后期可以加进去
 * @param  {Object} data         需要发送的数据
 * @param  {List} requiredKeys 必填项Key列表
 * @param  {List} optionalKeys 选填项Key列表。不做校验，只做记录使用
 * @return {Boolean}              是否通过校验
 */
function checkParams(url, data, requiredKeys=[], optionalKeys=[]) {
  if (typeof data !== 'object' && typeof data !== 'string') {
    console.error('错误类型: data', typeof data);
    return false;
  }
  for (let i=0; i<requiredKeys.length; i++) {
    let key = requiredKeys[i];
    if ('undefined' === typeof data[key] || ('object' === typeof data[key] && !data[key])) {
      console.error(`错误的请求参数${key},value: ${data[key]}`)
      return false;
    }
  }
  optionalKeys.map( (key, index) => {
    if ('undefined' !== typeof data[key] && ('object' === typeof data[key] && data[key])) {
      console.info(`请求的选填参数:${key}, 值: ${data[key]}`)
    }
  });
  return true;
}

let Request = {};
API_LIST.map( (apiOpt, index) => {
  let { url, funcName, type, requiredKeys, optionalKeys } = apiOpt;
  if(typeof Request[funcName] === 'function') {
    console.error('方法`${funcName}` 已经注册，请不要重复注册，或简单你的配置');
  } else {
    Request[funcName] = (data, opts, successCb, errorCb) => {
      // 省略data和opts参数，可以不用传值，直接将第一、第二个参数当做回调函数
      if(typeof data === 'function' && typeof opts === 'function') {
        successCb = data;
        errorCb = opts;
        data = {};
      } else if(typeof data !== 'function' && typeof opts === 'function') {
      // 省略opts参数，将第二、第三个参数当做回调函数
        errorCb = successCb
        successCb = opts;
      }
      if(checkParams(url, data, requiredKeys, optionalKeys)) {
        send(url, type, data, opts, successCb, errorCb);
      }
    }
  }
});

// 这里校验登录状态，如果是login页面，不需要

export default Request;
