import '../../sass/index.scss'
import 'jquery-ui/themes/base/theme.css';
import 'jquery-ui/themes/base/datepicker.css'

import Request from '../common/Request';
import $ from 'jquery';
import Table from '../../components/table/table';
import dialog from '../../components/dialog/dialog';
import 'jquery-ui/ui/widgets/datepicker';
import '../../components/menubar/menubar.js';
import '../../components/header/header.js';
import { datepickerOpt } from '../common/util';
let lastRequestData = {};
/**
 * 获取园所信息
 * @param  {Object} requestData 需要传递的值
 * @return {[type]}      [description]
 */
function requestNoticeList(requestData={}) {
  if (!requestData.curPage) {
    requestData.curPage = 1;
  }
  if (!requestData.pageSize) {
    requestData.pageSize = 10;
  }
  Request.getNoticeList(requestData, (respData) => {
    lastRequestData = requestData;
    tableInstance.resetData(respData);
  }, (errMsg) => {
    alert(errMsg);
  })
}

// 列表展示顺序，标题名
// 如果有renderFunc，可以自定义显示内容，必须返回字符串。
var kTitleList = [{
  key: "createTime",
  title:  "发布日期"
}, {
  key: "userName",
  title:  "发布人"
}, {
  key: "title",
  title:  "标题",
  renderFunc: function(info) {
    return `<a class="link_blue" href="notice_detail.html?noticeId=${info.noticeId}">${info.title}</a>`;
  }
}, {
  key: "receiveNum",
  title: "接收人数"
}, {
  key: "readNum",
  title:  "已读人数"
}, {
  key: "unreadNum",
  title:  "未读人数"
}, {
  key: "opration",
  title:  "操作",
  renderFunc: function(info) {
    console.log(info);
    return `<span data-notice-id="${info.noticeId}" class="btn remind ${info.opPermitted ? 'btn-disabled' : 'btn-oringe'}">再次提醒</span>
      <span data-notice-id="${info.noticeId}" class=" btn btn-small delete ${info.opPermitted ? 'btn-disabled' : 'btn-red'}">删除</span>`;
  }
}];


let tableInstance;

function initPage() {
  requestNoticeList();
  bindFilterHandler();
  if(typeof tableInstance === 'undefined') {
    initTable();
  }
  $( "#createTime" ).datepicker(datepickerOpt);
  $( "#endTime" ).datepicker(datepickerOpt);
}

function bindFilterHandler() {
  $('#filterBtn').on('click', function(e) {
    console.log($('.filter_options_row').find('input'))
    var filterData = {};
    // @TODO 查询搜索
    $('.filter_options_row').find('input').each( function(index, elem) {
      var id = $(elem).attr('id');
      var value = $(elem).val();
      if(value) {
        filterData[id] = value;
      }
    } );
    requestNoticeList(filterData);
  });
  $('#content').on('click', '.btn', function() {
    let $self = $(this);
    let noticeId = $self.data('notice-id')
    if($self.hasClass('delete') && !$self.hasClass('btn-disabled')) {
      dialog.show('删除', '您确定要删除么？').once('ok', function() {
        // 删除操作
        deleteNotice(noticeId, $self);
      });
    } else if($self.hasClass('remind') && !$self.hasClass('btn-disabled')) {
      // 提醒操作
      remindNotice(noticeId, $self);
    }
  });
}

function deleteNotice(noticeId, $btnElem) {
  Request.deleteNotice({
    noticeId: noticeId
  }, (jsonData) => {
    $btnElem.parents('.table_row').remove();
    dialog.hide();
  }, (errMsg) => {
    alert(`删除通知失败:${errMsg}`);
  });
}
function remindNotice(noticeId, $self) {
  Request.remindAgain({
    noticeId: noticeId
  }, (jsonData) => {
    alert('已成功提醒');
    // @TODO 应该置灰，规则？？
  }, (errMsg) => {
    alert(`提醒失败:${errMsg}`);
  })
}


function initTable() {
  tableInstance = new Table({}, {
    kTitleList: kTitleList,
    switchPageFunc: (pageNum) => {
      requestNoticeList($.extend({}, lastRequestData, {
        curPage: pageNum
      }));
    }
  });
}




initPage();
