import $ from 'jquery';
import Request from '../../js/common/Request';
import { getCookie } from '../../js/common/util';
// 从cookie中获取用户名，登录状态
var CUR_USER_ID = getCookie('CUR_USER_ID');
var CUR_USER_NAME = getCookie('CUR_USER_NAME');
if (!CUR_USER_NAME || !CUR_USER_ID) {
  // 跳转到登录页面
  redirectToLogin();
}

$('.user_info_name').html(CUR_USER_NAME);

$('.logout').on('click', function() {
  Request.logout();
  setTimeout(redirectToLogin, 300);
});

function redirectToLogin() {
  window.location.href = '../login.html';
}
