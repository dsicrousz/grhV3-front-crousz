// Configuration Vite standard - remplace T3 Env
export const env = {
  // Variables client (accès via import.meta.env)
  VITE_APP_TITLE: import.meta.env.VITE_APP_TITLE || 'GRH CROUSZ',
  VITE_APP_BACKEND: import.meta.env.VITE_APP_BACKEND || 'http://localhost:3001',
  VITE_APP_TOKENSTORAGENAME: import.meta.env.VITE_APP_TOKENSTORAGENAME || 'grh_token',
  VITE_R2_URL: import.meta.env.VITE_R2_URL || '',
  VITE_BETTER_AUTH_IDENTIFY_URL: import.meta.env.VITE_BETTER_AUTH_IDENTIFY_URL || '',
  VITE_APP_FRONTEND: import.meta.env.VITE_APP_FRONTEND || 'http://localhost:3000',
  // Variables serveur (si nécessaire)
  SERVER_URL: import.meta.env.SERVER_URL,
} as const

// Types pour les variables d'environnement
export type Env = typeof env
