
const { registerUTSInterface, initUTSProxyClass, initUTSProxyFunction, initUTSPackageName, initUTSIndexClassName, initUTSClassName } = uni
const name = 'xtfGpslocation'
const moduleName = 'android ios 原生gps前后台定位，系统定位'
const moduleType = ''
const errMsg = ``
const is_uni_modules = true
const pkg = /*#__PURE__*/ initUTSPackageName(name, is_uni_modules)
const cls = /*#__PURE__*/ initUTSIndexClassName(name, is_uni_modules)

const exports = { __esModule: true }



exports.isProviderEnabled = /*#__PURE__*/ initUTSProxyFunction(false, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: 'isProviderEnabledByJs', keepAlive: false, params: [], return: ""})
exports.openLocSetting = /*#__PURE__*/ initUTSProxyFunction(false, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: 'openLocSettingByJs', keepAlive: false, params: [], return: ""})
exports.onStartLoc = /*#__PURE__*/ initUTSProxyFunction(false, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: 'onStartLocByJs', keepAlive: true, params: [{"name":"data","type":"UTSSDKModulesXtfGpslocationLocDataJSONObject"},{"name":"callback","type":"UTSCallback"}], return: ""})
exports.onStartLocs = /*#__PURE__*/ initUTSProxyFunction(false, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: 'onStartLocsByJs', keepAlive: true, params: [{"name":"data","type":"UTSSDKModulesXtfGpslocationLocDataJSONObject"},{"name":"callback","type":"UTSCallback"}], return: ""})
exports.stop = /*#__PURE__*/ initUTSProxyFunction(false, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: 'stopByJs', keepAlive: false, params: [{"name":"removeNotifation","type":"boolean"}], return: ""})
exports.getLastLocation = /*#__PURE__*/ initUTSProxyFunction(false, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: 'getLastLocationByJs', keepAlive: false, params: [{"name":"callback","type":"UTSCallback"}], return: ""})
exports.getLastLocations = /*#__PURE__*/ initUTSProxyFunction(false, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: 'getLastLocationsByJs', keepAlive: false, params: [{"name":"callback","type":"UTSCallback"}], return: ""})
exports.requestBackgroundLocPer = /*#__PURE__*/ initUTSProxyFunction(false, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: 'requestBackgroundLocPerByJs', keepAlive: false, params: [], return: ""})
exports.starts = /*#__PURE__*/ initUTSProxyFunction(false, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: 'startsByJs', keepAlive: false, params: [{"name":"data","type":"UTSSDKModulesXtfGpslocationLocDataJSONObject"},{"name":"callback","type":"UTSCallback"}], return: ""})
exports.start = /*#__PURE__*/ initUTSProxyFunction(false, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: 'startByJs', keepAlive: false, params: [{"name":"data","type":"UTSSDKModulesXtfGpslocationLocDataJSONObject"},{"name":"callback","type":"UTSCallback"}], return: ""})
exports.isHavePermision = /*#__PURE__*/ initUTSProxyFunction(false, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: 'isHavePermisionByJs', keepAlive: false, params: [{"name":"pername","type":"string"}], return: ""})
exports.requestPermison = /*#__PURE__*/ initUTSProxyFunction(false, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: 'requestPermisonByJs', keepAlive: true, params: [{"name":"pername","type":"string"},{"name":"callback","type":"UTSCallback"}], return: ""})
uni.registerUTSPlugin('uni_modules/xtf-gpslocation', exports)
