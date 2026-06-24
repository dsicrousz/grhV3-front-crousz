import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Typography, Spin, Row, Col, Button, Space, Select, DatePicker } from 'antd'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
  AreaChart, Area,
  LineChart, Line,
  ComposedChart,
  CartesianGrid,
} from 'recharts'
import { BarChart3, Users, TrendingUp, DollarSign, Building2, Briefcase, Download, UserMinus, UserCheck, Activity, AlertCircle } from 'lucide-react'
import { ReportingService } from '@/services/reporting.service'
import dayjs from 'dayjs'
import { exportToExcel } from '@/lib/export-utils'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

function EmptyState({ message: msg = 'Aucune donnée disponible' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-slate-400 gap-3">
      <AlertCircle className="w-10 h-10 opacity-40" />
      <span className="text-sm">{msg}</span>
    </div>
  )
}

function SectionTitle({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-1">
      <div className="p-2 bg-slate-100 rounded-lg text-slate-500">{icon}</div>
      <div>
        <div className="font-semibold text-slate-700 text-base">{title}</div>
        {subtitle && <div className="text-xs text-slate-400">{subtitle}</div>}
      </div>
    </div>
  )
}

const chartTooltipStyle = {
  borderRadius: 8,
  border: '1px solid #e2e8f0',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  fontSize: 12,
}

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
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <Spin size="large" />
          <Text type="secondary">Chargement des données...</Text>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 px-6 py-4 flex items-center gap-4 shadow-sm">
        <div className="p-3 bg-purple-100 rounded-xl">
          <BarChart3 className="w-7 h-7 text-purple-600" />
        </div>
        <div>
          <Title level={4} style={{ margin: 0, color: '#1e293b' }}>Statistiques & Reporting</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>Analyses RH consolidées — {dayjs().format('YYYY')}</Text>
        </div>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]}>
        {[
          { label: 'Effectif actif', value: kpis.totalActifs, icon: <Users className="w-5 h-5" />, color: 'blue', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
          { label: `MS brute ${msAnneeData[msAnneeData.length - 1]?.key || ''}`, value: kpis.masseSalariale, icon: <DollarSign className="w-5 h-5" />, color: 'green', bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100', suffix: 'FCFA', format: true },
          { label: 'Salaire moyen', value: kpis.salaireMoyen, icon: <TrendingUp className="w-5 h-5" />, color: 'orange', bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', suffix: 'FCFA', format: true },
          { label: `Recrutements ${dayjs().year()}`, value: kpis.recrutementsThisYear, icon: <Building2 className="w-5 h-5" />, color: 'indigo', bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
          { label: 'Total contrats', value: kpis.totalContrats, icon: <Briefcase className="w-5 h-5" />, color: 'cyan', bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-100' },
          { label: 'Ruptures', value: kpis.totalRuptures, icon: <UserMinus className="w-5 h-5" />, color: 'red', bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
        ].map((kpi) => (
          <Col xs={12} sm={8} md={4} key={kpi.label}>
            <div className={`bg-white rounded-xl border ${kpi.border} shadow-sm p-4 flex items-start gap-3 hover:shadow-md transition-shadow`}>
              <div className={`p-2 rounded-lg ${kpi.bg} ${kpi.text} shrink-0`}>{kpi.icon}</div>
              <div className="min-w-0">
                <div className="text-xs text-slate-500 truncate mb-1">{kpi.label}</div>
                <div className={`text-xl font-bold ${kpi.text}`}>
                  {kpi.format ? Number(kpi.value).toLocaleString('fr-FR') : kpi.value}
                </div>
                {kpi.suffix && <div className="text-xs text-slate-400 mt-0.5">{kpi.suffix}</div>}
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* ═══════════ SECTION EFFECTIFS ═══════════ */}
      <div className="space-y-4">
        <SectionTitle icon={<Users className="w-4 h-4" />} title="Effectifs" subtitle="Répartition et évolution de l'effectif" />

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="font-medium text-slate-700 mb-4">Effectif par tranche d'âge</div>
              {ageBarData.length === 0 ? <EmptyState /> : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ageBarData} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="tranche" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <RechartsTooltip contentStyle={chartTooltipStyle} />
                    <Bar dataKey="effectif" name="Effectif" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Col>
          <Col xs={24} lg={8}>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 h-full">
              <div className="font-medium text-slate-700 mb-4">Répartition par type de contrat</div>
              {contratPieData.length === 0 ? <EmptyState /> : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={contratPieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      innerRadius={40}
                      paddingAngle={3}
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      dataKey="value"
                    >
                      {contratPieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={chartTooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Col>
        </Row>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-medium text-slate-700">Effectif sur une période</div>
            <RangePicker
              value={periode}
              onChange={(v) => v && v[0] && v[1] && setPeriode([v[0], v[1]])}
              format="DD/MM/YYYY"
              size="small"
            />
          </div>
          {loadingEffPer ? (
            <div className="flex justify-center py-10"><Spin /></div>
          ) : effectifPeriodeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={effectifPeriodeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="key" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <RechartsTooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="total" name="Effectif" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Users className="w-10 h-10 text-cyan-300" />
              <div className="text-2xl font-bold text-cyan-600">{effectifPeriodeTotal}</div>
              <div className="text-sm text-slate-400">employés du {periode[0].format('DD/MM/YYYY')} au {periode[1].format('DD/MM/YYYY')}</div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════ SECTION CONTRATS ═══════════ */}
      <div className="space-y-4">
        <SectionTitle icon={<Briefcase className="w-4 h-4" />} title="Contrats" subtitle="Évolution et motifs de rupture" />

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={14}>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="font-medium text-slate-700 mb-4">Évolution des recrutements (1er contrat)</div>
              {recrutementData.length === 0 ? <EmptyState /> : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={recrutementData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="annee" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <RechartsTooltip contentStyle={chartTooltipStyle} />
                    <Legend />
                    <Area type="monotone" dataKey="effectif_cumule" name="Effectif cumulé" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.12} strokeWidth={2} />
                    <Area type="monotone" dataKey="recrutements" name="Recrutements" stroke="#22c55e" fill="#22c55e" fillOpacity={0.12} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Col>
          <Col xs={24} lg={10}>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="font-medium text-slate-700 mb-4">Contrats créés par année</div>
              {loadingContAnnee ? (
                <div className="flex justify-center py-10"><Spin /></div>
              ) : contratsAnneeData.length === 0 ? <EmptyState /> : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={contratsAnneeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="annee" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <RechartsTooltip contentStyle={chartTooltipStyle} />
                    <Line type="monotone" dataKey="total" name="Contrats" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </Col>
        </Row>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-medium text-slate-700">Motifs de rupture des contrats</div>
            <span className="bg-red-50 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full border border-red-100">{kpis.totalRuptures} ruptures</span>
          </div>
          {loadingMotif ? (
            <div className="flex justify-center py-10"><Spin /></div>
          ) : motifData.length === 0 ? (
            <EmptyState message="Aucune rupture enregistrée" />
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={motifData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="motif" type="category" width={190} tick={{ fontSize: 12 }} />
                <RechartsTooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="total" name="Nombre" radius={[0, 4, 4, 0]}>
                  {motifData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ═══════════ SECTION MASSE SALARIALE ═══════════ */}
      <div className="space-y-4">
        <SectionTitle icon={<DollarSign className="w-4 h-4" />} title="Masse salariale" subtitle="Évolution annuelle, mensuelle et par poste" />

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-medium text-slate-700">Masse salariale par année</div>
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
            >Export</Button>
          </div>
          {loadingMSAnnee ? (
            <div className="flex justify-center py-10"><Spin /></div>
          ) : msAnneeData.length === 0 ? <EmptyState /> : (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={msAnneeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="key" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 12 }} />
                <RechartsTooltip contentStyle={chartTooltipStyle} formatter={(value: unknown) => [`${Number(value).toLocaleString('fr-FR')} FCFA`]} />
                <Legend />
                <Bar dataKey="brut" name="Brut" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="net" name="Net" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="chargesSalariales" name="Charges salariales" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="chargesPatronales" name="Charges patronales" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-medium text-slate-700">Masse salariale par poste</div>
            <Space size="small">
              <Select
                value={anneeMS}
                onChange={setAnneeMS}
                style={{ width: 110 }}
                size="small"
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
              >Export</Button>
            </Space>
          </div>
          {loadingMSPoste ? (
            <div className="flex justify-center py-10"><Spin /></div>
          ) : msByPoste.length === 0 ? <EmptyState /> : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={msByPoste.slice(0, 15)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="key" angle={-25} textAnchor="end" height={100} interval={0} tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                <RechartsTooltip contentStyle={chartTooltipStyle} formatter={(value: unknown) => [`${Number(value).toLocaleString('fr-FR')} FCFA`]} />
                <Legend />
                <Bar dataKey="brut" name="Brut" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="net" name="Net" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ═══════════ SECTION TURNOVER & RÉTENTION ═══════════ */}
      <div className="space-y-4">
        <SectionTitle icon={<TrendingUp className="w-4 h-4" />} title="Turnover & Rétention" subtitle="Mouvements de personnel et fidélisation" />

        {turnoverByAnnee.length > 0 && (() => {
          const latest = turnoverByAnnee[turnoverByAnnee.length - 1]
          return (
            <Row gutter={[16, 16]}>
              {[
                { label: `Taux turnover ${latest.annee}`, value: `${latest.tauxTurnover.toFixed(2)}%`, icon: <Activity className="w-5 h-5" />, bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
                { label: `Embauches ${latest.annee}`, value: latest.embauches, icon: <UserCheck className="w-5 h-5" />, bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
                { label: `Départs ${latest.annee}`, value: latest.departs, icon: <UserMinus className="w-5 h-5" />, bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
                { label: `Effectif moyen ${latest.annee}`, value: Math.round(latest.effectifMoyen), icon: <Users className="w-5 h-5" />, bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
              ].map((item) => (
                <Col xs={12} sm={6} key={item.label}>
                  <div className={`bg-white rounded-xl border ${item.border} shadow-sm p-4 flex items-start gap-3 hover:shadow-md transition-shadow`}>
                    <div className={`p-2 rounded-lg ${item.bg} ${item.text} shrink-0`}>{item.icon}</div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                      <div className={`text-xl font-bold ${item.text}`}>{item.value}</div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          )
        })()}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-medium text-slate-700">Turnover par année</div>
            <Space size="small">
              <Select
                value={turnoverRange[0]}
                onChange={(v) => setTurnoverRange([v, turnoverRange[1]])}
                style={{ width: 90 }}
                size="small"
                options={Array.from({ length: 20 }, (_, i) => dayjs().year() - i).map(y => ({ value: y, label: y.toString() }))}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>à</Text>
              <Select
                value={turnoverRange[1]}
                onChange={(v) => setTurnoverRange([turnoverRange[0], v])}
                style={{ width: 90 }}
                size="small"
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
              >Export</Button>
            </Space>
          </div>
          {loadingTurnoverAnnee ? (
            <div className="flex justify-center py-10"><Spin /></div>
          ) : turnoverByAnnee.length === 0 ? <EmptyState /> : (
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={turnoverByAnnee}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="key" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} />
                <RechartsTooltip contentStyle={chartTooltipStyle} />
                <Legend />
                <Bar yAxisId="left" dataKey="embauches" name="Embauches" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="departs" name="Départs" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="tauxTurnover" name="Taux turnover %" stroke="#8b5cf6" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-medium text-slate-700">Turnover mensuel</div>
            <Select
              value={anneeTurnover}
              onChange={setAnneeTurnover}
              style={{ width: 110 }}
              size="small"
              options={Array.from({ length: 10 }, (_, i) => dayjs().year() - i).map(y => ({ value: y, label: y.toString() }))}
            />
          </div>
          {loadingTurnoverMois ? (
            <div className="flex justify-center py-10"><Spin /></div>
          ) : turnoverByMois.length === 0 ? <EmptyState /> : (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={turnoverByMois}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="key" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} />
                <RechartsTooltip contentStyle={chartTooltipStyle} />
                <Legend />
                <Bar yAxisId="left" dataKey="embauches" name="Embauches" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="departs" name="Départs" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="tauxTurnover" name="Taux turnover %" stroke="#8b5cf6" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-medium text-slate-700">Rétention par cohorte (année du 1er contrat)</div>
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
            >Export</Button>
          </div>
          {loadingRetention ? (
            <div className="flex justify-center py-10"><Spin /></div>
          ) : retentionCohorte.length === 0 ? <EmptyState /> : (
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={[...retentionCohorte].sort((a, b) => Number(a.key) - Number(b.key))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="key" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}%`} domain={[0, 100]} tick={{ fontSize: 12 }} />
                <RechartsTooltip contentStyle={chartTooltipStyle} />
                <Legend />
                <Bar yAxisId="left" dataKey="effectifInitial" name="Effectif initial" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="encoreActifs" name="Encore actifs" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="tauxRetention" name="Taux rétention %" stroke="#8b5cf6" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ═══════════ SECTION MASSE SALARIALE MENSUELLE ═══════════ */}
      <div className="space-y-4">
        <SectionTitle icon={<DollarSign className="w-4 h-4" />} title="Masse salariale mensuelle" subtitle="Évolution mois par mois" />

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-medium text-slate-700">Masse salariale mensuelle</div>
            <Space size="small">
              <Select
                value={msMensuelleRange[0]}
                onChange={(v) => setMsMensuelleRange([v, msMensuelleRange[1]])}
                style={{ width: 90 }}
                size="small"
                options={Array.from({ length: 10 }, (_, i) => dayjs().year() - i).map(y => ({ value: y, label: y.toString() }))}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>à</Text>
              <Select
                value={msMensuelleRange[1]}
                onChange={(v) => setMsMensuelleRange([msMensuelleRange[0], v])}
                style={{ width: 90 }}
                size="small"
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
              >Export</Button>
            </Space>
          </div>
          {loadingMSMensuelle ? (
            <div className="flex justify-center py-10"><Spin /></div>
          ) : msMensuelle.length === 0 ? <EmptyState /> : (
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={msMensuelle}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="key" angle={-30} textAnchor="end" height={70} tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <RechartsTooltip
                  contentStyle={chartTooltipStyle}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any, name: any) => {
                    if (name === 'Effectif') return [String(value ?? ''), name]
                    return [`${Number(value ?? 0).toLocaleString('fr-FR')} FCFA`, name]
                  }}
                />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="brut" name="Brut" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
                <Area yAxisId="left" type="monotone" dataKey="net" name="Net" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="effectif" name="Effectif" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

