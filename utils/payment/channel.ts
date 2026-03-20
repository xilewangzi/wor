// 渠道识别（目录占位）

export type ChannelId = 'ios' | 'xiaomi' | 'vivo' | 'honor' | 'harmony' | 'unknown'

export function getChannel(): ChannelId {
  return 'unknown'
}

