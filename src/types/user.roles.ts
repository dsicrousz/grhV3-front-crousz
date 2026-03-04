export enum USER_ROLE {
  USER = 'user',
  ADMIN = 'admin',
  RH = 'rh',
  CSA = 'csa',
}

export const USER_ROLE_LABELS: Record<USER_ROLE, string> = {
  [USER_ROLE.USER]: 'Utilisateur',
  [USER_ROLE.ADMIN]: 'Administrateur',
  [USER_ROLE.RH]: 'Ressources Humaines',
  [USER_ROLE.CSA]: 'Comptabilité / Paie',
}

export const USER_ROLE_COLORS: Record<USER_ROLE, string> = {
  [USER_ROLE.USER]: 'default',
  [USER_ROLE.ADMIN]: 'red',
  [USER_ROLE.RH]: 'blue',
  [USER_ROLE.CSA]: 'green',
}