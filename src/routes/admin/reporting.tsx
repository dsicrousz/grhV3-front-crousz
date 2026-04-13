import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, Typography, Spin, Row, Col, Tag, Statistic, Button, Space } from 'antd'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
  AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'
import { BarChart3, Users, TrendingUp, DollarSign, Building2, Briefcase, Calendar, Download } from 'lucide-react'
import { EmployeService } from '@/services/employe.service'
import { NominationService } from '@/services/nomination.service'
import { AbsenceService } from '@/services/absence.service'
import { CongeService } from '@/services/conge.service'
import type { Employe } from '@/types/employe'
import type { Nomination } from '@/types/nomination'
import type { Absence } from '@/types/absence'
import type { Conge } from '@/types/conge'
import dayjs from 'dayjs'
import { exportToExcel } from '@/lib/export-utils'

const { Title, Text } = Typography

export const Route = createFileRoute('/admin/reporting')({
  component: ReportingPage,
})

function ReportingPage() {
  const { data: employes = [], isLoading: loadingEmp } = useQuery({
    queryKey: ['employes'],
    queryFn: () => EmployeService.getAll(),
  })

  const { data: nominations = [], isLoading: loadingNom } = useQuery({
    queryKey: ['nominations'],
    queryFn: () => NominationService.getAll(),
  })

  const { data: absences = [], isLoading: loadingAbs } = useQuery({
    queryKey: ['absences'],
    queryFn: () => AbsenceService.getAll(),
  })

  const { data: conges = [], isLoading: loadingCng } = useQuery({
    queryKey: ['conges'],
    queryFn: () => CongeService.getAll(),
  })

  const isLoading = loadingEmp || loadingNom || loadingAbs || loadingCng

  // --- 1. Pyramide des âges ---
  const ageData = useMemo(() => {
    const brackets: Record<string, { hommes: number; femmes: number }> = {
      '< 25': { hommes: 0, femmes: 0 },
      '25-34': { hommes: 0, femmes: 0 },
      '35-44': { hommes: 0, femmes: 0 },
      '45-54': { hommes: 0, femmes: 0 },
      '55+': { hommes: 0, femmes: 0 },
    }

    employes.filter((e: Employe) => e.is_actif && e.date_de_naissance).forEach((e: Employe) => {
      const age = dayjs().diff(dayjs(e.date_de_naissance), 'year')
      const genre = e.genre === 'Homme' ? 'hommes' : 'femmes'
      if (age < 25) brackets['< 25'][genre]++
      else if (age < 35) brackets['25-34'][genre]++
      else if (age < 45) brackets['35-44'][genre]++
      else if (age < 55) brackets['45-54'][genre]++
      else brackets['55+'][genre]++
    })

    return Object.entries(brackets).map(([tranche, data]) => ({
      tranche,
      Hommes: data.hommes,
      Femmes: data.femmes,
    }))
  }, [employes])

  // --- 2. Masse salariale par division ---
  const salaryByDivision = useMemo(() => {
    const nominationsActives = nominations.filter((n: Nomination) => n.est_active)
    const divMap = new Map<string, { nom: string; total: number; count: number }>()

    nominationsActives.forEach((n: Nomination) => {
      if (!n.division || !n.employe) return
      const divName = n.division.nom || 'Inconnu'
      const employe = n.employe
      const salaire = employe?.categorie?.valeur || 0

      if (!employe || salaire === 0) return

      const existing = divMap.get(divName) || { nom: divName, total: 0, count: 0 }
      existing.total += salaire
      existing.count++
      divMap.set(divName, existing)
    })

    return Array.from(divMap.values())
      .sort((a, b) => b.total - a.total)
      .map(d => ({
        nom: d.nom.length > 20 ? d.nom.substring(0, 20) + '...' : d.nom,
        masse_salariale: d.total,
        effectif: d.count,
        salaire_moyen: d.count > 0 ? Math.round(d.total / d.count) : 0,
      }))
  }, [nominations, employes])

  // --- 3. Évolution des effectifs par année de recrutement ---
  const effectifsEvolution = useMemo(() => {
    const yearMap = new Map<number, number>()
    employes
      .filter((e: Employe) => e.date_de_recrutement)
      .forEach((e: Employe) => {
        const year = dayjs(e.date_de_recrutement).year()
        yearMap.set(year, (yearMap.get(year) || 0) + 1)
      })

    const years = Array.from(yearMap.keys()).sort()
    if (years.length === 0) return []

    let cumul = 0
    return years.map(year => {
      cumul += yearMap.get(year) || 0
      return { annee: year.toString(), recrutements: yearMap.get(year) || 0, effectif_cumule: cumul }
    })
  }, [employes])

  // --- 4. Taux d'absentéisme par mois (12 derniers mois) ---
  const absenteismeData = useMemo(() => {
    const result: { mois: string; absences: number; conges: number; total: number }[] = []
    for (let i = 11; i >= 0; i--) {
      const month = dayjs().subtract(i, 'month')
      const monthStart = month.startOf('month')
      const monthEnd = month.endOf('month')

      const absCount = absences.filter((a: Absence) => {
        const start = dayjs(a.date_debut)
        const end = dayjs(a.date_fin)
        return (start.isBefore(monthEnd) || start.isSame(monthEnd)) &&
               (end.isAfter(monthStart) || end.isSame(monthStart))
      }).length

      const cngCount = conges.filter((c: Conge) => {
        const start = dayjs(c.date_debut)
        const end = dayjs(c.date_fin)
        return (start.isBefore(monthEnd) || start.isSame(monthEnd)) &&
               (end.isAfter(monthStart) || end.isSame(monthStart))
      }).length

      result.push({
        mois: month.format('MMM YY'),
        absences: absCount,
        conges: cngCount,
        total: absCount + cngCount,
      })
    }

    return result
  }, [absences, conges, employes])

  // --- 5. Répartition par type de contrat ---
  const contratData = useMemo(() => {
    const cdi = employes.filter((e: Employe) => e.is_actif && e.type === 'CDI').length
    const cdd = employes.filter((e: Employe) => e.is_actif && e.type === 'CDD').length
    return [
      { name: 'CDI', value: cdi, color: '#22c55e' },
      { name: 'CDD', value: cdd, color: '#f59e0b' },
    ].filter(d => d.value > 0)
  }, [employes])

  // --- 6. Ancienneté moyenne ---
  const ancienneteData = useMemo(() => {
    const brackets: Record<string, number> = {
      '< 1 an': 0,
      '1-3 ans': 0,
      '3-5 ans': 0,
      '5-10 ans': 0,
      '10-20 ans': 0,
      '20+ ans': 0,
    }

    employes
      .filter((e: Employe) => e.is_actif && e.date_de_recrutement)
      .forEach((e: Employe) => {
        const years = dayjs().diff(dayjs(e.date_de_recrutement), 'year')
        if (years < 1) brackets['< 1 an']++
        else if (years < 3) brackets['1-3 ans']++
        else if (years < 5) brackets['3-5 ans']++
        else if (years < 10) brackets['5-10 ans']++
        else if (years < 20) brackets['10-20 ans']++
        else brackets['20+ ans']++
      })

    return Object.entries(brackets).map(([tranche, count]) => ({
      tranche,
      effectif: count,
    }))
  }, [employes])

  // --- KPIs ---
  const kpis = useMemo(() => {
    const actifs = employes.filter((e: Employe) => e.is_actif)
    const totalSalaire = actifs.reduce((sum, e: Employe) => sum + (e.categorie?.valeur || 0), 0)
    const anciennetes = actifs
      .filter((e: Employe) => e.date_de_recrutement)
      .map((e: Employe) => dayjs().diff(dayjs(e.date_de_recrutement), 'year'))
    const avgAnciennete = anciennetes.length > 0
      ? (anciennetes.reduce((a, b) => a + b, 0) / anciennetes.length).toFixed(1)
      : '0'
    const ages = actifs
      .filter((e: Employe) => e.date_de_naissance)
      .map((e: Employe) => dayjs().diff(dayjs(e.date_de_naissance), 'year'))
    const avgAge = ages.length > 0
      ? (ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1)
      : '0'

    const thisYear = dayjs().year()
    const recrutementsThisYear = employes.filter((e: Employe) =>
      e.date_de_recrutement && dayjs(e.date_de_recrutement).year() === thisYear
    ).length

    return {
      totalActifs: actifs.length,
      masseSalariale: totalSalaire,
      salaireMoyen: actifs.length > 0 ? Math.round(totalSalaire / actifs.length) : 0,
      avgAnciennete,
      avgAge,
      recrutementsThisYear,
      totalAbsences: absences.length,
      totalConges: conges.length,
    }
  }, [employes, absences, conges])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <BarChart3 className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <Title level={4} style={{ margin: 0 }}>Statistiques & Reporting</Title>
            <Text type="secondary">Analyses avancées des ressources humaines</Text>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} md={6}>
          <Card size="small">
            <Statistic
              title="Effectif actif"
              value={kpis.totalActifs}
              prefix={<Users className="w-4 h-4 text-blue-500" />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card size="small">
            <Statistic
              title="Masse salariale"
              value={kpis.masseSalariale}
              prefix={<DollarSign className="w-4 h-4 text-green-500" />}
              suffix="FCFA"
              formatter={(value) => Number(value).toLocaleString('fr-FR')}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card size="small">
            <Statistic
              title="Salaire moyen"
              value={kpis.salaireMoyen}
              prefix={<TrendingUp className="w-4 h-4 text-orange-500" />}
              suffix="FCFA"
              formatter={(value) => Number(value).toLocaleString('fr-FR')}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card size="small">
            <Statistic
              title="Âge moyen"
              value={kpis.avgAge}
              suffix="ans"
              prefix={<Calendar className="w-4 h-4 text-purple-500" />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card size="small">
            <Statistic
              title="Ancienneté moy."
              value={kpis.avgAnciennete}
              suffix="ans"
              prefix={<Briefcase className="w-4 h-4 text-cyan-500" />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card size="small">
            <Statistic
              title="Recrutements"
              value={kpis.recrutementsThisYear}
              suffix={`en ${dayjs().year()}`}
              prefix={<Building2 className="w-4 h-4 text-indigo-500" />}
            />
          </Card>
        </Col>
      </Row>

      {/* Row 1: Pyramide des âges + Contrats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title="Pyramide des âges"
            extra={<Tag color="blue">{employes.filter((e: Employe) => e.is_actif).length} actifs</Tag>}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ageData} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="tranche" type="category" width={60} />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="Hommes" fill="#3b82f6" stackId="a" />
                <Bar dataKey="Femmes" fill="#ec4899" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Type de contrat">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={contratData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  dataKey="value"
                >
                  {contratData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Row 2: Masse salariale par division */}
      {salaryByDivision.length > 0 && (
        <Card
          title="Masse salariale par division"
          extra={
            <Button
              size="small"
              icon={<Download className="w-3 h-3" />}
              onClick={() => exportToExcel(
                salaryByDivision,
                [
                  { header: 'Division', key: 'nom' },
                  { header: 'Masse salariale (FCFA)', key: 'masse_salariale' },
                  { header: 'Effectif', key: 'effectif' },
                  { header: 'Salaire moyen (FCFA)', key: 'salaire_moyen' },
                ],
                'masse_salariale_divisions'
              )}
            >
              Export
            </Button>
          }
        >
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={salaryByDivision}>
              <XAxis dataKey="nom" angle={-20} textAnchor="end" height={80} interval={0} fontSize={11} />
              <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <RechartsTooltip
                formatter={(value: any) => [`${(Number(value) ?? 0).toLocaleString('fr-FR')} FCFA`]}
              />
              <Legend />
              <Bar dataKey="masse_salariale" name="Masse salariale" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Row 3: Évolution effectifs + Ancienneté */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="Évolution des effectifs">
            {effectifsEvolution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={effectifsEvolution}>
                  <XAxis dataKey="annee" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="effectif_cumule"
                    name="Effectif cumulé"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.15}
                  />
                  <Area
                    type="monotone"
                    dataKey="recrutements"
                    name="Recrutements"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.15}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-400 py-12">Aucune donnée de recrutement</div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Répartition par ancienneté">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={ancienneteData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="tranche" fontSize={11} />
                <PolarRadiusAxis />
                <Radar
                  name="Effectif"
                  dataKey="effectif"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                />
                <RechartsTooltip />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Row 4: Taux d'absentéisme */}
      <Card
        title="Absences & Congés — 12 derniers mois"
        extra={
          <Space>
            <Tag color="blue">Total absences: {kpis.totalAbsences}</Tag>
            <Tag color="green">Total congés: {kpis.totalConges}</Tag>
          </Space>
        }
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={absenteismeData}>
            <XAxis dataKey="mois" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Bar dataKey="absences" name="Absences" fill="#ef4444" radius={[4, 4, 0, 0]} />
            <Bar dataKey="conges" name="Congés" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
