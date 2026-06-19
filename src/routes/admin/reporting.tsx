import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, Typography, Spin, Row, Col, Tag, Statistic, Button, Space, Select, DatePicker } from 'antd'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
  AreaChart, Area,
  LineChart, Line,
  ComposedChart,
} from 'recharts'
import { BarChart3, Users, TrendingUp, DollarSign, Building2, Briefcase, Download, UserMinus, UserCheck, Activity } from 'lucide-react'
import { ReportingService } from '@/services/reporting.service'
import dayjs from 'dayjs'
import { exportToExcel } from '@/lib/export-utils'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

const CONTRAT_COLORS: Record<string, string> = {
  CDI: '#22c55e',
  CDD: '#f59e0b',
  TEMPORAIRE: '#3b82f6',
}

const MOTIF_LABELS: Record<string, string> = {
  DEMISSION: 'Démission',
  LICENCIEMENT_ABUSIF: 'Licenciement abusif',
  LICENCIEMENT_ECONOMIQUE: 'Licenciement économique',
  LICENCIEMENT_DISCIPLINAIRE: 'Licenciement disciplinaire',
  RETRAITE: 'Retraite',
  DECES: 'Décès',
  FIN_CDD: 'Fin de CDD',
  RUPTURE_CONVENTIONNELLE: 'Rupture conventionnelle',
  AUTRE: 'Autre',
}

const PIE_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316']

export const Route = createFileRoute('/admin/reporting')({
  component: ReportingPage,
})

function ReportingPage() {
  const [periode, setPeriode] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('year'),
    dayjs().endOf('year'),
  ])
  const [anneeMS, setAnneeMS] = useState<number | undefined>(dayjs().year())
  const [anneeTurnover, setAnneeTurnover] = useState<number>(dayjs().year())
  const [turnoverRange, setTurnoverRange] = useState<[number, number]>([dayjs().year() - 5, dayjs().year()])
  const [msMensuelleRange, setMsMensuelleRange] = useState<[number, number]>([dayjs().year() - 1, dayjs().year()])

  // --- Queries ---
  const { data: effectifByType = [], isLoading: loadingEffType } = useQuery({
    queryKey: ['reporting', 'effectif', 'by-type-contrat'],
    queryFn: () => ReportingService.getEffectifByTypeContrat(),
  })

  const { data: effectifByAge = [], isLoading: loadingEffAge } = useQuery({
    queryKey: ['reporting', 'effectif', 'by-age'],
    queryFn: () => ReportingService.getEffectifByAge(),
  })

  const { data: effectifByAnnee = [], isLoading: loadingEffAnnee } = useQuery({
    queryKey: ['reporting', 'effectif', 'by-annee-recrutement'],
    queryFn: () => ReportingService.getEffectifByAnneeRecrutement(),
  })

  const { data: effectifByPeriode, isLoading: loadingEffPer } = useQuery({
    queryKey: ['reporting', 'effectif', 'by-periode', periode[0].format('YYYY-MM-DD'), periode[1].format('YYYY-MM-DD')],
    queryFn: () => ReportingService.getEffectifByPeriode(
      periode[0].format('YYYY-MM-DD'),
      periode[1].format('YYYY-MM-DD'),
    ),
  })

  const effectifPeriodeData = useMemo(() => {
    if (Array.isArray(effectifByPeriode)) {
      return effectifByPeriode.map(d => ({ key: d.key, total: d.total }))
    }
    return []
  }, [effectifByPeriode])

  const effectifPeriodeTotal = useMemo(() => {
    if (typeof effectifByPeriode === 'number') return effectifByPeriode
    if (Array.isArray(effectifByPeriode)) {
      return effectifByPeriode.reduce((sum, d) => sum + d.total, 0)
    }
    return 0
  }, [effectifByPeriode])

  const { data: contratsByType = [] } = useQuery({
    queryKey: ['reporting', 'contrats', 'by-type'],
    queryFn: () => ReportingService.getContratsByType(),
  })

  const { data: contratsByMotif = [], isLoading: loadingMotif } = useQuery({
    queryKey: ['reporting', 'contrats', 'by-motif-rupture'],
    queryFn: () => ReportingService.getContratsByMotifRupture(),
  })

  const { data: contratsByAnnee = [], isLoading: loadingContAnnee } = useQuery({
    queryKey: ['reporting', 'contrats', 'by-annee'],
    queryFn: () => ReportingService.getContratsByAnnee(),
  })

  const { data: msByAnnee = [], isLoading: loadingMSAnnee } = useQuery({
    queryKey: ['reporting', 'masse-salariale', 'by-annee'],
    queryFn: () => ReportingService.getMasseSalarialeByAnnee(),
  })

  const { data: msByPoste = [], isLoading: loadingMSPoste } = useQuery({
    queryKey: ['reporting', 'masse-salariale', 'by-poste', anneeMS],
    queryFn: () => ReportingService.getMasseSalarialeByPoste(anneeMS),
  })

  const { data: turnoverByAnnee = [], isLoading: loadingTurnoverAnnee } = useQuery({
    queryKey: ['reporting', 'turnover', 'by-annee', turnoverRange[0], turnoverRange[1]],
    queryFn: () => ReportingService.getTurnoverByAnnee(turnoverRange[0], turnoverRange[1]),
  })


  const { data: turnoverByMois = [], isLoading: loadingTurnoverMois } = useQuery({
    queryKey: ['reporting', 'turnover', 'by-mois', anneeTurnover],
    queryFn: () => ReportingService.getTurnoverByMois(anneeTurnover),
  })

  const { data: retentionCohorte = [], isLoading: loadingRetention } = useQuery({
    queryKey: ['reporting', 'retention', 'by-cohorte'],
    queryFn: () => ReportingService.getRetentionByCohorte(),
  })

  const { data: msMensuelle = [], isLoading: loadingMSMensuelle } = useQuery({
    queryKey: ['reporting', 'masse-salariale', 'mensuelle', msMensuelleRange[0], msMensuelleRange[1]],
    queryFn: () => ReportingService.getMasseSalarialeMensuelle(msMensuelleRange[0], msMensuelleRange[1]),
  })

  const isLoading = loadingEffType || loadingEffAge || loadingEffAnnee || loadingMSAnnee

  // --- Données préparées ---
  const contratPieData = useMemo(() =>
    effectifByType.map(d => ({
      name: d.key,
      value: d.total,
      color: CONTRAT_COLORS[d.key] || '#64748b',
    })).filter(d => d.value > 0),
    [effectifByType],
  )

  const ageBarData = useMemo(() =>
    effectifByAge.map(d => ({ tranche: d.key, effectif: d.total })),
    [effectifByAge],
  )

  const recrutementData = useMemo(() => {
    const sorted = [...effectifByAnnee].sort((a, b) => Number(a.key) - Number(b.key))
    let cumul = 0
    return sorted.map(d => {
      cumul += d.total
      return { annee: d.key, recrutements: d.total, effectif_cumule: cumul }
    })
  }, [effectifByAnnee])

  const motifData = useMemo(() =>
    contratsByMotif.map(d => ({
      motif: MOTIF_LABELS[d.key] || d.key,
      total: d.total,
    })),
    [contratsByMotif],
  )

  const contratsAnneeData = useMemo(() =>
    [...contratsByAnnee].sort((a, b) => Number(a.key) - Number(b.key)).map(d => ({
      annee: d.key,
      total: d.total,
    })),
    [contratsByAnnee],
  )

  const msAnneeData = useMemo(() =>
    [...msByAnnee].sort((a, b) => Number(a.key) - Number(b.key)),
    [msByAnnee],
  )

  // --- KPIs ---
  const kpis = useMemo(() => {
    const totalActifs = effectifByType.reduce((sum, d) => sum + d.total, 0)
    const lastMS = msAnneeData[msAnneeData.length - 1]
    const masseSalariale = lastMS?.brut || 0
    const effectifAnnee = lastMS?.effectif || totalActifs
    const salaireMoyen = effectifAnnee > 0 ? Math.round(masseSalariale / effectifAnnee) : 0
    const recrutementsThisYear = effectifByAnnee.find(d => d.key === dayjs().year().toString())?.total || 0
    const totalRuptures = contratsByMotif.reduce((sum, d) => sum + d.total, 0)
    const totalContrats = contratsByType.reduce((sum, d) => sum + d.total, 0)

    return {
      totalActifs,
      masseSalariale,
      salaireMoyen,
      recrutementsThisYear,
      totalRuptures,
      totalContrats,
    }
  }, [effectifByType, effectifByAnnee, msAnneeData, contratsByMotif, contratsByType])

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
            <Text type="secondary">Analyses RH consolidées</Text>
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
              title={`Masse salariale brute ${msAnneeData[msAnneeData.length - 1]?.key || ''}`}
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
              title={`Recrutements ${dayjs().year()}`}
              value={kpis.recrutementsThisYear}
              prefix={<Building2 className="w-4 h-4 text-indigo-500" />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card size="small">
            <Statistic
              title="Total contrats"
              value={kpis.totalContrats}
              prefix={<Briefcase className="w-4 h-4 text-cyan-500" />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card size="small">
            <Statistic
              title="Ruptures"
              value={kpis.totalRuptures}
              prefix={<Briefcase className="w-4 h-4 text-red-500" />}
            />
          </Card>
        </Col>
      </Row>

      {/* Row 1: Tranches d'âge + Type de contrat */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Effectif par tranche d'âge">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ageBarData}>
                <XAxis dataKey="tranche" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="effectif" name="Effectif" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Effectif par type de contrat">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={contratPieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  dataKey="value"
                >
                  {contratPieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Row 2: Effectif par période */}
      <Card
        title="Effectif sur une période"
        extra={
          <RangePicker
            value={periode}
            onChange={(v) => v && v[0] && v[1] && setPeriode([v[0], v[1]])}
            format="DD/MM/YYYY"
          />
        }
      >
        {loadingEffPer ? (
          <Spin />
        ) : effectifPeriodeData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={effectifPeriodeData}>
              <XAxis dataKey="key" />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey="total" name="Effectif" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-8">
            <Statistic
              title={`Du ${periode[0].format('DD/MM/YYYY')} au ${periode[1].format('DD/MM/YYYY')}`}
              value={effectifPeriodeTotal}
              prefix={<Users className="w-5 h-5 text-cyan-500" />}
              suffix="employés"
            />
          </div>
        )}
      </Card>

      {/* Row 3: Évolution effectifs + Contrats par année */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="Évolution des recrutements (1er contrat)">
            {recrutementData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={recrutementData}>
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
              <div className="text-center text-gray-400 py-12">Aucune donnée</div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Contrats créés par année">
            {loadingContAnnee ? (
              <Spin />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={contratsAnneeData}>
                  <XAxis dataKey="annee" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="total" name="Contrats" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
      </Row>

      {/* Row 4: Motifs de rupture */}
      <Card
        title="Motifs de rupture des contrats"
        extra={<Tag color="red">{kpis.totalRuptures} ruptures</Tag>}
      >
        {loadingMotif ? (
          <Spin />
        ) : motifData.length === 0 ? (
          <div className="text-center text-gray-400 py-12">Aucune rupture enregistrée</div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={motifData} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="motif" type="category" width={180} fontSize={12} />
              <RechartsTooltip />
              <Bar dataKey="total" name="Nombre">
                {motifData.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Row 5: Masse salariale par année */}
      <Card
        title="Masse salariale par année"
        extra={
          <Button
            size="small"
            icon={<Download className="w-3 h-3" />}
            onClick={() => exportToExcel(
              msAnneeData,
              [
                { header: 'Année', key: 'key' },
                { header: 'Brut (FCFA)', key: 'brut' },
                { header: 'Net (FCFA)', key: 'net' },
                { header: 'Charges salariales (FCFA)', key: 'chargesSalariales' },
                { header: 'Charges patronales (FCFA)', key: 'chargesPatronales' },
                { header: 'Effectif', key: 'effectif' },
              ],
              'masse_salariale_annuelle',
            )}
          >
            Export
          </Button>
        }
      >
        {loadingMSAnnee ? (
          <Spin />
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={msAnneeData}>
              <XAxis dataKey="key" />
              <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
              <RechartsTooltip
                formatter={(value: any) => [`${Number(value).toLocaleString('fr-FR')} FCFA`]}
              />
              <Legend />
              <Bar dataKey="brut" name="Brut" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="net" name="Net" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="chargesSalariales" name="Charges salariales" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="chargesPatronales" name="Charges patronales" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Row 6: Masse salariale par poste */}
      <Card
        title="Masse salariale par poste"
        extra={
          <Space>
            <Select
              value={anneeMS}
              onChange={setAnneeMS}
              style={{ width: 120 }}
              allowClear
              placeholder="Année"
              options={msAnneeData.map(d => ({ value: Number(d.key), label: d.key }))}
            />
            <Button
              size="small"
              icon={<Download className="w-3 h-3" />}
              onClick={() => exportToExcel(
                msByPoste,
                [
                  { header: 'Poste', key: 'key' },
                  { header: 'Brut (FCFA)', key: 'brut' },
                  { header: 'Net (FCFA)', key: 'net' },
                  { header: 'Effectif', key: 'effectif' },
                ],
                'masse_salariale_postes',
              )}
            >
              Export
            </Button>
          </Space>
        }
      >
        {loadingMSPoste ? (
          <Spin />
        ) : msByPoste.length === 0 ? (
          <div className="text-center text-gray-400 py-12">Aucune donnée</div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={msByPoste.slice(0, 15)}>
              <XAxis dataKey="key" angle={-25} textAnchor="end" height={100} interval={0} fontSize={11} />
              <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <RechartsTooltip
                formatter={(value: any) => [`${Number(value).toLocaleString('fr-FR')} FCFA`]}
              />
              <Legend />
              <Bar dataKey="brut" name="Brut" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="net" name="Net" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Row 7: Turnover KPIs */}
      {turnoverByAnnee.length > 0 && (() => {
        const latest = turnoverByAnnee[turnoverByAnnee.length - 1]
        return (
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title={`Taux turnover ${latest.annee}`}
                  value={latest.tauxTurnover}
                  suffix="%"
                  prefix={<Activity className="w-4 h-4 text-red-500" />}
                  precision={2}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title={`Embauches ${latest.annee}`}
                  value={latest.embauches}
                  prefix={<UserCheck className="w-4 h-4 text-green-500" />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title={`Départs ${latest.annee}`}
                  value={latest.departs}
                  prefix={<UserMinus className="w-4 h-4 text-orange-500" />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small">
                <Statistic
                  title={`Effectif moyen ${latest.annee}`}
                  value={latest.effectifMoyen}
                  prefix={<Users className="w-4 h-4 text-blue-500" />}
                  precision={0}
                />
              </Card>
            </Col>
          </Row>
        )
      })()}

      {/* Row 8: Turnover par année */}
      <Card
        title="Turnover par année"
        extra={
          <Space>
            <Select
              value={turnoverRange[0]}
              onChange={(v) => setTurnoverRange([v, turnoverRange[1]])}
              style={{ width: 100 }}
              options={Array.from({ length: 20 }, (_, i) => dayjs().year() - i).map(y => ({ value: y, label: y.toString() }))}
            />
            <Text type="secondary">à</Text>
            <Select
              value={turnoverRange[1]}
              onChange={(v) => setTurnoverRange([turnoverRange[0], v])}
              style={{ width: 100 }}
              options={Array.from({ length: 20 }, (_, i) => dayjs().year() - i).map(y => ({ value: y, label: y.toString() }))}
            />
            <Button
              size="small"
              icon={<Download className="w-3 h-3" />}
              onClick={() => exportToExcel(
                turnoverByAnnee,
                [
                  { header: 'Année', key: 'key' },
                  { header: 'Embauches', key: 'embauches' },
                  { header: 'Départs', key: 'departs' },
                  { header: 'Effectif début', key: 'effectifDebut' },
                  { header: 'Effectif fin', key: 'effectifFin' },
                  { header: 'Effectif moyen', key: 'effectifMoyen' },
                  { header: 'Taux turnover (%)', key: 'tauxTurnover' },
                ],
                'turnover_annuel',
              )}
            >
              Export
            </Button>
          </Space>
        }
      >
        {loadingTurnoverAnnee ? (
          <Spin />
        ) : turnoverByAnnee.length === 0 ? (
          <div className="text-center text-gray-400 py-12">Aucune donnée</div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={turnoverByAnnee}>
              <XAxis dataKey="key" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}%`} />
              <RechartsTooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="embauches" name="Embauches" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="left" dataKey="departs" name="Départs" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="tauxTurnover" name="Taux turnover %" stroke="#8b5cf6" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Row 9: Turnover mensuel */}
      <Card
        title="Turnover mensuel"
        extra={
          <Select
            value={anneeTurnover}
            onChange={setAnneeTurnover}
            style={{ width: 120 }}
            options={Array.from({ length: 10 }, (_, i) => dayjs().year() - i).map(y => ({ value: y, label: y.toString() }))}
          />
        }
      >
        {loadingTurnoverMois ? (
          <Spin />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={turnoverByMois}>
              <XAxis dataKey="key" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}%`} />
              <RechartsTooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="embauches" name="Embauches" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="left" dataKey="departs" name="Départs" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="tauxTurnover" name="Taux turnover %" stroke="#8b5cf6" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Row 10: Rétention par cohorte */}
      <Card
        title="Rétention par cohorte (année du 1er contrat)"
        extra={
          <Button
            size="small"
            icon={<Download className="w-3 h-3" />}
            onClick={() => exportToExcel(
              retentionCohorte,
              [
                { header: 'Cohorte', key: 'key' },
                { header: 'Effectif initial', key: 'effectifInitial' },
                { header: 'Encore actifs', key: 'encoreActifs' },
                { header: 'Taux rétention (%)', key: 'tauxRetention' },
              ],
              'retention_cohortes',
            )}
          >
            Export
          </Button>
        }
      >
        {loadingRetention ? (
          <Spin />
        ) : retentionCohorte.length === 0 ? (
          <div className="text-center text-gray-400 py-12">Aucune donnée</div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={[...retentionCohorte].sort((a, b) => Number(a.key) - Number(b.key))}>
              <XAxis dataKey="key" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
              <RechartsTooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="effectifInitial" name="Effectif initial" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="left" dataKey="encoreActifs" name="Encore actifs" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="tauxRetention" name="Taux rétention %" stroke="#8b5cf6" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Row 11: Masse salariale mensuelle */}
      <Card
        title="Masse salariale mensuelle"
        extra={
          <Space>
            <Select
              value={msMensuelleRange[0]}
              onChange={(v) => setMsMensuelleRange([v, msMensuelleRange[1]])}
              style={{ width: 100 }}
              options={Array.from({ length: 10 }, (_, i) => dayjs().year() - i).map(y => ({ value: y, label: y.toString() }))}
            />
            <Text type="secondary">à</Text>
            <Select
              value={msMensuelleRange[1]}
              onChange={(v) => setMsMensuelleRange([msMensuelleRange[0], v])}
              style={{ width: 100 }}
              options={Array.from({ length: 10 }, (_, i) => dayjs().year() - i).map(y => ({ value: y, label: y.toString() }))}
            />
            <Button
              size="small"
              icon={<Download className="w-3 h-3" />}
              onClick={() => exportToExcel(
                msMensuelle,
                [
                  { header: 'Mois', key: 'key' },
                  { header: 'Brut (FCFA)', key: 'brut' },
                  { header: 'Net (FCFA)', key: 'net' },
                  { header: 'Charges salariales (FCFA)', key: 'chargesSalariales' },
                  { header: 'Charges patronales (FCFA)', key: 'chargesPatronales' },
                  { header: 'Effectif', key: 'effectif' },
                ],
                'masse_salariale_mensuelle',
              )}
            >
              Export
            </Button>
          </Space>
        }
      >
        {loadingMSMensuelle ? (
          <Spin />
        ) : msMensuelle.length === 0 ? (
          <div className="text-center text-gray-400 py-12">Aucune donnée</div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={msMensuelle}>
              <XAxis dataKey="key" angle={-30} textAnchor="end" height={70} fontSize={11} />
              <YAxis yAxisId="left" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
              <YAxis yAxisId="right" orientation="right" />
              <RechartsTooltip
                formatter={(value: any, name: any) => {
                  if (name === 'Effectif') return [value, name]
                  return [`${Number(value).toLocaleString('fr-FR')} FCFA`, name]
                }}
              />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="brut" name="Brut" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
              <Area yAxisId="left" type="monotone" dataKey="net" name="Net" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} />
              <Line yAxisId="right" type="monotone" dataKey="effectif" name="Effectif" stroke="#f59e0b" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  )
}
