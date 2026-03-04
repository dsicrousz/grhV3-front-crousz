import { USER_ROLE } from './user.roles'

export interface User {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image?: string | null
  role: USER_ROLE
  banned?: boolean
  banReason?: string | null
  banExpires?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateUserDto {
  name: string
  email: string
  password: string
  role: USER_ROLE
}

export interface UpdateUserDto {
  name?: string
  email?: string
  role?: USER_ROLE
  banned?: boolean
  banReason?: string
}
