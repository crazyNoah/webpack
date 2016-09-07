import '../../sass/index.scss'

import Request from '../common/Request';
import $ from 'jquery';
import Table from '../../components/table/table';
import '../../components/menubar/menubar.js';
import '../../components/header/header.js';

var regionList = [];
// 缓存当前选中的省份信息及其子集
var curCityList = [];
let lastRequestData = {};

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

/**
 * 获取园所信息
 * @param  {Object} requestData 需要传递的值
 * @return {[type]}      [description]
 */
function requestSchoolList(requestData={}) {
  if (!requestData.curPage) {
    requestData.curPage = 1;
  }
  if (!requestData.pageSize) {
    requestData.pageSize = 10;
  }
  Request.getSchoolList(requestData, (respData) => {
    lastRequestData = requestData;
    tableInstance.resetData(respData);
  }, (errMsg) => {
    alert(errMsg);
  })
}

var kTitleList = [{
  key: "schoolName",
  title:  "幼儿园名称"
}, {
  key: "schoolNature",
  title:  "园所性质"
}, {
  key: "leaderName",
  title:  "园长姓名"
}, {
  key: "mobile",
  title:  "联系电话"
}, {
  key: "teacherNum",
  title:  "教师人数"
}, {
  key: "teacherRate",
  title:  "教师使用率"
}, {
  key: "studentNum",
  title:  "学生人数"
}, {
  key: "familyRate",
  title:  "家长使用率"
}];


let tableInstance;
function initPage() {
  requestAreaData();
  requestSchoolList();
  initHandlers();
  if(typeof tableInstance === 'undefined') {
    initTable();
  }
}

function initHandlers() {
  initFilterHandler();
  initRegionSelectHandler();
}
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
      if (list.length === 1) {
        checkStr = 'checked="checked"'
      }
      return `<option ${checkStr} value="${info.code}">${info.name}</option>`;
    }).join('');
  }
  if (list.length > 1 || list.length === 0) {
    optionStr = `<option value="" checked="checked">${defaultOptionName}</option>${optionStr}`;
  }
  $(containerSelector).html(optionStr);
  setTimeout(() => {
    $(containerSelector).trigger('change');
  }, 0)
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

function getFilterData() {
  var filterKeys = [
    'provinceSelect',
    'citySelect',
    'areaSelect',
    'schoolName',
    'schoolNature',
    'mobile',
    'leaderName'
  ];
  var filterData = {};
  for( let i=0; i<filterKeys.length; i++) {
    let key = filterKeys[i];
    let value = $(`#${key}`).val();
    if(value) {
      filterData[key] = value;
    }
  }
  return filterData;
}

function initFilterHandler() {
  $('#filterBtn').on('click', function(e) {
    var filterData = getFilterData();
    requestSchoolList(filterData);
  });
}

function initTable() {
  tableInstance = new Table({}, {
    kTitleList: kTitleList,
    switchPageFunc: (pageNum) => {
      console.log(pageNum)
      // @TODO 防止多次请求
      requestSchoolList($.extend({}, lastRequestData, {
        curPage: pageNum
      }));
    }
  });
}

initPage();
