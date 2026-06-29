import { createContext, useContext, useMemo } from 'react'
import type { AppAbility } from './abilities'
import { defineAbilityFor } from './abilities'
import { useSession } from './auth-client'

export const AbilityContext = createContext<AppAbility>(defineAbilityFor(undefined))

export function AbilityProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const ability = useMemo(() => defineAbilityFor(session?.user?.role), [session?.user?.role])

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  )
}

export function useAbility(): AppAbility {
  return useContext(AbilityContext)
}
