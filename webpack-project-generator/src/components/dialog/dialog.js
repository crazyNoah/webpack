import $ from 'jquery';

var dialog = {
  /**
   * 用来缓存需要相应的事件，格式如下：
   * {
   *
   *   'ok': [handlerFunc1, handlerFunc2],
   *   相应一次就销毁
   *   'ok_once': [handlerOnceFunc1, handlerONceFunc2]
   * }
   * @type {Object}
   */
  handlerMap: {},
  /**
   * 显示对话框，暂时只支持自定义title和content
   * 传入的title和content都需要经过decodeURIComponent
   * @TODO 需要可以自定义btns。每次重新渲染btns的时候，需要清除之前的绑定时间
   * @param  {String} title   对话框标题
   * @param  {String} content 对话框内容
   * @param  {Array} btns    对话框按钮组，暂时未
   * @return {[type]}         [description]
   */
  show: function(title, content, btns) {
    if (!this._wrapElem) {
      this.initWrapElem();
    }
    this._wrapElem.find('.dialog_title').html(decodeURIComponent(title));
    this._wrapElem.find('.dialog_content').html(decodeURIComponent(content));
    this._wrapElem.show();
    $(document.body).css('overflow', 'hidden');
    return this;
  },
  hide: function() {
    if (!this._wrapElem) {
      return;
    }
    $(document.body).css('overflow', 'auto');
    this._wrapElem.hide();
  },
  initWrapElem: function() {
    this._wrapElem = $(`
      <div class="dialog_wrap">
        <div class="dialog_inner_wrap">
          <div class="dialog_inner_content">
            <div class="dialog_title"><span class="close_dialog"><span></div>
            <div class="dialog_content"></div>
            <div class="dialog_btns">
              <div class="dialog_btn dialog_ok">确定</div>
              <div class="dialog_btn dialog_cancel">取消</div>
            </div>
          </div>
        </div>
        <div class="dialog_mask_layer"></div>
      </div>`);
    $(document.body).append(this._wrapElem);
    this.bindBtnHandler();
  },
  bindBtnHandler: function() {
    var _self = this;
    this._wrapElem.on('click', '.dialog_btn', function() {
      if ($(this).hasClass('dialog_ok')) {
        _self.fire('ok');
      } else if ($(this).hasClass('dialog_cancel')) {
        _self.hide();
        _self.fire('cancel');
      }
    });
  },
  fire: function(type) {
    var handlers = this.handlerMap[type];
    var onceHandlers = this.handlerMap[`${type}_once`];
    if (typeof type !== 'string') {
      return;
    }
    if (handlers && handlers.length > 0) {
      this.executeHandlers(handlers);
    }
    if (onceHandlers && onceHandlers.length > 0) {
      this.executeHandlers(onceHandlers);
      // once的事件执行完后销毁
      this.handlerMap[`${type}_once`] = [];
    }
  },
  executeHandlers: function(handlers) {
    handlers.map( (handler, index) => {
      if (typeof handler === 'function') {
        handler();
      }
    });
  },
  on: function(type, handler) {
    if (typeof type !== 'string' || type .length < 1) {
      return ;
    }
    var handlers = this.handlerMap[type] || [];
    handlers.push(handler);
    this.handlerMap[type] = handlers;
  },
  once: function(type, handler) {
    if (typeof type !== 'string' || type .length < 1) {
      return ;
    }
    var handlers = this.handlerMap[`${type}_once`] || [];
    handlers.push(handler);
    this.handlerMap[`${type}_once`] = handlers;
  },
  off: function(type) {
    // 清空注册事件
    this.handlerMap[type] = [];
    this.handlerMap[`${type}_once`] = [];
  }
}

export default dialog;
