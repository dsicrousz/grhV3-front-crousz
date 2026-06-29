import { createFileRoute, Link } from '@tanstack/react-router'
import { Typography, Card } from 'antd'
import { FileText, Building2, Users, Settings, UserCog, Briefcase, FileX2, Palette, KeyRound, ScrollText } from 'lucide-react'
import { useAbility } from '@/auth/ability-context'
import type { Action, Subject } from '@/auth/abilities'

const { Title, Text } = Typography

export const Route = createFileRoute('/admin/parametrage/')({
  component: ParametragePage,
})

type ParamItem = {
  title: string
  description: string
  icon: typeof FileText
  path: string
  color: string
  disabled?: boolean
  I?: Action
  a?: Subject
}

const parametrageItems: ParamItem[] = [
  {
    title: 'Utilisateurs',
    description: 'Gérer les comptes et les permissions des utilisateurs',
    icon: UserCog,
    path: '/admin/parametrage/utilisateurs',
    color: 'bg-blue-100 text-blue-600',
    I: 'create',
    a: 'session',
  },
  {
    title: 'Rubriques de paie',
    description: 'Gérer les rubriques utilisées dans les bulletins de paie',
    icon: FileText,
    path: '/admin/parametrage/rubriques',
    color: 'bg-teal-100 text-teal-600',
    I: 'list',
    a: 'rubrique',
  },
  {
    title: 'Fonctions',
    description: 'Gérer les fonctions des employés',
    icon: Briefcase,
    path: '/admin/parametrage/fonctions',
    color: 'bg-amber-100 text-amber-600',
    I: 'list',
    a: 'fonction',
  },
  {
    title: 'Divisions & Services',
    description: 'Gérer l\'organigramme de l\'entreprise',
    icon: Building2,
    path: '/admin/parametrage/divisions',
    color: 'bg-purple-100 text-purple-600',
    I: 'list',
    a: 'division',
  },
  {
    title: 'Catégories employés',
    description: 'Définir les catégories professionnelles',
    icon: Users,
    path: '/admin/parametrage/categories',
    color: 'bg-indigo-100 text-indigo-600',
  },
  {
    title:'Attributions Individuelles',
    description: 'Gérer les attributions des rubriques',
    icon: FileText,
    path: '/admin/parametrage/attributions-individuelles',
    color: 'bg-teal-100 text-teal-600',
    I: 'list',
    a: 'attribution',
  },
  {
    title: 'Motifs de rupture',
    description: 'Gérer les motifs de rupture de contrat',
    icon: FileX2,
    path: '/admin/parametrage/motifs-rupture',
    color: 'bg-red-100 text-red-600',
    I: 'list',
    a: 'motifRupture',
  },
  {
    title: 'Couleurs bulletins',
    description: 'Paramétrer la couleur des bulletins de paie par année',
    icon: Palette,
    path: '/admin/parametrage/parametres-bulletins',
    color: 'bg-violet-100 text-violet-600',
    I: 'list',
    a: 'parametreBulletin',
  },
]

const restrictedItems: ParamItem[] = [
  {
    title: 'Clés API',
    description: 'Créer et gérer les clés d\'authentification pour les intégrations externes',
    icon: KeyRound,
    path: '/admin/parametrage/api-keys',
    color: 'bg-gray-900 text-white',
    I: 'create',
    a: 'session',
  },
  {
    title: 'Audit des sessions',
    description: 'Consulter l\'historique des connexions et déconnexions',
    icon: ScrollText,
    path: '/admin/parametrage/audits',
    color: 'bg-rose-100 text-rose-600',
    I: 'read',
    a: 'session',
  },
]

function ParametragePage() {
  const ability = useAbility()

  const allItems = [...parametrageItems, ...restrictedItems]
  const visibleItems = allItems.filter((item) => {
    if (item.disabled) return true
    if (!item.I || !item.a) return true
    return ability.can(item.I, item.a)
  })

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-slate-100 rounded-lg">
          <Settings className="w-6 h-6 text-slate-600" />
        </div>
        <div>
          <Title level={4} style={{ margin: 0 }}>Paramétrage</Title>
          <Text type="secondary">Configurez les paramètres de l'application</Text>
        </div>
      </div>

      {/* Grid of settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleItems.map((item) => (
          <Link
            key={item.path}
            to={item.disabled ? '#' : item.path}
            className={item.disabled ? 'cursor-not-allowed' : ''}
          >
            <Card
              hoverable={!item.disabled}
              className={`h-full transition-all ${item.disabled ? 'opacity-50' : 'hover:shadow-md'}`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${item.color}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <Title level={5} style={{ margin: 0, marginBottom: 4 }}>
                    {item.title}
                  </Title>
                  <Text type="secondary" className="text-sm">
                    {item.description}
                  </Text>
                  {item.disabled && (
                    <Text type="secondary" className="block text-xs mt-2 italic">
                      Bientôt disponible
                    </Text>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
