import type { Action, Subject } from './abilities'
import { useAbility } from './ability-context'

type CanProps = {
  I: Action
  a: Subject
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function Can({ I, a, children, fallback = null }: CanProps) {
  const ability = useAbility()
  if (ability.can(I, a)) {
    return <>{children}</>
  }
  return <>{fallback}</>
}
