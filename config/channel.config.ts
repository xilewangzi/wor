// 渠道配置（目录占位）
export const channelConfig = {
  ios: {},
  xiaomi: {},
  vivo: {},
  honor: {},
  harmony: {}
} as const

export type ChannelId = keyof typeof channelConfig

