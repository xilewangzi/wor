
const { registerUTSInterface, initUTSProxyClass, initUTSProxyFunction, initUTSPackageName, initUTSIndexClassName, initUTSClassName } = uni
const name = 'snUtsIap'
const moduleName = '苹果内购+订阅uts插件'
const moduleType = ''
const errMsg = ``
const is_uni_modules = true
const pkg = /*#__PURE__*/ initUTSPackageName(name, is_uni_modules)
const cls = /*#__PURE__*/ initUTSIndexClassName(name, is_uni_modules)

const exports = { __esModule: true }



exports.myTest = /*#__PURE__*/ initUTSProxyFunction(false, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: 'myTestByJs', keepAlive: false, params: [{"name":"callback","type":"UTSCallback"}], return: ""})
exports.myTestSync = /*#__PURE__*/ initUTSProxyFunction(false, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: 'myTestSyncByJs', keepAlive: false, params: [], return: ""})
exports.initConnection = /*#__PURE__*/ initUTSProxyFunction(false, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: 'initConnectionByJs', keepAlive: false, params: [], return: ""})
exports.endConnection = /*#__PURE__*/ initUTSProxyFunction(false, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: 'endConnectionByJs', keepAlive: false, params: [], return: ""})
exports.disable = /*#__PURE__*/ initUTSProxyFunction(false, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: 'disableByJs', keepAlive: false, params: [], return: ""})
exports.getStorefront = /*#__PURE__*/ initUTSProxyFunction(false, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: 'getStorefrontByJs', keepAlive: false, params: [{"name":"callback","type":"UTSCallback"}], return: ""})
exports.getAppTransaction = /*#__PURE__*/ initUTSProxyFunction(false, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: 'getAppTransactionByJs', keepAlive: false, params: [{"name":"callback","type":"UTSCallback"}], return: ""})
exports.getItems = /*#__PURE__*/ initUTSProxyFunction(false, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: 'getItemsByJs', keepAlive: false, params: [{"name":"skus","type":"string"},{"name":"callback","type":"UTSCallback"}], return: ""})
exports.getAvailableItems = /*#__PURE__*/ initUTSProxyFunction(false, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: 'getAvailableItemsByJs', keepAlive: false, params: [{"name":"alsoPublishToEventListener","type":"boolean"},{"name":"onlyIncludeActiveItems","type":"boolean"},{"name":"callback","type":"UTSCallback"}], return: ""})
exports.buyProduct = /*#__PURE__*/ initUTSProxyFunction(false, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: 'buyProductByJs', keepAlive: false, params: [{"name":"options","type":"UTSSDKModulesSnUtsIapSnUtsIapBuyOptionsJSONObject"},{"name":"callback","type":"UTSCallback"}], return: ""})
exports.finishTransaction = /*#__PURE__*/ initUTSProxyFunction(false, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: 'finishTransactionByJs', keepAlive: false, params: [{"name":"transactionIdentifier","type":"string"}], return: ""})
exports.getPendingTransactions = /*#__PURE__*/ initUTSProxyFunction(false, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: 'getPendingTransactionsByJs', keepAlive: false, params: [{"name":"callback","type":"UTSCallback"}], return: ""})
exports.clearTransaction = /*#__PURE__*/ initUTSProxyFunction(false, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: 'clearTransactionByJs', keepAlive: false, params: [], return: ""})
exports.isEligibleForIntroOffer = /*#__PURE__*/ initUTSProxyFunction(false, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: 'isEligibleForIntroOfferByJs', keepAlive: false, params: [{"name":"groupID","type":"string"},{"name":"callback","type":"UTSCallback"}], return: ""})
exports.subscriptionStatus = /*#__PURE__*/ initUTSProxyFunction(false, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: 'subscriptionStatusByJs', keepAlive: false, params: [{"name":"sku","type":"string"},{"name":"callback","type":"UTSCallback"}], return: ""})
exports.currentEntitlement = /*#__PURE__*/ initUTSProxyFunction(false, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: 'currentEntitlementByJs', keepAlive: false, params: [{"name":"sku","type":"string"},{"name":"callback","type":"UTSCallback"}], return: ""})
exports.latestTransaction = /*#__PURE__*/ initUTSProxyFunction(false, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: 'latestTransactionByJs', keepAlive: false, params: [{"name":"sku","type":"string"},{"name":"callback","type":"UTSCallback"}], return: ""})
exports.getPromotedProduct = /*#__PURE__*/ initUTSProxyFunction(false, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: 'getPromotedProductByJs', keepAlive: false, params: [{"name":"callback","type":"UTSCallback"}], return: ""})
exports.buyPromotedProduct = /*#__PURE__*/ initUTSProxyFunction(false, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: 'buyPromotedProductByJs', keepAlive: false, params: [{"name":"callback","type":"UTSCallback"}], return: ""})
exports.onPromotedProduct = /*#__PURE__*/ initUTSProxyFunction(false, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: 'onPromotedProductByJs', keepAlive: false, params: [{"name":"callback","type":"UTSCallback"}], return: ""})
exports.sync = /*#__PURE__*/ initUTSProxyFunction(false, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: 'syncByJs', keepAlive: false, params: [{"name":"callback","type":"UTSCallback"}], return: ""})
exports.presentCodeRedemptionSheet = /*#__PURE__*/ initUTSProxyFunction(false, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: 'presentCodeRedemptionSheetByJs', keepAlive: false, params: [], return: ""})
exports.showManageSubscriptions = /*#__PURE__*/ initUTSProxyFunction(false, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: 'showManageSubscriptionsByJs', keepAlive: false, params: [{"name":"callback","type":"UTSCallback"}], return: ""})
exports.beginRefundRequest = /*#__PURE__*/ initUTSProxyFunction(false, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: 'beginRefundRequestByJs', keepAlive: false, params: [{"name":"sku","type":"string"},{"name":"callback","type":"UTSCallback"}], return: ""})
exports.getReceiptData = /*#__PURE__*/ initUTSProxyFunction(false, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: 'getReceiptDataByJs', keepAlive: false, params: [{"name":"callback","type":"UTSCallback"}], return: ""})
exports.isTransactionVerified = /*#__PURE__*/ initUTSProxyFunction(false, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: 'isTransactionVerifiedByJs', keepAlive: false, params: [{"name":"sku","type":"string"},{"name":"callback","type":"UTSCallback"}], return: ""})
exports.getTransactionJws = /*#__PURE__*/ initUTSProxyFunction(false, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: 'getTransactionJwsByJs', keepAlive: false, params: [{"name":"sku","type":"string"},{"name":"callback","type":"UTSCallback"}], return: ""})
exports.validateReceiptIOS = /*#__PURE__*/ initUTSProxyFunction(false, { moduleName, moduleType, errMsg, main: true, package: pkg, class: cls, name: 'validateReceiptIOSByJs', keepAlive: false, params: [{"name":"sku","type":"string"},{"name":"callback","type":"UTSCallback"}], return: ""})
uni.registerUTSPlugin('uni_modules/sn-uts-iap', exports)
