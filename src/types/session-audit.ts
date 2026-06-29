export enum TypeActionSession {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
}

export interface SessionAudit {
  _id: string
  userId: string
  userEmail: string
  action: TypeActionSession
  sessionId: string
  ipAddress: string
  userAgent: string
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
}
