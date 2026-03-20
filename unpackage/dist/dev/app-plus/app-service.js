if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global = uni.requireGlobal();
  ArrayBuffer = global.ArrayBuffer;
  Int8Array = global.Int8Array;
  Uint8Array = global.Uint8Array;
  Uint8ClampedArray = global.Uint8ClampedArray;
  Int16Array = global.Int16Array;
  Uint16Array = global.Uint16Array;
  Int32Array = global.Int32Array;
  Uint32Array = global.Uint32Array;
  Float32Array = global.Float32Array;
  Float64Array = global.Float64Array;
  BigInt64Array = global.BigInt64Array;
  BigUint64Array = global.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  var _a, _b;
  const ON_SHOW = "onShow";
  const ON_LOAD = "onLoad";
  const ON_UNLOAD = "onUnload";
  function requireNativePlugin(name) {
    return weex.requireModule(name);
  }
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  function resolveEasycom(component, easycom) {
    return typeof component === "string" ? easycom : component;
  }
  const createLifeCycleHook = (lifecycle, flag2 = 0) => (hook, target = vue.getCurrentInstance()) => {
    !vue.isInSSRComponentSetup && vue.injectHook(lifecycle, hook, target);
  };
  const onShow = /* @__PURE__ */ createLifeCycleHook(
    ON_SHOW,
    1 | 2
    /* HookFlags.PAGE */
  );
  const onLoad = /* @__PURE__ */ createLifeCycleHook(
    ON_LOAD,
    2
    /* HookFlags.PAGE */
  );
  const onUnload = /* @__PURE__ */ createLifeCycleHook(
    ON_UNLOAD,
    2
    /* HookFlags.PAGE */
  );
  function queryParams(data = {}, isPrefix = true, arrayFormat = "brackets") {
    const prefix = isPrefix ? "?" : "";
    const _result = [];
    if (!["indices", "brackets", "repeat", "comma"].includes(arrayFormat))
      arrayFormat = "brackets";
    for (const key in data) {
      const value = data[key];
      if (["", void 0, null].includes(value)) {
        continue;
      }
      if (Array.isArray(value)) {
        switch (arrayFormat) {
          case "indices":
            for (let i = 0; i < value.length; i++) {
              _result.push(`${key}[${i}]=${value[i]}`);
            }
            break;
          case "brackets":
            value.forEach((_value) => {
              _result.push(`${key}[]=${_value}`);
            });
            break;
          case "repeat":
            value.forEach((_value) => {
              _result.push(`${key}=${_value}`);
            });
            break;
          case "comma":
            let commaStr = "";
            value.forEach((_value) => {
              commaStr += (commaStr ? "," : "") + _value;
            });
            _result.push(`${key}=${commaStr}`);
            break;
          default:
            value.forEach((_value) => {
              _result.push(`${key}[]=${_value}`);
            });
        }
      } else {
        _result.push(`${key}=${value}`);
      }
    }
    return _result.length ? prefix + _result.join("&") : "";
  }
  class Router {
    // route: (options?: string | RouterConfig, params?: Record<string, any>) => Promise<void>;
    constructor() {
      this.config = {
        type: "navigateTo",
        url: "",
        delta: 1,
        // navigateBack页面后退时,回退的层数
        params: {},
        // 传递的参数
        animationType: "pop-in",
        // 窗口动画,只在APP有效
        animationDuration: 300,
        // 窗口动画持续时间,单位毫秒,只在APP有效
        intercept: false
        // 是否需要拦截
      };
      this.route = this.route.bind(this);
    }
    // 判断url前面是否有"/"，如果没有则加上，否则无法跳转
    addRootPath(url2) {
      return url2[0] === "/" ? url2 : `/${url2}`;
    }
    // 整合路由参数
    mixinParam(url2, params) {
      url2 = url2 && this.addRootPath(url2);
      let query = "";
      if (/.*\/.*\?.*=.*/.test(url2)) {
        query = uni.$u.queryParams(params, false);
        return url2 + "&" + query;
      } else {
        query = uni.$u.queryParams(params);
        return url2 + query;
      }
    }
    /**
     * 路由跳转主方法
     * @param options 跳转配置或url字符串
     * @param params 跳转参数
     */
    async route(options = {}, params = {}) {
      let mergeConfig = {};
      if (typeof options === "string") {
        mergeConfig.url = this.mixinParam(options, params);
        mergeConfig.type = "navigateTo";
      } else {
        mergeConfig = uni.$u.deepMerge(this.config, options);
        mergeConfig.url = this.mixinParam(options.url || "", options.params || {});
      }
      if (params.intercept) {
        this.config.intercept = params.intercept;
      }
      mergeConfig.params = params;
      mergeConfig = uni.$u.deepMerge(this.config, mergeConfig);
      if (uni.$u.routeIntercept && typeof uni.$u.routeIntercept === "function") {
        const isNext = await new Promise((resolve) => {
          uni.$u.routeIntercept(mergeConfig, resolve);
        });
        isNext && this.openPage(mergeConfig);
      } else {
        this.openPage(mergeConfig);
      }
    }
    // 执行路由跳转
    openPage(config2) {
      const { url: url2 = "", type = "", delta = 1, animationDuration = 300 } = config2;
      if (type == "navigateTo" || type == "to") {
        uni.navigateTo({ url: url2, animationDuration });
      }
      if (type == "redirectTo" || type == "redirect") {
        uni.redirectTo({ url: url2 });
      }
      if (type == "switchTab" || type == "tab") {
        uni.switchTab({ url: url2 });
      }
      if (type == "reLaunch" || type == "launch") {
        uni.reLaunch({ url: url2 });
      }
      if (type == "navigateBack" || type == "back") {
        uni.navigateBack({ delta });
      }
    }
  }
  const route = new Router().route;
  if (!String.prototype.padStart) {
    String.prototype.padStart = function(maxLength, fillString = " ") {
      if (Object.prototype.toString.call(fillString) !== "[object String]")
        throw new TypeError("fillString must be String");
      let str = this;
      if (str.length >= maxLength)
        return String(str);
      let fillLength = maxLength - str.length, times = Math.ceil(fillLength / fillString.length);
      while (times >>= 1) {
        fillString += fillString;
        if (times === 1) {
          fillString += fillString;
        }
      }
      return fillString.slice(0, fillLength) + str;
    };
  }
  function timeFormat(dateTime = null, fmt = "yyyy-mm-dd") {
    if (!dateTime)
      dateTime = Number(/* @__PURE__ */ new Date());
    if (typeof dateTime === "number" || typeof dateTime === "string") {
      if (dateTime.toString().length == 10)
        dateTime = Number(dateTime) * 1e3;
    }
    const date2 = new Date(dateTime);
    let ret;
    const opt = {
      "y+": date2.getFullYear().toString(),
      // 年
      "m+": (date2.getMonth() + 1).toString(),
      // 月
      "d+": date2.getDate().toString(),
      // 日
      "h+": date2.getHours().toString(),
      // 时
      "M+": date2.getMinutes().toString(),
      // 分
      "s+": date2.getSeconds().toString()
      // 秒
      // 有其他格式化字符需求可以继续添加，必须转化成字符串
    };
    for (const k in opt) {
      ret = new RegExp("(" + k + ")").exec(fmt);
      if (ret) {
        fmt = fmt.replace(ret[1], ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, "0"));
      }
    }
    return fmt;
  }
  function timeFrom(dateTime = null, format = "yyyy-mm-dd") {
    if (!dateTime)
      dateTime = Number(/* @__PURE__ */ new Date());
    if (typeof dateTime === "number" || typeof dateTime === "string") {
      if (dateTime.toString().length == 10)
        dateTime = Number(dateTime) * 1e3;
    }
    const timestamp = +new Date(Number(dateTime));
    const timer = (Number(/* @__PURE__ */ new Date()) - timestamp) / 1e3;
    let tips = "";
    switch (true) {
      case timer < 300:
        tips = "刚刚";
        break;
      case (timer >= 300 && timer < 3600):
        tips = parseInt(String(timer / 60)) + "分钟前";
        break;
      case (timer >= 3600 && timer < 86400):
        tips = parseInt(String(timer / 3600)) + "小时前";
        break;
      case (timer >= 86400 && timer < 2592e3):
        tips = parseInt(String(timer / 86400)) + "天前";
        break;
      default:
        if (format === false) {
          if (timer >= 2592e3 && timer < 365 * 86400) {
            tips = parseInt(String(timer / (86400 * 30))) + "个月前";
          } else {
            tips = parseInt(String(timer / (86400 * 365))) + "年前";
          }
        } else {
          tips = timeFormat(timestamp, format);
        }
    }
    return tips;
  }
  function colorGradient(startColor = "rgb(0, 0, 0)", endColor = "rgb(255, 255, 255)", step = 10) {
    const startRGB = hexToRgb(startColor, false);
    const [startR, startG, startB] = startRGB;
    const endRGB = hexToRgb(endColor, false);
    const [endR, endG, endB] = endRGB;
    const sR = (endR - startR) / step;
    const sG = (endG - startG) / step;
    const sB = (endB - startB) / step;
    const colorArr = [];
    for (let i = 0; i < step; i++) {
      const hex = rgbToHex(
        `rgb(${Math.round(sR * i + startR)},${Math.round(sG * i + startG)},${Math.round(sB * i + startB)})`
      );
      colorArr.push(hex);
    }
    return colorArr;
  }
  function hexToRgb(sColor, str = true) {
    const reg = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
    sColor = sColor.toLowerCase();
    if (sColor && reg.test(sColor)) {
      if (sColor.length === 4) {
        let sColorNew = "#";
        for (let i = 1; i < 4; i += 1) {
          sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
        }
        sColor = sColorNew;
      }
      const sColorChange = [
        parseInt("0x" + sColor.slice(1, 3)),
        parseInt("0x" + sColor.slice(3, 5)),
        parseInt("0x" + sColor.slice(5, 7))
      ];
      if (!str) {
        return sColorChange;
      } else {
        return `rgb(${sColorChange[0]},${sColorChange[1]},${sColorChange[2]})`;
      }
    } else if (/^(rgb|RGB)/.test(sColor)) {
      const arr = sColor.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
      return arr.map((val) => Number(val));
    } else {
      return sColor;
    }
  }
  function rgbToHex(rgb) {
    const reg = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
    if (/^(rgb|RGB)/.test(rgb)) {
      const aColor = rgb.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
      let strHex = "#";
      for (let i = 0; i < aColor.length; i++) {
        let hex = Number(aColor[i]).toString(16);
        hex = hex.length == 1 ? "0" + hex : hex;
        strHex += hex;
      }
      if (strHex.length !== 7) {
        strHex = rgb;
      }
      return strHex;
    } else if (reg.test(rgb)) {
      const aNum = rgb.replace(/#/, "").split("");
      if (aNum.length === 6) {
        return rgb;
      } else if (aNum.length === 3) {
        let numHex = "#";
        for (let i = 0; i < aNum.length; i += 1) {
          numHex += aNum[i] + aNum[i];
        }
        return numHex;
      }
    } else {
      return rgb;
    }
    return rgb;
  }
  function colorToRgba(color2, alpha = 0.3) {
    color2 = rgbToHex(color2);
    const reg = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
    let sColor = color2.toLowerCase();
    if (sColor && reg.test(sColor)) {
      if (sColor.length === 4) {
        let sColorNew = "#";
        for (let i = 1; i < 4; i += 1) {
          sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
        }
        sColor = sColorNew;
      }
      const sColorChange = [
        parseInt("0x" + sColor.slice(1, 3)),
        parseInt("0x" + sColor.slice(3, 5)),
        parseInt("0x" + sColor.slice(5, 7))
      ];
      return `rgba(${sColorChange.join(",")},${alpha})`;
    } else {
      return sColor;
    }
  }
  const colorGradients = {
    colorGradient,
    hexToRgb,
    rgbToHex,
    colorToRgba
  };
  function guid(len = 32, firstU = true, radix) {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
    const uuid = [];
    const base = radix || chars.length;
    if (len) {
      for (let i = 0; i < len; i++)
        uuid[i] = chars[0 | Math.random() * base];
    } else {
      let r;
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = "-";
      uuid[14] = "4";
      for (let i = 0; i < 36; i++) {
        if (!uuid[i]) {
          r = 0 | Math.random() * 16;
          uuid[i] = chars[i == 19 ? r & 3 | 8 : r];
        }
      }
    }
    if (firstU) {
      uuid.shift();
      return "u" + uuid.join("");
    } else {
      return uuid.join("");
    }
  }
  const version = "0.5.1";
  const config = vue.reactive({
    v: version,
    version,
    // 主题名称
    type: ["primary", "success", "info", "error", "warning"],
    // 默认为官方主题名称
    defaultTheme: "uviewpro",
    // 默认为亮色模式
    defaultDarkMode: "light",
    // 默认为中文
    defaultLocale: "zh-CN"
  });
  const lightPalette = {
    primary: "#2979ff",
    primaryDark: "#2b85e4",
    primaryDisabled: "#a0cfff",
    primaryLight: "#ecf5ff",
    success: "#19be6b",
    successDark: "#18b566",
    successDisabled: "#71d5a1",
    successLight: "#dbf1e1",
    warning: "#ff9900",
    warningDark: "#f29100",
    warningDisabled: "#fcbd71",
    warningLight: "#fdf6ec",
    error: "#fa3534",
    errorDark: "#dd6161",
    errorDisabled: "#fab6b6",
    errorLight: "#fef0f0",
    info: "#909399",
    infoDark: "#82848a",
    infoDisabled: "#c8c9cc",
    infoLight: "#f4f4f5",
    whiteColor: "#ffffff",
    blackColor: "#000000",
    mainColor: "#303133",
    contentColor: "#606266",
    tipsColor: "#909399",
    lightColor: "#c0c4cc",
    borderColor: "#dcdfe6",
    dividerColor: "#e4e7ed",
    maskColor: "rgba(0, 0, 0, 0.4)",
    shadowColor: "rgba(0, 0, 0, 0.1)",
    bgColor: "#f3f4f6",
    bgWhite: "#ffffff",
    bgGrayLight: "#f1f1f1",
    bgGrayDark: "#2f343c",
    bgBlack: "#000000"
  };
  const darkPalette = {
    primary: "#8ab4ff",
    primaryDark: "#5f8dff",
    primaryDisabled: "#3d4f74",
    primaryLight: "#1d273f",
    success: "#4ade80",
    successDark: "#1f9d57",
    successDisabled: "#2f4d3d",
    successLight: "#10291f",
    warning: "#fbbf24",
    warningDark: "#c88f00",
    warningDisabled: "#4a3b17",
    warningLight: "#2b1f05",
    error: "#ff6b6b",
    errorDark: "#d83a3a",
    errorDisabled: "#4f2323",
    errorLight: "#2d1414",
    info: "#a0a7b8",
    infoDark: "#7c8394",
    infoDisabled: "#3b3f4c",
    infoLight: "#1d2029",
    whiteColor: "#f5f6f7",
    blackColor: "#f5f6f7",
    mainColor: "#f5f6f7",
    contentColor: "#cfd3dc",
    tipsColor: "#9aa1af",
    lightColor: "#6b7082",
    borderColor: "#3a4251",
    dividerColor: "#3a4251",
    maskColor: "rgba(0, 0, 0, 0.6)",
    shadowColor: "rgba(0, 0, 0, 0.3)",
    bgColor: "#111827",
    bgWhite: "#000000",
    bgGrayLight: "#1a1a1a",
    bgGrayDark: "#f5f7fa",
    bgBlack: "#ffffff"
  };
  const lightCss = {
    "--u-background": "#ffffff",
    "--u-surface": "#f7f8fa",
    "--u-text": "#303133"
  };
  const darkCss = {
    "--u-background": "#0f1115",
    "--u-surface": "#1c2233",
    "--u-text": "#f5f6f7"
  };
  const defaultThemes = [
    {
      name: config.defaultTheme,
      label: "默认蓝",
      description: "uView Pro 默认主题，支持亮色与暗黑模式",
      color: lightPalette,
      darkColor: darkPalette,
      css: lightCss,
      darkCss
    }
  ];
  const color = vue.reactive({ ...lightPalette });
  function getSystemDarkMode() {
    try {
      if (typeof uni !== "undefined" && typeof uni.getSystemInfoSync === "function") {
        const systemInfo = uni.getSystemInfoSync();
        const theme = systemInfo.osTheme || systemInfo.theme || "light";
        if (theme === "dark") {
          return "dark";
        }
        if (theme === "light") {
          return "light";
        }
      }
    } catch (e) {
      formatAppLog("warn", "at uni_modules/uview-pro/libs/util/system-theme.ts:22", "[system-theme] getSystemDarkMode failed", e);
    }
    return "light";
  }
  const zhCN = {
    name: "zh-CN",
    uActionSheet: {
      cancelText: "取消"
    },
    uUpload: {
      uploadText: "选择图片",
      retry: "点击重试",
      overSize: "超出允许的文件大小",
      overMaxCount: "超出最大允许的文件个数",
      reUpload: "重新上传",
      uploadFailed: "上传失败，请重试",
      modalTitle: "提示",
      deleteConfirm: "您确定要删除此项吗？",
      terminatedRemove: "已终止移除",
      removeSuccess: "移除成功",
      previewFailed: "预览图片失败",
      notAllowedExt: "不允许选择{ext}格式的文件",
      noAction: "请配置上传地址"
    },
    uVerificationCode: {
      startText: "获取验证码",
      changeText: "X秒重新获取",
      endText: "重新获取"
    },
    uSection: {
      subTitle: "更多"
    },
    uSelect: {
      cancelText: "取消",
      confirmText: "确认"
    },
    uSearch: {
      placeholder: "请输入关键字",
      actionText: "搜索"
    },
    uNoNetwork: {
      tips: "哎呀，网络信号丢失",
      checkNetwork: "请检查网络，或前往",
      setting: "设置",
      retry: "重试",
      noConnection: "无网络连接",
      connected: "网络已连接"
    },
    uReadMore: {
      closeText: "展开阅读全文",
      openText: "收起"
    },
    uPagination: {
      prevText: "上一页",
      nextText: "下一页"
    },
    uPicker: {
      cancelText: "取消",
      confirmText: "确认"
    },
    uModal: {
      title: "提示",
      content: "内容",
      confirmText: "确认",
      cancelText: "取消"
    },
    uLoadmore: {
      loadmore: "加载更多",
      loading: "正在加载...",
      nomore: "没有更多了"
    },
    uLink: {
      mpTips: "链接已复制，请在浏览器打开"
    },
    uKeyboard: {
      cancelText: "取消",
      confirmText: "确认",
      number: "数字键盘",
      idCard: "身份证键盘",
      plate: "车牌号键盘"
    },
    uInput: {
      placeholder: "请输入内容"
    },
    uCalendar: {
      startText: "开始",
      endText: "结束",
      toolTip: "选择日期",
      outOfRange: "日期超出范围啦~",
      year: "年",
      month: "月",
      sun: "日",
      mon: "一",
      tue: "二",
      wed: "三",
      thu: "四",
      fri: "五",
      sat: "六",
      confirmText: "确定",
      to: "至"
    },
    uEmpty: {
      car: "购物车为空",
      page: "页面不存在",
      search: "没有搜索结果",
      address: "没有收货地址",
      wifi: "没有WiFi",
      order: "订单为空",
      coupon: "没有优惠券",
      favor: "暂无收藏",
      permission: "无权限",
      history: "无历史记录",
      news: "无新闻列表",
      message: "消息列表为空",
      list: "列表为空",
      data: "数据为空"
    },
    uCountDown: {
      day: "天",
      hour: "时",
      minute: "分",
      second: "秒"
    },
    uFullScreen: {
      title: "发现新版本",
      upgrade: "升级"
    }
  };
  const enUS = {
    name: "en-US",
    uActionSheet: {
      cancelText: "Cancel"
    },
    uUpload: {
      uploadText: "Select Image",
      retry: "Retry",
      overSize: "File size exceeds allowed limit",
      overMaxCount: "Exceeds maximum allowed number of files",
      reUpload: "Re-upload",
      uploadFailed: "Upload failed, please try again",
      modalTitle: "Notice",
      deleteConfirm: "Are you sure you want to delete this item?",
      terminatedRemove: "Removal cancelled",
      removeSuccess: "Removed successfully",
      previewFailed: "Failed to preview image",
      notAllowedExt: "Files with {ext} format are not allowed",
      noAction: "Please configure upload address"
    },
    uVerificationCode: {
      startText: "Get Code",
      changeText: "Retry in Xs",
      endText: "Retry"
    },
    uSection: {
      subTitle: "More"
    },
    uSelect: {
      cancelText: "Cancel",
      confirmText: "Confirm"
    },
    uSearch: {
      placeholder: "Please enter keywords",
      actionText: "Search"
    },
    uNoNetwork: {
      tips: "Ooops, network disconnected",
      checkNetwork: "Please check network or go to",
      setting: "Settings",
      retry: "Retry",
      noConnection: "No network connection",
      connected: "Network connected"
    },
    uReadMore: {
      closeText: "Read More",
      openText: "Collapse"
    },
    uPagination: {
      prevText: "Prev",
      nextText: "Next"
    },
    uPicker: {
      cancelText: "Cancel",
      confirmText: "Confirm"
    },
    uModal: {
      title: "Notice",
      content: "Content",
      confirmText: "Confirm",
      cancelText: "Cancel"
    },
    uLoadmore: {
      loadmore: "Load more",
      loading: "Loading...",
      nomore: "No more"
    },
    uLink: {
      mpTips: "Link copied, please open it in browser"
    },
    uKeyboard: {
      cancelText: "Cancel",
      confirmText: "Confirm",
      number: "Number Keyboard",
      idCard: "ID Card Keyboard",
      plate: "Plate Keyboard"
    },
    uInput: {
      placeholder: "Please enter"
    },
    uCalendar: {
      startText: "Start",
      endText: "End",
      toolTip: "Select date",
      outOfRange: "Date out of range",
      year: "",
      month: "",
      sun: "Sun",
      mon: "Mon",
      tue: "Tue",
      wed: "Wed",
      thu: "Thu",
      fri: "Fri",
      sat: "Sat",
      confirmText: "Confirm",
      to: " to "
    },
    uEmpty: {
      car: "Shopping cart is empty",
      page: "Page not found",
      search: "No search results",
      address: "No shipping address",
      wifi: "No WiFi",
      order: "No orders",
      coupon: "No coupons",
      favor: "No favorites",
      permission: "No permission",
      history: "No history",
      news: "No news",
      message: "No messages",
      list: "No list",
      data: "No data"
    },
    uCountDown: {
      day: "days",
      hour: "hours",
      minute: "minutes",
      second: "Second"
    },
    uFullScreen: {
      title: "New Version Available",
      upgrade: "Upgrade"
    }
  };
  const localePack = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    enUS,
    zhCN
  }, Symbol.toStringTag, { value: "Module" }));
  const THEME_STORAGE_KEY = "uview-pro-theme";
  const DARK_MODE_STORAGE_KEY = "uview-pro-dark-mode";
  const LOCALE_STORAGE_KEY = "uview-pro-locale";
  const DEFAULT_LIGHT_TOKENS = ((_a = defaultThemes[0]) == null ? void 0 : _a.color) || {};
  const DEFAULT_DARK_TOKENS = ((_b = defaultThemes[0]) == null ? void 0 : _b.darkColor) || {};
  const STRUCTURAL_TOKENS = /* @__PURE__ */ new Set([
    "bgColor",
    "bgWhite",
    "bgGrayLight",
    "bgGrayDark",
    "bgBlack",
    "borderColor",
    "lightColor",
    "mainColor",
    "contentColor",
    "tipsColor",
    "whiteColor",
    "blackColor",
    "dividerColor",
    "maskColor",
    "shadowColor"
  ]);
  class ConfigProvider {
    constructor() {
      this.themesRef = vue.ref([]);
      this.currentThemeRef = vue.ref(null);
      this.darkModeRef = vue.ref(config.defaultDarkMode);
      this.cssVarsRef = vue.ref({});
      this.localesRef = vue.ref([]);
      this.currentLocaleRef = vue.ref(null);
      this.baseColorTokens = DEFAULT_LIGHT_TOKENS;
      this.baseDarkColorTokens = DEFAULT_DARK_TOKENS;
      this.debug = false;
      this.systemDarkModeMediaQuery = null;
      this.lastAppliedCssKeys = [];
      this.interval = 0;
      this.initSystemDarkModeListener();
    }
    /**
     * 初始化系统暗黑模式监听器
     * 支持 H5、App、小程序等平台
     */
    initSystemDarkModeListener() {
      try {
        if (typeof window !== "undefined" && window.matchMedia) {
          this.systemDarkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
          const listener = () => {
            if (this.darkModeRef.value === "auto") {
              this.applyTheme(this.currentThemeRef.value);
            }
          };
          if (this.systemDarkModeMediaQuery.addEventListener) {
            this.systemDarkModeMediaQuery.addEventListener("change", listener);
          } else if (this.systemDarkModeMediaQuery.addListener) {
            this.systemDarkModeMediaQuery.addListener(listener);
          }
        }
      } catch (e) {
        if (this.debug)
          formatAppLog("warn", "at uni_modules/uview-pro/libs/util/config-provider.ts:98", "[ConfigProvider] H5 system dark mode listener failed", e);
      }
      try {
        if (typeof uni !== "undefined" && typeof uni.onThemeChange === "function") {
          uni.onThemeChange((res) => {
            formatAppLog("log", "at uni_modules/uview-pro/libs/util/config-provider.ts:105", "[ConfigProvider] system theme changed", res);
            if (this.darkModeRef.value === "auto") {
              this.applyTheme(this.currentThemeRef.value);
            }
          });
        }
      } catch (e) {
        if (this.debug)
          formatAppLog("warn", "at uni_modules/uview-pro/libs/util/config-provider.ts:113", "[ConfigProvider] uni-app system dark mode listener failed", e);
      }
      this.initAppEvent();
    }
    /**
     * App 平台事件监听
     * 经测试 uni.onThemeChange 在 App 平台目前没生效，暂时只能通过定时检查
     */
    initAppEvent() {
      try {
        if (this.interval)
          clearInterval(this.interval);
        this.interval = setInterval(() => {
          if (this.darkModeRef.value === "auto") {
            this.applyTheme(this.currentThemeRef.value);
          }
        }, 5e3);
      } catch (e) {
        if (this.debug)
          formatAppLog("warn", "at uni_modules/uview-pro/libs/util/config-provider.ts:134", "[ConfigProvider] setInterval failed", e);
      }
    }
    /**
     * 检测当前是否应该使用暗黑模式
     */
    isSystemDarkMode() {
      try {
        if (this.systemDarkModeMediaQuery) {
          return this.systemDarkModeMediaQuery.matches;
        }
      } catch (e) {
        if (this.debug)
          formatAppLog("warn", "at uni_modules/uview-pro/libs/util/config-provider.ts:147", "[ConfigProvider] matchMedia check failed", e);
      }
      try {
        return getSystemDarkMode() === "dark";
      } catch (e) {
        if (this.debug)
          formatAppLog("warn", "at uni_modules/uview-pro/libs/util/config-provider.ts:152", "[ConfigProvider] native system theme check failed", e);
        return false;
      }
    }
    /**
     * 初始化主题系统
     * @param themes 可用主题数组
     * @param defaultTheme 可选默认主题名
     */
    initTheme(themes, defaultConfig, isForce) {
      const normalizedThemes = this.normalizeThemes(themes);
      if (!normalizedThemes.length) {
        formatAppLog("warn", "at uni_modules/uview-pro/libs/util/config-provider.ts:165", "[ConfigProvider] init called with empty themes");
        return;
      }
      if (defaultConfig) {
        if (typeof defaultConfig === "string") {
          config.defaultTheme = defaultConfig || config.defaultTheme;
        } else if (typeof defaultConfig === "object") {
          const { defaultTheme, defaultDarkMode } = defaultConfig;
          config.defaultTheme = defaultTheme || config.defaultTheme;
          config.defaultDarkMode = defaultDarkMode || config.defaultDarkMode;
        }
      }
      this.themesRef.value = normalizedThemes.slice();
      const saved = this.readStorage(THEME_STORAGE_KEY);
      let initialName = saved || config.defaultTheme || this.themesRef.value[0].name;
      if (isForce && config.defaultTheme)
        initialName = config.defaultTheme;
      let found = this.themesRef.value.find((t) => t.name === initialName);
      if (!found)
        found = this.themesRef.value.find((t) => t.name === config.defaultTheme);
      if (!found)
        found = this.themesRef.value[0];
      this.currentThemeRef.value = found;
      this.initDarkMode(config.defaultDarkMode, isForce);
      this.applyTheme(found);
      if (this.debug)
        formatAppLog("log", "at uni_modules/uview-pro/libs/util/config-provider.ts:201", "[ConfigProvider] initialized, theme=", found.name, "darkMode=", this.darkModeRef.value);
      return this;
    }
    /**
     * 初始化暗黑模式设置
     * @param darkMode
     */
    initDarkMode(darkMode, isForce) {
      const savedDarkMode = this.readStorage(DARK_MODE_STORAGE_KEY);
      let darkModeValue = savedDarkMode || darkMode || config.defaultDarkMode;
      if (isForce && darkMode)
        darkModeValue = darkMode;
      this.darkModeRef.value = darkModeValue;
    }
    /**
     * 初始化国际化数据
     * @param locales 可选的 locale 列表（对象数组，包含 name 字段）
     * @param defaultLocaleName 可选默认 locale 名称
     */
    initLocales(locales, defaultLocaleName, isForce) {
      const normalized = this.normalizeLocales(locales);
      if (!normalized.length) {
        if (this.debug)
          formatAppLog("warn", "at uni_modules/uview-pro/libs/util/config-provider.ts:226", "[ConfigProvider] initLocales called with empty locales");
        return;
      }
      this.localesRef.value = normalized.slice();
      const saved = this.readStorage(LOCALE_STORAGE_KEY);
      let initialName = saved || defaultLocaleName || config.defaultLocale;
      if (isForce && defaultLocaleName)
        initialName = defaultLocaleName;
      let found = this.localesRef.value.find((l) => l.name === initialName);
      if (!found)
        found = this.localesRef.value.find((l) => l.name === config.defaultLocale);
      if (!found)
        found = this.localesRef.value[0];
      this.currentLocaleRef.value = found;
      if (this.debug)
        formatAppLog("log", "at uni_modules/uview-pro/libs/util/config-provider.ts:244", "[ConfigProvider] locales initialized, locale=", found == null ? void 0 : found.name);
      return this;
    }
    /**
     * 归一化 locale 配置，保证始终至少有一个默认 locale
     */
    normalizeLocales(locales) {
      let builtinList = [];
      try {
        builtinList = Object.values(localePack || {}).filter((v) => v && typeof v === "object");
      } catch (e) {
        if (this.debug)
          formatAppLog("warn", "at uni_modules/uview-pro/libs/util/config-provider.ts:258", "[ConfigProvider] normalizeLocales read builtin failed", e);
      }
      if (!Array.isArray(locales) || !locales.length) {
        return builtinList.slice();
      }
      const map = /* @__PURE__ */ new Map();
      builtinList.forEach((item) => {
        if (item && item.name) {
          map.set(item.name, { ...item || {} });
        }
      });
      locales.forEach((loc) => {
        if (!loc || !loc.name)
          return;
        const existing = map.get(loc.name);
        if (!existing) {
          map.set(loc.name, { ...loc || {} });
          return;
        }
        const merged = { ...existing };
        Object.keys(loc).forEach((k) => {
          const v = loc[k];
          if (v != null && typeof v === "object" && !Array.isArray(v) && typeof merged[k] === "object") {
            merged[k] = { ...merged[k] || {}, ...v || {} };
          } else {
            merged[k] = v;
          }
        });
        map.set(loc.name, merged);
      });
      return Array.from(map.values());
    }
    /**
     * 获取所有可用 locale
     */
    getLocales() {
      return this.localesRef.value.slice();
    }
    /**
     * 获取当前 locale 对象
     */
    getCurrentLocale() {
      return this.currentLocaleRef.value;
    }
    /**
     * 切换 locale 并持久化
     */
    setLocale(localeName) {
      if (!this.localesRef.value || this.localesRef.value.length === 0) {
        formatAppLog("warn", "at uni_modules/uview-pro/libs/util/config-provider.ts:318", "[ConfigProvider] setLocale called but locales list empty");
        return;
      }
      const locale = this.localesRef.value.find((l) => l.name === localeName);
      if (!locale) {
        formatAppLog("warn", "at uni_modules/uview-pro/libs/util/config-provider.ts:323", "[ConfigProvider] locale not found:", localeName);
        return;
      }
      this.currentLocaleRef.value = locale;
      this.writeStorage(LOCALE_STORAGE_KEY, localeName);
      if (this.debug)
        formatAppLog("log", "at uni_modules/uview-pro/libs/util/config-provider.ts:328", "[ConfigProvider] setLocale ->", localeName);
    }
    /**
     * 翻译函数
     * 支持 key 路径，例如 'calendar.placeholder'
     * replacements 支持数组或对象替换占位符 {0} 或 {name}
     */
    t(key, replacements, localeName) {
      const localeObj = localeName && this.localesRef.value.find((l) => l.name === localeName) || this.currentLocaleRef.value;
      if (!localeObj)
        return key;
      const parts = key.split(".");
      let cur = localeObj;
      for (let i = 0; i < parts.length; i++) {
        if (cur == null)
          break;
        cur = cur[parts[i]];
      }
      let text = typeof cur === "string" ? cur : key;
      if (replacements != null) {
        if (Array.isArray(replacements)) {
          replacements.forEach((val, idx) => {
            text = text.split(`{${idx}}`).join(String(val));
          });
        } else if (typeof replacements === "object") {
          Object.keys(replacements).forEach((k) => {
            text = text.split(`{${k}}`).join(String(replacements[k]));
          });
        }
      }
      return text;
    }
    /**
     * 获取所有可用主题
     */
    getThemes() {
      return this.themesRef.value.slice();
    }
    /**
     * 获取当前主题
     */
    getCurrentTheme() {
      return this.currentThemeRef.value;
    }
    /**
     * 切换主题并持久化
     */
    setTheme(themeName) {
      if (!this.themesRef.value || this.themesRef.value.length === 0) {
        formatAppLog("warn", "at uni_modules/uview-pro/libs/util/config-provider.ts:380", "[ConfigProvider] setTheme called but themes list empty");
        return;
      }
      const theme = this.themesRef.value.find((t) => t.name === themeName);
      if (!theme) {
        formatAppLog("warn", "at uni_modules/uview-pro/libs/util/config-provider.ts:386", "[ConfigProvider] theme not found:", themeName);
        return;
      }
      this.currentThemeRef.value = theme;
      this.applyTheme(theme);
      this.writeStorage(THEME_STORAGE_KEY, themeName);
      if (this.debug)
        formatAppLog("log", "at uni_modules/uview-pro/libs/util/config-provider.ts:398", "[ConfigProvider] setTheme ->", themeName);
    }
    /**
     * 运行时更新当前主题颜色并应用（不持久化）
     * @param colors 主题颜色键值，支持部分更新
     */
    setThemeColor(colors) {
      if (!colors || Object.keys(colors).length === 0)
        return;
      if (!this.currentThemeRef.value) {
        formatAppLog("warn", "at uni_modules/uview-pro/libs/util/config-provider.ts:408", "[ConfigProvider] setThemeColor called but no current theme");
        return;
      }
      const mode = this.getActiveMode();
      if (mode === "dark") {
        const existing = this.currentThemeRef.value.darkColor || {};
        this.currentThemeRef.value.darkColor = {
          ...existing,
          ...colors
        };
      } else {
        const existing = this.currentThemeRef.value.color || {};
        this.currentThemeRef.value.color = {
          ...existing,
          ...colors
        };
      }
      this.applyTheme(this.currentThemeRef.value);
      if (this.debug)
        formatAppLog("log", "at uni_modules/uview-pro/libs/util/config-provider.ts:431", "[ConfigProvider] setThemeColor ->", colors);
    }
    /**
     * 获取当前暗黑模式设置
     */
    getDarkMode() {
      return this.darkModeRef.value;
    }
    /**
     * 设置暗黑模式
     * @param mode 'auto' (跟随系统) | 'light' (强制亮色) | 'dark' (强制暗黑)
     */
    setDarkMode(mode) {
      this.darkModeRef.value = mode;
      this.writeStorage(DARK_MODE_STORAGE_KEY, mode);
      this.applyTheme(this.currentThemeRef.value);
      if (this.debug)
        formatAppLog("log", "at uni_modules/uview-pro/libs/util/config-provider.ts:453", "[ConfigProvider] setDarkMode ->", mode);
    }
    /**
     * 检查当前是否处于暗黑模式
     */
    isInDarkMode() {
      const mode = this.darkModeRef.value;
      if (mode === "dark")
        return true;
      if (mode === "light")
        return false;
      return this.isSystemDarkMode();
    }
    /**
     * 归一化主题配置，保证始终至少有一个默认主题
     */
    normalizeThemes(themes) {
      if (Array.isArray(themes) && themes.length) {
        return this.mergeThemes(defaultThemes, themes);
      }
      return defaultThemes.slice();
    }
    mergeThemes(...lists) {
      const map = /* @__PURE__ */ new Map();
      lists.filter((list2) => Array.isArray(list2) && list2.length > 0).forEach((list2) => {
        list2.forEach((theme) => {
          const normalized = this.ensureDarkVariant({
            ...theme,
            color: this.applyColorFallbacks(theme.color),
            darkColor: theme.darkColor ? { ...theme.darkColor } : void 0,
            css: theme.css ? { ...theme.css } : void 0,
            darkCss: theme.darkCss ? { ...theme.darkCss } : void 0
          });
          map.set(normalized.name, normalized);
        });
      });
      return Array.from(map.values());
    }
    ensureDarkVariant(theme) {
      const finalDark = this.buildDarkPalette(theme);
      return {
        ...theme,
        darkColor: this.applyDarkFallbacks(finalDark)
      };
    }
    buildDarkPalette(theme) {
      const provided = theme.darkColor || {};
      const generated = this.generateDarkFromLight(theme.color || {}, provided);
      return {
        ...generated,
        ...provided
      };
    }
    /**
     * 应用亮色主题
     */
    applyColorFallbacks(color2) {
      return {
        ...this.baseColorTokens || {},
        ...color2 || {}
      };
    }
    /**
     * 应用暗黑主题
     */
    applyDarkFallbacks(color2) {
      return {
        ...this.baseDarkColorTokens || {},
        ...color2 || {}
      };
    }
    filterNonStructuralTokens(palette) {
      const result = {};
      Object.entries(palette || {}).forEach(([key, value]) => {
        if (!this.isStructuralToken(key)) {
          result[key] = value;
        }
      });
      return result;
    }
    generateDarkFromLight(palette, provided) {
      const result = {};
      const nonStructural = this.filterNonStructuralTokens(palette);
      Object.entries(nonStructural).forEach(([key, value]) => {
        var _a2;
        if (typeof value !== "string")
          return;
        if (provided && Object.prototype.hasOwnProperty.call(provided, key)) {
          return;
        }
        const fallback = (_a2 = this.baseDarkColorTokens) == null ? void 0 : _a2[key];
        result[key] = this.createDarkVariantFromLight(value, fallback);
      });
      return result;
    }
    createDarkVariantFromLight(color2, fallback) {
      const normalized = this.normalizeHex(color2);
      const fallbackHex = fallback ? this.normalizeHex(fallback) : null;
      if (normalized && fallbackHex) {
        return this.mixHex(normalized, fallbackHex, 0.6);
      }
      if (fallbackHex)
        return fallbackHex;
      return normalized || color2;
    }
    normalizeHex(color2) {
      if (!color2)
        return null;
      const hex = color2.trim();
      if (/^#([0-9a-fA-F]{6})$/.test(hex))
        return hex.toLowerCase();
      return null;
    }
    mixHex(fromHex, toHex, ratio) {
      const from = this.hexToRgb(fromHex);
      const to = this.hexToRgb(toHex);
      if (!from || !to)
        return toHex;
      const clamp = (val) => Math.min(255, Math.max(0, Math.round(val)));
      const r = clamp(from.r * (1 - ratio) + to.r * ratio);
      const g = clamp(from.g * (1 - ratio) + to.g * ratio);
      const b = clamp(from.b * (1 - ratio) + to.b * ratio);
      return this.rgbToHex(r, g, b);
    }
    hexToRgb(hex) {
      const match = /^#([0-9a-fA-F]{6})$/.exec(hex);
      if (!match)
        return null;
      return {
        r: parseInt(match[1].slice(0, 2), 16),
        g: parseInt(match[1].slice(2, 4), 16),
        b: parseInt(match[1].slice(4, 6), 16)
      };
    }
    rgbToHex(r, g, b) {
      const toHex = (val) => val.toString(16).padStart(2, "0");
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
    isStructuralToken(token) {
      return STRUCTURAL_TOKENS.has(token);
    }
    /**
     * 运行时同步主题颜色（$u.color）
     * 更新响应式 color 对象，确保所有使用 $u.color 的地方都能响应式更新
     */
    syncRuntimeTheme(palette) {
      var _a2;
      try {
        const defaultPalette = this.getActiveMode() === "dark" ? this.baseDarkColorTokens : this.baseColorTokens;
        const mergedPalette = {
          ...defaultPalette,
          ...palette
        };
        Object.keys(mergedPalette).forEach((key) => {
          const value = mergedPalette[key];
          if (value != null) {
            color[key] = value;
          }
        });
        if (typeof uni !== "undefined" && ((_a2 = uni == null ? void 0 : uni.$u) == null ? void 0 : _a2.color)) {
          uni.$u.color = color;
        }
      } catch (e) {
        if (this.debug)
          formatAppLog("warn", "at uni_modules/uview-pro/libs/util/config-provider.ts:631", "[ConfigProvider] sync runtime theme failed", e);
      }
    }
    /**
     * 获取当前激活的模式
     */
    getActiveMode() {
      return this.isInDarkMode() ? "dark" : "light";
    }
    /**
     * 获取当前主题的配色方案
     */
    getPaletteForMode(theme, mode) {
      if (mode === "dark") {
        return theme.darkColor && Object.keys(theme.darkColor).length ? theme.darkColor : theme.color || {};
      }
      return theme.color || {};
    }
    /**
     * 获取当前主题的CSS变量覆盖
     */
    getCssOverrides(theme, mode) {
      if (mode === "dark") {
        return (theme.darkCss && Object.keys(theme.darkCss).length ? theme.darkCss : theme.css) || {};
      }
      return theme.css || {};
    }
    /**
     * 读取Storage key
     */
    readStorage(key) {
      try {
        if (typeof uni === "undefined" || typeof uni.getStorageSync !== "function")
          return null;
        const value = uni.getStorageSync(key);
        return value ?? null;
      } catch (e) {
        if (this.debug)
          formatAppLog("warn", "at uni_modules/uview-pro/libs/util/config-provider.ts:671", "[ConfigProvider] failed to read storage", e);
        return null;
      }
    }
    /**
     * 写入Storage key value
     */
    writeStorage(key, value) {
      try {
        if (typeof uni === "undefined" || typeof uni.setStorageSync !== "function")
          return;
        uni.setStorageSync(key, value);
      } catch (e) {
        if (this.debug)
          formatAppLog("warn", "at uni_modules/uview-pro/libs/util/config-provider.ts:684", "[ConfigProvider] failed to write storage", e);
      }
    }
    /**
     * 更新文档主题模式 H5
     */
    updateDocumentMode(mode) {
      if (typeof document === "undefined" || !document.documentElement)
        return;
      const root = document.documentElement;
      root.dataset.uThemeMode = mode;
      root.classList.remove("u-theme-light", "u-theme-dark");
      root.classList.add(`u-theme-${mode}`);
    }
    /**
     * 转换为 CSS 变量名称
     */
    toCssVarName(key, prefix = "--u") {
      const types = config.type;
      if (types.some((type) => key.startsWith(type))) {
        prefix += "-type";
      }
      const kebab = key.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/[\s_]+/g, "-").toLowerCase();
      return `${prefix}-${kebab}`;
    }
    /**
     * 添加 RGB 值
     */
    attachRgbVar(target, varName, value) {
      if (typeof value !== "string")
        return;
      const hex = value.startsWith("#") ? value.slice(1) : "";
      if (!/^[0-9a-fA-F]{6}$/.test(hex))
        return;
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      target[`${varName}-rgb`] = `${r}, ${g}, ${b}`;
    }
    /**
     * 构建 CSS 变量映射表
     * 生成格式：
     */
    buildCssVarMap(theme, mode) {
      const map = {
        "--u-theme-mode": mode
      };
      const palette = this.getPaletteForMode(theme, mode);
      const cssOverrides = this.getCssOverrides(theme, mode);
      const applyEntry = (key, value) => {
        if (value == null)
          return;
        const strValue = String(value);
        if (key.startsWith("--")) {
          map[key] = strValue;
          this.attachRgbVar(map, key, strValue);
          return;
        }
        const cssVarName = this.toCssVarName(key);
        map[cssVarName] = strValue;
        this.attachRgbVar(map, cssVarName, strValue);
      };
      Object.entries(palette || {}).forEach(([key, value]) => applyEntry(key, value));
      Object.entries(cssOverrides || {}).forEach(([key, value]) => applyEntry(key, value));
      return map;
    }
    /**
     * 刷新 CSS 变量 H5
     */
    flushCssVars(vars) {
      if (typeof document === "undefined" || !document.documentElement)
        return;
      const root = document.documentElement;
      this.lastAppliedCssKeys.forEach((key) => {
        root.style.removeProperty(key);
      });
      Object.entries(vars).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
      this.lastAppliedCssKeys = Object.keys(vars);
    }
    /**
     * 将主题应用到运行时：
     * - 1) 调用 uni.$u.setColor(theme.color) 如果存在
     * - 2) 在 H5 环境中，将 css map 注入到 document.documentElement 的 CSS 变量中
     * - 3) 支持暗黑模式：根据 darkColor 或 color 应用相应的颜色
     */
    applyTheme(theme) {
      if (!theme)
        return;
      const mode = this.getActiveMode();
      const palette = this.getPaletteForMode(theme, mode);
      this.syncRuntimeTheme(palette);
      const cssVarMap = this.buildCssVarMap(theme, mode);
      this.cssVarsRef.value = cssVarMap;
      this.flushCssVars(cssVarMap);
      this.updateDocumentMode(mode);
    }
  }
  const configProvider = new ConfigProvider();
  function getColor(name) {
    if (color[name]) {
      return color[name];
    }
    return lightPalette[name] || "";
  }
  function setColor(theme) {
    configProvider.setThemeColor(theme);
  }
  function type2icon(type = "success", fill = false) {
    if (!["primary", "info", "error", "warning", "success"].includes(type))
      type = "success";
    let iconName = "";
    switch (type) {
      case "primary":
        iconName = "info-circle";
        break;
      case "info":
        iconName = "info-circle";
        break;
      case "error":
        iconName = "close-circle";
        break;
      case "warning":
        iconName = "error-circle";
        break;
      case "success":
        iconName = "checkmark-circle";
        break;
      default:
        iconName = "checkmark-circle";
    }
    if (fill)
      iconName += "-fill";
    return iconName;
  }
  function randomArray(array2 = []) {
    return array2.sort(() => Math.random() - 0.5);
  }
  function deepClone(obj, cache = /* @__PURE__ */ new WeakMap()) {
    if (obj === null || typeof obj !== "object")
      return obj;
    if (cache.has(obj))
      return cache.get(obj);
    let clone;
    if (obj instanceof Date) {
      clone = new Date(obj.getTime());
    } else if (obj instanceof RegExp) {
      clone = new RegExp(obj);
    } else if (obj instanceof Map) {
      clone = new Map(Array.from(obj, ([key, value]) => [key, deepClone(value, cache)]));
    } else if (obj instanceof Set) {
      clone = new Set(Array.from(obj, (value) => deepClone(value, cache)));
    } else if (Array.isArray(obj)) {
      clone = obj.map((value) => deepClone(value, cache));
    } else if (Object.prototype.toString.call(obj) === "[object Object]") {
      clone = Object.create(Object.getPrototypeOf(obj));
      cache.set(obj, clone);
      for (const [key, value] of Object.entries(obj)) {
        clone[key] = deepClone(value, cache);
      }
    } else {
      clone = Object.assign({}, obj);
    }
    cache.set(obj, clone);
    return clone;
  }
  function deepMerge(target = {}, source = {}) {
    target = deepClone(target);
    if (typeof target !== "object" || target === null || typeof source !== "object" || source === null)
      return target;
    const merged = Array.isArray(target) ? target.slice() : Object.assign({}, target);
    for (const prop in source) {
      if (!Object.prototype.hasOwnProperty.call(source, prop))
        continue;
      const sourceValue = source[prop];
      const targetValue = merged[prop];
      if (sourceValue instanceof Date) {
        merged[prop] = new Date(sourceValue);
      } else if (sourceValue instanceof RegExp) {
        merged[prop] = new RegExp(sourceValue);
      } else if (sourceValue instanceof Map) {
        merged[prop] = new Map(sourceValue);
      } else if (sourceValue instanceof Set) {
        merged[prop] = new Set(sourceValue);
      } else if (typeof sourceValue === "object" && sourceValue !== null) {
        merged[prop] = deepMerge(targetValue, sourceValue);
      } else {
        merged[prop] = sourceValue;
      }
    }
    return merged;
  }
  function email(value) {
    return /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/.test(
      value
    );
  }
  function mobile(value) {
    return /^1[3-9]\d{9}$/.test(value);
  }
  function url(value) {
    return /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w-.\/?%&=]*)?/.test(value);
  }
  function date(value) {
    return !/Invalid|NaN/.test(new Date(value).toString());
  }
  function dateISO(value) {
    return /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/.test(value);
  }
  function number(value) {
    return /^[\+-]?(\d+\.?\d*|\.\d+|\d\.\d+e\+\d+)$/.test(value);
  }
  function digits(value) {
    return /^\d+$/.test(value);
  }
  function idCard(value) {
    return /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/.test(value);
  }
  function carNo(value) {
    const xreg = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}(([0-9]{5}[DF]$)|([DF][A-HJ-NP-Z0-9][0-9]{4}$))/;
    const creg = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳]{1}$/;
    if (value.length === 7) {
      return creg.test(value);
    } else if (value.length === 8) {
      return xreg.test(value);
    } else {
      return false;
    }
  }
  function amount(value) {
    return /^[1-9]\d*(,\d{3})*(\.\d{1,2})?$|^0\.\d{1,2}$/.test(value);
  }
  function chinese(value) {
    let reg = /^[\u4e00-\u9fa5]+$/gi;
    return reg.test(value);
  }
  function letter(value) {
    return /^[a-zA-Z]*$/.test(value);
  }
  function enOrNum(value) {
    let reg = /^[0-9a-zA-Z]*$/g;
    return reg.test(value);
  }
  function contains(value, param) {
    return value.indexOf(param) >= 0;
  }
  function range(value, param) {
    return value >= param[0] && value <= param[1];
  }
  function rangeLength(value, param) {
    return value.length >= param[0] && value.length <= param[1];
  }
  function landline(value) {
    let reg = /^\d{3,4}-\d{7,8}(-\d{3,4})?$/;
    return reg.test(value);
  }
  function empty(value) {
    switch (typeof value) {
      case "undefined":
        return true;
      case "string":
        if (value.replace(/(^[ \t\n\r]*)|([ \t\n\r]*$)/g, "").length == 0)
          return true;
        break;
      case "boolean":
        if (!value)
          return true;
        break;
      case "number":
        if (0 === value || isNaN(value))
          return true;
        break;
      case "object":
        if (null === value || value.length === 0)
          return true;
        for (var i in value) {
          return false;
        }
        return true;
    }
    return false;
  }
  function jsonString(value) {
    if (typeof value == "string") {
      try {
        var obj = JSON.parse(value);
        if (typeof obj == "object" && obj) {
          return true;
        } else {
          return false;
        }
      } catch (e) {
        return false;
      }
    }
    return false;
  }
  function array(value) {
    if (typeof Array.isArray === "function") {
      return Array.isArray(value);
    } else {
      return Object.prototype.toString.call(value) === "[object Array]";
    }
  }
  function object(value) {
    return Object.prototype.toString.call(value) === "[object Object]";
  }
  function code(value, len = 6) {
    return new RegExp(`^\\d{${len}}$`).test(value);
  }
  function func(value) {
    return typeof value === "function";
  }
  function promise(value) {
    return object(value) && func(value.then) && func(value.catch);
  }
  function image(value) {
    const newValue = value.split("?")[0];
    const IMAGE_REGEXP = /\.(jpeg|jpg|gif|png|svg|webp|jfif|bmp|dpg)/i;
    return IMAGE_REGEXP.test(newValue);
  }
  function video(value) {
    const VIDEO_REGEXP = /\.(mp4|mpg|mpeg|dat|asf|avi|rm|rmvb|mov|wmv|flv|mkv|m3u8)/i;
    return VIDEO_REGEXP.test(value);
  }
  function regExp(o) {
    return o && Object.prototype.toString.call(o) === "[object RegExp]";
  }
  function string(value) {
    return typeof value === "string";
  }
  const test = {
    email,
    mobile,
    url,
    date,
    dateISO,
    number,
    digits,
    idCard,
    carNo,
    amount,
    chinese,
    letter,
    enOrNum,
    contains,
    range,
    rangeLength,
    empty,
    isEmpty: empty,
    jsonString,
    landline,
    object,
    array,
    code,
    func,
    promise,
    video,
    image,
    regExp,
    string
  };
  function addUnit(value = "auto", unit = "rpx") {
    const strValue = String(value);
    if (!strValue)
      return "";
    if (strValue === "auto")
      return strValue;
    if (strValue.includes(" ")) {
      return strValue.split(" ").map((s) => {
        if (s === "auto" || /^-?\d*\.?\d+(%|px|rpx|em|rem|vh|vw)$/.test(s))
          return s;
        return test.number(s) ? `${s}${unit}` : s;
      }).join(" ");
    }
    if (/^-?\d*\.?\d+(%|px|rpx|em|rem|vh|vw)$/.test(strValue))
      return strValue;
    return test.number(strValue) ? `${strValue}${unit}` : strValue;
  }
  function random(min, max) {
    if (min >= 0 && max > 0 && max >= min) {
      const gab = max - min + 1;
      return Math.floor(Math.random() * gab + min);
    } else {
      return 0;
    }
  }
  function trim(str, pos = "both") {
    if (pos === "both") {
      return str.replace(/^\s+|\s+$/g, "");
    } else if (pos === "left") {
      return str.replace(/^\s*/, "");
    } else if (pos === "right") {
      return str.replace(/(\s*$)/g, "");
    } else if (pos === "all") {
      return str.replace(/\s+/g, "");
    } else {
      return str;
    }
  }
  function toast(title, option = 1500) {
    uni.showToast({
      title,
      icon: typeof option === "string" ? option : typeof option === "object" ? option.icon || "none" : "none",
      duration: typeof option === "number" ? option : typeof option === "object" ? option.duration || "1500" : 1500
    });
  }
  function getParent(name, keys) {
    var _a2;
    let parent = this.$parent;
    while (parent) {
      if (((_a2 = parent.$options) == null ? void 0 : _a2.name) !== name) {
        parent = parent.$parent;
      } else {
        const data = {};
        if (Array.isArray(keys)) {
          keys.forEach((val) => {
            data[val] = (parent == null ? void 0 : parent[val]) ? parent[val] : "";
          });
        } else {
          for (const i in keys) {
            if (Array.isArray(keys[i])) {
              if (keys[i].length) {
                data[i] = keys[i];
              } else {
                data[i] = parent[i];
              }
            } else if (keys[i] && keys[i].constructor === Object) {
              if (Object.keys(keys[i]).length) {
                data[i] = keys[i];
              } else {
                data[i] = parent[i];
              }
            } else {
              data[i] = keys[i] || keys[i] === false ? keys[i] : parent[i];
            }
          }
        }
        return data;
      }
    }
    return {};
  }
  function $parent(componentName, _instance = null) {
    var _a2;
    const instance = _instance || vue.getCurrentInstance();
    let parent = instance && instance.parent;
    if (!componentName)
      return parent;
    while (parent) {
      const name = (_a2 = parent.type) == null ? void 0 : _a2.name;
      if (name === componentName) {
        return parent;
      }
      parent = parent.parent;
    }
    return null;
  }
  function os() {
    return uni.getSystemInfoSync().platform;
  }
  function sys() {
    return uni.getSystemInfoSync();
  }
  let timeout = null;
  function debounce(func2, wait = 500, immediate = false) {
    if (timeout !== null)
      clearTimeout(timeout);
    if (immediate) {
      const callNow = !timeout;
      timeout = setTimeout(() => {
        timeout = null;
      }, wait);
      if (callNow)
        typeof func2 === "function" && func2();
    } else {
      timeout = setTimeout(() => {
        typeof func2 === "function" && func2();
      }, wait);
    }
  }
  let flag;
  function throttle(func2, wait = 500, immediate = true) {
    if (immediate) {
      if (!flag) {
        flag = true;
        typeof func2 === "function" && func2();
        setTimeout(() => {
          flag = false;
        }, wait);
      }
    } else {
      if (!flag) {
        flag = true;
        setTimeout(() => {
          flag = false;
          typeof func2 === "function" && func2();
        }, wait);
      }
    }
  }
  function getRect(selector, _instance = null, all = false) {
    const instance = _instance || vue.getCurrentInstance();
    return new Promise((resolve) => {
      uni.createSelectorQuery().in(instance == null ? void 0 : instance.proxy)[all ? "selectAll" : "select"](selector).boundingClientRect((rect) => {
        if (all && Array.isArray(rect) && rect.length) {
          resolve(rect);
        }
        if (!all && rect) {
          resolve(rect);
        }
      }).exec();
    });
  }
  function UniCopy(text, config2) {
    const opt = Object.assign({ data: text }, config2);
    uni.setClipboardData(opt);
  }
  function clipboard(content, options) {
    const text = String(content);
    const defaultOpt = {
      showToast: true,
      success: () => {
      },
      fail: () => {
      },
      complete: () => {
      }
    };
    const config2 = Object.assign(defaultOpt, options);
    UniCopy(text, config2);
  }
  const zIndex = {
    toast: 10090,
    noNetwork: 10080,
    // popup包含popup，actionSheet，keyboard，picker的值
    popup: 10075,
    mask: 10070,
    navbar: 980,
    topTips: 975,
    sticky: 970,
    indexListSticky: 965,
    tabbar: 998
  };
  function mitt(all) {
    all = all || /* @__PURE__ */ new Map();
    return {
      /**
       * A Map of event names to registered handler functions.
       */
      all,
      /**
       * Register an event handler for the given type.
       * @param {string|symbol} type Type of event to listen for, or `'*'` for all events
       * @param {Function} handler Function to call in response to given event
       * @memberOf mitt
       */
      on(type, handler) {
        const handlers = all.get(type);
        if (handlers) {
          handlers.push(handler);
        } else {
          all.set(type, [handler]);
        }
      },
      /**
       * Remove an event handler for the given type.
       * If `handler` is omitted, all handlers of the given type are removed.
       * @param {string|symbol} type Type of event to unregister `handler` from (`'*'` to remove a wildcard handler)
       * @param {Function} [handler] Handler function to remove
       * @memberOf mitt
       */
      off(type, handler) {
        const handlers = all.get(type);
        if (handlers) {
          if (handler) {
            handlers.splice(handlers.indexOf(handler) >>> 0, 1);
          } else {
            all.set(type, []);
          }
        }
      },
      /**
       * Invoke all handlers for the given type.
       * If present, `'*'` handlers are invoked after type-matched handlers.
       *
       * Note: Manually firing '*' handlers is not supported.
       *
       * @param {string|symbol} type The event type to invoke
       * @param {Any} [evt] Any value (object is recommended and powerful), passed to each handler
       * @memberOf mitt
       */
      emit(type, evt) {
        let handlers = all.get(type);
        if (handlers) {
          [...handlers].forEach((handler) => {
            handler(evt);
          });
        }
        handlers = all.get("*");
        if (handlers) {
          [...handlers].forEach((handler) => {
            handler(type, evt);
          });
        }
      },
      /**
       * Clear all
       */
      clear() {
        this.all.clear();
      }
    };
  }
  const IGNORE_REQUEST_KEYS = ["baseUrl", "meta"];
  class Request {
    constructor() {
      this.config = {
        baseUrl: "",
        // 请求的根域名
        header: {},
        // 默认的请求头
        method: "POST",
        // 请求方式
        dataType: "json",
        // 设置为json，返回后uni.request会对数据进行一次JSON.parse
        responseType: "text",
        // 此参数无需处理，因为5+和支付宝小程序不支持，默认为text即可
        timeout: 6e4,
        meta: {
          originalData: true,
          // 是否在拦截器中返回服务端的原始数据，见文档说明
          toast: false,
          // 是否在请求出错时，弹出toast
          loading: false
          // 是否显示加载中
        }
      };
      this.interceptor = {
        request: null,
        response: null
      };
    }
    /**
     * 将全局配置合并到本次请求的 options 中
     * - 忽略 IGNORE_REQUEST_KEYS 中的字段（如 meta）
     * - 对 header 使用深合并（全局 header 为默认，options.header 优先）
     * - 对对象类型的字段尝试深合并，基础类型以 options 值优先
     * - 处理 baseUrl：若存在全局 baseUrl 且 options.url 非完整 url（非 http 开头），则合并成完整 URL
     */
    mergeGlobalConfigToOptions(options) {
      const mergedOptions = { ...options };
      for (const key of Object.keys(this.config)) {
        if (IGNORE_REQUEST_KEYS.includes(key)) {
          continue;
        }
        const cfgVal = this.config[key];
        const optVal = options[key];
        if (cfgVal === void 0)
          continue;
        if (key === "header") {
          mergedOptions.header = deepMerge(cfgVal || {}, optVal || {});
          continue;
        }
        if (typeof cfgVal === "string" || typeof cfgVal === "number" || typeof cfgVal === "boolean") {
          mergedOptions[key] = optVal !== void 0 ? optVal : cfgVal;
          continue;
        }
        if (typeof cfgVal === "object" && !Array.isArray(cfgVal)) {
          mergedOptions[key] = deepMerge(cfgVal || {}, optVal || {});
          continue;
        }
        if (optVal === void 0) {
          mergedOptions[key] = cfgVal;
        }
      }
      const baseUrl = this.config.baseUrl;
      if (baseUrl && mergedOptions.url && typeof mergedOptions.url === "string" && mergedOptions.url.indexOf("http") !== 0) {
        mergedOptions.url = baseUrl + (mergedOptions.url.indexOf("/") === 0 ? mergedOptions.url : `/${mergedOptions.url}`);
      }
      if (!mergedOptions.url) {
        mergedOptions.url = "";
      }
      return mergedOptions;
    }
    /**
     * 设置全局默认配置
     * @param customConfig 自定义配置
     */
    setConfig(customConfig) {
      this.config = deepMerge(this.config, customConfig);
    }
    /**
     * 主要请求部分
     * @param options 请求参数
     */
    request(options) {
      const mergedMeta = {
        ...this.config.meta,
        ...options.meta || {}
      };
      options.meta = mergedMeta;
      options.url = options.url || "";
      options.params = options.params || {};
      options = this.mergeGlobalConfigToOptions(options);
      if (this.interceptor.request && typeof this.interceptor.request === "function") {
        const interceptorRequest = this.interceptor.request(options);
        if (!interceptorRequest) {
          return new Promise(() => {
          });
        }
        this.options = interceptorRequest;
      }
      return new Promise((resolve, reject) => {
        options.complete = (response) => {
          const meta = options.meta || this.config.meta || {};
          const originalData = meta.originalData ?? false;
          response.config = options;
          if (originalData) {
            if (this.interceptor.response && typeof this.interceptor.response === "function") {
              const resInterceptors = this.interceptor.response(response);
              if (resInterceptors !== false) {
                resolve(resInterceptors);
              } else {
                reject(response);
              }
            } else {
              resolve(response);
            }
          } else {
            if (response.statusCode === 200) {
              if (this.interceptor.response && typeof this.interceptor.response === "function") {
                const resInterceptors = this.interceptor.response(response.data);
                if (resInterceptors !== false) {
                  resolve(resInterceptors);
                } else {
                  reject(response.data);
                }
              } else {
                resolve(response.data);
              }
            } else {
              reject(response);
            }
          }
        };
        uni.request(options);
      });
    }
    get(url2, data = {}, options = {}) {
      return this.request({
        method: "GET",
        url: url2,
        data,
        header: options.header,
        meta: options.meta
      });
    }
    post(url2, data = {}, options = {}) {
      return this.request({
        url: url2,
        method: "POST",
        data,
        header: options.header,
        meta: options.meta
      });
    }
    put(url2, data = {}, options = {}) {
      return this.request({
        url: url2,
        method: "PUT",
        data,
        header: options.header,
        meta: options.meta
      });
    }
    delete(url2, data = {}, options = {}) {
      return this.request({
        url: url2,
        method: "DELETE",
        data,
        header: options.header,
        meta: options.meta
      });
    }
  }
  const httpInstance = new Request();
  const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
    trace: console.trace,
    table: console.table,
    time: console.time,
    timeEnd: console.timeEnd,
    group: console.group,
    groupEnd: console.groupEnd,
    groupCollapsed: console.groupCollapsed,
    assert: console.assert,
    clear: console.clear,
    count: console.count,
    countReset: console.countReset
  };
  Object.keys(originalConsole).forEach((key) => {
    const methodKey = key;
    if (!originalConsole[methodKey]) {
      originalConsole[methodKey] = () => {
      };
    }
  });
  class Logger {
    constructor() {
      this.debugMode = false;
      this.prefix = "[uViewPro]";
      this.showCallerInfo = true;
    }
    /**
     * 设置调试模式
     * @param enabled 是否启用调试模式
     */
    setDebugMode(enabled) {
      this.debugMode = !!enabled;
      if (this.debugMode) {
        formatAppLog("log", "at uni_modules/uview-pro/libs/util/logger.ts:64", "[uViewPro] Debug mode enabled");
      } else {
        formatAppLog("log", "at uni_modules/uview-pro/libs/util/logger.ts:66", "[uViewPro] Debug mode disabled");
      }
      return this;
    }
    /**
     * 设置是否显示调用者信息（文件名和行号）
     * @param show 是否显示调用者信息
     */
    setShowCallerInfo(show) {
      this.showCallerInfo = !!show;
      return this;
    }
    /**
     * 设置日志前缀
     * @param prefix 日志前缀
     */
    setPrefix(prefix) {
      if (prefix)
        this.prefix = prefix;
      return this;
    }
    /**
     * 获取当前调试模式状态
     * @returns 当前调试模式状态
     */
    getDebugMode() {
      return this.debugMode;
    }
    /**
     * 从文件路径中提取纯净的文件名（去除查询参数和路径）
     * @param filePath 文件路径
     * @returns 纯净的文件名
     */
    extractFileName(filePath) {
      if (!filePath)
        return "";
      const withoutQuery = filePath.split("?")[0];
      const parts = withoutQuery.split(/[/\\]/);
      const fileNameWithExt = parts.pop() || "";
      return fileNameWithExt;
    }
    /**
     * 获取调用者信息（文件名和行号）
     * @returns 调用者信息字符串
     */
    getCallerInfo() {
      if (!this.showCallerInfo)
        return "";
      try {
        const error = new Error();
        const stack = error.stack;
        if (!stack)
          return "";
        const stackLines = stack.split("\n");
        for (let i = 3; i < stackLines.length; i++) {
          const line = stackLines[i].trim();
          if (line && !line.includes("logger.ts") && !line.includes("Logger.") && !line.includes("at Object.")) {
            const match = line.match(/\(?(.*):(\d+):(\d+)\)?/);
            if (match) {
              const filePath = match[1];
              const lineNumber = match[2];
              const fileName = this.extractFileName(filePath);
              return `[${fileName}:${lineNumber}]`;
            }
            break;
          }
        }
      } catch (e) {
      }
      return "";
    }
    /**
     * 通用日志输出方法
     * @param level 日志级别
     * @param args 日志参数
     */
    output(level, ...args) {
      if (!this.debugMode || !originalConsole[level])
        return;
      const method = originalConsole[level];
      const callerInfo = this.getCallerInfo();
      if (this.prefix) {
        if (callerInfo) {
          method(`${this.prefix}${callerInfo}`, ...args);
        } else {
          method(this.prefix, ...args);
        }
      } else {
        if (callerInfo) {
          method(callerInfo, ...args);
        } else {
          method(...args);
        }
      }
    }
    /**
     * 普通日志
     * @param args 日志参数
     */
    log(...args) {
      this.output("log", ...args);
    }
    /**
     * 信息日志
     * @param args 日志参数
     */
    info(...args) {
      this.output("info", ...args);
    }
    /**
     * 警告日志
     * @param args 日志参数
     */
    warn(...args) {
      this.output("warn", ...args);
    }
    /**
     * 错误日志
     * @param args 日志参数
     */
    error(...args) {
      this.output("error", ...args);
    }
    /**
     * 调试日志
     * @param args 日志参数
     */
    debug(...args) {
      if (!originalConsole.debug)
        return;
      this.output("debug", ...args);
    }
    /**
     * 堆栈跟踪
     * @param args 日志参数
     */
    trace(...args) {
      if (!originalConsole.trace)
        return;
      this.output("trace", ...args);
    }
    /**
     * 表格输出
     * @param data 表格数据
     * @param columns 列名（可选）
     */
    table(data, columns) {
      if (!this.debugMode || !originalConsole.table)
        return;
      if (this.prefix) {
        originalConsole.log(this.prefix);
      }
      originalConsole.table(data, columns);
    }
    /**
     * 开始计时
     * @param label 计时器标签
     */
    time(label) {
      if (!this.debugMode || !originalConsole.time)
        return;
      const fullLabel = this.prefix ? `${this.prefix} ${label}` : label;
      originalConsole.time(fullLabel);
    }
    /**
     * 结束计时
     * @param label 计时器标签
     */
    timeEnd(label) {
      if (!this.debugMode || !originalConsole.timeEnd)
        return;
      const fullLabel = this.prefix ? `${this.prefix} ${label}` : label;
      originalConsole.timeEnd(fullLabel);
    }
    /**
     * 分组日志
     * @param label 分组标签
     */
    group(label) {
      if (!this.debugMode || !originalConsole.group)
        return;
      const fullLabel = this.prefix ? `${this.prefix} ${label}` : label;
      originalConsole.group(fullLabel);
    }
    /**
     * 结束分组
     */
    groupEnd() {
      if (!this.debugMode || !originalConsole.groupEnd)
        return;
      originalConsole.groupEnd();
    }
    /**
     * 分组日志（默认折叠）
     * @param label 分组标签
     */
    groupCollapsed(label) {
      if (!this.debugMode || !originalConsole.groupCollapsed)
        return;
      const fullLabel = this.prefix ? `${this.prefix} ${label}` : label;
      originalConsole.groupCollapsed(fullLabel);
    }
    /**
     * 断言
     * @param condition 条件
     * @param message 错误消息
     */
    assert(condition, ...message) {
      if (!this.debugMode || !originalConsole.assert)
        return;
      if (this.prefix) {
        originalConsole.assert(condition, this.prefix, ...message);
      } else {
        originalConsole.assert(condition, ...message);
      }
    }
    /**
     * 清空控制台
     */
    clear() {
      if (!this.debugMode || !originalConsole.clear)
        return;
      originalConsole.clear();
    }
    /**
     * 计数器
     * @param label 计数器标签
     */
    count(label) {
      if (!this.debugMode || !originalConsole.count)
        return;
      const fullLabel = this.prefix && label ? `${this.prefix} ${label}` : label || this.prefix;
      originalConsole.count(fullLabel);
    }
    /**
     * 重置计数器
     * @param label 计数器标签
     */
    countReset(label) {
      if (!this.debugMode || !originalConsole.countReset)
        return;
      const fullLabel = this.prefix && label ? `${this.prefix} ${label}` : label || this.prefix;
      originalConsole.countReset(fullLabel);
    }
    /**
     * 带样式的日志
     * @param style CSS样式
     * @param message 消息内容
     */
    styled(style, message) {
      if (!this.debugMode)
        return;
      const callerInfo = this.getCallerInfo();
      const fullMessage = callerInfo ? `${message} ${callerInfo}` : message;
      if (this.prefix) {
        formatAppLog("log", "at uni_modules/uview-pro/libs/util/logger.ts:353", `%c${this.prefix} ${fullMessage}`, style);
      } else {
        formatAppLog("log", "at uni_modules/uview-pro/libs/util/logger.ts:355", `%c${fullMessage}`, style);
      }
    }
  }
  const logger = new Logger();
  configProvider.themesRef;
  configProvider.currentThemeRef;
  configProvider.darkModeRef;
  function initTheme(themes, defaultConfig, isForce) {
    if (Array.isArray(themes) && themes.length > 0) {
      configProvider.initTheme(themes, defaultConfig, isForce);
      return;
    }
    configProvider.initTheme(defaultThemes, defaultConfig);
  }
  function formatPrice(number2, decimals = 0, decimalPoint = ".", thousandsSeparator = ",") {
    function round(num, precision) {
      const factor = Math.pow(10, precision);
      return (Math.round(num * factor) / factor).toFixed(precision);
    }
    let numStr = String(number2).replace(/[^0-9+\-Ee.]/g, "");
    const n = !isFinite(+numStr) ? 0 : +numStr;
    const prec = !isFinite(+decimals) ? 0 : Math.abs(decimals);
    const sep = thousandsSeparator ?? ",";
    const dec = decimalPoint ?? ".";
    let s = [];
    s = (prec ? round(n, prec) : Math.round(n).toString()).split(".");
    const re = /(-?\d+)(\d{3})/;
    while (re.test(s[0])) {
      s[0] = s[0].replace(re, `$1${sep}$2`);
    }
    if ((s[1] || "").length < prec) {
      s[1] = s[1] || "";
      s[1] += "0".repeat(prec - s[1].length);
    }
    return s.join(dec);
  }
  function formatName(name) {
    if (name.length === 2) {
      return name.charAt(0) + "*";
    } else if (name.length > 2) {
      const masked = "*".repeat(name.length - 2);
      return name.charAt(0) + masked + name.charAt(name.length - 1);
    } else {
      return name;
    }
  }
  function addStyle(customStyle, target = "object") {
    if (test.empty(customStyle) || typeof customStyle === "object" && target === "object" || target === "string" && typeof customStyle === "string") {
      return customStyle;
    }
    if (target === "object") {
      const trimmedStyle = trim(customStyle);
      const styleArray = trimmedStyle.split(";");
      const style = {};
      for (let i = 0; i < styleArray.length; i++) {
        if (styleArray[i]) {
          const item = styleArray[i].split(":");
          if (item.length === 2) {
            style[trim(item[0])] = trim(item[1]);
          }
        }
      }
      return style;
    }
    let string2 = "";
    for (const i in customStyle) {
      if (Object.prototype.hasOwnProperty.call(customStyle, i)) {
        const key = i.replace(/([A-Z])/g, "-$1").toLowerCase();
        string2 += `${key}:${customStyle[i]};`;
      }
    }
    return trim(string2);
  }
  function toStyle(...styles) {
    if (styles.length === 1 && Array.isArray(styles[0])) {
      styles = styles[0].slice();
    }
    const map = /* @__PURE__ */ new Map();
    const processString = (str) => {
      if (!str)
        return;
      const parts = str.split(";");
      for (let part of parts) {
        part = part.trim();
        if (!part)
          continue;
        const idx = part.indexOf(":");
        if (idx === -1)
          continue;
        const key = trim(part.slice(0, idx));
        const val = trim(part.slice(idx + 1));
        if (key === "" || val === "")
          continue;
        const k = kebabCase(key);
        map.set(k, val);
      }
    };
    const processObject = (obj) => {
      if (!obj)
        return;
      Object.keys(obj).forEach((key) => {
        const val = obj[key];
        if (val == null || val === "")
          return;
        const k = kebabCase(key);
        map.set(k, val);
      });
    };
    for (const item of styles) {
      if (item == null || item === "")
        continue;
      if (test.string(item)) {
        processString(item);
      } else if (test.array(item)) {
        item.forEach((el) => {
          if (test.string(el))
            processString(el);
          else if (test.object(el))
            processObject(el);
        });
      } else if (test.object(item)) {
        processObject(item);
      }
    }
    if (map.size === 0)
      return "";
    const result = Array.from(map.entries()).map(([k, v]) => `${k}:${String(v)}`).join(";");
    return result ? result.endsWith(";") ? result : result + ";" : "";
  }
  function kebabCase(word) {
    const newWord = word.replace(/[A-Z]/g, function(match) {
      return "-" + match;
    }).toLowerCase();
    return newWord;
  }
  function sleep(value = 30) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, value);
    });
  }
  const $u = {
    queryParams,
    route,
    timeFormat,
    date: timeFormat,
    // 另名date
    timeFrom,
    colorGradient: colorGradients.colorGradient,
    colorToRgba: colorGradients.colorToRgba,
    guid,
    color,
    getColor,
    setColor,
    sys,
    os,
    type2icon,
    randomArray,
    hexToRgb: colorGradients.hexToRgb,
    rgbToHex: colorGradients.rgbToHex,
    test,
    random,
    deepClone,
    deepMerge,
    getParent,
    $parent,
    clipboard,
    addUnit,
    trim,
    type: ["primary", "success", "error", "warning", "info"],
    http: httpInstance,
    toast,
    config,
    // uView配置信息相关，比如版本号
    zIndex,
    debounce,
    throttle,
    mitt: mitt(),
    getRect,
    formatPrice,
    formatName,
    addStyle,
    toStyle,
    kebabCase,
    sleep
  };
  const install = (app, options) => {
    var _a2, _b2, _c;
    try {
      if (options) {
        if (options == null ? void 0 : options.theme) {
          const optTheme = options.theme;
          if (Array.isArray(optTheme)) {
            initTheme(optTheme);
          } else if (typeof optTheme === "object" && optTheme.themes) {
            initTheme(
              optTheme.themes,
              {
                defaultTheme: optTheme.defaultTheme,
                defaultDarkMode: optTheme.defaultDarkMode
              },
              optTheme.isForce
            );
          } else {
            const defaultTheme = defaultThemes[0];
            if (defaultTheme) {
              const mergedTheme = {
                ...defaultTheme,
                color: {
                  ...defaultTheme.color,
                  ...optTheme
                }
              };
              initTheme([mergedTheme], defaultTheme.name);
            }
          }
        } else {
          initTheme();
        }
        try {
          if (options == null ? void 0 : options.locale) {
            const optLocale = options.locale;
            if (typeof optLocale === "string") {
              configProvider.initLocales(void 0, optLocale);
            } else if (Array.isArray(optLocale)) {
              configProvider.initLocales(optLocale);
            } else if (optLocale && typeof optLocale === "object") {
              configProvider.initLocales(optLocale.locales, optLocale.defaultLocale, optLocale.isForce);
            } else {
              configProvider.initLocales();
            }
          } else {
            configProvider.initLocales();
          }
        } catch (e) {
          formatAppLog("error", "at uni_modules/uview-pro/index.ts:74", "[install locales] Error:", e);
        }
        logger.setDebugMode(((_a2 = options == null ? void 0 : options.log) == null ? void 0 : _a2.debug) ?? false).setPrefix((_b2 = options == null ? void 0 : options.log) == null ? void 0 : _b2.prefix).setShowCallerInfo(((_c = options == null ? void 0 : options.log) == null ? void 0 : _c.showCallerInfo) ?? true);
      } else {
        initTheme();
      }
    } catch (error) {
      formatAppLog("error", "at uni_modules/uview-pro/index.ts:86", "[install options] Error:", error);
    }
    uni.$u = $u;
    app.config.globalProperties.$u = $u;
  };
  const uViewPro = {
    install
  };
  const stringProp = (defaultVal) => ({
    type: String,
    default: defaultVal
  });
  const stringOrObjectProp = (defaultVal) => ({
    type: [String, Object],
    default: defaultVal
  });
  const baseProps = {
    /**
     * 自定义根节点样式
     */
    customStyle: stringOrObjectProp(""),
    /**
     * 自定义根节点样式类
     */
    customClass: stringProp("")
  };
  const IconProps = {
    ...baseProps,
    /** 图标名称，见示例图标集 */
    name: { type: String, default: "" },
    /** 图标颜色，可接受主题色 */
    color: { type: String, default: "" },
    /** 字体大小，单位rpx（默认32） */
    size: { type: [Number, String], default: "inherit" },
    /** 是否显示粗体 */
    bold: { type: Boolean, default: false },
    /** 点击图标的时候传递事件出去的index（用于区分点击了哪一个） */
    index: { type: [Number, String], default: "" },
    /** 触摸图标时的类名 */
    hoverClass: { type: String, default: "" },
    /** 自定义扩展前缀，方便用户扩展自己的图标库 */
    customPrefix: { type: String, default: "uicon" },
    /** 图标右边或者下面的文字 */
    label: { type: [String, Number], default: "" },
    /** label的位置，只能右边或者下边 */
    labelPos: { type: String, default: "right" },
    /** label的大小，单位rpx（默认28） */
    labelSize: { type: [String, Number], default: "28" },
    /** label的颜色 */
    labelColor: { type: String, default: "var(--u-content-color)" },
    /** label与图标的距离(横向排列)，单位rpx（默认6） */
    marginLeft: { type: [String, Number], default: "6" },
    /** label与图标的距离(竖向排列)，单位rpx（默认6） */
    marginTop: { type: [String, Number], default: "6" },
    /** label与图标的距离(竖向排列)，单位rpx（默认6） */
    marginRight: { type: [String, Number], default: "6" },
    /** label与图标的距离(竖向排列)，单位rpx（默认6） */
    marginBottom: { type: [String, Number], default: "6" },
    /** label与图标的距离，单位rpx，权重高于 margin */
    space: { type: [String, Number], default: "" },
    /** 图片的mode，参考uni-app image组件 */
    imgMode: { type: String, default: "widthFix" },
    /** 用于显示图片小图标时，图片的宽度，单位rpx */
    width: { type: [String, Number], default: "" },
    /** 用于显示图片小图标时，图片的高度，单位rpx */
    height: { type: [String, Number], default: "" },
    /** 用于解决某些情况下，让图标垂直居中的用途，单位rpx */
    top: { type: [String, Number], default: 0 },
    /** 是否为DecimalIcon */
    showDecimalIcon: { type: Boolean, default: false },
    /** 背景颜色，可接受主题色，仅Decimal时有效 */
    inactiveColor: { type: String, default: "var(--u-divider-color)" },
    /** 显示的百分比，仅Decimal时有效 */
    percent: { type: [Number, String], default: "50" }
  };
  const __default__$4 = {
    name: "u-icon",
    options: {
      addGlobalClass: true,
      virtualHost: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$b = /* @__PURE__ */ vue.defineComponent({
    ...__default__$4,
    props: IconProps,
    emits: ["click", "touchstart"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const emit = __emit;
      const props = __props;
      const iconClass = vue.computed(() => {
        let classes = [];
        classes.push(props.customPrefix + "-" + props.name);
        if (props.customPrefix === "uicon") {
          classes.push("u-iconfont");
        } else {
          classes.push(props.customPrefix);
        }
        if (props.showDecimalIcon && props.inactiveColor && $u.config.type.includes(props.inactiveColor)) {
          classes.push("u-icon__icon--" + props.inactiveColor);
        } else if (props.color && $u.config.type.includes(props.color)) {
          classes.push("u-icon__icon--" + props.color);
        }
        return classes;
      });
      const iconStyle = vue.computed(() => {
        const style = {
          fontSize: props.size === "inherit" ? "inherit" : $u.addUnit(props.size),
          fontWeight: props.bold ? "bold" : "normal",
          // 某些特殊情况需要设置一个到顶部的距离，才能更好的垂直居中
          top: $u.addUnit(props.top)
        };
        if (props.showDecimalIcon && props.inactiveColor && !$u.config.type.includes(props.inactiveColor)) {
          style.color = props.inactiveColor;
        } else if (props.color && !$u.config.type.includes(props.color)) {
          style.color = props.color;
        }
        return style;
      });
      const isImg = vue.computed(() => {
        return props.name.indexOf("/") !== -1;
      });
      const imgStyle = vue.computed(() => {
        const style = {
          width: props.width ? $u.addUnit(props.width) : $u.addUnit(props.size),
          height: props.height ? $u.addUnit(props.height) : $u.addUnit(props.size)
        };
        return style;
      });
      const decimalIconStyle = vue.computed(() => {
        const style = {
          fontSize: props.size === "inherit" ? "inherit" : $u.addUnit(props.size),
          fontWeight: props.bold ? "bold" : "normal",
          // 某些特殊情况需要设置一个到顶部的距离，才能更好的垂直居中
          top: $u.addUnit(props.top),
          width: props.percent + "%"
        };
        if (props.color && !$u.config.type.includes(props.color)) {
          style.color = props.color;
        }
        return style;
      });
      const decimalIconClass = vue.computed(() => {
        let classes = [];
        classes.push(props.customPrefix + "-" + props.name);
        if (props.customPrefix === "uicon") {
          classes.push("u-iconfont");
        } else {
          classes.push(props.customPrefix);
        }
        if (props.color && $u.config.type.includes(props.color)) {
          classes.push("u-icon__icon--" + props.color);
        } else {
          classes.push("u-icon__icon--primary");
        }
        return classes;
      });
      const labelStyle = vue.computed(() => {
        return {
          color: props.labelColor,
          fontSize: $u.addUnit(props.labelSize),
          marginLeft: props.labelPos === "right" ? $u.addUnit(props.space || props.marginLeft) : 0,
          marginTop: props.labelPos === "bottom" ? $u.addUnit(props.space || props.marginTop) : 0,
          marginRight: props.labelPos === "left" ? $u.addUnit(props.space || props.marginRight) : 0,
          marginBottom: props.labelPos === "top" ? $u.addUnit(props.space || props.marginBottom) : 0
        };
      });
      function onClick(event) {
        emit("click", props.index || event);
      }
      function onTouchstart(event) {
        emit("touchstart", props.index || event);
      }
      const __returned__ = { emit, props, iconClass, iconStyle, isImg, imgStyle, decimalIconStyle, decimalIconClass, labelStyle, onClick, onTouchstart, get $u() {
        return $u;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  function _sfc_render$a(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        style: vue.normalizeStyle($setup.$u.toStyle(_ctx.customStyle)),
        class: vue.normalizeClass(["u-icon", ["u-icon--" + _ctx.labelPos, _ctx.customClass]]),
        onClick: $setup.onClick
      },
      [
        $setup.isImg ? (vue.openBlock(), vue.createElementBlock("image", {
          key: 0,
          class: "u-icon__img",
          src: $setup.props.name,
          mode: _ctx.imgMode,
          style: vue.normalizeStyle([$setup.imgStyle])
        }, null, 12, ["src", "mode"])) : (vue.openBlock(), vue.createElementBlock("text", {
          key: 1,
          class: vue.normalizeClass(["u-icon__icon", $setup.iconClass]),
          style: vue.normalizeStyle($setup.$u.toStyle($setup.iconStyle)),
          "hover-class": _ctx.hoverClass,
          onTouchstart: $setup.onTouchstart
        }, [
          _ctx.showDecimalIcon ? (vue.openBlock(), vue.createElementBlock("text", {
            key: 0,
            style: vue.normalizeStyle($setup.$u.toStyle($setup.decimalIconStyle)),
            class: vue.normalizeClass([$setup.decimalIconClass, "u-icon__decimal"]),
            "hover-class": _ctx.hoverClass
          }, null, 14, ["hover-class"])) : vue.createCommentVNode("v-if", true)
        ], 46, ["hover-class"])),
        _ctx.label !== "" ? (vue.openBlock(), vue.createElementBlock(
          "text",
          {
            key: 2,
            class: "u-icon__label",
            style: vue.normalizeStyle($setup.labelStyle)
          },
          vue.toDisplayString(_ctx.label),
          5
          /* TEXT, STYLE */
        )) : vue.createCommentVNode("v-if", true)
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_0$1 = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["render", _sfc_render$a], ["__scopeId", "data-v-b4d1c4b2"], ["__file", "/Users/zhangzan/zhangruibo/uniapp-worB/uni_modules/uview-pro/components/u-icon/u-icon.vue"]]);
  const ButtonProps = {
    ...baseProps,
    /** 是否细边框 */
    hairLine: { type: Boolean, default: true },
    /** 按钮的预置样式，default，primary，error，warning，success */
    type: { type: String, default: "default" },
    /** 按钮尺寸，default，medium，mini */
    size: { type: String, default: "default" },
    /** 按钮形状，circle（两边为半圆），square（带圆角） */
    shape: { type: String, default: "square" },
    /** 按钮是否镂空 */
    plain: { type: Boolean, default: false },
    /** 是否禁止状态 */
    disabled: { type: Boolean, default: false },
    /** 是否加载中 */
    loading: { type: Boolean, default: false },
    /** 支付宝小程序，当 open-type 为 getAuthorize 时有效 */
    scope: { type: String, default: "" },
    /** 开放能力，具体请看uniapp稳定关于button组件部分说明 */
    openType: { type: String, default: "" },
    /** 用于 <form> 组件，点击分别会触发 <form> 组件的 submit/reset 事件 */
    formType: { type: String, default: "" },
    /** 打开 APP 时，向 APP 传递的参数，open-type=launchApp时有效 */
    appParameter: { type: String, default: "" },
    /** 指定是否阻止本节点的祖先节点出现点击态，微信小程序有效 */
    hoverStopPropagation: { type: Boolean, default: false },
    /** 指定返回用户信息的语言，zh_CN 简体中文，zh_TW 繁体中文，en 英文。只微信小程序有效 */
    lang: { type: String, default: "en" },
    /** 会话来源，open-type="contact"时有效。只微信小程序有效 */
    sessionFrom: { type: String, default: "" },
    /** 会话内消息卡片标题，open-type="contact"时有效 */
    sendMessageTitle: { type: String, default: "" },
    /** 会话内消息卡片点击跳转小程序路径，open-type="contact"时有效 */
    sendMessagePath: { type: String, default: "" },
    /** 会话内消息卡片图片，open-type="contact"时有效 */
    sendMessageImg: { type: String, default: "" },
    /** 是否显示会话内消息卡片，open-type="contact"时有效 */
    showMessageCard: { type: Boolean, default: false },
    /** 手指按（触摸）按钮时按钮时的背景颜色 */
    hoverBgColor: { type: String, default: "" },
    /** 水波纹的背景颜色 */
    rippleBgColor: { type: String, default: "" },
    /** 是否开启水波纹效果 */
    ripple: { type: Boolean, default: false },
    /** 按下的类名 */
    hoverClass: { type: String, default: "" },
    /** 额外传参参数，用于小程序的data-xxx属性，通过target.dataset.name获取 */
    dataName: { type: String, default: "" },
    /** 节流，一定时间内只能触发一次 */
    throttleTime: { type: [String, Number], default: 0 },
    /** 按住后多久出现点击态，单位毫秒 */
    hoverStartTime: { type: [String, Number], default: 20 },
    /** 手指松开后点击态保留时间，单位毫秒 */
    hoverStayTime: { type: [String, Number], default: 150 }
  };
  const __default__$3 = {
    name: "u-button",
    options: {
      addGlobalClass: true,
      virtualHost: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$a = /* @__PURE__ */ vue.defineComponent({
    ...__default__$3,
    props: ButtonProps,
    emits: [
      "click",
      "getuserinfo",
      "contact",
      "getphonenumber",
      "error",
      "launchapp",
      "opensetting",
      "chooseavatar",
      "agreeprivacyauthorization"
    ],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const emit = __emit;
      const props = __props;
      const rippleTop = vue.ref(0);
      const rippleLeft = vue.ref(0);
      const fields = vue.ref({});
      const waveActive = vue.ref(false);
      const getHoverClass = vue.computed(() => {
        if (props.loading || props.disabled || props.ripple)
          return "";
        if (props.hoverClass)
          return props.hoverClass;
        let hoverClass = "";
        hoverClass = props.plain ? "u-" + props.type + "-plain-hover" : "u-" + props.type + "-hover";
        return hoverClass;
      });
      const showHairLineBorder = vue.computed(() => {
        if (["primary", "success", "error", "warning"].indexOf(props.type) >= 0 && !props.plain) {
          return "";
        } else {
          return "u-hairline-border";
        }
      });
      function click(e) {
        if (Number(props.throttleTime)) {
          $u.throttle(() => {
            clickAction(e);
          }, Number(props.throttleTime));
        } else {
          clickAction(e);
        }
      }
      function clickAction(e) {
        if (props.loading === true || props.disabled === true)
          return;
        if (props.ripple) {
          waveActive.value = false;
          vue.nextTick(() => {
            getWaveQuery(e);
          });
        }
        emit("click", e);
      }
      function getWaveQuery(e) {
        getElQuery().then((res) => {
          let data = res[0];
          if (!data.width || !data.width)
            return;
          data.targetWidth = data.height > data.width ? data.height : data.width;
          if (!data.targetWidth)
            return;
          fields.value = data;
          let touchesX = "", touchesY = "";
          touchesX = e.touches[0].clientX;
          touchesY = e.touches[0].clientY;
          rippleTop.value = Number(touchesY) - data.top - data.targetWidth / 2;
          rippleLeft.value = Number(touchesX) - data.left - data.targetWidth / 2;
          vue.nextTick(() => {
            waveActive.value = true;
          });
        });
      }
      function getElQuery() {
        return new Promise((resolve) => {
          let queryInfo = "";
          queryInfo = uni.createSelectorQuery().in(null);
          queryInfo.select(".u-btn").boundingClientRect();
          queryInfo.exec((data) => {
            resolve(data);
          });
        });
      }
      function getphonenumber(event) {
        emit("getphonenumber", event);
      }
      function getuserinfo(event) {
        emit("getuserinfo", event);
      }
      function error(event) {
        emit("error", event);
      }
      function opensetting(event) {
        emit("opensetting", event);
      }
      function launchapp(event) {
        emit("launchapp", event);
      }
      function getAuthorize(event) {
        if (props.scope === "phoneNumber") {
          getphonenumber(event);
        } else if (props.scope === "userInfo") {
          getuserinfo(event);
        }
      }
      function contact(event) {
        emit("contact", event);
      }
      function chooseavatar(event) {
        emit("chooseavatar", event);
      }
      function agreeprivacyauthorization(event) {
        emit("agreeprivacyauthorization", event);
      }
      const __returned__ = { emit, props, rippleTop, rippleLeft, fields, waveActive, getHoverClass, showHairLineBorder, click, clickAction, getWaveQuery, getElQuery, getphonenumber, getuserinfo, error, opensetting, launchapp, getAuthorize, contact, chooseavatar, agreeprivacyauthorization, get $u() {
        return $u;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("button", {
      id: "u-wave-btn",
      class: vue.normalizeClass(["u-btn u-line-1 u-fix-ios-appearance", [
        "u-size-" + _ctx.size,
        _ctx.plain ? "u-btn--" + _ctx.type + "--plain" : "",
        _ctx.loading ? "u-loading" : "",
        _ctx.shape === "circle" ? "u-round-circle" : "",
        _ctx.hairLine ? $setup.showHairLineBorder : "u-btn--bold-border",
        "u-btn--" + _ctx.type,
        _ctx.disabled ? `u-btn--${_ctx.type}--disabled` : "",
        _ctx.customClass
      ]]),
      "hover-start-time": Number(_ctx.hoverStartTime),
      "hover-stay-time": Number(_ctx.hoverStayTime),
      disabled: _ctx.disabled,
      "form-type": _ctx.formType,
      "open-type": _ctx.disabled || _ctx.loading ? void 0 : _ctx.openType,
      "app-parameter": _ctx.appParameter,
      "hover-stop-propagation": _ctx.hoverStopPropagation,
      "send-message-title": _ctx.sendMessageTitle,
      "send-message-path": "sendMessagePath",
      lang: _ctx.lang,
      "data-name": _ctx.dataName,
      "session-from": _ctx.sessionFrom,
      "send-message-img": _ctx.sendMessageImg,
      "show-message-card": _ctx.showMessageCard,
      "on:getAuthorize": $setup.getAuthorize,
      onGetuserinfo: $setup.getuserinfo,
      onContact: $setup.contact,
      onGetphonenumber: $setup.getphonenumber,
      onError: $setup.error,
      onLaunchapp: $setup.launchapp,
      onOpensetting: $setup.opensetting,
      onChooseavatar: $setup.chooseavatar,
      onAgreeprivacyauthorization: $setup.agreeprivacyauthorization,
      style: vue.normalizeStyle(
        $setup.$u.toStyle(
          {
            overflow: _ctx.ripple ? "hidden" : "visible"
          },
          _ctx.customStyle
        )
      ),
      onClick: _cache[0] || (_cache[0] = vue.withModifiers(($event) => $setup.click($event), ["stop"])),
      "hover-class": $setup.getHoverClass,
      loading: _ctx.loading
    }, [
      vue.renderSlot(_ctx.$slots, "default", {}, void 0, true),
      _ctx.ripple ? (vue.openBlock(), vue.createElementBlock(
        "view",
        {
          key: 0,
          class: vue.normalizeClass(["u-wave-ripple", [$setup.waveActive ? "u-wave-active" : ""]]),
          style: vue.normalizeStyle({
            top: $setup.rippleTop + "px",
            left: $setup.rippleLeft + "px",
            width: $setup.fields.targetWidth + "px",
            height: $setup.fields.targetWidth + "px",
            "background-color": _ctx.rippleBgColor || "rgba(0, 0, 0, 0.15)"
          })
        },
        null,
        6
        /* CLASS, STYLE */
      )) : vue.createCommentVNode("v-if", true)
    ], 46, ["hover-start-time", "hover-stay-time", "disabled", "form-type", "open-type", "app-parameter", "hover-stop-propagation", "send-message-title", "lang", "data-name", "session-from", "send-message-img", "show-message-card", "hover-class", "loading"]);
  }
  const __easycom_1 = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$9], ["__scopeId", "data-v-a44cf897"], ["__file", "/Users/zhangzan/zhangruibo/uniapp-worB/uni_modules/uview-pro/components/u-button/u-button.vue"]]);
  const MaskProps = {
    ...baseProps,
    /** 是否显示遮罩 */
    show: {
      type: Boolean,
      default: false
    },
    /** 层级z-index */
    zIndex: {
      type: [Number, String],
      default: ""
    },
    /** 遮罩的动画样式，是否使用zoom进行scale进行缩放 */
    zoom: {
      type: Boolean,
      default: true
    },
    /** 遮罩的过渡时间，单位为ms */
    duration: {
      type: [Number, String],
      default: 300
    },
    /** 是否可以通过点击遮罩进行关闭 */
    maskClickAble: {
      type: Boolean,
      default: true
    }
  };
  const __default__$2 = {
    name: "u-mask",
    options: {
      addGlobalClass: true,
      virtualHost: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$9 = /* @__PURE__ */ vue.defineComponent({
    ...__default__$2,
    props: MaskProps,
    emits: ["click"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const props = __props;
      const emit = __emit;
      const zoomStyle = vue.ref({ transform: "" });
      const scale = "scale(1.2, 1.2)";
      vue.watch(
        () => props.show,
        (n) => {
          if (n && props.zoom) {
            zoomStyle.value.transform = "scale(1, 1)";
          } else if (!n && props.zoom) {
            zoomStyle.value.transform = scale;
          }
        }
      );
      const maskStyle = vue.computed(() => {
        let style = {};
        style.backgroundColor = "rgba(0, 0, 0, 0.6)";
        if (props.show)
          style.zIndex = props.zIndex ? props.zIndex : $u.zIndex.mask;
        else
          style.zIndex = -1;
        style.transition = `all ${Number(props.duration) / 1e3}s ease-in-out`;
        return style;
      });
      function click() {
        if (!props.maskClickAble)
          return;
        emit("click");
      }
      const __returned__ = { props, emit, zoomStyle, scale, maskStyle, click, get $u() {
        return $u;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["u-mask", [
          {
            "u-mask-zoom": $setup.props.zoom,
            "u-mask-show": $setup.props.show
          },
          _ctx.customClass
        ]]),
        "hover-stop-propagation": "",
        style: vue.normalizeStyle($setup.$u.toStyle($setup.maskStyle, $setup.zoomStyle, _ctx.customStyle)),
        onClick: $setup.click,
        onTouchmove: vue.withModifiers(() => {
        }, ["stop", "prevent"])
      },
      [
        vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ],
      38
      /* CLASS, STYLE, NEED_HYDRATION */
    );
  }
  const __easycom_0 = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$8], ["__scopeId", "data-v-44024954"], ["__file", "/Users/zhangzan/zhangruibo/uniapp-worB/uni_modules/uview-pro/components/u-mask/u-mask.vue"]]);
  const PopupProps = {
    ...baseProps,
    /** 显示状态 */
    show: { type: Boolean, default: false },
    /** 弹出方向，left|right|top|bottom|center */
    mode: { type: String, default: "left" },
    /** 是否显示遮罩 */
    mask: { type: Boolean, default: true },
    /** 抽屉的宽度(mode=left|right)，或者高度(mode=top|bottom)，单位rpx，或者"auto"，或者百分比"50%"，表示由内容撑开高度或者宽度 */
    length: { type: [Number, String], default: "auto" },
    /** 是否开启缩放动画，只在mode=center时有效 */
    zoom: { type: Boolean, default: true },
    /** 是否开启底部安全区适配，开启的话，会在iPhoneX机型底部添加一定的内边距 */
    safeAreaInsetBottom: { type: Boolean, default: false },
    /** 是否可以通过点击遮罩进行关闭 */
    maskCloseAble: { type: Boolean, default: true },
    /** v-model 控制弹窗显示 */
    modelValue: { type: Boolean, default: false },
    /** 内部参数，解决多层调用报错不能修改props值的问题 */
    popup: { type: Boolean, default: true },
    /** 圆角 */
    borderRadius: { type: [Number, String], default: 0 },
    /** 弹窗z-index */
    zIndex: { type: [Number, String], default: zIndex.popup },
    /** 是否显示关闭图标 */
    closeable: { type: Boolean, default: false },
    /** 关闭图标的名称，只能uView的内置图标 */
    closeIcon: { type: String, default: "close" },
    /** 自定义关闭图标位置，top-left为左上角，top-right为右上角，bottom-left为左下角，bottom-right为右下角 */
    closeIconPos: { type: String, default: "top-right" },
    /** 关闭图标的颜色 */
    closeIconColor: { type: String, default: "var(--u-tips-color)" },
    /** 关闭图标的大小，单位rpx */
    closeIconSize: { type: [String, Number], default: "30" },
    /** 弹窗宽度 */
    width: { type: String, default: "" },
    /** 弹窗高度 */
    height: { type: String, default: "" },
    /** 负top定位，支持rpx/px/百分比 */
    negativeTop: { type: [String, Number], default: 0 },
    /** 遮罩自定义样式 */
    maskCustomStyle: { type: Object, default: () => ({}) },
    /** 动画时长，单位ms */
    duration: { type: [String, Number], default: 250 }
  };
  const __default__$1 = {
    name: "u-popup",
    options: {
      addGlobalClass: true,
      virtualHost: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$8 = /* @__PURE__ */ vue.defineComponent({
    ...__default__$1,
    props: PopupProps,
    emits: ["update:modelValue", "open", "close"],
    setup(__props, { expose: __expose, emit: __emit }) {
      __expose();
      const props = __props;
      const emit = __emit;
      const visibleSync = vue.ref(false);
      const showDrawer = vue.ref(false);
      const timer = vue.ref(null);
      const closeFromInner = vue.ref(false);
      const style = vue.computed(() => {
        let style2 = {};
        if (props.mode == "left" || props.mode == "right") {
          style2 = {
            width: props.width ? getUnitValue(props.width) : getUnitValue(props.length),
            height: "100%",
            transform: `translate3D(${props.mode == "left" ? "-100%" : "100%"},0px,0px)`
          };
        } else if (props.mode == "top" || props.mode == "bottom") {
          style2 = {
            width: "100%",
            height: props.height ? getUnitValue(props.height) : getUnitValue(props.length),
            transform: `translate3D(0px,${props.mode == "top" ? "-100%" : "100%"},0px)`
          };
        }
        style2.zIndex = uZIndex.value;
        if (props.borderRadius) {
          switch (props.mode) {
            case "left":
              style2.borderRadius = `0 ${props.borderRadius}rpx ${props.borderRadius}rpx 0`;
              break;
            case "top":
              style2.borderRadius = `0 0 ${props.borderRadius}rpx ${props.borderRadius}rpx`;
              break;
            case "right":
              style2.borderRadius = `${props.borderRadius}rpx 0 0 ${props.borderRadius}rpx`;
              break;
            case "bottom":
              style2.borderRadius = `${props.borderRadius}rpx ${props.borderRadius}rpx 0 0`;
              break;
          }
          style2.overflow = "hidden";
        }
        if (props.duration)
          style2.transition = `all ${Number(props.duration) / 1e3}s linear`;
        return style2;
      });
      const centerStyle = vue.computed(() => {
        let style2 = {};
        style2.width = props.width ? getUnitValue(props.width) : getUnitValue(props.length);
        style2.height = props.height ? getUnitValue(props.height) : "auto";
        style2.zIndex = uZIndex.value;
        style2.marginTop = `-${$u.addUnit(props.negativeTop)}`;
        if (props.borderRadius) {
          style2.borderRadius = `${props.borderRadius}rpx`;
          style2.overflow = "hidden";
        }
        return style2;
      });
      const uZIndex = vue.computed(() => props.zIndex ? props.zIndex : $u.zIndex.popup);
      vue.watch(
        () => props.modelValue,
        (val) => {
          if (val) {
            open();
          } else if (!closeFromInner.value) {
            close();
          }
          closeFromInner.value = false;
        }
      );
      vue.onMounted(() => {
        if (props.modelValue)
          open();
      });
      function getUnitValue(val) {
        if (/(%|px|rpx|auto)$/.test(String(val)))
          return val;
        else
          return val + "rpx";
      }
      function maskClick() {
        close();
      }
      function close() {
        closeFromInner.value = true;
        change("showDrawer", "visibleSync", false);
      }
      function modeCenterClose(mode) {
        if (mode != "center" || !props.maskCloseAble)
          return;
        close();
      }
      function open() {
        change("visibleSync", "showDrawer", true);
      }
      function change(param1, param2, status) {
        if (props.popup === true) {
          emit("update:modelValue", status);
        }
        (param1 === "showDrawer" ? showDrawer : visibleSync).value = status;
        if (status) {
          vue.nextTick(() => {
            (param2 === "showDrawer" ? showDrawer : visibleSync).value = status;
            emit(status ? "open" : "close");
          });
        } else {
          timer.value = setTimeout(() => {
            (param2 === "showDrawer" ? showDrawer : visibleSync).value = status;
            emit(status ? "open" : "close");
          }, Number(props.duration));
        }
      }
      const __returned__ = { props, emit, visibleSync, showDrawer, timer, closeFromInner, style, centerStyle, uZIndex, getUnitValue, maskClick, close, modeCenterClose, open, change, get $u() {
        return $u;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_u_mask = resolveEasycom(vue.resolveDynamicComponent("u-mask"), __easycom_0);
    const _component_u_icon = resolveEasycom(vue.resolveDynamicComponent("u-icon"), __easycom_0$1);
    return $setup.visibleSync ? (vue.openBlock(), vue.createElementBlock(
      "view",
      {
        key: 0,
        class: vue.normalizeClass(["u-drawer", _ctx.customClass]),
        style: vue.normalizeStyle($setup.$u.toStyle({ zIndex: Number($setup.uZIndex) - 1 }, _ctx.customStyle)),
        "hover-stop-propagation": ""
      },
      [
        vue.createVNode(_component_u_mask, {
          duration: _ctx.duration,
          "custom-style": _ctx.maskCustomStyle,
          maskClickAble: _ctx.maskCloseAble,
          "z-index": Number($setup.uZIndex) - 2,
          show: $setup.showDrawer && _ctx.mask,
          onClick: $setup.maskClick
        }, null, 8, ["duration", "custom-style", "maskClickAble", "z-index", "show"]),
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["u-drawer-content", [
              _ctx.safeAreaInsetBottom ? "safe-area-inset-bottom" : "",
              "u-drawer-" + _ctx.mode,
              $setup.showDrawer ? "u-drawer-content-visible" : "",
              _ctx.zoom && _ctx.mode == "center" ? "u-animation-zoom" : ""
            ]]),
            onClick: _cache[2] || (_cache[2] = ($event) => $setup.modeCenterClose(_ctx.mode)),
            onTouchmove: _cache[3] || (_cache[3] = vue.withModifiers(() => {
            }, ["stop", "prevent"])),
            style: vue.normalizeStyle([$setup.style])
          },
          [
            _ctx.mode == "center" ? (vue.openBlock(), vue.createElementBlock(
              "view",
              {
                key: 0,
                class: "u-mode-center-box",
                onClick: _cache[0] || (_cache[0] = vue.withModifiers(() => {
                }, ["stop", "prevent"])),
                onTouchmove: _cache[1] || (_cache[1] = vue.withModifiers(() => {
                }, ["stop", "prevent"])),
                style: vue.normalizeStyle([$setup.centerStyle])
              },
              [
                _ctx.closeable ? (vue.openBlock(), vue.createElementBlock(
                  "view",
                  {
                    key: 0,
                    onClick: $setup.close,
                    class: vue.normalizeClass(["u-close", ["u-close--" + _ctx.closeIconPos]])
                  },
                  [
                    vue.createVNode(_component_u_icon, {
                      name: _ctx.closeIcon,
                      color: _ctx.closeIconColor,
                      size: _ctx.closeIconSize
                    }, null, 8, ["name", "color", "size"])
                  ],
                  2
                  /* CLASS */
                )) : vue.createCommentVNode("v-if", true),
                vue.createElementVNode("scroll-view", {
                  class: "u-drawer__scroll-view",
                  "scroll-y": "true"
                }, [
                  vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
                ])
              ],
              36
              /* STYLE, NEED_HYDRATION */
            )) : (vue.openBlock(), vue.createElementBlock("scroll-view", {
              key: 1,
              class: "u-drawer__scroll-view",
              "scroll-y": "true"
            }, [
              vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
            ])),
            _ctx.mode != "center" && _ctx.closeable ? (vue.openBlock(), vue.createElementBlock(
              "view",
              {
                key: 2,
                onClick: $setup.close,
                class: vue.normalizeClass(["u-close", ["u-close--" + _ctx.closeIconPos]])
              },
              [
                vue.createVNode(_component_u_icon, {
                  name: _ctx.closeIcon,
                  color: _ctx.closeIconColor,
                  size: _ctx.closeIconSize
                }, null, 8, ["name", "color", "size"])
              ],
              2
              /* CLASS */
            )) : vue.createCommentVNode("v-if", true)
          ],
          38
          /* CLASS, STYLE, NEED_HYDRATION */
        )
      ],
      6
      /* CLASS, STYLE */
    )) : vue.createCommentVNode("v-if", true);
  }
  const __easycom_2 = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$7], ["__scopeId", "data-v-e8170420"], ["__file", "/Users/zhangzan/zhangruibo/uniapp-worB/uni_modules/uview-pro/components/u-popup/u-popup.vue"]]);
  const ToastProps = {
    ...baseProps,
    /** 层级 z-index */
    zIndex: { type: [Number, String], default: zIndex.toast },
    /** 提示类型，success/warning/error/loading 等 */
    type: { type: String, default: "" },
    /** 显示时长，单位ms */
    duration: { type: Number, default: 2e3 },
    /** 是否显示图标 */
    icon: { type: Boolean, default: true },
    /** 显示位置，center/top/bottom */
    position: { type: String, default: "center" },
    /** 关闭时的回调函数 */
    callback: { type: Function, default: null },
    /** 是否返回上一页 */
    back: { type: Boolean, default: false },
    /** 是否为tab页面跳转 */
    isTab: { type: Boolean, default: false },
    /** 跳转的url */
    url: { type: String, default: "" },
    /** 跳转参数对象 */
    params: { type: Object, default: () => ({}) }
  };
  const __default__ = {
    name: "u-toast",
    options: {
      addGlobalClass: true,
      virtualHost: true,
      styleIsolation: "shared"
    }
  };
  const _sfc_main$7 = /* @__PURE__ */ vue.defineComponent({
    ...__default__,
    props: ToastProps,
    setup(__props, { expose: __expose }) {
      const props = __props;
      const isShow = vue.ref(false);
      let timer = null;
      const config2 = vue.ref({
        params: {},
        // URL跳转的参数，对象
        title: "",
        // 显示文本
        type: "",
        // 主题类型，primary，success，error，warning，black
        duration: 2e3,
        // 显示的时间，毫秒
        isTab: false,
        // 是否跳转tab页面
        url: "",
        // toast消失后是否跳转页面，有则跳转，优先级高于back参数
        icon: true,
        // 显示的图标
        position: "center",
        // toast出现的位置
        callback: null,
        // 执行完后的回调函数
        back: false
        // 结束toast是否自动返回上一页
      });
      const tmpConfig = vue.ref({ ...config2.value });
      const iconName = vue.computed(() => {
        if (["error", "warning", "success", "info"].indexOf(tmpConfig.value.type) >= 0 && tmpConfig.value.icon) {
          let icon = $u.type2icon(tmpConfig.value.type);
          return icon;
        }
        return "";
      });
      const uZIndex = vue.computed(() => {
        return isShow.value ? props.zIndex ? props.zIndex : $u.zIndex.toast : "999999";
      });
      function show(options) {
        tmpConfig.value = $u.deepMerge(config2.value, options);
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        isShow.value = true;
        timer = setTimeout(() => {
          isShow.value = false;
          clearTimeout(timer);
          timer = null;
          typeof tmpConfig.value.callback === "function" && tmpConfig.value.callback();
          timeEnd();
        }, tmpConfig.value.duration);
      }
      function hide() {
        isShow.value = false;
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      }
      function timeEnd() {
        if (tmpConfig.value.url) {
          if (tmpConfig.value.url[0] != "/")
            tmpConfig.value.url = "/" + tmpConfig.value.url;
          if (Object.keys(tmpConfig.value.params).length) {
            let query = "";
            if (/.*\/.*\?.*=.*/.test(tmpConfig.value.url)) {
              query = $u.queryParams(tmpConfig.value.params, false);
              tmpConfig.value.url = tmpConfig.value.url + "&" + query;
            } else {
              query = $u.queryParams(tmpConfig.value.params);
              tmpConfig.value.url += query;
            }
          }
          if (tmpConfig.value.isTab) {
            uni.switchTab({ url: tmpConfig.value.url });
          } else {
            uni.navigateTo({ url: tmpConfig.value.url });
          }
        } else if (tmpConfig.value.back) {
          $u.route({ type: "back" });
        }
      }
      __expose({
        show,
        hide
      });
      const __returned__ = { props, isShow, get timer() {
        return timer;
      }, set timer(v) {
        timer = v;
      }, config: config2, tmpConfig, iconName, uZIndex, show, hide, timeEnd, get $u() {
        return $u;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  });
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_u_icon = resolveEasycom(vue.resolveDynamicComponent("u-icon"), __easycom_0$1);
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["u-toast", [$setup.isShow ? "u-show" : "", "u-type-" + $setup.tmpConfig.type, "u-position-" + $setup.tmpConfig.position, _ctx.customClass]]),
        style: vue.normalizeStyle($setup.$u.toStyle({ zIndex: $setup.uZIndex }, _ctx.customStyle))
      },
      [
        vue.createElementVNode("view", { class: "u-icon-wrap" }, [
          $setup.tmpConfig.icon ? (vue.openBlock(), vue.createBlock(_component_u_icon, {
            key: 0,
            "custom-class": "u-toast_icon",
            name: $setup.iconName,
            size: 30,
            color: $setup.tmpConfig.type
          }, null, 8, ["name", "color"])) : vue.createCommentVNode("v-if", true)
        ]),
        vue.createElementVNode(
          "text",
          { class: "u-text" },
          vue.toDisplayString($setup.tmpConfig.title),
          1
          /* TEXT */
        )
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_3 = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$6], ["__scopeId", "data-v-d8326375"], ["__file", "/Users/zhangzan/zhangruibo/uniapp-worB/uni_modules/uview-pro/components/u-toast/u-toast.vue"]]);
  let list = [
    {
      "id": 9,
      "name": "LaFerrari FXX-KK",
      "image": "https://applet.jiaqiandianzi.xyz/uploads/cars/3ca337e0021ba1a34fb2b7498ca6462e519e0bde.jpg",
      "car_video": "https://applet.jiaqiandianzi.xyz/uploads/videos/8865a77d50fdaf9372ca42be5c3eaf2d7bb86e8c.mp4",
      "dianuo_wave": "https://applet.jiaqiandianzi.xyz/uploads/20230421/e9c8f59bcddf8f8dae75b3b21d55131a.m4a",
      "jiasu_wave": "https://applet.jiaqiandianzi.xyz/uploads/20230613/db01c0b8c9a312c146fc37dc96a4c723.m4a",
      "jiansu_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/149b9ad782633eda089265764fb7f17ed31d544f.m4a",
      "jiansu2_wave": "https://applet.jiaqiandianzi.xyz/uploads/20230613/83498e055ff2cbdec363dc1210bfc071.m4a",
      "daisu_wave": "https://applet.jiaqiandianzi.xyz/uploads/20230613/7ed82afb27153474fc1fb9a22e3952b7.m4a"
    },
    {
      "id": 10,
      "name": "Lamborghini Huracan",
      "image": "https://applet.jiaqiandianzi.xyz/uploads/cars/59fa2ce389fe2140b9f2b5b646308cf48977e421.png",
      "car_video": "https://applet.jiaqiandianzi.xyz/uploads/videos/8865a77d50fdaf9372ca42be5c3eaf2d7bb86e8c.mp4",
      "dianuo_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/7774c2bbb8f53d432037ac7f45bebde509b0ee1a.m4a",
      "jiasu_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/a313ea37c6e58e0b370de225173381bb0598bf0b.m4a",
      "jiansu_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/6dcf8976e791696b780b6e56855795d96eddab60.m4a",
      "jiansu2_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/567999b3d176ab41888990d99ad23346e05bf895.m4a",
      "daisu_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/763037bbe964d2f96ea80a9bb31fd2579fcf438e.m4a"
    },
    {
      "id": 11,
      "name": "PAGANI HUAYRA",
      "image": "https://applet.jiaqiandianzi.xyz/uploads/cars/695850c3cf94b29ee179fea579f836a9b5f63c39.png",
      "car_video": "https://applet.jiaqiandianzi.xyz/uploads/videos/8865a77d50fdaf9372ca42be5c3eaf2d7bb86e8c.mp4",
      "dianuo_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/60592df66919f8c7d75ace6bb164f090971aed57.m4a",
      "jiasu_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/6315747d06c45ff18ed6096b1a5f3b11ff1847c5.m4a",
      "jiansu_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/149b9ad782633eda089265764fb7f17ed31d544f.m4a",
      "jiansu2_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/45014193f5c2d3ebdb490db9cbbe87ca1d7fa98e.m4a",
      "daisu_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/f962719b9a436170a325c2e6d3eb8cbf9e103d90.m4a"
    },
    {
      "id": 12,
      "name": "Ferrari 488 GT3",
      "image": "https://applet.jiaqiandianzi.xyz/uploads/cars/4e5100a39b74af96b49b6144c011ae2992fc9314.png",
      "car_video": "https://applet.jiaqiandianzi.xyz/uploads/videos/8865a77d50fdaf9372ca42be5c3eaf2d7bb86e8c.mp4",
      "dianuo_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/0511e19a3a136efb972943560c38bd46a57d5656.m4a",
      "jiasu_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/e4c0828a82854185904289e41e65dc6447b290df.m4a",
      "jiansu_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/be1cec6fb306595def063fcd6af9a39d14c81f97.m4a",
      "jiansu2_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/de33c1ae33f02ec13fd39c97b087dcda9011773d.m4a",
      "daisu_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/dc3d3beffca5ac70d627e76b46509780fa1b2aa7.m4a"
    },
    {
      "id": 15,
      "name": "Ford GT40",
      "image": "https://applet.jiaqiandianzi.xyz/uploads/cars/cf7312a3927c64f1c2debdc091cf14cb1279ebb1.jpg",
      "car_video": "https://applet.jiaqiandianzi.xyz/uploads/videos/8865a77d50fdaf9372ca42be5c3eaf2d7bb86e8c.mp4",
      "dianuo_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/1a75d1f531f6742c82bf6c94bc96d4edbb3935cc.m4a",
      "jiasu_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/f5da9f1714a903062ff69b0a859a8dbe3b57489f.m4a",
      "jiansu_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/913ba34fa8ce288f94c19e4c488414ed455b0f8d.m4a",
      "jiansu2_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/8ddb6d9cbbd701fbcf58dbda2f22ac9019755dca.m4a",
      "daisu_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/832623eee096bd5d879d81c302d1000506b3ec83.m4a"
    },
    {
      "id": 16,
      "name": "Ford Mustang V8",
      "image": "https://applet.jiaqiandianzi.xyz/uploads/cars/bd1a1ba7f180ef81e3a22c5425c6259b6b9bb8ce.jpg",
      "car_video": "https://applet.jiaqiandianzi.xyz/uploads/videos/8865a77d50fdaf9372ca42be5c3eaf2d7bb86e8c.mp4",
      "dianuo_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/489654b898d326caa4d675886ab5bd6d2f722caa.m4a",
      "jiasu_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/602ede6da3ab2ee3043dd0b4308b2173cd1842a1.m4a",
      "jiansu_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/2ca558599afcdee3b1fd6cc07ba3e7c9401355b7.m4a",
      "jiansu2_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/242f992bc922965b67e27d3a3e8938ea057344df.m4a",
      "daisu_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/545f118701b948decd523ef536837c6d9b27a9db.m4a"
    },
    {
      "id": 17,
      "name": "Audi R8 GT3",
      "image": "https://applet.jiaqiandianzi.xyz/uploads/cars/ee1f8269b2ae09b6dcf7e85e752e4a0b45f4f1ec.jpg",
      "car_video": "https://applet.jiaqiandianzi.xyz/uploads/videos/8865a77d50fdaf9372ca42be5c3eaf2d7bb86e8c.mp4",
      "dianuo_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/1b1499e217398493f140d8633637854ff8de2e59.m4a",
      "jiasu_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/13ffb7335a99ebaf934edfc35c3750bc7bb754c0.m4a",
      "jiansu_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/4636ea8810441768b99b8fd6eff3f62b27bcc55b.m4a",
      "jiansu2_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/b9d38f9f771194a028e3749276daa73959570726.m4a",
      "daisu_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/39e48464c02e3a80e9547bded86de1c7fdabf516.m4a"
    },
    {
      "id": 18,
      "name": "Porsche 997 GT3 R",
      "image": "https://applet.jiaqiandianzi.xyz/uploads/cars/4731d22f342967e41eb2e6df893f0c496f92023c.png",
      "car_video": "https://applet.jiaqiandianzi.xyz/uploads/videos/8865a77d50fdaf9372ca42be5c3eaf2d7bb86e8c.mp4",
      "dianuo_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/057a038e8ef2e2242ec7a9cecf4d057c6bb4a0ef.m4a",
      "jiasu_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/ac1cfd8b059b81c435b3e956f9226d1d3f05db2d.m4a",
      "jiansu_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/d9c2152eb7f115452fe2340364604f7743c78d60.m4a",
      "jiansu2_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/2067821fb9da130676a4617e2639eff3f8f66f9c.m4a",
      "daisu_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/49e441a958d087a90f03359cfdefeee5416660a1.m4a"
    },
    {
      "id": 19,
      "name": "Bentley Continental GT3",
      "image": "https://applet.jiaqiandianzi.xyz/uploads/cars/c11a707979ff2419c7bfd9ee6620f9116eb53ed6.png",
      "car_video": "https://applet.jiaqiandianzi.xyz/uploads/videos/8865a77d50fdaf9372ca42be5c3eaf2d7bb86e8c.mp4",
      "dianuo_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/af2e4b2d670d5a5a8bb8418e584bac436064ac21.m4a",
      "jiasu_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/778fbe8c737c5c3703bced064b5d7614f1786437.m4a",
      "jiansu_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/1d85ec237397c74493c4e99241f8b1f6292d3825.m4a",
      "jiansu2_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/0eafd9d97e00b56e59d119f478563c4ed0066e11.m4a",
      "daisu_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/33a503200b38087e9af2c1a86ba23dc4ff732ac8.m4a"
    },
    {
      "id": 20,
      "name": "Ferrari 458 GT3",
      "image": "https://applet.jiaqiandianzi.xyz/uploads/cars/203c2502ed00ab42831494afa486d2f6d32000c2.jpg",
      "car_video": "https://applet.jiaqiandianzi.xyz/uploads/videos/8865a77d50fdaf9372ca42be5c3eaf2d7bb86e8c.mp4",
      "dianuo_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/b8cb0a00d0b8c9a3d9a8bb625df7d71d6d049583.m4a",
      "jiasu_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/36cbb78fc0a24caa7502259e66fb26071fbb8f66.m4a",
      "jiansu_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/b19ce0029ce35066fa5e1314573aba8990a283e2.m4a",
      "jiansu2_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/da04ebba4eb73135f6ff0e303b64c29f119cc173.m4a",
      "daisu_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/7233682b335e46c18766c0f4495d008fdd4520e4.m4a"
    },
    {
      "id": 21,
      "name": "McLaren MP4-12C GR3",
      "image": "https://applet.jiaqiandianzi.xyz/uploads/cars/d38133c24641692cfc7d264fa07bfed864cd7c15.jpg",
      "car_video": "https://applet.jiaqiandianzi.xyz/uploads/videos/8865a77d50fdaf9372ca42be5c3eaf2d7bb86e8c.mp4",
      "dianuo_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/7f3edf6f3e1cba36769992e1a7a92fda72e3b251.m4a",
      "jiasu_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/0f93b2ab74c29f1bd33320bfef0801dba84de0db.m4a",
      "jiansu_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/482a30355ffd79f27e299b10bfff4ded1ce70b9e.m4a",
      "jiansu2_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/567999b3d176ab41888990d99ad23346e05bf895.m4a",
      "daisu_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/6e1a207c1e227c7e6bfa1231ddbe5c30ef812d27.m4a"
    },
    {
      "id": 22,
      "name": "Triumph Speed TripleR 1050cc",
      "image": "https://applet.jiaqiandianzi.xyz/uploads/cars/434b6d333d5bf64a13784b405702db309cd8e0cd.jpg",
      "car_video": "https://applet.jiaqiandianzi.xyz/uploads/videos/8865a77d50fdaf9372ca42be5c3eaf2d7bb86e8c.mp4",
      "dianuo_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/17b55266a5c15a7fe72a21f567f89583b1788fb4.m4a",
      "jiasu_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/1b34db62800ae569ed0d877f39288705f20d95ea.m4a",
      "jiansu_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/c51a8369fadb7c6d620a6c3fdf1c58fbc946747e.m4a",
      "jiansu2_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/951b62208e1498b00a6b16714bc973ff9be6b73b.m4a",
      "daisu_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/896b05761d4e16be6b8072f3b2b828358c17fb62.m4a"
    },
    {
      "id": 23,
      "name": "Dodge viper",
      "image": "https://applet.jiaqiandianzi.xyz/uploads/cars/baf7c8a66ecc0cb68f008c5a48ddd08219e983b2.jpg",
      "car_video": "https://applet.jiaqiandianzi.xyz/uploads/videos/8865a77d50fdaf9372ca42be5c3eaf2d7bb86e8c.mp4",
      "dianuo_wave": "https://applet.jiaqiandianzi.xyz/uploads/20230613/20c26f837110147a2a8a1bc957682ade.m4a",
      "jiasu_wave": "https://applet.jiaqiandianzi.xyz/uploads/20230613/02bdc601e3caecdcb2669ff4fc8ba058.m4a",
      "jiansu_wave": "https://applet.jiaqiandianzi.xyz/uploads/waves/6dcf8976e791696b780b6e56855795d96eddab60.m4a",
      "jiansu2_wave": "https://applet.jiaqiandianzi.xyz/uploads/20230613/bef097eb0eefc7d9588c6896060e09b5.m4a",
      "daisu_wave": "https://applet.jiaqiandianzi.xyz/uploads/20230613/8496ca18aaf71504a6fa44473525d4b6.m4a"
    }
  ];
  const xtfGpslocation_utsProxy = uni.requireUTSPlugin("uni_modules/xtf-gpslocation");
  const snUtsIap_utsProxy = uni.requireUTSPlugin("uni_modules/sn-uts-iap");
  const _imports_0 = "/static/image/success.gif";
  const _imports_1 = "/static/image/lihe.gif";
  const _imports_2 = "/static/image/speed.gif";
  const sku = "dy1";
  var wv;
  const _sfc_main$6 = {
    data() {
      return {
        countGps: 0,
        //gps调用次数
        activationType: false,
        //速度获取方式
        isActive: false,
        //是否激活
        speedInKmphValue: 0,
        //显示速度 km/h
        speed: 0,
        //实际速度 m/s
        carList: list,
        activePopup: false,
        curCar: null,
        //当前选中车辆
        current: null,
        unlockedList: [],
        isLogin: false,
        cardId: null,
        userId: "",
        isPlaySound: false,
        // showPopup: false ,// 控制弹窗显示/隐藏
        isActivation: false,
        //控制激活码弹框
        isBuying: false,
        expirationDate: ""
      };
    },
    onLoad(options) {
      const _this = this;
      const isConnected = snUtsIap_utsProxy.initConnection();
      if (isConnected) {
        formatAppLog("log", "at pages/index/index.vue:151", "成功连接到 App Store");
      } else {
        formatAppLog("log", "at pages/index/index.vue:153", "无法连接到 App Store");
      }
      snUtsIap_utsProxy.subscriptionStatus(sku, (result) => {
        if (result.code === 0) {
          const status = result.data.status;
          formatAppLog("log", "at pages/index/index.vue:159", "订阅状态:", status, result);
          status.forEach((s) => {
            formatAppLog("log", "at pages/index/index.vue:170", `状态: ${s.state}`);
            formatAppLog("log", "at pages/index/index.vue:171", `平台: ${s.platform}`);
          });
        }
      });
      snUtsIap_utsProxy.currentEntitlement(sku, (result) => {
        if (result.code === 0) {
          const entitlement = result.data;
          const now = (/* @__PURE__ */ new Date()).getTime();
          formatAppLog("log", "at pages/index/index.vue:180", "当前权益:", entitlement);
          if (entitlement && entitlement.expirationDateIos && now < entitlement.expirationDateIos) {
            _this.$refs.uToastRef.show({
              title: "您已订阅",
              duration: 1e3,
              type: "success"
            });
            _this.isActive = true;
          }
          if (entitlement && entitlement.expirationDateIos) {
            const expirationDate = new Date(entitlement.expirationDateIos);
            _this.expirationDate = expirationDate.toLocaleDateString() + " " + expirationDate.toLocaleTimeString();
          }
        }
      });
      var onGps = xtfGpslocation_utsProxy.isProviderEnabled();
      if (!onGps) {
        xtfGpslocation_utsProxy.openLocSetting();
      }
      uni.setKeepScreenOn({
        keepScreenOn: true
      });
      xtfGpslocation_utsProxy.requestBackgroundLocPer();
      setTimeout(() => {
        wv = this.$scope.$getAppWebview().children()[0];
        xtfGpslocation_utsProxy.onStartLocs({
          backgroud: true
        }, function(loc) {
          _this.countGps = _this.countGps + 1;
          if ("speed" in loc && (loc.speed || loc.speed >= 0)) {
            if (loc.speed == -1)
              _this.updateSpeed(loc, 0);
            else {
              _this.updateSpeed(loc, loc.speed);
            }
          } else
            _this.updateSpeed(loc, loc.speed);
        });
      }, 2e3);
    },
    onUnload() {
      snUtsIap_utsProxy.endConnection();
      snUtsIap_utsProxy.disable();
    },
    mounted() {
    },
    methods: {
      updateSpeed(res, speed) {
        this.speed = speed;
        this.speedInKmphValue = Math.floor(speed * 3.6);
        if (wv)
          wv.evalJS(
            `setSpeed(${speed * 3.6})`
          );
      },
      toggleEngine(item) {
        formatAppLog("log", "at pages/index/index.vue:245", item);
        if (!this.isActive) {
          this.activePopup = true;
          return;
        }
        if (this.curCar == item) {
          if (this.isPlaySound) {
            wv.evalJS(`stopEngine()`);
            this.isPlaySound = false;
          } else {
            wv.evalJS(`stopEngine()`);
            wv.evalJS(
              `startEngine("${item.dianuo_wave}","${item.daisu_wave}")`
            );
            this.isPlaySound = true;
          }
        } else {
          wv.evalJS(`stopEngine()`);
          wv.evalJS(
            `startEngine("${item.dianuo_wave}","${item.daisu_wave}")`
          );
          this.isPlaySound = true;
        }
        this.curCar = item;
      },
      goUserCenter() {
        if (!uni.getStorageSync("uni_id_token")) {
          uni.navigateTo({
            "url": "/uni_modules/uni-id-pages/pages/login/login-withpwd"
          });
        } else {
          uni.navigateTo({
            "url": "/uni_modules/uni-id-pages/pages/userinfo/userinfo"
          });
        }
      },
      async goFriend() {
        uni.navigateTo({
          "url": "/pages/friend/friend"
        });
      },
      async showActivation() {
        if (this.isBuying)
          return;
        const _this = this;
        _this.isBuying = true;
        snUtsIap_utsProxy.buyProduct({
          sku,
          // 产品 SKU
          andDangerouslyFinishTransactionAutomatically: false,
          // 是否自动完成交易
          // appAccountToken: 'E621E1F8-C36C-495A-93FC-0C247A3E6E51', // 应用账户令牌（可选）, 必须是严格的uuid字符串
          quantity: 1
          // 购买数量（可选）
        }, (result) => {
          formatAppLog("log", "at pages/index/index.vue:302", result);
          if (result.code === 0) {
            formatAppLog("log", "at pages/index/index.vue:304", "购买成功:", result.data, result);
            const transactionId = result.data.transactionId;
            const success = snUtsIap_utsProxy.finishTransaction(transactionId);
            if (success) {
              formatAppLog("log", "at pages/index/index.vue:312", "交易完成");
              _this.isActive = true;
              _this.$refs.uToastRef.show({
                title: "激活成功",
                type: "success"
              });
            }
          } else {
            formatAppLog("log", "at pages/index/index.vue:321", "购买失败，错误码:", result.code);
            switch (result.code) {
              case -1:
                formatAppLog("log", "at pages/index/index.vue:326", "用户取消购买");
                _this.$refs.uToastRef.show({
                  title: "用户取消购买",
                  type: "error"
                });
                break;
              case -2:
                formatAppLog("log", "at pages/index/index.vue:333", "购买待处理");
                _this.$refs.uToastRef.show({
                  title: "购买待处理",
                  type: "error"
                });
                break;
              case -3:
                formatAppLog("log", "at pages/index/index.vue:340", "未知状态");
                _this.$refs.uToastRef.show({
                  title: "未知状态",
                  type: "error"
                });
                break;
              case -4:
                formatAppLog("log", "at pages/index/index.vue:347", "购买异常:", result.data.error);
                _this.$refs.uToastRef.show({
                  title: "购买异常:" + result.data.error,
                  type: "error"
                });
                break;
              case -10:
                formatAppLog("log", "at pages/index/index.vue:354", "产品未找到");
                _this.$refs.uToastRef.show({
                  title: "产品未找到",
                  type: "error"
                });
                break;
              default:
                formatAppLog("log", "at pages/index/index.vue:361", "其他错误");
                _this.$refs.uToastRef.show({
                  title: "其他错误",
                  type: "error"
                });
            }
          }
          _this.activePopup = false;
          _this.isBuying = false;
        });
      }
    }
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_u_icon = resolveEasycom(vue.resolveDynamicComponent("u-icon"), __easycom_0$1);
    const _component_u_button = resolveEasycom(vue.resolveDynamicComponent("u-button"), __easycom_1);
    const _component_u_popup = resolveEasycom(vue.resolveDynamicComponent("u-popup"), __easycom_2);
    const _component_u_toast = resolveEasycom(vue.resolveDynamicComponent("u-toast"), __easycom_3);
    return vue.openBlock(), vue.createElementBlock(
      vue.Fragment,
      null,
      [
        vue.createElementVNode(
          "web-view",
          {
            "webview-styles": { height: "0px", width: "100%", border: "1px solid red", position: "absolute", top: "50px" },
            ref: "webview",
            src: "/hybrid/html/local.html",
            class: "webview",
            onMessage: _cache[0] || (_cache[0] = (...args) => _ctx.handlePostMessage && _ctx.handlePostMessage(...args)),
            "on:onPostMessage": _cache[1] || (_cache[1] = (...args) => _ctx.handlePostMessage && _ctx.handlePostMessage(...args))
          },
          null,
          544
          /* NEED_HYDRATION, NEED_PATCH */
        ),
        vue.createElementVNode("view", { class: "content" }, [
          $data.activationType ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "successBox",
            onClick: _cache[2] || (_cache[2] = (...args) => _ctx.cloneActiva && _ctx.cloneActiva(...args))
          }, [
            vue.createElementVNode("img", {
              class: "success",
              src: _imports_0,
              alt: ""
            }),
            vue.createElementVNode("img", {
              class: "lihe",
              src: _imports_1,
              alt: ""
            }),
            vue.createElementVNode("view", { class: "text" }, "点击车辆，声音放大，链接蓝牙，从速度0开始启动享受声浪!")
          ])) : vue.createCommentVNode("v-if", true),
          vue.createElementVNode("view", { class: "speedbox speed" }, [
            $data.speedInKmphValue > 0 ? (vue.openBlock(), vue.createElementBlock(
              "image",
              {
                key: 0,
                class: vue.normalizeClass(["speedimg", { speed_add_class: $data.isActive }]),
                src: _imports_2
              },
              null,
              2
              /* CLASS */
            )) : vue.createCommentVNode("v-if", true),
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["speed-text", { speed_add_class: $data.isActive }])
              },
              vue.toDisplayString($data.speedInKmphValue),
              3
              /* TEXT, CLASS */
            )
          ]),
          vue.createElementVNode("view", { class: "unlocked mt-2" }, [
            vue.createElementVNode("view", {
              class: "title",
              style: { "font-size": "0.8125rem", "letter-spacing": "0" }
            }, [
              vue.createElementVNode(
                "view",
                null,
                vue.toDisplayString($data.isActive ? "您已解下列车辆，使用方法在交个朋友详细介绍" : "未解锁，请点击激活解锁"),
                1
                /* TEXT */
              )
            ]),
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.carList, (item, index) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: "carList flex justify-between",
                  style: vue.normalizeStyle([{ "position": "relative" }, { background: "url(" + item.image + ")" }]),
                  onClick: ($event) => $options.toggleEngine(item),
                  key: index
                }, [
                  vue.createElementVNode(
                    "text",
                    {
                      class: vue.normalizeClass(["carName ml-4", { carName_add_class: $data.isActive }])
                    },
                    vue.toDisplayString(item.name),
                    3
                    /* TEXT, CLASS */
                  ),
                  !$data.isPlaySound || !($data.curCar == item) ? (vue.openBlock(), vue.createBlock(_component_u_icon, {
                    key: 0,
                    name: "play-circle",
                    style: { "position": "absolute", "right": "0.9375rem", "top": "1.875rem" },
                    color: "#ffffff",
                    size: "50"
                  })) : $data.curCar == item && $data.isPlaySound ? (vue.openBlock(), vue.createBlock(_component_u_icon, {
                    key: 1,
                    name: "pause-circle",
                    style: { "position": "absolute", "right": "0.9375rem", "top": "1.875rem" },
                    color: "#ffffff",
                    size: "50"
                  })) : vue.createCommentVNode("v-if", true)
                ], 12, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["footercl", { footercl_add_class: $data.isActive }])
            },
            null,
            2
            /* CLASS */
          ),
          vue.createElementVNode("view", { class: "buttons" }, [
            vue.createElementVNode("view", { style: { "display": "flex", "align-items": "center" } }, [
              vue.createElementVNode(
                "view",
                {
                  class: "activation",
                  onClick: _cache[3] || (_cache[3] = (...args) => $options.showActivation && $options.showActivation(...args)),
                  style: { "width": "50%" }
                },
                vue.toDisplayString($data.isActive ? "已" : "") + "激活",
                1
                /* TEXT */
              ),
              vue.createElementVNode("view", {
                class: "friend",
                onClick: _cache[4] || (_cache[4] = (...args) => $options.goFriend && $options.goFriend(...args)),
                style: { "width": "50%" }
              }, " 交个朋友")
            ])
          ]),
          vue.createVNode(_component_u_popup, {
            modelValue: $data.activePopup,
            "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => $data.activePopup = $event),
            mode: "center",
            "border-radius": "12",
            onClose: _cache[7] || (_cache[7] = ($event) => $data.isActivation = false)
          }, {
            default: vue.withCtx(() => [
              vue.createElementVNode("view", { style: { "width": "21.875rem", "height": "5.5rem", "border-radius": "0.3125rem", "display": "flex", "flex-direction": "column", "justify-content": "center" } }, [
                vue.createVNode(_component_u_button, {
                  type: "primary",
                  loading: $data.isBuying,
                  onClick: _cache[5] || (_cache[5] = ($event) => $options.showActivation()),
                  style: { "width": "30%" }
                }, {
                  default: vue.withCtx(() => [
                    vue.createTextVNode("激活")
                  ]),
                  _: 1
                  /* STABLE */
                }, 8, ["loading"])
              ])
            ]),
            _: 1
            /* STABLE */
          }, 8, ["modelValue"]),
          vue.createVNode(_component_u_popup, {
            modelValue: $data.isActivation,
            "onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => $data.isActivation = $event),
            mode: "center",
            "border-radius": "12",
            onClose: _cache[11] || (_cache[11] = ($event) => $data.isActivation = false)
          }, {
            default: vue.withCtx(() => [
              vue.createElementVNode("view", { style: { "width": "21.875rem", "height": "12.5rem", "border-radius": "0.3125rem" } }, [
                vue.createElementVNode("view", { class: "popup_title" }, "填写信息"),
                vue.createElementVNode("view", {
                  class: "inputBody mt-5",
                  style: { "box-sizing": "border-box", "height": "2.8125rem" }
                }, [
                  vue.createElementVNode("view", {
                    class: "flex align-center",
                    style: { "display": "flex", "align-items": "center", "justify-content": "center", "margin-top": "1.875rem", "height": "2.8125rem" }
                  }, [
                    vue.createElementVNode("view", { style: { "width": "20%", "display": "flex", "align-items": "center", "color": "#000" } }, "激活码"),
                    vue.withDirectives(vue.createElementVNode(
                      "input",
                      {
                        type: "text",
                        "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => _ctx.activation = $event),
                        class: "input",
                        placeholder: "请输入激活码"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [vue.vModelText, _ctx.activation]
                    ])
                  ])
                ]),
                vue.createElementVNode("view", {
                  class: "inputBtn",
                  onClick: _cache[9] || (_cache[9] = ($event) => _ctx.goActivation())
                }, "提交")
              ])
            ]),
            _: 1
            /* STABLE */
          }, 8, ["modelValue"]),
          vue.createVNode(
            _component_u_toast,
            { ref: "uToastRef" },
            null,
            512
            /* NEED_PATCH */
          )
        ])
      ],
      64
      /* STABLE_FRAGMENT */
    );
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__file", "/Users/zhangzan/zhangruibo/uniapp-worB/pages/index/index.vue"]]);
  let host = "https://car.jiaqiandianzi.xyz/index.php/api/v1";
  let host1 = "https://applet.jiaqiandianzi.xyz";
  let api = {
    //选择声浪
    chooseVoice: `${host}/user/choose-voice/`,
    //登录
    miniLogin: `${host1}/api/user/third`,
    //首页车辆列表
    carList: `${host1}/api/index/car_list`,
    //获取系统设置
    system: `${host1}/api/index/base_config`,
    //提交信息
    userSave: `${host1}/api/index/user_save`,
    //激活
    activeCar: `${host1}/api/index/active_car`,
    //生成订单
    // createOrder: `${host1}/api/index/save_order`,
    //APP生成订单
    createOrder: `${host1}/api/index/save_order`,
    //支付
    wxPay: `${host1}/api/payment/order_pay`,
    // 支付宝支付
    // export const wxPay = BASE_URL + '/api/payment/order_alipay'
    // 支付宝APP支付
    // aliPay :`${host1}/api/payment/order_app_alipay`,
    // 微信APP支付
    // wxPay:`${host1}/api/payment/order_miniapp_pay`,
    // wxPay:`${host1}/api/payment/order_pay`,
    // 手机号登录
    // export const Login = BASE_URL + '/api/user/login' 
    Login: `${host1}/api/user/login_mobile`,
    quickLogin: `${host1}/api/user/login_mobile_nocode`,
    // 注册
    register: `${host1}/api/user/register`,
    // 协议
    agreement: `${host1}/api/user/agreement`,
    // 退出登录
    Logout: `${host1}/api/user/logout`,
    // 获取验证码
    verifica: `${host1}/api/sms/send`
  };
  let getData = {
    fetchApi: function(params) {
      return new Promise((resolve, reject) => {
        var contenttype = params.contenttype;
        if (contenttype) {
          uni.request({
            url: params.API_URL,
            data: Object.assign(params.data),
            method: params.method ? params.method : "GET",
            header: {
              Authorization: "Bearer " + uni.getStorageSync("token"),
              "content-type": "application/json",
              token: uni.getStorageSync("token")
            },
            Connection: "keep-alive",
            "Transfer-Encoding": "chunked",
            success: resolve,
            fail: reject
          });
        } else {
          uni.request({
            url: params.API_URL,
            data: Object.assign({}, params.data),
            method: params.method ? params.method : "GET",
            header: {
              "content-type": "application/json",
              Authorization: "Bearer " + uni.getStorageSync("token"),
              "content-type": "application/x-www-form-urlencoded",
              token: uni.getStorageSync("token")
            },
            success: resolve,
            fail: reject
          });
        }
      });
    },
    result: function(params) {
      let that = this;
      return that.fetchApi(params).then((res) => res);
    }
  };
  const _sfc_main$5 = {
    data() {
      return {
        balance: 0,
        //余额
        shareImg: "",
        //分享图片
        shareTitle: "",
        //分享标题
        content: "",
        //注意事项
        weChat: "",
        //技工微信
        banner: ""
        //背景
      };
    },
    onShow() {
      this.getSystem();
    },
    onShareAppMessage() {
      return {
        title: this.shareTitle,
        path: "/pages/index/index?pId=" + uni.getStorageSync("userId"),
        imageUrl: this.shareImg
      };
    },
    methods: {
      getSystem() {
        formatAppLog("log", "at pages/friend/friend.vue:50", api.system, host1, "111111");
        let param = {
          API_URL: api.system,
          method: "get"
        };
        getData.result(param).then((res) => {
          formatAppLog("log", "at pages/friend/friend.vue:56", res, "系统设置");
          this.shareImg = host1 + res.data.data.friend.share_image;
          this.shareTitle = res.data.data.friend.share_text;
          this.banner = host1 + res.data.data.friend.subpage_image;
          this.content = res.data.data.friend.subpage_text;
          this.weChat = "WOR 车友娇儿联系方式：1347664940";
          formatAppLog("log", "at pages/friend/friend.vue:62", this.banner, "this.bannerthis.banner");
        });
      }
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", null, [
      vue.createElementVNode("view", { class: "card" }, [
        vue.createElementVNode(
          "view",
          {
            class: "main",
            style: vue.normalizeStyle({ backgroundImage: "url(" + $data.banner + ")" })
          },
          vue.toDisplayString($data.weChat),
          5
          /* TEXT, STYLE */
        ),
        vue.createElementVNode("view", { class: "mt-3 flex align-center justify-center" }),
        vue.createElementVNode("view", { class: "content" }, [
          vue.createElementVNode("view", { class: "" }, " 注意事项 "),
          vue.createElementVNode(
            "view",
            { class: "mt-3" },
            vue.toDisplayString($data.content),
            1
            /* TEXT */
          )
        ])
      ])
    ]);
  }
  const PagesFriendFriend = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__file", "/Users/zhangzan/zhangruibo/uniapp-worB/pages/friend/friend.vue"]]);
  var lookup = [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    62,
    0,
    62,
    0,
    63,
    52,
    53,
    54,
    55,
    56,
    57,
    58,
    59,
    60,
    61,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    0,
    0,
    0,
    0,
    63,
    0,
    26,
    27,
    28,
    29,
    30,
    31,
    32,
    33,
    34,
    35,
    36,
    37,
    38,
    39,
    40,
    41,
    42,
    43,
    44,
    45,
    46,
    47,
    48,
    49,
    50,
    51
  ];
  function base64Decode(source, target) {
    var sourceLength = source.length;
    var paddingLength = source[sourceLength - 2] === "=" ? 2 : source[sourceLength - 1] === "=" ? 1 : 0;
    var tmp;
    var byteIndex = 0;
    var baseLength = sourceLength - paddingLength & 4294967292;
    for (var i = 0; i < baseLength; i += 4) {
      tmp = lookup[source.charCodeAt(i)] << 18 | lookup[source.charCodeAt(i + 1)] << 12 | lookup[source.charCodeAt(i + 2)] << 6 | lookup[source.charCodeAt(i + 3)];
      target[byteIndex++] = tmp >> 16 & 255;
      target[byteIndex++] = tmp >> 8 & 255;
      target[byteIndex++] = tmp & 255;
    }
    if (paddingLength === 1) {
      tmp = lookup[source.charCodeAt(i)] << 10 | lookup[source.charCodeAt(i + 1)] << 4 | lookup[source.charCodeAt(i + 2)] >> 2;
      target[byteIndex++] = tmp >> 8 & 255;
      target[byteIndex++] = tmp & 255;
    }
    if (paddingLength === 2) {
      tmp = lookup[source.charCodeAt(i)] << 2 | lookup[source.charCodeAt(i + 1)] >> 4;
      target[byteIndex++] = tmp & 255;
    }
  }
  const crypto = {
    getRandomValues(arr) {
      if (!(arr instanceof Int8Array || arr instanceof Uint8Array || arr instanceof Int16Array || arr instanceof Uint16Array || arr instanceof Int32Array || arr instanceof Uint32Array || arr instanceof Uint8ClampedArray)) {
        throw new Error("Expected an integer array");
      }
      if (arr.byteLength > 65536) {
        throw new Error("Can only request a maximum of 65536 bytes");
      }
      var crypto2 = requireNativePlugin("DCloud-Crypto");
      base64Decode(crypto2.getRandomValues(arr.byteLength), new Uint8Array(
        arr.buffer,
        arr.byteOffset,
        arr.byteLength
      ));
      return arr;
    }
  };
  const _sfc_main$4 = {
    __name: "utsiap",
    setup(__props, { expose: __expose }) {
      __expose();
      const isConnected = snUtsIap_utsProxy.initConnection();
      if (isConnected) {
        formatAppLog("log", "at pages/index/utsiap/utsiap.vue:34", "成功连接到 App Store");
      } else {
        formatAppLog("log", "at pages/index/utsiap/utsiap.vue:36", "无法连接到 App Store");
      }
      formatAppLog("log", "at pages/index/utsiap/utsiap.vue:38", crypto);
      var array2 = new Uint32Array(10);
      const uuid = crypto.getRandomValues(array2);
      onUnload(() => {
        snUtsIap_utsProxy.endConnection();
        snUtsIap_utsProxy.disable();
      });
      onLoad(() => {
        snUtsIap_utsProxy.getItems(["dy1"], (result) => {
          if (result.code === 0) {
            const products = result.data.products;
            formatAppLog("log", "at pages/index/utsiap/utsiap.vue:51", "产品信息:", products);
            products.forEach((product) => {
              formatAppLog("log", "at pages/index/utsiap/utsiap.vue:54", `产品ID: ${product.id}`);
              formatAppLog("log", "at pages/index/utsiap/utsiap.vue:55", `产品名称: ${product.displayName}`);
              formatAppLog("log", "at pages/index/utsiap/utsiap.vue:56", `产品价格: ${product.displayPrice}`);
              formatAppLog("log", "at pages/index/utsiap/utsiap.vue:57", `产品类型: ${product.type}`);
            });
          } else {
            formatAppLog("log", "at pages/index/utsiap/utsiap.vue:60", "获取产品信息失败");
          }
        });
        snUtsIap_utsProxy.getPendingTransactions((result) => {
          if (result.code === 0) {
            const transactions = result.data.transactions;
            formatAppLog("log", "at pages/index/utsiap/utsiap.vue:68", "待处理交易:", transactions);
            transactions.forEach((transaction) => {
              snUtsIap_utsProxy.finishTransaction(transaction.transactionId);
            });
          }
        });
        snUtsIap_utsProxy.subscriptionStatus("dy1", (result) => {
          if (result.code === 0) {
            const status = result.data.status;
            formatAppLog("log", "at pages/index/utsiap/utsiap.vue:80", "订阅状态:", status, result);
            status.forEach((s) => {
              formatAppLog("log", "at pages/index/utsiap/utsiap.vue:83", `状态: ${s.state}`);
              formatAppLog("log", "at pages/index/utsiap/utsiap.vue:84", `平台: ${s.platform}`);
            });
          }
        });
        snUtsIap_utsProxy.currentEntitlement("dy1", (result) => {
          if (result.code === 0) {
            const entitlement = result.data;
            formatAppLog("log", "at pages/index/utsiap/utsiap.vue:92", "当前权益:", entitlement);
          }
        });
        snUtsIap_utsProxy.latestTransaction("dy1", (result) => {
          if (result.code === 0) {
            const transaction = result.data;
            formatAppLog("log", "at pages/index/utsiap/utsiap.vue:99", "最新交易:", transaction);
          }
        });
      });
      const __returned__ = { isConnected, get array() {
        return array2;
      }, set array(v) {
        array2 = v;
      }, uuid, get onShow() {
        return onShow;
      }, get onLoad() {
        return onLoad;
      }, get onUnload() {
        return onUnload;
      }, onUnmounted: vue.onUnmounted, get initConnection() {
        return snUtsIap_utsProxy.initConnection;
      }, get getAvailableItems() {
        return snUtsIap_utsProxy.getAvailableItems;
      }, get endConnection() {
        return snUtsIap_utsProxy.endConnection;
      }, get getItems() {
        return snUtsIap_utsProxy.getItems;
      }, get disable() {
        return snUtsIap_utsProxy.disable;
      }, get buyProduct() {
        return snUtsIap_utsProxy.buyProduct;
      }, get finishTransaction() {
        return snUtsIap_utsProxy.finishTransaction;
      }, get getPendingTransactions() {
        return snUtsIap_utsProxy.getPendingTransactions;
      }, get isEligibleForIntroOffer() {
        return snUtsIap_utsProxy.isEligibleForIntroOffer;
      }, get subscriptionStatus() {
        return snUtsIap_utsProxy.subscriptionStatus;
      }, get currentEntitlement() {
        return snUtsIap_utsProxy.currentEntitlement;
      }, get latestTransaction() {
        return snUtsIap_utsProxy.latestTransaction;
      }, get showManageSubscriptions() {
        return snUtsIap_utsProxy.showManageSubscriptions;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      null,
      vue.toDisplayString($setup.uuid),
      1
      /* TEXT */
    );
  }
  const PagesIndexUtsiapUtsiap = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__file", "/Users/zhangzan/zhangruibo/uniapp-worB/pages/index/utsiap/utsiap.vue"]]);
  const startAt = 7;
  const stepInterval = 2;
  const videoSrc = "/static/wor.mp4";
  const _sfc_main$3 = {
    __name: "guide",
    setup(__props, { expose: __expose }) {
      __expose();
      const copyLines = [
        "本年度值得升级的汽车软件+（海外媒体报道）",
        "一键开启无需硬件",
        "根据卫星实时真实还原跑车声浪",
        "13 种声浪一次满足（帕加尼、兰博）",
        "真车实录，真响真还原。"
      ];
      const currentShownCount = vue.ref(0);
      const hasFinished = vue.ref(false);
      const visibleCopies = vue.computed(() => {
        const copies = copyLines.slice(0, currentShownCount.value);
        formatAppLog("log", "at pages/guide/guide.vue:55", "可见文案更新:", {
          total: copyLines.length,
          shown: currentShownCount.value,
          visible: copies.length,
          content: copies
        });
        return copies;
      });
      const showButton = vue.computed(() => {
        const shouldShow = currentShownCount.value > 0 && !hasFinished.value;
        formatAppLog("log", "at pages/guide/guide.vue:67", "按钮显示状态检查:", {
          currentShownCount: currentShownCount.value,
          hasFinished: hasFinished.value,
          shouldShow
        });
        return shouldShow;
      });
      const buttonText = vue.computed(() => {
        if (currentShownCount.value >= copyLines.length) {
          return "开始体验";
        } else if (currentShownCount.value === 1) {
          return "点击查看下一条";
        } else {
          return "继续";
        }
      });
      let intervalId = null;
      const playStartTs = vue.ref(null);
      function startTickerIfNeeded() {
        if (hasFinished.value)
          return;
        if (intervalId)
          return;
        if (playStartTs.value === null)
          playStartTs.value = Date.now();
        intervalId = setInterval(() => {
          if (hasFinished.value)
            return;
          if (playStartTs.value === null)
            return;
          const elapsedSeconds = (Date.now() - playStartTs.value) / 1e3;
          syncByCurTime(elapsedSeconds);
        }, 250);
      }
      function stopTicker() {
        if (intervalId)
          clearInterval(intervalId);
        intervalId = null;
        playStartTs.value = null;
      }
      function syncByCurTime(cur) {
        if (currentShownCount.value >= copyLines.length)
          return;
        if (cur < startAt)
          return;
        const desiredCount = Math.min(
          copyLines.length,
          Math.floor((cur - startAt) / stepInterval) + 1
        );
        if (desiredCount > currentShownCount.value) {
          formatAppLog("log", "at pages/guide/guide.vue:121", "显示文案:", desiredCount, "条，当前时间:", cur, "秒");
          currentShownCount.value = desiredCount;
        }
      }
      function onContinue() {
        formatAppLog("log", "at pages/guide/guide.vue:127", "用户点击按钮，当前文案数量:", currentShownCount.value);
        if (currentShownCount.value >= copyLines.length) {
          formatAppLog("log", "at pages/guide/guide.vue:131", "完成引导，跳转到首页");
          finishGuide();
        } else {
          currentShownCount.value++;
          formatAppLog("log", "at pages/guide/guide.vue:136", "显示下一条文案，当前数量:", currentShownCount.value);
          if (playStartTs.value) {
            playStartTs.value = Date.now() - (startAt + (currentShownCount.value - 1) * stepInterval) * 1e3;
            formatAppLog("log", "at pages/guide/guide.vue:141", "重置定时器时间戳");
          }
        }
      }
      function finishGuide() {
        if (hasFinished.value)
          return;
        hasFinished.value = true;
        stopTicker();
        uni.setStorageSync("hasShownGuide", true);
        uni.reLaunch({
          url: "/pages/index/index"
        });
      }
      function onPlay() {
        formatAppLog("log", "at pages/guide/guide.vue:158", "视频开始播放");
        playStartTs.value = Date.now();
        startTickerIfNeeded();
      }
      function onVideoLoaded() {
        formatAppLog("log", "at pages/guide/guide.vue:165", "视频元数据加载完成");
        const video2 = document.getElementById("worGuideVideo");
        if (video2) {
          video2.play().catch((err) => {
            formatAppLog("log", "at pages/guide/guide.vue:170", "视频播放失败:", err);
          });
        }
      }
      function onVideoError(e) {
        formatAppLog("log", "at pages/guide/guide.vue:176", "视频加载错误:", e);
        formatAppLog("log", "at pages/guide/guide.vue:177", "视频路径:", videoSrc);
      }
      function onTimeUpdate(e) {
        var _a2;
        if (hasFinished.value)
          return;
        const t = ((_a2 = e == null ? void 0 : e.detail) == null ? void 0 : _a2.currentTime) ?? (e == null ? void 0 : e.currentTime) ?? 0;
        const cur = Number(t) || 0;
        formatAppLog("log", "at pages/guide/guide.vue:186", "视频时间更新:", cur, "秒");
        syncByCurTime(cur);
      }
      function onEnded() {
        formatAppLog("log", "at pages/guide/guide.vue:193", "视频播放结束");
        finishGuide();
      }
      setTimeout(() => {
        formatAppLog("log", "at pages/guide/guide.vue:199", "启动兜底定时器检查:", {
          hasFinished: hasFinished.value,
          intervalId,
          playStartTs: playStartTs.value
        });
        if (!hasFinished.value && !intervalId) {
          formatAppLog("log", "at pages/guide/guide.vue:205", "启动兜底定时器");
          startTickerIfNeeded();
        }
      }, 1e3);
      formatAppLog("log", "at pages/guide/guide.vue:211", "引导页初始化完成");
      formatAppLog("log", "at pages/guide/guide.vue:212", "当前状态:", {
        currentShownCount: currentShownCount.value,
        hasFinished: hasFinished.value,
        showButton: showButton.value,
        buttonText: buttonText.value,
        visibleCopies: visibleCopies.value
      });
      formatAppLog("log", "at pages/guide/guide.vue:221", "引导页加载完成，视频路径:", videoSrc);
      formatAppLog("log", "at pages/guide/guide.vue:222", "文案数量:", copyLines.length);
      formatAppLog("log", "at pages/guide/guide.vue:223", "开始时间:", startAt, "秒，间隔:", stepInterval, "秒");
      const __returned__ = { copyLines, startAt, stepInterval, videoSrc, currentShownCount, hasFinished, visibleCopies, showButton, buttonText, get intervalId() {
        return intervalId;
      }, set intervalId(v) {
        intervalId = v;
      }, playStartTs, startTickerIfNeeded, stopTicker, syncByCurTime, onContinue, finishGuide, onPlay, onVideoLoaded, onVideoError, onTimeUpdate, onEnded, computed: vue.computed, ref: vue.ref };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "guide-container" }, [
      vue.createElementVNode(
        "video",
        {
          id: "worGuideVideo",
          class: "guide-video",
          src: $setup.videoSrc,
          controls: false,
          autoplay: true,
          muted: true,
          "show-center-play-btn": false,
          onPlay: $setup.onPlay,
          onTimeupdate: $setup.onTimeUpdate,
          onEnded: $setup.onEnded,
          onLoadedmetadata: $setup.onVideoLoaded,
          onError: $setup.onVideoError
        },
        null,
        32
        /* NEED_HYDRATION */
      ),
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("view", { class: "copies" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.visibleCopies, (line, idx) => {
              return vue.openBlock(), vue.createElementBlock(
                "view",
                {
                  key: idx,
                  class: "copy"
                },
                vue.toDisplayString(line),
                1
                /* TEXT */
              );
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        $setup.showButton ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "continue-wrap"
        }, [
          vue.createElementVNode(
            "view",
            {
              class: "continue-btn",
              onClick: $setup.onContinue,
              onTouchstart: _cache[0] || (_cache[0] = () => {
              }),
              onTouchend: _cache[1] || (_cache[1] = () => {
              })
            },
            vue.toDisplayString($setup.buttonText),
            33
            /* TEXT, NEED_HYDRATION */
          )
        ])) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesGuideGuide = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__scopeId", "data-v-04b95c5c"], ["__file", "/Users/zhangzan/zhangruibo/uniapp-worB/pages/guide/guide.vue"]]);
  const _sfc_main$2 = {
    __name: "subscription",
    setup(__props, { expose: __expose }) {
      __expose();
      const __returned__ = {};
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "page" }, [
      vue.createElementVNode("view", { class: "title" }, "订阅（占位）"),
      vue.createElementVNode("view", { class: "card" }, [
        vue.createElementVNode("view", { class: "row" }, [
          vue.createElementVNode("text", { class: "label" }, "月度套餐"),
          vue.createElementVNode("text", { class: "value" }, "-")
        ]),
        vue.createElementVNode("view", { class: "row" }, [
          vue.createElementVNode("text", { class: "label" }, "年度套餐"),
          vue.createElementVNode("text", { class: "value" }, "-")
        ])
      ]),
      vue.createElementVNode("view", { class: "actions" }, [
        vue.createElementVNode("button", {
          type: "primary",
          disabled: "true"
        }, "订阅（后续接入）")
      ])
    ]);
  }
  const PagesPaymentSubscription = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__scopeId", "data-v-9ce0e1d5"], ["__file", "/Users/zhangzan/zhangruibo/uniapp-worB/pages/payment/subscription.vue"]]);
  const _sfc_main$1 = {
    __name: "payment-result",
    setup(__props, { expose: __expose }) {
      __expose();
      const __returned__ = {};
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "page" }, [
      vue.createElementVNode("view", { class: "title" }, "支付结果（占位）"),
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("view", { class: "status" }, "状态：待接入"),
        vue.createElementVNode("view", { class: "desc" }, "后续将根据支付回调/结果展示成功或失败，并跳转对应页面")
      ]),
      vue.createElementVNode("view", { class: "actions" }, [
        vue.createElementVNode("button", {
          type: "primary",
          disabled: "true"
        }, "返回首页（后续）")
      ])
    ]);
  }
  const PagesPaymentPaymentResult = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__scopeId", "data-v-9dfde6b7"], ["__file", "/Users/zhangzan/zhangruibo/uniapp-worB/pages/payment/payment-result.vue"]]);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/friend/friend", PagesFriendFriend);
  __definePage("pages/index/utsiap/utsiap", PagesIndexUtsiapUtsiap);
  __definePage("pages/guide/guide", PagesGuideGuide);
  __definePage("pages/payment/subscription", PagesPaymentSubscription);
  __definePage("pages/payment/payment-result", PagesPaymentPaymentResult);
  const _sfc_main = {
    onLaunch: async function() {
      formatAppLog("log", "at App.vue:6", "App Launch");
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:10", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:13", "App Hide");
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "/Users/zhangzan/zhangruibo/uniapp-worB/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    app.use(uViewPro);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
