// 本地存储封装（目录占位）

export function storageGet<T = unknown>(_key: string): T | undefined {
  return undefined
}

export function storageSet(_key: string, _value: unknown): void {
  // 占位：后续按 uni.setStorageSync 封装
}

