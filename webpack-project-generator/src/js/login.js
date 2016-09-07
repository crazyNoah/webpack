import '../sass/index.scss';

import $ from 'jquery'
import Request from './common/Request';

var loginBtnSelector = '#loginBtn';
var errorMsgSelector = '.error_msg';
var userNameSelector = '#userName';
var passwordSelector = '#password';

const VALIDATE_LIST = [{
  key: 'userName',
  reg: /^[\s]*$/,
  msg: '用户名不能为空'
}, {
  key: 'password',
  reg: /^[\s]*$/,
  msg: '密码不能为空'
}];

function doCheck(data) {
  let i = 0;
  const { length } = VALIDATE_LIST;
  for ( ; i<length; i++) {
    let validObj = VALIDATE_LIST[i];
    if (new RegExp(validObj.reg).test(data[validObj.key])) {
      showErrorMsg(validObj.msg);
      return false;
    }
  }
  return true;
}

function showErrorMsg(msg) {
  $(errorMsgSelector).html(msg);
}


function getFormData() {
  var userName = $(userNameSelector).val();
  var password = $(passwordSelector).val();
  return {
    userName: userName,
    password: password
  }
}

function init() {
  $('#loginBtn').bind('click', () => {
    let formData = getFormData();
    if (true === doCheck(formData)) {
      showErrorMsg('');
      Request.doLogin(formData, (jsonData) => {
        window.location.href = 'park-info/index.html';
      }, (errMsg) => {
        alert(`登录错误：${errMsg}`);
      })
    }
  });
}

init();
