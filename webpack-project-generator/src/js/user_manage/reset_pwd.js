import '../../sass/index.scss';

import Request from '../common/Request';
import $ from 'jquery';
import '../../components/menubar/menubar.js';
import '../../components/header/header.js';

const TIPS_PWD_NOT_LEGAL = '密码长度应在5-12之间';
const TIPS_PWD_SHOULD_DIFF = '新旧密码不能一样';
const TIPS_CONFIRM_PWD_ERROR = '两次密码不一致'

// @TODO 代码重构....没时间改，先这么写

/**
 * 判断密码是否正确
 * @param  {String}  pwdStr 密码字符串
 * @return {Boolean}        是否正确
 */
function isPwdLegal(pwdStr) {
  var pwdReg = /^[a-zA-Z0-9!@#$%^&*]{5,12}$/;
  return pwdReg.test(pwdStr);
}

/**
 * 显示错误提示信息
 * @param  {HtmlElement || input selector} inputElem input元素
 * @param  {String} text      需要展示的信息
 * @return {}
 */
function showTips(inputElem, text) {
  $(inputElem).parent().find('.error_tips').html(text).show();
}
/**
 * 隐藏错误提示信息
 * @param  {HtmlElement || input selector} inputElem input元素
 * @return {}
 */
function hideTips(inputElem) {
  $(inputElem).parent().find('.error_tips').hide();
}

function initHandler() {
  $('#oldPassword').on('blur', function() {
    var value = $(this).val();
    if(!isPwdLegal(value)) {
      showTips(this, TIPS_PWD_NOT_LEGAL);
    }
  });

  $('#oldPassword, #newPassword, #confirmPassword').on('focus', function() {
    hideTips(this);
  });

  $('#newPassword').on('blur', function() {
    var oldPassword = $('#oldPassword').val();
    var newPassword = $(this).val();
    if(!isPwdLegal(newPassword)) {
      showTips(this, TIPS_PWD_NOT_LEGAL);
      return;
    }
    if(newPassword === oldPassword) {
      showTips(this, TIPS_PWD_SHOULD_DIFF);
    }
  });
  $('#confirmPassword').on('blur', function() {
    var newPassword = $('#newPassword').val();
    var confirmPassword = $(this).val();
    if(!isPwdLegal(confirmPassword)) {
      showTips(this, TIPS_PWD_NOT_LEGAL);
      return;
    }
    if(confirmPassword !== newPassword) {
      showTips(this, TIPS_CONFIRM_PWD_ERROR);//
    }
  });
  $('#submitBtn').on('click', function() {
    if(checkForm()) {
      // 可以提交
      Request.changePwd({
        newPassword: getNewPwd(),
        oldPassword: getOldPwd()
      }, (jsonData) => {
        alert('修改成功');
        resetForm();
      }, (errMsg) => {
        alert(`修改密码失败: ${errMsg}`);
      })
    }
  });
}

function getNewPwd() {
  return $('#newPassword').val();
}

function getOldPwd() {
  return $('#oldPassword').val();
}

function getConfirmPwd() {
  return $('#confirmPassword').val();
}

function resetForm() {
  $('#oldPassword').val('');
  $('#newPassword').val('');
  $('#confirmPassword').val('');
}

function checkForm() {
  var newPassword = getNewPwd();
  var oldPassword = getOldPwd();
  var confirmPassword = getConfirmPwd();
  if(!isPwdLegal(oldPassword)) {
    showTips('#oldPassword', TIPS_PWD_NOT_LEGAL);
    return false;
  }
  if(!isPwdLegal(newPassword)) {
    showTips('#newPassword', TIPS_PWD_NOT_LEGAL);
    return false;
  }
  if(!isPwdLegal(confirmPassword)) {
    showTips('#confirmPassword', TIPS_PWD_NOT_LEGAL);
    return false;
  }
  if(newPassword === oldPassword) {
    showTips('#oldPassword', TIPS_PWD_SHOULD_DIFF);
    return false;
  }
  if(oldPassword === confirmPassword) {
    showTips('#confirmPassword', TIPS_CONFIRM_PWD_ERROR);
    return false;
  }
  return true;
}


function initPage() {
  initHandler();
}

initPage();
