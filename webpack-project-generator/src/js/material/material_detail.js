import '../../sass/index.scss';

import Request, {
  BASE_PATH
} from '../common/Request';
import $ from 'jquery';
import { getUrlParam, getFileTypeByName } from '../common/util';
import '../../components/menubar/menubar.js';
import '../../components/header/header.js';
import dialog from '../../components/dialog/dialog';

let materialId = getUrlParam('materialId');

if(!materialId) {
  alert('参数错误');
} else {
  initPage();
}

function initPage() {
  Request.getMaterialDetail({
    materialId: materialId
  }, renderPage, (errMsg) => {
    alert(errMsg);
  })
  bindBtnHandler();
}

function bindBtnHandler() {
  $('#deleteMaterialBtn').on('click', function() {
    dialog.show('删除', '您确定要删除么？').once('ok', function() {
      Request.deleteMaterial({
        materialId: materialId,
      }, (jsonData) => {
        dialog.hide();
        // 删除成功，返回上一级页面
        history.go(-1);
      }, (errMsg) => {
        alert(`删除失败:${errMsg}`)
      });
    });
  });
  $('.accessory_wrap').on('click', '.accessory_row', function() {
    let id = $(this).data('accessory-id')
    Request.downloadAccessory({
      id: id,
      mainType: 1,
      mainId: materialId
    });
  });
}

function renderPage(data) {
  $('#title').val(data.title);
  $('#content').val(data.content);
  renderAccessoryList(data.accessoryList);
}

function renderAccessoryList(list) {
  if(!list || list.length < 1) {
    return;
  }
  let htmlStr = list.map( (info, index) => {
    let downloadQueryStr = $.param({
      id: info.accessoryId,
      mainType: 1,
      mainId: materialId
    });
    return `<div class="accessory_row" data-accessory-id="${info.accessoryId}"><a target="_blank" href="${BASE_PATH}download?${downloadQueryStr}"><i class="${'file_' + getFileTypeByName(info.name)}"></i><span>${info.name}</span></a></div>`
  }).join('');
  $('.accessory_wrap').html(htmlStr);
}
