import { Typography, Spin, Tag, Empty, Select } from 'antd'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileText, MapPin, Award, User2, Power, HelpCircle, Clock } from 'lucide-react'
import type { Historique } from '@/types/historique'
import { TypeEvenement } from '@/types/historique'
import { HistoriqueService } from '@/services/historique.service'
import dayjs from 'dayjs'

const { Title, Text } = Typography

interface EmployeHistoriqueProps {
  employeId: string
}

const typeConfig: Record<TypeEvenement, { label: string; color: string; icon: React.ReactNode }> = {
  [TypeEvenement.CONTRAT_CREATION]: { label: 'Nouveau contrat', color: 'green', icon: <FileText className="w-4 h-4" /> },
  [TypeEvenement.CONTRAT_MODIFICATION]: { label: 'Modification contrat', color: 'blue', icon: <FileText className="w-4 h-4" /> },
  [TypeEvenement.CONTRAT_FIN]: { label: 'Fin de contrat', color: 'red', icon: <FileText className="w-4 h-4" /> },
  [TypeEvenement.AFFECTATION_SITE]: { label: 'Affectation site', color: 'purple', icon: <MapPin className="w-4 h-4" /> },
  [TypeEvenement.FIN_AFFECTATION_SITE]: { label: 'Fin affectation', color: 'orange', icon: <MapPin className="w-4 h-4" /> },
  [TypeEvenement.NOMINATION]: { label: 'Nomination', color: 'cyan', icon: <Award className="w-4 h-4" /> },
  [TypeEvenement.FIN_NOMINATION]: { label: 'Fin nomination', color: 'gold', icon: <Award className="w-4 h-4" /> },
  [TypeEvenement.MODIFICATION_PROFIL]: { label: 'Modification profil', color: 'geekblue', icon: <User2 className="w-4 h-4" /> },
  [TypeEvenement.ACTIVATION]: { label: 'Activation', color: 'lime', icon: <Power className="w-4 h-4" /> },
  [TypeEvenement.DESACTIVATION]: { label: 'Désactivation', color: 'volcano', icon: <Power className="w-4 h-4" /> },
  [TypeEvenement.AUTRE]: { label: 'Autre', color: 'default', icon: <HelpCircle className="w-4 h-4" /> },
}

export const EmployeHistorique = ({ employeId }: EmployeHistoriqueProps) => {
  const [filterType, setFilterType] = useState<TypeEvenement | undefined>(undefined)

  const { data: historique = [], isLoading } = useQuery({
    queryKey: ['historique', employeId],
    queryFn: () => HistoriqueService.getByEmploye(employeId),
    enabled: !!employeId,
  })

  const filtered = filterType
    ? historique.filter((h: Historique) => h.type_evenement === filterType)
    : historique

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Title level={5} className="mb-0!">Historique</Title>
          <Tag>{historique.length} événement{historique.length > 1 ? 's' : ''}</Tag>
        </div>
        <Select
          allowClear
          placeholder="Filtrer par type"
          style={{ width: 220 }}
          onChange={(val) => setFilterType(val)}
          options={Object.values(TypeEvenement).map(t => ({
            value: t,
            label: typeConfig[t].label,
          }))}
        />
      </div>

      {isLoading ? (
        <Spin />
      ) : filtered.length === 0 ? (
        <Empty description="Aucun événement" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

          <div className="space-y-4">
            {filtered.map((event: Historique) => {
              const config = typeConfig[event.type_evenement] || typeConfig[TypeEvenement.AUTRE]
              return (
                <div key={event._id} className="relative flex items-start gap-4 pl-10">
                  {/* Dot */}
                  <div
                    className="absolute left-2.5 w-3 h-3 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: `var(--ant-color-${config.color === 'default' ? 'text-secondary' : config.color}, #888)` }}
                  />

                  <div className="flex-1 bg-white border rounded-lg p-3 hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span style={{ color: `var(--ant-color-${config.color}, #666)` }}>
                        {config.icon}
                      </span>
                      <Tag color={config.color} className="text-xs">{config.label}</Tag>
                      <Text type="secondary" className="text-xs ml-auto flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {dayjs(event.createdAt).format('DD/MM/YYYY HH:mm')}
                      </Text>
                    </div>
                    <Text className="text-sm">{event.description}</Text>
                    {event.auteur && (
                      <Text type="secondary" className="text-xs block mt-1">Par : {event.auteur}</Text>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
