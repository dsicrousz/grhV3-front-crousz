import { createFileRoute, Link } from '@tanstack/react-router'
import { Typography, Card } from 'antd'
import { FileText, Building2, Users, Settings, UserCog, Briefcase } from 'lucide-react'

const { Title, Text } = Typography

export const Route = createFileRoute('/admin/parametrage/')({
  component: ParametragePage,
})

const parametrageItems = [
  {
    title: 'Utilisateurs',
    description: 'Gérer les comptes et les permissions des utilisateurs',
    icon: UserCog,
    path: '/admin/parametrage/utilisateurs',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    title: 'Rubriques de paie',
    description: 'Gérer les rubriques utilisées dans les bulletins de paie',
    icon: FileText,
    path: '/admin/parametrage/rubriques',
    color: 'bg-teal-100 text-teal-600',
  },
  {
    title: 'Fonctions',
    description: 'Gérer les fonctions des employés',
    icon: Briefcase,
    path: '/admin/parametrage/fonctions',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    title: 'Divisions & Services',
    description: 'Gérer l\'organigramme de l\'entreprise',
    icon: Building2,
    path: '/admin/parametrage/divisions',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    title: 'Catégories employés',
    description: 'Définir les catégories professionnelles',
    icon: Users,
    path: '/admin/parametrage/categories',
    color: 'bg-indigo-100 text-indigo-600',
    disabled: true,
  },
  {
    title:'Attributions Individuelles',
    description: 'Gérer les attributions des rubriques',
    icon: FileText,
    path: '/admin/parametrage/attributions-individuelles',
    color: 'bg-teal-100 text-teal-600',
  }
]

function ParametragePage() {
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
        {parametrageItems.map((item) => (
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
