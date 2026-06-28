export interface ApiKey {
  id: string
  name?: string
  prefix?: string
  start?: string
  userId: string
  enabled: boolean
  remaining?: number
  refillAmount?: number
  refillInterval?: number
  lastRefillAt?: string
  rateLimitEnabled?: boolean
  rateLimitTimeWindow?: number
  rateLimitMax?: number
  requestCount?: number
  expiresAt?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
  metadata?: Record<string, unknown>
}

export interface CreateApiKeyDto {
  name?: string
  prefix?: string
  expiresIn?: number
  userId?: string
  remaining?: number
  refillAmount?: number
  refillInterval?: number
  rateLimitEnabled?: boolean
  rateLimitTimeWindow?: number
  rateLimitMax?: number
  metadata?: Record<string, unknown>
}

export interface ApiKeyListResponse {
  apiKeys: ApiKey[]
  total: number
  limit?: number
  offset?: number
}
