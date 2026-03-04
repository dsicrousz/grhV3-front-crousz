import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, Tag, Typography, Empty } from 'antd'
import { AlertTriangle, Cake, FileWarning, CalendarClock, Bell } from 'lucide-react'
import { EmployeService } from '@/services/employe.service'
import { CongeService } from '@/services/conge.service'
import type { Employe } from '@/types/employe'
import type { Conge } from '@/types/conge'
import { StatutDemandeConge } from '@/types/conge'
import dayjs from 'dayjs'

const { Text } = Typography

interface Rappel {
  id: string
  type: 'cdd_expiration' | 'anniversaire' | 'conge_en_attente' | 'conge_non_pris'
  severity: 'critical' | 'warning' | 'info'
  title: string
  description: string
  date?: string
  employeId?: string
}

const severityConfig = {
  critical: { color: '#ef4444', bg: '#fef2f2', border: '#fecaca', tagColor: 'red' },
  warning: { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', tagColor: 'orange' },
  info: { color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', tagColor: 'blue' },
}

const typeIcons = {
  cdd_expiration: <FileWarning className="w-4 h-4" />,
  anniversaire: <Cake className="w-4 h-4" />,
  conge_en_attente: <CalendarClock className="w-4 h-4" />,
  conge_non_pris: <AlertTriangle className="w-4 h-4" />,
}

const typeLabels = {
  cdd_expiration: 'Fin CDD',
  anniversaire: 'Anniversaire',
  conge_en_attente: 'Congé en attente',
  conge_non_pris: 'Congé non utilisé',
}

export function DashboardRappels() {
  const { data: employes = [] } = useQuery({
    queryKey: ['employes'],
    queryFn: () => EmployeService.getAll(),
  })

  const { data: conges = [] } = useQuery({
    queryKey: ['conges'],
    queryFn: () => CongeService.getAll(),
  })

  const rappels = useMemo<Rappel[]>(() => {
    const result: Rappel[] = []
    const today = dayjs()

    // 1. CDD expirant dans les 30/60/90 jours
    employes
      .filter((e: Employe) => e.is_actif && e.type === 'CDD' && e.date_de_fin_de_contrat)
      .forEach((e: Employe) => {
        const endDate = dayjs(e.date_de_fin_de_contrat)
        const daysLeft = endDate.diff(today, 'day')

        if (daysLeft < 0) {
          result.push({
            id: `cdd-expired-${e._id}`,
            type: 'cdd_expiration',
            severity: 'critical',
            title: `CDD expiré — ${e.prenom} ${e.nom}`,
            description: `Le contrat a expiré le ${endDate.format('DD/MM/YYYY')} (il y a ${Math.abs(daysLeft)} jours)`,
            date: e.date_de_fin_de_contrat,
            employeId: e._id,
          })
        } else if (daysLeft <= 30) {
          result.push({
            id: `cdd-30-${e._id}`,
            type: 'cdd_expiration',
            severity: 'critical',
            title: `CDD expire bientôt — ${e.prenom} ${e.nom}`,
            description: `Le contrat expire le ${endDate.format('DD/MM/YYYY')} (dans ${daysLeft} jours)`,
            date: e.date_de_fin_de_contrat,
            employeId: e._id,
          })
        } else if (daysLeft <= 60) {
          result.push({
            id: `cdd-60-${e._id}`,
            type: 'cdd_expiration',
            severity: 'warning',
            title: `CDD expire dans 2 mois — ${e.prenom} ${e.nom}`,
            description: `Le contrat expire le ${endDate.format('DD/MM/YYYY')} (dans ${daysLeft} jours)`,
            date: e.date_de_fin_de_contrat,
            employeId: e._id,
          })
        } else if (daysLeft <= 90) {
          result.push({
            id: `cdd-90-${e._id}`,
            type: 'cdd_expiration',
            severity: 'info',
            title: `CDD expire dans 3 mois — ${e.prenom} ${e.nom}`,
            description: `Le contrat expire le ${endDate.format('DD/MM/YYYY')} (dans ${daysLeft} jours)`,
            date: e.date_de_fin_de_contrat,
            employeId: e._id,
          })
        }
      })

    // 2. Anniversaires dans les 7 prochains jours
    employes
      .filter((e: Employe) => e.is_actif && e.date_de_naissance)
      .forEach((e: Employe) => {
        const birthday = dayjs(e.date_de_naissance)
        const thisYearBirthday = birthday.year(today.year())
        const nextBirthday = thisYearBirthday.isBefore(today, 'day')
          ? thisYearBirthday.add(1, 'year')
          : thisYearBirthday
        const daysUntil = nextBirthday.diff(today, 'day')
        const age = nextBirthday.year() - birthday.year()

        if (daysUntil === 0) {
          result.push({
            id: `bday-${e._id}`,
            type: 'anniversaire',
            severity: 'info',
            title: `🎂 Anniversaire aujourd'hui — ${e.prenom} ${e.nom}`,
            description: `${e.prenom} fête ses ${age} ans aujourd'hui !`,
            date: nextBirthday.toISOString(),
            employeId: e._id,
          })
        } else if (daysUntil <= 7) {
          result.push({
            id: `bday-${e._id}`,
            type: 'anniversaire',
            severity: 'info',
            title: `Anniversaire proche — ${e.prenom} ${e.nom}`,
            description: `${e.prenom} fêtera ses ${age} ans le ${nextBirthday.format('DD/MM')} (dans ${daysUntil} jours)`,
            date: nextBirthday.toISOString(),
            employeId: e._id,
          })
        }
      })

    // 3. Congés en attente de validation (> 3 jours)
    conges
      .filter((c: Conge) => c.statut === StatutDemandeConge.EN_ATTENTE)
      .forEach((c: Conge) => {
        const createdAt = dayjs(c.createdAt)
        const daysWaiting = today.diff(createdAt, 'day')
        const empName = typeof c.employe === 'object' && c.employe
          ? `${c.employe.prenom} ${c.employe.nom}`
          : 'Employé'

        if (daysWaiting >= 3) {
          result.push({
            id: `conge-pending-${c._id}`,
            type: 'conge_en_attente',
            severity: daysWaiting >= 7 ? 'critical' : 'warning',
            title: `Congé en attente depuis ${daysWaiting} jours`,
            description: `Demande de ${empName} du ${dayjs(c.date_debut).format('DD/MM')} au ${dayjs(c.date_fin).format('DD/MM')}`,
            date: c.createdAt,
          })
        }
      })

    // Sort: critical first, then warning, then info
    const severityOrder = { critical: 0, warning: 1, info: 2 }
    result.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

    return result
  }, [employes, conges])

  if (rappels.length === 0) {
    return (
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-gray-500" />
          <Text strong>Rappels & Alertes</Text>
        </div>
        <Empty description="Aucun rappel pour le moment" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Card>
    )
  }

  const criticalCount = rappels.filter(r => r.severity === 'critical').length
  const warningCount = rappels.filter(r => r.severity === 'warning').length

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-orange-500" />
          <Text strong>Rappels & Alertes</Text>
          <Tag color="default">{rappels.length}</Tag>
        </div>
        <div className="flex items-center gap-1">
          {criticalCount > 0 && <Tag color="red">{criticalCount} urgent{criticalCount > 1 ? 's' : ''}</Tag>}
          {warningCount > 0 && <Tag color="orange">{warningCount} attention</Tag>}
        </div>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {rappels.map(rappel => {
          const config = severityConfig[rappel.severity]
          return (
            <div
              key={rappel.id}
              className="flex items-start gap-3 p-3 rounded-lg transition-colors hover:opacity-90"
              style={{
                backgroundColor: config.bg,
                borderLeft: `4px solid ${config.color}`,
              }}
            >
              <div className="mt-0.5" style={{ color: config.color }}>
                {typeIcons[rappel.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Text strong className="text-sm" style={{ color: config.color }}>
                    {rappel.title}
                  </Text>
                  <Tag color={config.tagColor} className="text-[10px]">
                    {typeLabels[rappel.type]}
                  </Tag>
                </div>
                <Text type="secondary" className="text-xs block mt-0.5">
                  {rappel.description}
                </Text>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
