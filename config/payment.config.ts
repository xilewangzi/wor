/**
 * 支付配置文件
 * 配置各平台的支付参数和商品信息
 */

export interface ProductConfig {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  type: 'consumable' | 'subscription';
  subscriptionPeriod?: 'monthly' | 'yearly';
}

export interface PaymentPlatformConfig {
  platform: 'ios' | 'android' | 'harmony';
  provider: string;
  appKey?: string;
  appSecret?: string;
  products: ProductConfig[];
}

// iOS 支付配置
export const iosPaymentConfig: PaymentPlatformConfig = {
  platform: 'ios',
  provider: 'apple',
  products: [
    {
      id: 'com.wor.exhaust.monthly',
      name: '月度订阅',
      description: '解锁所有车辆声浪，每月自动续费',
      price: 18,
      currency: 'CNY',
      type: 'subscription',
      subscriptionPeriod: 'monthly'
    },
    {
      id: 'com.wor.exhaust.yearly',
      name: '年度订阅',
      description: '解锁所有车辆声浪，每年自动续费，更优惠',
      price: 168,
      currency: 'CNY',
      type: 'subscription',
      subscriptionPeriod: 'yearly'
    }
  ]
};

// 小米支付配置
export const xiaomiPaymentConfig: PaymentPlatformConfig = {
  platform: 'android',
  provider: 'xiaomi',
  appKey: 'YOUR_XIAOMI_APP_KEY',
  appSecret: 'YOUR_XIAOMI_APP_SECRET',
  products: [
    {
      id: 'wor_monthly_xiaomi',
      name: '月度订阅',
      description: '解锁所有车辆声浪，每月自动续费',
      price: 18,
      currency: 'CNY',
      type: 'subscription',
      subscriptionPeriod: 'monthly'
    },
    {
      id: 'wor_yearly_xiaomi',
      name: '年度订阅',
      description: '解锁所有车辆声浪，每年自动续费，更优惠',
      price: 168,
      currency: 'CNY',
      type: 'subscription',
      subscriptionPeriod: 'yearly'
    }
  ]
};

// VIVO 支付配置
export const vivoPaymentConfig: PaymentPlatformConfig = {
  platform: 'android',
  provider: 'vivo',
  appKey: 'YOUR_VIVO_APP_KEY',
  appSecret: 'YOUR_VIVO_APP_SECRET',
  products: [
    {
      id: 'wor_monthly_vivo',
      name: '月度订阅',
      description: '解锁所有车辆声浪，每月自动续费',
      price: 18,
      currency: 'CNY',
      type: 'subscription',
      subscriptionPeriod: 'monthly'
    },
    {
      id: 'wor_yearly_vivo',
      name: '年度订阅',
      description: '解锁所有车辆声浪，每年自动续费，更优惠',
      price: 168,
      currency: 'CNY',
      type: 'subscription',
      subscriptionPeriod: 'yearly'
    }
  ]
};

// 荣耀支付配置
export const honorPaymentConfig: PaymentPlatformConfig = {
  platform: 'android',
  provider: 'honor',
  appKey: 'YOUR_HONOR_APP_KEY',
  appSecret: 'YOUR_HONOR_APP_SECRET',
  products: [
    {
      id: 'wor_monthly_honor',
      name: '月度订阅',
      description: '解锁所有车辆声浪，每月自动续费',
      price: 18,
      currency: 'CNY',
      type: 'subscription',
      subscriptionPeriod: 'monthly'
    },
    {
      id: 'wor_yearly_honor',
      name: '年度订阅',
      description: '解锁所有车辆声浪，每年自动续费，更优惠',
      price: 168,
      currency: 'CNY',
      type: 'subscription',
      subscriptionPeriod: 'yearly'
    }
  ]
};

// 鸿蒙支付配置
export const harmonyPaymentConfig: PaymentPlatformConfig = {
  platform: 'harmony',
  provider: 'huawei',
  appKey: 'YOUR_HUAWEI_APP_KEY',
  appSecret: 'YOUR_HUAWEI_APP_SECRET',
  products: [
    {
      id: 'wor_monthly_harmony',
      name: '月度订阅',
      description: '解锁所有车辆声浪，每月自动续费',
      price: 18,
      currency: 'CNY',
      type: 'subscription',
      subscriptionPeriod: 'monthly'
    },
    {
      id: 'wor_yearly_harmony',
      name: '年度订阅',
      description: '解锁所有车辆声浪，每年自动续费，更优惠',
      price: 168,
      currency: 'CNY',
      type: 'subscription',
      subscriptionPeriod: 'yearly'
    }
  ]
};

/**
 * 获取当前平台的支付配置
 */
export function getPaymentConfig(): PaymentPlatformConfig {
  // #ifdef APP-IOS
  return iosPaymentConfig;
  // #endif
  
  // #ifdef APP-ANDROID
  const channel = getChannel();
  switch(channel) {
    case 'xiaomi':
      return xiaomiPaymentConfig;
    case 'vivo':
      return vivoPaymentConfig;
    case 'honor':
      return honorPaymentConfig;
    default:
      return xiaomiPaymentConfig; // 默认使用小米配置
  }
  // #endif
  
  // #ifdef APP-HARMONY
  return harmonyPaymentConfig;
  // #endif
  
  return iosPaymentConfig; // 默认返回iOS配置
}

/**
 * 获取渠道标识
 */
function getChannel(): string {
  // 这里需要根据实际情况获取渠道标识
  // 可以通过包名、manifest配置等方式识别
  return 'xiaomi';
}
