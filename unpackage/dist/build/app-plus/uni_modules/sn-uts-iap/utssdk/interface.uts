export type SnUtsIapResult = {
	code : number,
	data : UTSJSONObject
}

export type SnUtsIapCallback = (result : SnUtsIapResult) => void

export type SnUtsIapBuyOptions = {
	sku : string, 
	andDangerouslyFinishTransactionAutomatically : boolean, 
	appAccountToken ?: string, 
	quantity ?: number, 
	discountOffer ?: UTSJSONObject
}

// 基础连接管理
export declare function initConnection() : boolean
export declare function endConnection() : boolean
export declare function disable() : boolean

// 商店信息
export declare function getStorefront(callback : SnUtsIapCallback) : void
export declare function getAppTransaction(callback : SnUtsIapCallback) : void

// 产品管理
export declare function getItems(skus : Array<string>, callback : SnUtsIapCallback) : void
export declare function getAvailableItems(alsoPublishToEventListener : boolean, onlyIncludeActiveItems : boolean, callback : SnUtsIapCallback) : void

// 购买相关
export declare function buyProduct(options : SnUtsIapBuyOptions, callback : SnUtsIapCallback) : void
export declare function finishTransaction(transactionIdentifier : string) : boolean
export declare function getPendingTransactions(callback : SnUtsIapCallback) : void
export declare function clearTransaction() : void

// 订阅相关
export declare function isEligibleForIntroOffer(groupID : string, callback : SnUtsIapCallback) : void
export declare function subscriptionStatus(sku : string, callback : SnUtsIapCallback) : void
export declare function currentEntitlement(sku : string, callback : SnUtsIapCallback) : void
export declare function latestTransaction(sku : string, callback : SnUtsIapCallback) : void

// 促销产品
export declare function getPromotedProduct(callback : SnUtsIapCallback) : void
export declare function buyPromotedProduct(callback : SnUtsIapCallback) : void
export declare function onPromotedProduct(callback : SnUtsIapCallback) : void

// 其他功能
export declare function sync(callback : SnUtsIapCallback) : void
export declare function presentCodeRedemptionSheet() : boolean
export declare function showManageSubscriptions(callback : SnUtsIapCallback) : void
export declare function beginRefundRequest(sku : string, callback : SnUtsIapCallback) : void
export declare function getReceiptData(callback : SnUtsIapCallback) : void
export declare function isTransactionVerified(sku : string, callback : SnUtsIapCallback) : void
export declare function getTransactionJws(sku : string, callback : SnUtsIapCallback) : void
export declare function validateReceiptIOS(sku : string, callback : SnUtsIapCallback) : void

// 测试函数
export declare function myTest(callback : SnUtsIapCallback) : void
export declare function myTestSync() : SnUtsIapResult