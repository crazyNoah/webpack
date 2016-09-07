import $ from 'jquery';


/**
 * 渲染完整的表和分页元素
 * @param  {Object} data       依赖的数据
 * @param  {List} kTitleList 需要显示那些内容传递key、title、renderFunc
 * @return {}
 */
function renderFullTable(data, kTitleList) {
  if(!data.list) {
    return;
  }
  let headerStr = getListHeaderStr(kTitleList);
  let contentStr = getListContentStr(data.list, kTitleList);
  let tableStr = `<div class="table_wrap">${headerStr}${contentStr}</div>`;
  $('#content').append(tableStr);

  var paginationStr = getPaginationStr(data);
  $('#content').append(paginationStr);
}
function getListHeaderStr(kTitleList) {
  var headerStr = kTitleList.map( (obj, index) => {
    return `<div class="${obj.key} table_cell">${obj.title}</div>`;
  }).join('');
  return `<div class="table_head"><div class="table_row">${headerStr}</div></div>`;
}

/**
 * 根据list获取table body 内容
 * @param  {List} list       传递的List数据
 * @param  {List} kTitleList 同renderFullTable
 * @return {String}            table body字符串
 */
function getListContentStr(list, kTitleList) {
  var contentStr = list.map( (info, index) => {
    var rowStr = kTitleList.map( (obj) => {
      let itemStr = info[obj.key];
      if (typeof obj.renderFunc === 'function') {
        itemStr = obj.renderFunc(info, obj);
      }
      return `<div class="table_cell">${itemStr}</div>`;
    }).join('');
    return `<div class="table_row">${rowStr}</div>`;
  }).join('');
  return `<div class="table_body">${contentStr}</div>`;
}

/**
 * 根据分页配置获取分页内容字符串
 * @param  {Object} pageOpts 分页的配置
 * @return {String}          分页内容字符串
 */
function getPaginationStr(pageOpts) {
  if (pageOpts.count < 1) {
    return '';
  }
  var prevBtn = '<span class="prev_btn">prev</span>';
  var nextBtn = '<span class="next_btn">next</span>'
  var paginationStr = '';
  // 首页
  let firstPage = '<span class="direct_page" data-page-num=1>首页</span>'
  let lastPage = `<span class="direct_page" data-page-num=${pageOpts.pageCount}>尾页</span>`
  let i = 1;
  // 分页显示当前页前五，后五序号，其他不显示
  if (pageOpts.curPage > 6) {
    i = pageOpts.curPage - 5;
  }
  var maxCount = (pageOpts.curPage+6 > pageOpts.pageCount) ? pageOpts.pageCount+1 : pageOpts.curPage+6
  for ( ; i<maxCount; i++) {
     paginationStr += `<span data-page-num=${i} ${pageOpts.curPage===i ? 'class="cur"' : ''}>${i}</span>`;
  }
  return `<div class="pagination_wrap">${firstPage}${prevBtn}${paginationStr}${nextBtn}${lastPage}</div>`
}

// @TODO 该项目中只有一个实例即可
function Table(data, opts) {
  this.opts = opts;
  if ($('table_wrap').length < 1 && data) {
    renderFullTable(data, opts.kTitleList);
    if(data.curPage) {
      this.curPage = data.curPage;
      this.pageCount = data.pageCount;
    }
  } else {
    console.error('已经有一个table实例了');
  }
};

/**
 * 重置数据，并根据数据刷新表的显示
 * @param  {Object} data 新数据
 * @return {}
 */
Table.prototype.resetData = function(data) {
  if ($('.table_wrap').length < 1) {
    renderFullTable(data, this.opts.kTitleList);
    this.curPage = data.curPage;
    this.pageCount = data.pageCount;
    this.bindListener();
    return;
  }
  $('.table_body').remove();
  $('.table_wrap').append(getListContentStr(data.list, this.opts.kTitleList));
  $('.pagination_wrap').html(getPaginationStr(data));
}

/**
 * 绑定分页按钮的监听事件
 * @return {}
 */
Table.prototype.bindListener = function() {
  var _self = this;
  let { switchPageFunc } = this.opts;
  $('.pagination_wrap').on('click', 'span', (e) => {

    var target = e.target || e.srcElement;
    var pageNum = $(target).data('page-num');
    if($(target).hasClass('prev_btn')) {
      if(_self.curPage === 1) {
        return;
      }
      pageNum = _self.curPage - 1;
    } else if($(target).hasClass('next_btn')) {
      if(_self.curPage === _self.pageCount) {
        return;
      }
      pageNum = _self.curPage + 1;
    }
    // 回调传出当时点击需要出发的索引值
    switchPageFunc(pageNum);
  });
};

export default Table;
