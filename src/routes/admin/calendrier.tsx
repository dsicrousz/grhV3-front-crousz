import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, Tag, Select, Typography, Badge, Tooltip, Space, Button } from 'antd'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { AbsenceService } from '@/services/absence.service'
import { CongeService } from '@/services/conge.service'
import { EmployeService } from '@/services/employe.service'
import type { Absence } from '@/types/absence'
import { TypeAbsence, StatutDemande } from '@/types/absence'
import type { Conge } from '@/types/conge'
import { TypeConge, StatutDemandeConge } from '@/types/conge'
import type { Employe } from '@/types/employe'
import dayjs from 'dayjs'

const { Title, Text } = Typography

export const Route = createFileRoute('/admin/calendrier')({
  component: CalendrierPage,
})

interface CalendarEvent {
  id: string
  title: string
  employeName: string
  dateDebut: string
  dateFin: string
  type: string
  category: 'absence' | 'conge'
  statut: string
  color: string
  bgColor: string
}

const absenceColors: Record<TypeAbsence, { color: string; bg: string }> = {
  [TypeAbsence.MALADIE]: { color: '#ef4444', bg: '#fef2f2' },
  [TypeAbsence.PERSONNEL]: { color: '#3b82f6', bg: '#eff6ff' },
  [TypeAbsence.FAMILIAL]: { color: '#8b5cf6', bg: '#f5f3ff' },
  [TypeAbsence.AUTRE]: { color: '#6b7280', bg: '#f9fafb' },
}

const congeColors: Record<TypeConge, { color: string; bg: string }> = {
  [TypeConge.ANNUEL]: { color: '#22c55e', bg: '#f0fdf4' },
  [TypeConge.MALADIE]: { color: '#ef4444', bg: '#fef2f2' },
  [TypeConge.MATERNITE]: { color: '#ec4899', bg: '#fdf2f8' },
  [TypeConge.PATERNITE]: { color: '#3b82f6', bg: '#eff6ff' },
  [TypeConge.SANS_SOLDE]: { color: '#f97316', bg: '#fff7ed' },
  [TypeConge.EXCEPTIONNEL]: { color: '#8b5cf6', bg: '#f5f3ff' },
  [TypeConge.FORMATION]: { color: '#06b6d4', bg: '#ecfeff' },
  [TypeConge.AUTRE]: { color: '#6b7280', bg: '#f9fafb' },
}

const typeAbsenceLabels: Record<TypeAbsence, string> = {
  [TypeAbsence.MALADIE]: 'Maladie',
  [TypeAbsence.PERSONNEL]: 'Personnel',
  [TypeAbsence.FAMILIAL]: 'Familial',
  [TypeAbsence.AUTRE]: 'Autre',
}

const typeCongeLabels: Record<TypeConge, string> = {
  [TypeConge.ANNUEL]: 'Annuel',
  [TypeConge.MALADIE]: 'Maladie',
  [TypeConge.MATERNITE]: 'Maternité',
  [TypeConge.PATERNITE]: 'Paternité',
  [TypeConge.SANS_SOLDE]: 'Sans solde',
  [TypeConge.EXCEPTIONNEL]: 'Exceptionnel',
  [TypeConge.FORMATION]: 'Formation',
  [TypeConge.AUTRE]: 'Autre',
}

function CalendrierPage() {
  const [currentDate, setCurrentDate] = useState(dayjs())
  const [filterEmploye, setFilterEmploye] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<'all' | 'absence' | 'conge'>('all')
  const [filterStatut, setFilterStatut] = useState<string | null>(null)

  const { data: absences = [] } = useQuery({
    queryKey: ['absences'],
    queryFn: () => AbsenceService.getAll(),
  })

  const { data: conges = [] } = useQuery({
    queryKey: ['conges'],
    queryFn: () => CongeService.getAll(),
  })

  const { data: employes = [] } = useQuery({
    queryKey: ['employes'],
    queryFn: () => EmployeService.getAll(),
  })

  const getEmployeName = (employe: Employe | string): string => {
    if (typeof employe === 'object' && employe) return `${employe.prenom} ${employe.nom}`
    const found = employes.find(e => e._id === employe)
    return found ? `${found.prenom} ${found.nom}` : 'Inconnu'
  }

  const getEmployeId = (employe: Employe | string): string => {
    if (typeof employe === 'object' && employe) return employe._id
    return employe
  }

  const events = useMemo<CalendarEvent[]>(() => {
    const absenceEvents: CalendarEvent[] = absences.map((a: Absence) => {
      const colors = absenceColors[a.type] || absenceColors[TypeAbsence.AUTRE]
      return {
        id: `abs-${a._id}`,
        title: `Absence - ${typeAbsenceLabels[a.type] || a.type}`,
        employeName: getEmployeName(a.employe),
        dateDebut: a.date_debut,
        dateFin: a.date_fin,
        type: a.type,
        category: 'absence' as const,
        statut: a.statut,
        color: colors.color,
        bgColor: colors.bg,
      }
    })

    const congeEvents: CalendarEvent[] = conges.map((c: Conge) => {
      const colors = congeColors[c.type] || congeColors[TypeConge.AUTRE]
      return {
        id: `cng-${c._id}`,
        title: `Congé - ${typeCongeLabels[c.type] || c.type}`,
        employeName: getEmployeName(c.employe),
        dateDebut: c.date_debut,
        dateFin: c.date_fin,
        type: c.type,
        category: 'conge' as const,
        statut: c.statut,
        color: colors.color,
        bgColor: colors.bg,
      }
    })

    let allEvents = [...absenceEvents, ...congeEvents]

    if (filterEmploye) {
      allEvents = allEvents.filter(e => {
        const absItem = absences.find(a => `abs-${a._id}` === e.id)
        const cngItem = conges.find(c => `cng-${c._id}` === e.id)
        if (absItem) return getEmployeId(absItem.employe) === filterEmploye
        if (cngItem) return getEmployeId(cngItem.employe) === filterEmploye
        return false
      })
    }

    if (filterCategory !== 'all') {
      allEvents = allEvents.filter(e => e.category === filterCategory)
    }

    if (filterStatut) {
      allEvents = allEvents.filter(e => e.statut === filterStatut)
    }

    return allEvents
  }, [absences, conges, employes, filterEmploye, filterCategory, filterStatut])

  // Calendar grid generation
  const startOfMonth = currentDate.startOf('month')
  const endOfMonth = currentDate.endOf('month')
  const startOfCalendar = startOfMonth.startOf('week')
  const endOfCalendar = endOfMonth.endOf('week')

  const weeks: dayjs.Dayjs[][] = []
  let day = startOfCalendar
  while (day.isBefore(endOfCalendar) || day.isSame(endOfCalendar, 'day')) {
    const week: dayjs.Dayjs[] = []
    for (let i = 0; i < 7; i++) {
      week.push(day)
      day = day.add(1, 'day')
    }
    weeks.push(week)
  }

  const getEventsForDay = (date: dayjs.Dayjs): CalendarEvent[] => {
    return events.filter(event => {
      const start = dayjs(event.dateDebut).startOf('day')
      const end = dayjs(event.dateFin).startOf('day')
      return (date.isSame(start, 'day') || date.isAfter(start, 'day')) &&
             (date.isSame(end, 'day') || date.isBefore(end, 'day'))
    })
  }

  const statutTagColor = (statut: string) => {
    if (statut === StatutDemande.APPROUVEE || statut === StatutDemandeConge.APPROUVEE) return 'green'
    if (statut === StatutDemande.REJETEE || statut === StatutDemandeConge.REJETEE) return 'red'
    return 'orange'
  }

  const statutLabel = (statut: string) => {
    if (statut === StatutDemande.APPROUVEE || statut === StatutDemandeConge.APPROUVEE) return 'Approuvé'
    if (statut === StatutDemande.REJETEE || statut === StatutDemandeConge.REJETEE) return 'Rejeté'
    return 'En attente'
  }

  const joursSemaine = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  // Stats
  const monthEvents = events.filter(e => {
    const start = dayjs(e.dateDebut)
    const end = dayjs(e.dateFin)
    return (start.isSame(currentDate, 'month') || end.isSame(currentDate, 'month') ||
      (start.isBefore(startOfMonth) && end.isAfter(endOfMonth)))
  })
  const absCount = monthEvents.filter(e => e.category === 'absence').length
  const cngCount = monthEvents.filter(e => e.category === 'conge').length
  const pendingCount = monthEvents.filter(e =>
    e.statut === StatutDemande.EN_ATTENTE || e.statut === StatutDemandeConge.EN_ATTENTE
  ).length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Calendar className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <Title level={4} style={{ margin: 0 }}>Calendrier des absences & congés</Title>
            <Text type="secondary">Vue d'ensemble mensuelle de l'équipe</Text>
          </div>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card size="small">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-700">{monthEvents.length}</div>
            <div className="text-xs text-gray-500">Total ce mois</div>
          </div>
        </Card>
        <Card size="small" className="border-l-4 border-l-orange-500">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{absCount}</div>
            <div className="text-xs text-gray-500">Absences</div>
          </div>
        </Card>
        <Card size="small" className="border-l-4 border-l-green-500">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{cngCount}</div>
            <div className="text-xs text-gray-500">Congés</div>
          </div>
        </Card>
        <Card size="small" className="border-l-4 border-l-yellow-500">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <div className="text-xs text-gray-500">En attente</div>
          </div>
        </Card>
      </div>

      {/* Filtres + Navigation */}
      <Card size="small">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              icon={<ChevronLeft className="w-4 h-4" />}
              onClick={() => setCurrentDate(prev => prev.subtract(1, 'month'))}
            />
            <div className="min-w-[200px] text-center">
              <span className="text-lg font-semibold capitalize">
                {currentDate.format('MMMM YYYY')}
              </span>
            </div>
            <Button
              icon={<ChevronRight className="w-4 h-4" />}
              onClick={() => setCurrentDate(prev => prev.add(1, 'month'))}
            />
            <Button size="small" onClick={() => setCurrentDate(dayjs())}>
              Aujourd'hui
            </Button>
          </div>

          <Space wrap>
            <Select
              placeholder="Employé"
              allowClear
              showSearch
              optionFilterProp="label"
              style={{ width: 200 }}
              value={filterEmploye}
              onChange={setFilterEmploye}
              options={employes.map(e => ({ value: e._id, label: `${e.prenom} ${e.nom}` }))}
            />
            <Select
              placeholder="Catégorie"
              allowClear
              style={{ width: 140 }}
              value={filterCategory === 'all' ? null : filterCategory}
              onChange={(v) => setFilterCategory(v || 'all')}
              options={[
                { value: 'absence', label: 'Absences' },
                { value: 'conge', label: 'Congés' },
              ]}
            />
            <Select
              placeholder="Statut"
              allowClear
              style={{ width: 140 }}
              value={filterStatut}
              onChange={setFilterStatut}
              options={[
                { value: 'en_attente', label: 'En attente' },
                { value: 'approuvee', label: 'Approuvé' },
                { value: 'rejetee', label: 'Rejeté' },
              ]}
            />
          </Space>
        </div>
      </Card>

      {/* Calendar Grid */}
      <Card bodyStyle={{ padding: 0 }}>
        {/* Header jours */}
        <div className="grid grid-cols-7 border-b">
          {joursSemaine.map(jour => (
            <div key={jour} className="py-3 text-center text-sm font-semibold text-gray-600 bg-gray-50">
              {jour}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-7 border-b last:border-b-0">
            {week.map((date, dayIdx) => {
              const isCurrentMonth = date.isSame(currentDate, 'month')
              const isToday = date.isSame(dayjs(), 'day')
              const dayEvents = getEventsForDay(date)
              const displayEvents = dayEvents.slice(0, 3)
              const moreCount = dayEvents.length - 3

              return (
                <div
                  key={dayIdx}
                  className={`min-h-[110px] p-1 border-r last:border-r-0 transition-colors ${
                    isCurrentMonth ? 'bg-white' : 'bg-gray-50/50'
                  } ${isToday ? 'bg-blue-50/50' : ''}`}
                >
                  <div className={`text-right text-sm mb-1 px-1 ${
                    isToday
                      ? 'font-bold'
                      : isCurrentMonth
                      ? 'text-gray-700'
                      : 'text-gray-300'
                  }`}>
                    {isToday ? (
                      <Badge count={date.date()} style={{ backgroundColor: '#3b82f6' }} />
                    ) : (
                      date.date()
                    )}
                  </div>

                  <div className="space-y-0.5">
                    {displayEvents.map(event => (
                      <Tooltip
                        key={event.id}
                        title={
                          <div>
                            <div className="font-semibold">{event.employeName}</div>
                            <div>{event.title}</div>
                            <div className="text-xs opacity-80">
                              {dayjs(event.dateDebut).format('DD/MM')} → {dayjs(event.dateFin).format('DD/MM')}
                            </div>
                            <Tag color={statutTagColor(event.statut)} className="mt-1">
                              {statutLabel(event.statut)}
                            </Tag>
                          </div>
                        }
                      >
                        <div
                          className="text-[10px] leading-tight px-1 py-0.5 rounded truncate cursor-pointer"
                          style={{
                            backgroundColor: event.bgColor,
                            color: event.color,
                            borderLeft: `3px solid ${event.color}`,
                          }}
                        >
                          {event.employeName.split(' ')[0]}
                          <span className="opacity-60 ml-0.5">
                            {event.category === 'absence' ? '• Abs' : '• Cng'}
                          </span>
                        </div>
                      </Tooltip>
                    ))}
                    {moreCount > 0 && (
                      <Tooltip
                        title={
                          <div className="space-y-1">
                            {dayEvents.slice(3).map(event => (
                              <div key={event.id}>
                                <span className="font-medium">{event.employeName}</span>
                                <span className="opacity-80 ml-1">- {event.title}</span>
                              </div>
                            ))}
                          </div>
                        }
                      >
                        <div className="text-[10px] text-center text-gray-500 cursor-pointer hover:text-gray-700">
                          +{moreCount} de plus
                        </div>
                      </Tooltip>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </Card>

      {/* Légende */}
      <Card size="small">
        <div className="flex flex-wrap gap-6">
          <div>
            <Text strong className="text-sm block mb-2">Absences</Text>
            <div className="flex flex-wrap gap-2">
              {Object.entries(typeAbsenceLabels).map(([key, label]) => (
                <Tag
                  key={key}
                  color={absenceColors[key as TypeAbsence]?.color}
                  className="text-xs"
                >
                  {label}
                </Tag>
              ))}
            </div>
          </div>
          <div>
            <Text strong className="text-sm block mb-2">Congés</Text>
            <div className="flex flex-wrap gap-2">
              {Object.entries(typeCongeLabels).map(([key, label]) => (
                <Tag
                  key={key}
                  color={congeColors[key as TypeConge]?.color}
                  className="text-xs"
                >
                  {label}
                </Tag>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
