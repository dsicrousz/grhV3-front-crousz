import Api from './Api'

class SessionAuditServiceClass {
  async findRecent(limit: number = 50): Promise<SessionAudit[]> {
    return Api.get('/session-audit', { params: { limit } }).then((res) => res.data)
  }

  async findByUser(userId: string): Promise<SessionAudit[]> {
    return Api.get(`/session-audit/user/${userId}`).then((res) => res.data)
  }
}

import type { SessionAudit } from '@/types/session-audit'

export const SessionAuditService = new SessionAuditServiceClass()
