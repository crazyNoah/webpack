import '../../sass/index.scss'

import Request from '../common/Request';
import $ from 'jquery';
import { getFileTypeByName } from '../common/util';
import WebUploader from  'webuploader';
import '../../components/menubar/menubar.js';
import '../../components/header/header.js';
// 全局的上传组件
// 具体使用方法参考http://fex.baidu.com/webuploader/doc/index.html#WebUploader_Uploader_upload
let uploader;
function initPage() {
  initWebUploader();
  initHandler();
}

function initWebUploader() {
  uploader = WebUploader.create({
    pick: {
      id: '#uploadFile'
    },
    method: 'POST',
    server: '/gov-admin/v1/uploadFile',
    fileNumLimit: 10,
    fileSingleSizeLimit: 10 * 1024 * 1024
  });
  uploader.on('fileQueued', function(file) {
    console.log(file)
    addAccessoryElem(file);
    uploader.upload(file);
  });
  uploader.on('uploadError', function(file, reason) {
    var rowElem = getAccessoryRow(file.id);
    if (rowElem.length < 1) {
      return;
    }
    rowElem.find('.progress').html('');
    rowElem.find('.tips').html(`上传失败: ${reason}`);
  });
  uploader.on('uploadProgress', function(file, percentage) {
    var rowElem = getAccessoryRow(file.id);
    setRowProgress(rowElem, `正在上传:${percentage}%`)
  });
  uploader.on('uploadSuccess', function(file, response) {
    var rowElem = getAccessoryRow(file.id);
    let tipStr = '上传成功';
    const { code, message, data } = response;
    const { id, name } = data;
    if(code !== 0) {
      tipStr = `上传失败: ${message}`;
    } else {
      // 将accessoryId 赋值给file，在提交时取出
      file.accessoryId = id;
    }
    setRowTips(rowElem, tipStr);
    setRowProgress(rowElem, '');
  });
}

function setRowTips($elem, tipString) {
  if($elem.length < 1) {
    return;
  }
  $elem.find('.tips').html(tipString);
}

function setRowProgress($elem, str) {
  if($elem.length < 1) {
    return;
  }
  $elem.find('.progress').html(str);
}

/**
 * 通过file id获取对应的附件元素
 * @param  {String} fileId 附件id
 * @return {jQuery Object}        返回jQuery对象
 */
function getAccessoryRow(fileId) {
  return $(`.accessory_row[data-file-id=${fileId}]`);
}


function addAccessoryElem(file) {
  $('#accessoryList').append(`
    <div class="accessory_row" data-file-id=${file.id}>
      <i class="file_${getFileTypeByName(file.name)}"></i>
      <span>${file.name}</span>
      <span class=" delete-file">删除</span>
      <span class="progress"></span><span class="tips"></span></div>`);
}

function initHandler() {
  $('#accessoryList').on('click', '.delete-file', function() {
    var fileId = $(this).parent().data('file-id');
    uploader.removeFile(fileId)
    $(this).parent().remove();
  });
  $('#submitBtn').on('click', function(e) {
    submit();
  });
}
function checkData(data) {
  const { title, context, accessoryList, range } = data;
  var fileLength  = accessoryList.length;
  if(title.length < 1) {
    alert('请填写标题');
    return false;
  }
  if(title.length > 200) {
    alert('标题过长');
    return false;
  }
  if(context.length > 1500) {
    alert('内容过长');
    return false;
  }
  if(fileLength > 10) {
    alert('附件个数不能超过10');
    return false;
  }
  return true;
}

function submit() {
  var formData = getFormData();
  if(!checkData(formData)) {
    return;
  }
  // @TODO 提交
  Request.addNotice(formData, (jsonData) => {
    alert('发布通知成功');
    history.go(-1);
  }, (errMsg) => {
    alert(`发布通知失败${errMsg}`);
  })
}

function getFormData() {
  var title = $('#title').val();
  var context = $('#context').val();
  var range = $('[name="range"]:checked').val();
  let accessoryList = [];
  var completeFiles = uploader.getFiles('complete');
  if (completeFiles.length > 0) {
    accessoryList = completeFiles.map( (file, index) => {
      return file.accessoryId;
    });
  }
  return {
    title: title,
    context: context,
    range: range,
    accessoryList: accessoryList
  }
  // formData.title = title;
  // formData.context = context;
  // formData.range = range;
  // return formData;
}
initPage();
