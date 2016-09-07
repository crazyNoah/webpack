import '../../sass/index.scss';

import Request, {
  BASE_PATH
} from '../common/Request';
import $ from 'jquery';
import { getUrlParam, getFileTypeByName } from '../common/util';

import '../../components/menubar/menubar.js';
import '../../components/header/header.js';
import dialog from '../../components/dialog/dialog';
let noticeId = getUrlParam('noticeId');

if(!noticeId) {
  alert('参数错误');
} else {
  initPage();
}

function initPage() {
  Request.getNoticeDetail({
    noticeId: noticeId
  }, renderPage, (errMsg) => {
    alert(errMsg);
  })
  bindBtnHandler();
}

function bindBtnHandler() {
  bindDeleteHandler();
  bindRemindHandler();
  // bindDownLoadHandler();
}

function bindDeleteHandler() {
  // 删除按钮
  $('#deleteNoticeBtn').on('click', function() {
    if($(this).hasClass('btn-disabled')) {
      return;
    }
    dialog.show('删除', '您确定要删除么？').once('ok', function() {
      Request.deleteNotice({
        noticeId: noticeId,
      }, (jsonData) => {
        dialog.hide();
        // 删除成功，返回上一级页面
        history.go(-1);
      }, (errMsg) => {
        alert(`删除失败:${errMsg}`)
      });
    });
  });
}

function bindRemindHandler() {
  $('.range_wrap').on('click', '#remindBtn', function() {
    if ($(this).hasClass('btn-disabled')) {
      return;
    }
    Request.remindAgain({
      noticeId: noticeId
    }, (jsonData) => {
      alert('已成功提醒');
      // @TODO 暂时不做处理
    }, (errMsg) => {
      alert(`再次提醒失败: ${errMsg}`);
    })
  });
}


function renderPage(data) {
  $('#title').val(data.title);
  $('#content').val(data.content);
  if (!data.opPermitted) {
    $('#deleteNoticeBtn').addClass('btn-disabled').off('click');
  }
  renderAccessoryList(data.accessoryList);
  renderRangeAndCount(data);
}
function renderRangeAndCount(data) {
  let htmlStr = `<span><input type="radio" checked="checked" disabled/>${data.range}</span>
        <span>（接收人数: ${data.receiveNum}人&nbsp;&nbsp;&nbsp;已读人数: ${data.readNum}人&nbsp;&nbsp;&nbsp;未读人数: ${data.unreadNum}人）</span>
        <span class="btn ${data.opPermitted ? 'btn-oringe' : 'btn-disabled'}" id="remindBtn">再次提醒</span>`;
  $('.range_wrap').html(htmlStr);
}

function renderAccessoryList(list) {
  if(!list || list.length < 1) {
    return;
  }
  let htmlStr = list.map( (info, index) => {
    let downloadQueryStr = $.param({
      id: info.accessoryId,
      mainType: 2,
      mainId: noticeId
    });
    return `<div class="accessory_row" data-accessory-id="${info.accessoryId}"><a target="_blank" href="${BASE_PATH}download?${downloadQueryStr}"><i class="${'file_' + getFileTypeByName(info.name)}"></i><span>${info.name}</span></a></div>`
  }).join('');
  $('.accessory_wrap').html(htmlStr);
}
