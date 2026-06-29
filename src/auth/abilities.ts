import { AbilityBuilder, createMongoAbility, type MongoAbility } from '@casl/ability'
import { USER_ROLE } from '@/types/user.roles'

export type Subject =
  | 'employe'
  | 'bulletin'
  | 'lot'
  | 'rubrique'
  | 'session'
  | 'document'
  | 'nomination'
  | 'attribution'
  | 'contrat'
  | 'conge'
  | 'absence'
  | 'workflow'
  | 'site'
  | 'poste'
  | 'fonction'
  | 'division'
  | 'categorie'
  | 'service'
  | 'typedocument'
  | 'impot'
  | 'historique'
  | 'exclusion'
  | 'affectation'
  | 'motifRupture'
  | 'parametreBulletin'
  | 'pieceJointe'
  | 'reporting'
  | 'all'

export type Action =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'list'
  | 'generate'
  | 'validate'
  | 'upload'
  | 'calculate'
  | 'close'

export type AppAbility = MongoAbility<[Action, Subject]>

type RoleStatements = Record<string, Action[]>

const dsiStatements: RoleStatements = {
  employe: ['read', 'list'],
  bulletin: ['read', 'list'],
  lot: ['read', 'list'],
  rubrique: ['read', 'list'],
  session: ['read', 'list','create'],
  document: ['read', 'list'],
  nomination: ['read', 'list'],
  attribution: ['read', 'list'],
  contrat: ['read', 'list'],
  conge: ['read', 'list'],
  absence: ['read', 'list'],
  workflow: ['read', 'list'],
  site: ['read', 'list'],
  poste: ['read', 'list'],
  fonction: ['read', 'list'],
  division: ['read', 'list'],
  categorie: ['read', 'list'],
  service: ['read', 'list'],
  typedocument: ['read', 'list'],
  impot: ['read', 'list'],
  historique: ['read', 'list'],
  exclusion: ['read', 'list'],
  affectation: ['read', 'list'],
  motifRupture: ['read', 'list'],
  parametreBulletin: ['read', 'list'],
  pieceJointe: ['read', 'list'],
  reporting: ['read', 'list'],
}

const adminStatements: RoleStatements = {
  employe: ['create', 'read', 'update', 'delete', 'list'],
  bulletin: ['create', 'read', 'update', 'delete', 'list', 'generate', 'validate'],
  lot: ['create', 'read', 'update', 'delete', 'list', 'calculate', 'close'],
  rubrique: ['create', 'read', 'update', 'delete', 'list'],
  session: ['create', 'read', 'update', 'delete', 'list', 'close'],
  document: ['create', 'read', 'update', 'delete', 'list', 'upload'],
  nomination: ['create', 'read', 'update', 'delete', 'list'],
  attribution: ['create', 'read', 'update', 'delete', 'list'],
  contrat: ['create', 'read', 'update', 'delete', 'list'],
  conge: ['create', 'read', 'update', 'delete', 'list', 'validate'],
  absence: ['create', 'read', 'update', 'delete', 'list', 'validate'],
  workflow: ['create', 'read', 'update', 'delete', 'list'],
  site: ['create', 'read', 'update', 'delete', 'list'],
  poste: ['create', 'read', 'update', 'delete', 'list'],
  fonction: ['create', 'read', 'update', 'delete', 'list'],
  division: ['create', 'read', 'update', 'delete', 'list'],
  categorie: ['create', 'read', 'update', 'delete', 'list'],
  service: ['create', 'read', 'update', 'delete', 'list'],
  typedocument: ['create', 'read', 'update', 'delete', 'list'],
  impot: ['create', 'read', 'update', 'delete', 'list'],
  historique: ['create', 'read', 'update', 'delete', 'list'],
  exclusion: ['create', 'read', 'update', 'delete', 'list'],
  affectation: ['create', 'read', 'update', 'delete', 'list'],
  motifRupture: ['create', 'read', 'update', 'delete', 'list'],
  parametreBulletin: ['create', 'read', 'update', 'delete', 'list'],
  pieceJointe: ['create', 'read', 'update', 'delete', 'list'],
  reporting: ['read', 'list'],
}

const rhStatements: RoleStatements = {
  employe: ['create', 'read', 'update', 'delete', 'list'],
  bulletin: ['create', 'read', 'update', 'list', 'generate', 'validate'],
  lot: ['read', 'list', 'delete', 'update', 'create', 'calculate', 'close'],
  rubrique: ['read', 'list'],
  session: ['read', 'list'],
  document: ['create', 'read', 'update', 'delete', 'list', 'upload'],
  nomination: ['create', 'read', 'update', 'delete', 'list'],
  attribution: ['create', 'read', 'update', 'delete', 'list'],
  contrat: ['create', 'read', 'update', 'delete', 'list'],
  conge: ['create', 'read', 'update', 'delete', 'list', 'validate'],
  absence: ['create', 'read', 'update', 'delete', 'list', 'validate'],
  workflow: ['create', 'read', 'update', 'delete', 'list'],
  site: ['read', 'list'],
  poste: ['read', 'list'],
  fonction: ['read', 'list'],
  division: ['read', 'list'],
  categorie: ['read', 'list'],
  service: ['read', 'list'],
  typedocument: ['read', 'list'],
  impot: ['read', 'list'],
  historique: ['create', 'read', 'update', 'delete', 'list'],
  exclusion: ['create', 'read', 'update', 'delete', 'list'],
  affectation: ['create', 'read', 'update', 'delete', 'list'],
  motifRupture: ['read', 'list'],
  parametreBulletin: ['read', 'list'],
  pieceJointe: ['create', 'read', 'update', 'delete', 'list'],
  reporting: ['read', 'list'],
}

const csaStatements: RoleStatements = {
  employe: ['read', 'list'],
  bulletin: ['read', 'list', 'validate'],
  lot: ['read', 'update', 'list', 'calculate', 'close'],
  rubrique: ['read', 'list'],
  session: ['read', 'list'],
  document: ['read', 'list'],
  nomination: ['read', 'list'],
  attribution: ['read', 'list'],
  contrat: ['read', 'list'],
  conge: ['read', 'list'],
  absence: ['read', 'list'],
  workflow: ['read', 'list'],
  site: ['read', 'list'],
  poste: ['read', 'list'],
  fonction: ['read', 'list'],
  division: ['read', 'list'],
  categorie: ['read', 'list'],
  service: ['read', 'list'],
  typedocument: ['read', 'list'],
  impot: ['read', 'list'],
  historique: ['read', 'list'],
  exclusion: ['read', 'list'],
  affectation: ['read', 'list'],
  motifRupture: ['read', 'list'],
  parametreBulletin: ['read', 'list'],
  pieceJointe: ['read', 'list'],
  reporting: ['read', 'list'],
}

const roleStatementsMap: Record<USER_ROLE, RoleStatements> = {
  [USER_ROLE.DSI]: dsiStatements,
  [USER_ROLE.ADMIN]: adminStatements,
  [USER_ROLE.RH]: rhStatements,
  [USER_ROLE.CSA]: csaStatements,
}

export function defineAbilityFor(role: string | undefined): AppAbility {
  const { can, rules } = new AbilityBuilder<AppAbility>(createMongoAbility)

  if (role) {
    const statements = roleStatementsMap[role as USER_ROLE]
    if (statements) {
      for (const [subject, actions] of Object.entries(statements)) {
        can(actions as Action[], subject as Subject)
      }
    }
  }

  return createMongoAbility<AppAbility>(rules)
}
