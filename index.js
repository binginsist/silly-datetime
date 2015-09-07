(function(root, factory) {
  'use strict';
  /* istanbul ignore else  */
  if (typeof exports === 'object') {
    // CommonJS
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define(function() {
      return factory();
    });
  } else if (typeof define === 'function' && define.cmd) {
    // CMD
    define(function(require, exports, module) {
      module.exports = factory();
    });
  } else {
    // Global Variables
    root.ResizeImage = factory();
  }
})(this, function () {
  'use strict';

  var out = {};

  /**
   * 将输入的任意对象转换成 Date，如果装换失败将返回当前时间
   * @param  {any} datetime 需要被格式化的时间
   * @return {Date}         转换好的 Date
   */
  function getDateObject(datetime) {
    var t = datetime instanceof Date ? datetime : new Date(datetime);
    if (!t.getDate()) {
      t = new Date();
    }
    return t;
  }

  /**
   * 格式化时间
   * @param  {Date}   datetime 需要被格式化的时间
   * @param  {string} format   格式化字符串，默认为 'YYYY-MM-DD HH:mm:ss'
   * @return {string}          格式化后的时间字符串
   */
  out.format = function (datetime, format) {
    var t = getDateObject(datetime);
    var hours, o, i = 0;
    format = format || 'YYYY-MM-DD HH:mm:ss';
    hours = t.getHours();
    o = [
      ['M+', t.getMonth() + 1],
      ['D+', t.getDate()],
      // H 24小时制
      ['H+', hours],
      // h 12小时制
      ['h+', hours > 12 ? hours - 12 : hours],
      ['m+', t.getMinutes()],
      ['s+', t.getSeconds()],
    ];
    // 替换 Y
    if (/(Y+)/.test(format)) {
      format = format.replace(RegExp.$1, (t.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    // 替换 M, D, H, h, m, s
    for (; i < o.length; i++) {
      if (new RegExp('(' + o[i][0] + ')').test(format)) {
        format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[i][1] : ('00' + o[i][1]).substr(('' + o[i][1]).length));
      }
    }
    // 替换 a/A 为 am, pm
    return format.replace(/a/ig, hours > 11 ? 'pm' : 'am');
  };



  /**
   * CONST and VAR for .fromNow
   */
  // 预设语言：英语
  var LOCALE_EN = {
    future: 'in %s',
    past: '%s ago',
    s: 'a few seconds',
    mm: '%s minutes',
    hh: '%s hours',
    dd: '%s days',
    MM: '%s months',
    yy: '%s years'
  };
  // 预设语言：简体中文
  var LOCALE_ZH_CN = {
    future: '%s内',
    past: '%s前',
    s: '几秒',
    mm: '%s分钟',
    hh: '%s小时',
    dd: '%s天',
    MM: '%s月',
    yy: '%s年'
  };
  // 当前本地化语言对象
  var _curentLocale = {};


  /**
   * 修改本地化语言
   * @param  {string|Object}   string: 预设语言 `zh-cn` 或 `en`；Object: 自定义 locate 对象
   * @return {Object}          this
   */
  out.locate = function (arg) {
    var newLocale, prop;
    if (typeof arg === 'string') {
      newLocale = arg === 'zh-cn' ? LOCALE_ZH_CN : LOCALE_EN;
    } else {
      newLocale = arg;
    }
    for (prop in newLocale) {
      if (newLocale.hasOwnProperty(prop) && typeof newLocale[prop] === 'string') {
        _curentLocale[prop] = newLocale[prop];
      }
    }
    return out;
  };
  // 初始化本地化语言为 en
  out.locate('');



  /**
   * CONST for .fromNow
   */
  // 各计算区间
  var DET_STD = [
    [ 'yy', 31536e6 ], // 1000 * 60 * 60 * 24 * 365 一年月按 365 天算
    [ 'MM', 2592e6 ],  // 1000 * 60 * 60 * 24 * 30 一个月按 30 天算
    [ 'dd', 864e5 ],   // 1000 * 60 * 60 * 24
    [ 'hh', 36e5 ],    // 1000 * 60 * 60
    [ 'mm', 6e4 ],     // 1000 * 60
    [ 's',  0 ],       // 只要大于等于 0 都是秒
  ];

  /**
   * 计算给出时间和当前时间的时间距离
   * @param  {Date}   datetime 需要计算的时间
   * @return {string}          时间距离
   */
  out.fromNow = function (datetime) {
    var det = +new Date() - (+getDateObject(datetime));
    var format, str, i = 0, detDef, detDefVal;
    if (det < 0) {
      format = _curentLocale.future;
      det = -det;
    } else {
      format = _curentLocale.past;
    }
    for (; i < DET_STD.length; i++) {
      detDef = DET_STD[i];
      detDefVal = detDef[1];
      if (det >= detDefVal) {
        str = _curentLocale[detDef[0]].replace('%s', parseInt(det/detDefVal, 0) || 1);
        break;
      }
    }
    return format.replace('%s', str);
  };

  return out;
});
