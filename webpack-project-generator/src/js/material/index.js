import '../../sass/index.scss';

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
function requestMaterialList(requestData={}) {
  if (!requestData.curPage) {
    requestData.curPage = 1;
  }
  if (!requestData.pageSize) {
    requestData.pageSize = 10;
  }
  Request.getMaterialList(requestData, (respData) => {
    lastRequestData = requestData;
    tableInstance.resetData(respData);
  }, (errMsg) => {
    alert(errMsg);
  })
}

// 列表展示顺序，标题名
// 如果有renderFunc，可以自定义显示内容，必须返回字符串。
var kTitleList = [{
  key: "provinceName",
  title:  "省份"
}, {
  key: "cityName",
  title:  "城市"
}, {
  key: "areaName",
  title:  "区县"
}, {
  key: "schoolName",
  title: "幼儿园名称"
}, {
  key: "createUser",
  title:  "上报人"
}, {
  key: "title",
  title:  "标题",
  renderFunc: function(info) {
    return `<a class="link_blue" href="material_detail.html?materialId=${info.materialId}">${info.title}</a>`;
  }
}, {
  key: "accessoryAmount",
  title: "附件个数"
}, {
  key: "createtime",
  title: "上报时间"
}, {
  key: "opration",
  title:  "操作",
  renderFunc: function(info) {
    return `<span data-material-id="${info.materialId}" class=" btn btn-small delete-btn ${info.opPermitted ? 'btn-disabled' : 'btn-red'}">删除</span>`;
  }
}];


let tableInstance;
function initPage() {
  requestAreaData();
  initRegionSelectHandler();
  initDatePicker();
  requestMaterialList();
  bindHandler();
  if(typeof tableInstance === 'undefined') {
    initTable();
  }
}
function initDatePicker() {
  $('#startDate').datepicker(datepickerOpt);
  $('#endDate').datepicker(datepickerOpt);
}


function bindHandler() {
  $('#filterBtn').on('click', function(e) {
    let filterData = {};
    $('.filter_options_row').find('input, select').each( function(index, elem) {
      var name = $(elem).attr('name');
      var value = $(elem).val();
      if (value) {
        filterData[name] = value;
      }
    });
    requestMaterialList(filterData);
  });
  $('.content_wrap').on('click', '.delete-btn', function(e) {
    var _self = this;
    let materialId = $(this).data('material-id');
    dialog.show('删除', '您确定要删除么？').once('ok', function() {
      Request.deleteMaterial({
        materialId: materialId,
      }, (jsonData) => {
        dialog.hide();
        // 删除成功，删除该条信息
        $(_self).parents('.table_row').remove();
      }, (errMsg) => {
        alert(`删除失败:${errMsg}`)
      });
    });
  });
}

function initTable() {
  tableInstance = new Table({}, {
    kTitleList: kTitleList,
    switchPageFunc: (pageNum) => {
      console.log(pageNum)
      // @TODO 防止多次请求
      requestMaterialList($.extend({}, lastRequestData, {
        curPage: pageNum
      }));
    }
  });
}


initPage();





// 省市区三级联动相关
let regionList = [];
let curCityList = [];
function initRegionSelectHandler() {
  $('#provinceSelect').on('change', function() {
    var provinceCode = $(this).val();
    var cityList = getChildrenByCode(provinceCode, regionList);
    curCityList = cityList;
    initRegionElem('#citySelect', cityList, '全市');
  });
  $('#citySelect').on('change', function() {
    var cityCode = $(this).val();
    var areaList = getChildrenByCode(cityCode, curCityList);
    initRegionElem('#areaSelect', areaList, '全区');
  });
}

/**
 * 初始化地区组件
 * @return {}
 */
function initRegionElem(containerSelector, list, defaultOptionName) {
  var optionStr = '';//`<option disabled>${defaultOptionName}</option>`;
  if (list.length > 0) {
    optionStr = list.map( (info, index) => {
      let checkStr = '';
      if (index === 1) {
        checkStr = 'checked="checked"';
        // 默认选中
      }
      return `<option ${checkStr} value="${info.code}">${info.name}</option>`;
    }).join('');
    // 触发选中状态，联动
  }
  if (list.length > 1 || list.length  === 0) {
    optionStr = `<option value="">${defaultOptionName}</option>${optionStr}`
  }
  $(containerSelector).html(optionStr);
  setTimeout(() => {
    $(containerSelector).trigger('change');
  }, 0)
}

/**
 * 获取省市区数据
 */
function requestAreaData() {
  // 查询用户可操作的省市区选项
  Request.getUserPrivilege((data) => {
    console.log(data);
    regionList = data.list;
    initRegionElem('#provinceSelect', regionList, '全省');
    // @TODO 省市区三级联动数据
  }, (errMsg) => {
    alert(errMsg);
  });
}


function getChildrenByCode(code, list) {
  var areaList = [];
  let length = list.length;
  if(length > 0) {
    let i=0;
    for( ; i<length; i++) {
      if(list[i].code == code) {
        areaList = list[i].children;
        break;
      }
    }
  }
  return areaList;
}
