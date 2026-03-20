<h2>UTS环境兼容性</h2>

|  uni-app	| uni-app x	|
|  :----:	| :----:	|
| √			| √			|

# sn-uts-iap

一个基于 UTS 的 iOS 应用内购买 (IAP) 模块，封装了 StoreKit 2 的功能。

## 功能特性

### 基础连接管理
- `initConnection()` - 初始化与 App Store 的连接
- `endConnection()` - 结束连接
- `disable()` - 禁用模块

### 商店信息
- `getStorefront()` - 获取当前商店区域
- `getAppTransaction()` - 获取应用交易信息

### 产品管理
- `getItems(skus)` - 获取指定 SKU 的产品信息
- `getAvailableItems()` - 获取可用的购买项目

### 购买相关
- `buyProduct()` - 购买产品
- `finishTransaction()` - 完成交易
- `getPendingTransactions()` - 获取待处理的交易
- `clearTransaction()` - 清理交易

### 订阅相关
- `isEligibleForIntroOffer()` - 检查是否有资格获得介绍性优惠
- `subscriptionStatus()` - 获取订阅状态
- `currentEntitlement()` - 获取当前权益
- `latestTransaction()` - 获取最新交易

### 促销产品
- `getPromotedProduct()` - 获取促销产品
- `buyPromotedProduct()` - 购买促销产品
- `onPromotedProduct()` - 监听促销产品通知

### 其他功能
- `sync()` - 同步与 App Store
- `presentCodeRedemptionSheet()` - 显示兑换码输入界面
- `showManageSubscriptions()` - 显示订阅管理界面
- `beginRefundRequest()` - 开始退款请求
- `getReceiptData()` - 获取收据数据
- `isTransactionVerified()` - 检查交易是否已验证
- `getTransactionJws()` - 获取交易的 JWS 表示
- `validateReceiptIOS()` - 验证 iOS 收据

## 安装和配置

### 1. 安装模块
将 `sn-uts-iap` 模块复制到项目的 `uni_modules` 目录中。

### 2. iOS 配置
在 `Info.plist` 中添加必要的权限：
```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

### 3. 沙盒测试配置
- 在 Xcode 中配置沙盒测试账户
- 确保设备已登录测试账户
- 使用测试产品 ID 进行测试

## 使用方法

### 1. 初始化连接

```typescript
import { initConnection, endConnection, disable } from '@/uni_modules/sn-uts-iap'

// 初始化连接
const isConnected = initConnection()
if (isConnected) {
    console.log('成功连接到 App Store')
} else {
    console.log('无法连接到 App Store')
}

// 应用退出时清理
onUnload(() => {
    endConnection()
    disable()
})
```

### 2. 获取产品信息

```typescript
import { getItems, getAvailableItems } from '@/uni_modules/sn-uts-iap'

// 获取指定产品信息
getItems(['com.example.product1', 'com.example.subscription1'], (result) => {
    if (result.code === 0) {
        const products = result.data.products
        console.log('产品信息:', products)
        
        products.forEach(product => {
            console.log(`产品ID: ${product.id}`)
            console.log(`产品名称: ${product.displayName}`)
            console.log(`产品价格: ${product.displayPrice}`)
            console.log(`产品类型: ${product.type}`)
        })
    } else {
        console.log('获取产品信息失败')
    }
})

// 获取可用购买项目
getAvailableItems(true, true, (result) => {
    if (result.code === 0) {
        const items = result.data.items
        console.log('可用购买项目:', items)
    }
})
```

### 3. 购买产品

```typescript
import { buyProduct, finishTransaction, getPendingTransactions } from '@/uni_modules/sn-uts-iap'

// 购买产品
buyProduct({
    sku: 'com.example.product1',                    // 产品 SKU
    andDangerouslyFinishTransactionAutomatically: false,  // 是否自动完成交易
    appAccountToken: 'E621E1F8-C36C-495A-93FC-0C247A3E6E5F', // 应用账户令牌（可选）, 必须是严格的uuid字符串
    quantity: 1,                                    // 购买数量（可选）
    discountOffer: {                                // 折扣优惠（可选）
        identifier: 'offer_id',                     // 优惠标识符
        keyIdentifier: 'key_id',                    // 密钥标识符
        nonce: '550e8400-e29b-41d4-a716-446655440000',   // 随机数（UUID格式）
        signature: 'base64_signature',              // 签名（Base64编码）
        timestamp: '1234567890'                     // 时间戳
    }
}, (result) => {
    if (result.code === 0) {
        console.log('购买成功:', result.data)
        
        // 手动完成交易：（如果andDangerouslyFinishTransactionAutomatically=true，则不需要手动处理）
        const transactionId = result.data.transactionId
        const success = finishTransaction(transactionId)
        if (success) {
            console.log('交易完成')
        }
    } else {
        console.log('购买失败，错误码:', result.code)
        
        // 处理不同的错误状态
        switch (result.code) {
            case -1:
                console.log('用户取消购买')
                break
            case -2:
                console.log('购买待处理')
                break
            case -3:
                console.log('未知状态')
                break
            case -4:
                console.log('购买异常:', result.data.error)
                break
            case -10:
                console.log('产品未找到')
                break
            default:
                console.log('其他错误')
        }
    }
})

// 获取待处理交易
getPendingTransactions((result) => {
    if (result.code === 0) {
        const transactions = result.data.transactions
        console.log('待处理交易:', transactions)
        
        // 完成所有待处理交易
        transactions.forEach(transaction => {
            finishTransaction(transaction.transactionId)
        })
    }
})
```

### 4. 使用折扣优惠

```typescript
// 使用折扣优惠购买产品
buyProduct({
    sku: 'com.example.subscription1',
    andDangerouslyFinishTransactionAutomatically: false,
    appAccountToken: 'E621E1F8-C36C-495A-93FC-0C247A3E6E5F',
    quantity: 1,
    discountOffer: {
        identifier: 'promo_offer_123',              // 优惠标识符（从服务器获取）
        keyIdentifier: 'key_identifier',            // 密钥标识符（从服务器获取）
        nonce: '550e8400-e29b-41d4-a716-446655440000', // 随机数（UUID格式）
        signature: 'base64_encoded_signature',      // 签名（Base64编码，从服务器获取）
        timestamp: '1640995200'                     // 时间戳（Unix时间戳）
    }
}, (result) => {
    if (result.code === 0) {
        console.log('使用折扣优惠购买成功:', result.data)
    } else {
        console.log('购买失败:', result.code, result.data)
    }
})
```

### 5. 订阅管理

```typescript
import { 
    isEligibleForIntroOffer, 
    subscriptionStatus, 
    currentEntitlement,
    latestTransaction 
} from '@/uni_modules/sn-uts-iap'

// 检查是否有资格获得介绍性优惠
isEligibleForIntroOffer('com.example.subscription1', (result) => {
    if (result.code === 0) {
        const isEligible = result.data.isEligible
        console.log('是否有资格获得介绍性优惠:', isEligible)
    }
})

// 获取订阅状态
subscriptionStatus('com.example.subscription1', (result) => {
    if (result.code === 0) {
        const status = result.data.status
        console.log('订阅状态:', status)
        
        status.forEach(s => {
            console.log(`状态: ${s.state}`)
            console.log(`平台: ${s.platform}`)
        })
    }
})

// 获取当前权益
currentEntitlement('com.example.subscription1', (result) => {
    if (result.code === 0) {
        const entitlement = result.data
        console.log('当前权益:', entitlement)
    }
})

// 获取最新交易
latestTransaction('com.example.subscription1', (result) => {
    if (result.code === 0) {
        const transaction = result.data
        console.log('最新交易:', transaction)
    }
})
```

### 6. 促销产品处理

```typescript
import { 
    getPromotedProduct, 
    buyPromotedProduct,
    onPromotedProduct 
} from '@/uni_modules/sn-uts-iap'

// 监听促销产品通知
onPromotedProduct((product) => {
    if (product) {
        console.log('收到促销产品:', product)
        
        // 显示促销产品信息
        uni.showModal({
            title: '促销产品',
            content: `发现促销产品: ${product.localizedTitle}`,
            confirmText: '立即购买',
            cancelText: '稍后再说',
            success: (res) => {
                if (res.confirm) {
                    buyPromotedProduct((result) => {
                        if (result.code === 0) {
                            console.log('促销产品购买成功')
                        }
                    })
                }
            }
        })
    }
})

// 获取当前促销产品
getPromotedProduct((result) => {
    if (result.code === 0) {
        const product = result.data
        if (product && Object.keys(product).length > 0) {
            console.log('当前促销产品:', product)
        } else {
            console.log('当前没有促销产品')
        }
    }
})
```

### 7. 其他功能

```typescript
import { 
    sync, 
    presentCodeRedemptionSheet,
    showManageSubscriptions,
    beginRefundRequest,
    getReceiptData,
    isTransactionVerified,
    getTransactionJws,
    validateReceiptIOS
} from '@/uni_modules/sn-uts-iap'

// 同步与 App Store
sync((result) => {
    if (result.code === 0) {
        const success = result.data.success
        console.log('同步结果:', success)
    }
})

// 显示兑换码输入界面
const redemptionResult = presentCodeRedemptionSheet()
console.log('兑换码界面显示结果:', redemptionResult)

// 显示订阅管理界面
showManageSubscriptions((result) => {
    if (result.code === 0) {
        const success = result.data.success
        console.log('订阅管理界面显示结果:', success)
    }
})

// 开始退款请求
beginRefundRequest('com.example.product1', (result) => {
    if (result.code === 0) {
        const refundStatus = result.data.refundStatus
        console.log('退款状态:', refundStatus)
    }
})

// 获取收据数据
getReceiptData((result) => {
    if (result.code === 0) {
        const receiptData = result.data.receiptData
        console.log('收据数据:', receiptData)
    }
})

// 验证交易
isTransactionVerified('com.example.product1', (result) => {
    if (result.code === 0) {
        const isVerified = result.data.isVerified
        console.log('交易验证结果:', isVerified)
    }
})

// 获取交易 JWS
getTransactionJws('com.example.product1', (result) => {
    if (result.code === 0) {
        const jws = result.data.jwsRepresentation
        console.log('交易 JWS:', jws)
    }
})

// 验证 iOS 收据
validateReceiptIOS('com.example.product1', (result) => {
    if (result.code === 0) {
        const validation = result.data
        console.log('收据验证结果:', validation)
        console.log('是否有效:', validation.isValid)
        console.log('收据数据:', validation.receiptData)
        console.log('JWS 表示:', validation.jwsRepresentation)
    }
})
```

## 错误处理

### 1. 网络错误处理
```typescript
getItems(['com.example.product1'], (result) => {
    if (result.code === 0) {
        // 成功处理
        console.log('产品信息:', result.data)
    } else {
        // 错误处理
        console.error('获取产品失败:', result)
        
        // 根据错误类型进行不同处理
        if (result.code === -1001) {
            console.log('网络超时，请检查网络连接')
        } else if (result.code === -1009) {
            console.log('无网络连接')
        }
    }
})
```

### 2. 购买失败处理
```typescript
buyProduct({
    sku: 'com.example.product1',
    andDangerouslyFinishTransactionAutomatically: false,
    appAccountToken: 'E621E1F8-C36C-495A-93FC-0C247A3E6E5F',
    quantity: 1,
    discountOffer: null
}, (result) => {
    if (result.code === 0) {
        console.log('购买成功')
    } else {
        console.error('购买失败:', result)
        
        // 处理特定错误
        switch (result.code) {
            case -1:
                console.log('用户取消购买')
                break
            case -2:
                console.log('购买待处理')
                break
            case -3:
                console.log('未知状态')
                break
            case -4:
                console.log('购买异常:', result.data.error)
                break
            case -10:
                console.log('产品未找到')
                break
            default:
                console.log('其他错误')
        }
    }
})
```

## 最佳实践

### 1. 生命周期管理
```typescript
export default {
    onLoad() {
        // 页面加载时初始化连接
        this.initIAP()
    },
    
    onUnload() {
        // 页面卸载时清理连接
        this.cleanupIAP()
    },
    
    methods: {
        initIAP() {
            const isConnected = initConnection()
            if (isConnected) {
                console.log('IAP 连接成功')
                this.loadProducts()
            }
        },
        
        cleanupIAP() {
            endConnection()
            disable()
        },
        
        loadProducts() {
            getItems(['com.example.product1'], (result) => {
                if (result.code === 0) {
                    this.products = result.data.products
                }
            })
        }
    }
}
```

### 2. 状态管理
```typescript
export default {
    data() {
        return {
            iapConnected: false,
            products: [],
            pendingTransactions: [],
            currentSubscription: null
        }
    },
    
    methods: {
        async checkIAPStatus() {
            // 检查连接状态
            this.iapConnected = initConnection()
            
            if (this.iapConnected) {
                // 加载产品信息
                this.loadProducts()
                
                // 检查待处理交易
                this.checkPendingTransactions()
                
                // 检查当前订阅
                this.checkCurrentSubscription()
            }
        },
        
        loadProducts() {
            getItems(['com.example.product1', 'com.example.subscription1'], (result) => {
                if (result.code === 0) {
                    this.products = result.data.products
                }
            })
        },
        
        checkPendingTransactions() {
            getPendingTransactions((result) => {
                if (result.code === 0) {
                    this.pendingTransactions = result.data.transactions
                }
            })
        },
        
        checkCurrentSubscription() {
            currentEntitlement('com.example.subscription1', (result) => {
                if (result.code === 0) {
                    this.currentSubscription = result.data
                }
            })
        }
    }
}
```

### 3. 用户界面集成
```typescript
export default {
    methods: {
        showProductList() {
            if (this.products.length === 0) {
                uni.showToast({
                    title: '正在加载产品信息...',
                    icon: 'loading'
                })
                return
            }
            
            const productList = this.products.map(product => ({
                title: product.displayName,
                price: product.displayPrice,
                description: product.description
            }))
            
            uni.showActionSheet({
                itemList: productList.map(p => `${p.title} - ${p.price}`),
                success: (res) => {
                    const selectedProduct = this.products[res.tapIndex]
                    this.purchaseProduct(selectedProduct)
                }
            })
        },
        
        purchaseProduct(product) {
            uni.showModal({
                title: '确认购买',
                content: `确定要购买 ${product.displayName} 吗？价格：${product.displayPrice}`,
                success: (res) => {
                    if (res.confirm) {
                        this.startPurchase(product)
                    }
                }
            })
        },
        
        startPurchase(product) {
            uni.showLoading({
                title: '正在处理购买...'
            })
            
            buyProduct({
                sku: product.id,
                andDangerouslyFinishTransactionAutomatically: false,
                appAccountToken: 'E621E1F8-C36C-495A-93FC-0C247A3E6E5F',
                quantity: 1,
                discountOffer: null
            }, (result) => {
                uni.hideLoading()
                
                if (result.code === 0) {
                    uni.showToast({
                        title: '购买成功！',
                        icon: 'success'
                    })
                    
                    // 完成交易
                    finishTransaction(result.data.transactionId)
                    
                    // 刷新状态
                    this.checkCurrentSubscription()
                } else {
                    uni.showToast({
                        title: '购买失败',
                        icon: 'error'
                    })
                    
                    // 处理错误
                    console.error('购买失败:', result.code, result.data)
                }
            })
        }
    }
}
```

## 注意事项

1. **iOS 版本要求**: 需要 iOS 15.0 或更高版本
2. **权限配置**: 确保在 `Info.plist` 中配置了必要的权限
3. **沙盒测试**: 开发阶段建议使用沙盒环境进行测试
4. **错误处理**: 所有异步操作都应该包含适当的错误处理
5. **生命周期管理**: 在应用/页面卸载时正确清理 IAP 连接
6. **网络状态**: 确保在网络连接正常时进行 IAP 操作
7. **产品 ID**: 使用正确的产品 ID 进行测试和生产
8. **收据验证**: 在生产环境中验证收据的真实性