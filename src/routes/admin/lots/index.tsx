import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Space,
  Spin,
  Statistic,
  Steps,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd'
import { Check, Clock, Download, Eye, FileText, Pencil, Plus, Send, Trash2, Undo2, X } from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { LotService } from '@/services/lot.service'
import { StateLot } from '@/types/lot'
import type {
  CreateLotDto,
  Lot,
  LotStatistiquesLot,
  LotStatistiquesLotRubrique,
  LotStatistiquesMensuelles,
  LotStatistiquesRubrique,
} from '@/types/lot'
import dayjs from 'dayjs'
import { USER_ROLE } from '@/types/user.roles'
import { useSession } from '@/auth/auth-client'
import type { ColumnsType } from 'antd/es/table'
import { exportToExcel } from '@/lib/export-utils'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

export const Route = createFileRoute('/admin/lots/')({
  component: LotsPage,
})

const formatCurrency = (value?: number) => Number(value ?? 0).toLocaleString('fr-FR')

function LotsPage() {
  const { data: session } = useSession()
  const navigate = Route.useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLot, setEditingLot] = useState<Lot | null>(null)
  const [form] = Form.useForm()
  const [periodeStats, setPeriodeStats] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('year'),
    dayjs().endOf('month'),
  ])
  const queryClient = useQueryClient()

  const { data: lots = [], isLoading } = useQuery({
    queryKey: ['lots'],
    queryFn: () => LotService.getAll(),
  })

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: [
      'lots',
      'statistiques',
      periodeStats[0].month() + 1,
      periodeStats[0].year(),
      periodeStats[1].month() + 1,
      periodeStats[1].year(),
    ],
    queryFn: () =>
      LotService.getStatistiquesByPeriode({
        moisDebut: periodeStats[0].month() + 1,
        anneeDebut: periodeStats[0].year(),
        moisFin: periodeStats[1].month() + 1,
        anneeFin: periodeStats[1].year(),
      }),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateLotDto) => LotService.create(data),
    onSuccess: () => {
      message.success('Lot créé avec succès')
      setIsModalOpen(false)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['lots'] })
    },
    onError: () => {
      message.error('Erreur lors de la création du lot')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateLotDto }) => LotService.update(id, data),
    onSuccess: () => {
      message.success('Lot mis à jour avec succès')
      setIsModalOpen(false)
      setEditingLot(null)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['lots'] })
    },
    onError: () => {
      message.error('Erreur lors de la mise à jour du lot')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => LotService.delete(id),
    onSuccess: () => {
      message.success('Lot supprimé avec succès')
      queryClient.invalidateQueries({ queryKey: ['lots'] })
    },
    onError: () => {
      message.error('Erreur lors de la suppression du lot')
    },
  })

  const publishMutation = useMutation({
    mutationFn: (id: string) => LotService.publish(id),
    onSuccess: () => {
      message.success('Lot publié avec succès')
      queryClient.invalidateQueries({ queryKey: ['lots'] })
    },
    onError: () => {
      message.error('Erreur lors de la publication du lot')
    },
  })

  const generateMutation = useMutation({
    mutationFn: (id: string) => LotService.generate(id),
    onSuccess: () => {
      message.success('Lot généré avec succès')
      queryClient.invalidateQueries({ queryKey: ['lots'] })
      queryClient.invalidateQueries({ queryKey: ['lots', 'statistiques'] })
    },
    onError: () => {
      message.error('Erreur lors de la génération du lot')
    },
  })

  const submitMutation = useMutation({
    mutationFn: (id: string) => LotService.submit(id),
    onSuccess: () => {
      message.success('Lot soumis avec succès')
      queryClient.invalidateQueries({ queryKey: ['lots'] })
    },
    onError: () => {
      message.error('Erreur lors de la soumission du lot')
    },
  })

  const cancelSubmitMutation = useMutation({
    mutationFn: (id: string) => LotService.cancelSubmit(id),
    onSuccess: () => {
      message.success('Soumission annulée avec succès')
      queryClient.invalidateQueries({ queryKey: ['lots'] })
    },
    onError: () => {
      message.error("Erreur lors de l'annulation de la soumission")
    },
  })

  const setWaitingMutation = useMutation({
    mutationFn: (id: string) => LotService.setWaiting(id),
    onSuccess: () => {
      message.success('Lot mis en attente avec succès')
      queryClient.invalidateQueries({ queryKey: ['lots'] })
    },
    onError: () => {
      message.error('Erreur lors de la mise en attente du lot')
    },
  })

  const cancelWaitingMutation = useMutation({
    mutationFn: (id: string) => LotService.cancelWaiting(id),
    onSuccess: () => {
      message.success('Mise en attente annulée avec succès')
      queryClient.invalidateQueries({ queryKey: ['lots'] })
    },
    onError: () => {
      message.error("Erreur lors de l'annulation de la mise en attente")
    },
  })

  const validateMutation = useMutation({
    mutationFn: (id: string) => LotService.validate(id),
    onSuccess: () => {
      message.success('Lot validé avec succès')
      queryClient.invalidateQueries({ queryKey: ['lots'] })
    },
    onError: () => {
      message.error('Erreur lors de la validation du lot')
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (id: string) => LotService.reject(id),
    onSuccess: () => {
      message.success('Lot rejeté avec succès')
      queryClient.invalidateQueries({ queryKey: ['lots'] })
    },
    onError: () => {
      message.error('Erreur lors du rejet du lot')
    },
  })

  const handleSubmit = (values: { periode: [dayjs.Dayjs, dayjs.Dayjs]; libelle: string }) => {
    const [debut, fin] = values.periode
    const data: CreateLotDto = {
      libelle: values.libelle,
      debut: debut.format('YYYY-MM-DD'),
      fin: fin.format('YYYY-MM-DD'),
    }

    if (editingLot) {
      updateMutation.mutate({ id: editingLot._id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = (lot: Lot) => {
    setEditingLot(lot)
    form.setFieldsValue({
      ...lot,
      periode: [dayjs(lot.debut), dayjs(lot.fin)],
    })
    setIsModalOpen(true)
  }

  const getStateStep = (etat: string) => {
    switch (etat) {
      case 'BROUILLON':
        return 0
      case 'SOUMIS':
        return 1
      case 'EN COURS DE VALIDATION':
        return 2
      case 'VALIDE':
        return 3
      default:
        return 0
    }
  }

  const getStateColor = (etat: string) => {
    switch (etat) {
      case 'BROUILLON':
        return 'default'
      case 'SOUMIS':
        return 'processing'
      case 'EN COURS DE VALIDATION':
        return 'warning'
      case 'VALIDE':
        return 'success'
      default:
        return 'default'
    }
  }

  const totalLots =
    stats?.lotCount ??
    stats?.nombreLots ??
    stats?.periode?.nombreLots ??
    stats?.lots?.length ??
    0
  const totalBulletins =
    stats?.bulletinCount ??
    stats?.nombreBulletins ??
    stats?.periode?.nombreBulletins ??
    stats?.lots?.reduce((sum, lot) => sum + (lot.bulletinCount ?? lot.nombreBulletins ?? 0), 0) ??
    0

  const evolutionData = useMemo(
    () =>
      (stats?.evolutionMensuelle ?? []).map((item: LotStatistiquesMensuelles) => ({
        key: item.key ?? item.libelle ?? `${String(item.mois).padStart(2, '0')}/${item.annee}`,
        brut: item.brut,
        net: item.net,
        bulletins: item.bulletinCount ?? item.nombreBulletins ?? 0,
        effectif: item.effectif,
      })),
    [stats],
  )

  const rubriqueColumns: ColumnsType<LotStatistiquesRubrique> = [
    {
      title: 'Rubrique',
      key: 'libelle',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.libelle}</Text>
          {record.code && <Text type="secondary">{record.code}</Text>}
        </Space>
      ),
    },
    {
      title: 'Occurrences',
      dataIndex: 'occurrences',
      key: 'occurrences',
    },
    {
      title: 'Montant total',
      key: 'totalMontant',
      render: (_, record) => `${formatCurrency(record.totalMontant)} FCFA`,
    },
    {
      title: 'Base totale',
      key: 'totalBase',
      render: (_, record) => `${formatCurrency(record.totalBase)} FCFA`,
    },
    {
      title: 'Montant moyen',
      key: 'moyenneMontant',
      render: (_, record) => `${formatCurrency(record.moyenneMontant)} FCFA`,
    },
    {
      title: 'Base moyenne',
      key: 'moyenneBase',
      render: (_, record) => `${formatCurrency(record.moyenneBase)} FCFA`,
    },
  ]

  const lotStatsColumns: ColumnsType<LotStatistiquesLot> = [
    {
      title: 'Lot',
      key: 'libelle',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.libelle}</Text>
        </Space>
      ),
    },
    {
      title: 'Bulletins',
      dataIndex: 'nombreBulletins',
      key: 'nombreBulletins',
      render: (_, record) => record.bulletinCount ?? record.nombreBulletins ?? 0,
    },
    {
      title: 'Effectif',
      dataIndex: 'effectif',
      key: 'effectif',
    },
    {
      title: 'Brut',
      key: 'brut',
      render: (_, record) => `${formatCurrency(record.brut)} FCFA`,
    },
    {
      title: 'Net',
      key: 'net',
      render: (_, record) => `${formatCurrency(record.net)} FCFA`,
    },
  ]

  const exportStats = () => {
    if (!stats) return

    const rows = [
      {
        section: 'Resume',
        categorie: 'Totaux',
        libelle: 'Periode',
        valeur: `${periodeStats[0].format('MM/YYYY')} - ${periodeStats[1].format('MM/YYYY')}`,
      },
      { section: 'Resume', categorie: 'Totaux', libelle: 'Nombre de lots', valeur: totalLots },
      { section: 'Resume', categorie: 'Totaux', libelle: 'Nombre de bulletins', valeur: totalBulletins },
      { section: 'Resume', categorie: 'Totaux', libelle: 'Effectif', valeur: stats.totaux.effectif },
      { section: 'Resume', categorie: 'Totaux', libelle: 'Brut', valeur: stats.totaux.brut },
      { section: 'Resume', categorie: 'Totaux', libelle: 'Net', valeur: stats.totaux.net },
      { section: 'Resume', categorie: 'Totaux', libelle: 'Total imposable', valeur: stats.totaux.totalIm },
      { section: 'Resume', categorie: 'Totaux', libelle: 'Total non imposable', valeur: stats.totaux.totalNI },
      { section: 'Resume', categorie: 'Totaux', libelle: 'Retenues', valeur: stats.totaux.totalRet },
      { section: 'Resume', categorie: 'Totaux', libelle: 'Part patronale', valeur: stats.totaux.totalPP },
      ...stats.evolutionMensuelle.map((item) => ({
        section: 'Evolution mensuelle',
        categorie: item.key ?? `${String(item.mois).padStart(2, '0')}/${item.annee}`,
        libelle: item.key ?? `${String(item.mois).padStart(2, '0')}/${item.annee}`,
        lots: item.lotCount ?? item.nombreLots ?? '',
        bulletins: item.bulletinCount ?? item.nombreBulletins ?? '',
        effectif: item.effectif,
        brut: item.brut,
        net: item.net,
        totalIm: item.totalIm,
        totalNI: item.totalNI,
        totalRet: item.totalRet,
        totalPP: item.totalPP,
      })),
      ...stats.rubriques.map((rubrique) => ({
        section: 'Rubriques',
        categorie: rubrique.code ?? '',
        libelle: rubrique.libelle,
        occurrences: rubrique.occurrences,
        totalMontant: rubrique.totalMontant ?? '',
        totalBase: rubrique.totalBase ?? '',
        moyenneMontant: rubrique.moyenneMontant ?? '',
        moyenneBase: rubrique.moyenneBase ?? '',
      })),
      ...stats.lots.flatMap((lot) => [
        {
          section: 'Lots',
          categorie: 'Lot',
          libelle: lot.libelle,
          bulletins: lot.bulletinCount ?? lot.nombreBulletins ?? '',
          effectif: lot.effectif,
          brut: lot.brut,
          net: lot.net,
          totalIm: lot.totalIm,
          totalNI: lot.totalNI,
          totalRet: lot.totalRet,
          totalPP: lot.totalPP,
        },
        ...(lot.rubriques ?? []).map((rubrique) => ({
          section: 'Lots',
          categorie: `Rubrique lot ${lot.libelle}`,
          code: rubrique.code ?? '',
          libelle: rubrique.libelle,
          occurrences: rubrique.occurrences,
          totalMontant: rubrique.totalMontant ?? '',
          totalBase: rubrique.totalBase ?? '',
          moyenneMontant: rubrique.moyenneMontant ?? '',
          moyenneBase: rubrique.moyenneBase ?? '',
        })),
      ]),
    ]

    exportToExcel(
      rows,
      [
        { header: 'Section', key: 'section' },
        { header: 'Categorie', key: 'categorie' },
        { header: 'Code', key: 'code' },
        { header: 'Libelle', key: 'libelle' },
        { header: 'Valeur', key: 'valeur' },
        { header: 'Lots', key: 'lots' },
        { header: 'Bulletins', key: 'bulletins' },
        { header: 'Effectif', key: 'effectif' },
        { header: 'Occurrences', key: 'occurrences' },
        { header: 'Brut', key: 'brut' },
        { header: 'Net', key: 'net' },
        { header: 'Total imposable', key: 'totalIm' },
        { header: 'Total non imposable', key: 'totalNI' },
        { header: 'Retenues', key: 'totalRet' },
        { header: 'Part patronale', key: 'totalPP' },
        { header: 'Montant total', key: 'totalMontant' },
        { header: 'Base totale', key: 'totalBase' },
        { header: 'Montant moyen', key: 'moyenneMontant' },
        { header: 'Base moyenne', key: 'moyenneBase' },
      ],
      `lots_cdi_statistiques_${periodeStats[0].format('YYYYMM')}_${periodeStats[1].format('YYYYMM')}`,
      'Stats lots CDI',
    )
  }

  const columns: ColumnsType<Lot> = [
    {
      title: 'Libellé',
      dataIndex: 'libelle',
      key: 'libelle',
      render: (libelle) => <Text strong>{libelle}</Text>,
    },
    {
      title: 'Période',
      key: 'periode',
      render: (_, record) => (
        <Text type="secondary">
          Du {dayjs(record.debut).format('DD/MM/YYYY')} au {dayjs(record.fin).format('DD/MM/YYYY')}
        </Text>
      ),
    },
    {
      title: 'État',
      dataIndex: 'etat',
      key: 'etat',
      render: (etat: StateLot) => <Tag color={getStateColor(etat)}>{etat}</Tag>,
    },
    {
      title: 'Progression',
      key: 'progression',
      render: (_, record) => (
        <Steps
          size="small"
          current={getStateStep(record.etat)}
          titlePlacement="vertical"
          items={[
            { title: 'BROUILLON' },
            { title: 'SOUMIS' },
            { title: 'EN COURS DE VALIDATION' },
            { title: 'VALIDE' },
          ]}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record: Lot) => (
        <Space>
          <Tooltip title="Voir le lot">
            <Button
              type="text"
              size="small"
              icon={<Eye className="w-4 h-4" />}
              onClick={() => navigate({ to: '/admin/lots/$lotId', params: { lotId: record._id } })}
            />
          </Tooltip>
          {session?.user.role === USER_ROLE.RH && (
            <>
              {record.etat === StateLot.BROUILLON && (
                <>
                  <Tooltip title="Modifier">
                    <Button
                      type="text"
                      size="small"
                      icon={<Pencil className="w-4 h-4" />}
                      onClick={() => handleEdit(record)}
                    />
                  </Tooltip>
                  <Popconfirm
                    title="Supprimer ce lot ?"
                    description="Cette action est irréversible."
                    onConfirm={() => deleteMutation.mutate(record._id)}
                    okText="Supprimer"
                    cancelText="Annuler"
                    okButtonProps={{ danger: true }}
                  >
                    <Tooltip title="Supprimer">
                      <Button type="text" size="small" danger icon={<Trash2 className="w-4 h-4" />} />
                    </Tooltip>
                  </Popconfirm>
                  <Tooltip title="Générer">
                    <Button
                      type="text"
                      size="small"
                      icon={<FileText className="w-4 h-4" />}
                      onClick={() => generateMutation.mutate(record._id)}
                    />
                  </Tooltip>
                  <Tooltip title="Soumettre">
                    <Button
                      type="text"
                      size="small"
                      icon={<Send className="w-4 h-4" />}
                      onClick={() => submitMutation.mutate(record._id)}
                    />
                  </Tooltip>
                </>
              )}
              {record.etat === StateLot.WAITING1 && (
                <Tooltip title="Annuler la soumission">
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<Undo2 className="w-4 h-4" />}
                    onClick={() => cancelSubmitMutation.mutate(record._id)}
                  />
                </Tooltip>
              )}
            </>
          )}
          {session?.user.role === USER_ROLE.CSA && (
            <>
              {record.etat === StateLot.WAITING1 && (
                <Tooltip title="Mettre en cours de validation">
                  <Button
                    type="text"
                    size="small"
                    icon={<Clock className="w-4 h-4" />}
                    onClick={() => setWaitingMutation.mutate(record._id)}
                  />
                </Tooltip>
              )}
              {record.etat === StateLot.WAITING2 && (
                <Tooltip title="Annuler la mise en validation">
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<Undo2 className="w-4 h-4" />}
                    onClick={() => cancelWaitingMutation.mutate(record._id)}
                  />
                </Tooltip>
              )}
            </>
          )}
          {session?.user.role === USER_ROLE.ADMIN && record.etat === StateLot.WAITING2 && (
            <>
              <Tooltip title="Valider">
                <Button
                  type="text"
                  size="small"
                  icon={<Check className="w-4 h-4" />}
                  onClick={() => validateMutation.mutate(record._id)}
                />
              </Tooltip>
              <Tooltip title="Rejeter">
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<X className="w-4 h-4" />}
                  onClick={() => rejectMutation.mutate(record._id)}
                />
              </Tooltip>
            </>
          )}
          {record.etat === StateLot.VALIDE && !record.isPublished && (
            <Tooltip title="Publier">
              <Button
                type="text"
                size="small"
                icon={<FileText className="w-4 h-4" />}
                onClick={() => publishMutation.mutate(record._id)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div className="space-y-6 p-6">
      {generateMutation.isPending && (
        <Alert
          message="Génération des bulletins en cours..."
          description="Veuillez patienter, cette opération peut prendre quelques instants."
          type="info"
          showIcon
          icon={<Spin size="small" />}
          banner
        />
      )}
      <Spin
        size="large"
        spinning={
          isLoading ||
          createMutation.isPending ||
          updateMutation.isPending ||
          deleteMutation.isPending ||
          generateMutation.isPending ||
          submitMutation.isPending ||
          cancelSubmitMutation.isPending ||
          setWaitingMutation.isPending ||
          cancelWaitingMutation.isPending ||
          validateMutation.isPending ||
          rejectMutation.isPending ||
          publishMutation.isPending
        }
      >
        <Space className="w-full justify-between">
          <div>
            <Title level={4} className="mb-0! text-green-700">
              Lots CDI
            </Title>
            <Text type="secondary">Gestion des lots de paie CDI et statistiques consolidées</Text>
          </div>
          {session?.user.role === USER_ROLE.RH && (
            <Button
              type="primary"
              style={{ backgroundColor: '#16a34a', borderColor: '#16a34a' }}
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsModalOpen(true)}
            >
              Nouveau lot
            </Button>
          )}
        </Space>

        <Card className="border-green-200" style={{ borderColor: '#86efac' }}>
          <Table columns={columns} dataSource={lots} rowKey="_id" loading={isLoading} />
        </Card>

        <Card
          className="border-green-200"
          style={{ borderColor: '#86efac' }}
          title="Statistiques sur la période"
          extra={
            <Space>
              <Button size="small" icon={<Download className="w-3 h-3" />} onClick={exportStats} disabled={!stats}>
                Export Excel
              </Button>
              <RangePicker
                picker="month"
                value={periodeStats}
                onChange={(value) => {
                  if (value?.[0] && value?.[1]) {
                    setPeriodeStats([value[0], value[1]])
                  }
                }}
                allowClear={false}
                format="MM/YYYY"
              />
            </Space>
          }
        >
          {isLoadingStats ? (
            <div className="py-12 text-center">
              <Spin />
            </div>
          ) : stats ? (
            <Space direction="vertical" size="large" className="w-full">
              <Row gutter={[16, 16]}>
                <Col xs={12} md={8} xl={4}>
                  <Card size="small">
                    <Statistic title="Lots" value={totalLots} />
                  </Card>
                </Col>
                <Col xs={12} md={8} xl={4}>
                  <Card size="small">
                    <Statistic title="Bulletins" value={totalBulletins} />
                  </Card>
                </Col>
                <Col xs={12} md={8} xl={4}>
                  <Card size="small">
                    <Statistic title="Effectif" value={stats.totaux.effectif} />
                  </Card>
                </Col>
                <Col xs={12} md={8} xl={4}>
                  <Card size="small">
                    <Statistic title="Brut" value={stats.totaux.brut} suffix="FCFA" formatter={(value) => formatCurrency(Number(value))} />
                  </Card>
                </Col>
                <Col xs={12} md={8} xl={4}>
                  <Card size="small">
                    <Statistic title="Net" value={stats.totaux.net} suffix="FCFA" formatter={(value) => formatCurrency(Number(value))} />
                  </Card>
                </Col>
                <Col xs={12} md={8} xl={4}>
                  <Card size="small">
                    <Statistic title="Total imposable" value={stats.totaux.totalIm} suffix="FCFA" formatter={(value) => formatCurrency(Number(value))} />
                  </Card>
                </Col>
                <Col xs={12} md={8} xl={4}>
                  <Card size="small">
                    <Statistic title="Total non imposable" value={stats.totaux.totalNI} suffix="FCFA" formatter={(value) => formatCurrency(Number(value))} />
                  </Card>
                </Col>
                <Col xs={12} md={8} xl={4}>
                  <Card size="small">
                    <Statistic title="Retenues" value={stats.totaux.totalRet} suffix="FCFA" formatter={(value) => formatCurrency(Number(value))} />
                  </Card>
                </Col>
                <Col xs={12} md={8} xl={4}>
                  <Card size="small">
                    <Statistic title="Part patronale" value={stats.totaux.totalPP} suffix="FCFA" formatter={(value) => formatCurrency(Number(value))} />
                  </Card>
                </Col>
              </Row>

              <Card size="small" title="Évolution mensuelle">
                {evolutionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={evolutionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="key" />
                      <YAxis yAxisId="left" tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                      <YAxis yAxisId="right" orientation="right" />
                      <RechartsTooltip
                        formatter={(value, name) => {
                          if (name === 'Bulletins' || name === 'Effectif') return [value ?? 0, String(name)]
                          return [`${formatCurrency(Number(value ?? 0))} FCFA`, String(name)]
                        }}
                      />
                      <Legend />
                      <Area yAxisId="left" type="monotone" dataKey="brut" name="Brut" stroke="#16a34a" fill="#86efac" fillOpacity={0.35} />
                      <Area yAxisId="left" type="monotone" dataKey="net" name="Net" stroke="#15803d" fill="#bbf7d0" fillOpacity={0.25} />
                      <Bar yAxisId="right" dataKey="bulletins" name="Bulletins" fill="#0f766e" radius={[4, 4, 0, 0]} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <Empty description="Aucune évolution mensuelle disponible sur cette période" />
                )}
              </Card>

              <Card size="small" title="Rubriques agrégées">
                <Table
                  columns={rubriqueColumns}
                  dataSource={stats.rubriques}
                  rowKey={(record) => `${record.code ?? record.libelle}-${record.occurrences}`}
                  pagination={{ pageSize: 8 }}
                  locale={{ emptyText: 'Aucune rubrique sur cette période' }}
                  scroll={{ x: 900 }}
                />
              </Card>

              <Card size="small" title="Détail par lot">
                <Table
                  columns={lotStatsColumns}
                  dataSource={stats.lots}
                  rowKey={(record) => record._id ?? record.id ?? record.libelle}
                  expandable={{
                    expandedRowRender: (record) =>
                      record.rubriques?.length ? (
                        <Table<LotStatistiquesLotRubrique>
                          columns={rubriqueColumns}
                          dataSource={record.rubriques}
                          rowKey={(rubrique) => `${rubrique.code ?? rubrique.libelle}-${rubrique.occurrences}`}
                          pagination={false}
                          size="small"
                        />
                      ) : (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Aucune rubrique pour ce lot" />
                      ),
                  }}
                  pagination={{ pageSize: 6 }}
                  locale={{ emptyText: 'Aucun lot statistique sur cette période' }}
                  scroll={{ x: 700 }}
                />
              </Card>
            </Space>
          ) : (
            <Empty description="Impossible de charger les statistiques pour cette période" />
          )}
        </Card>

        <Modal
          title={editingLot ? 'Modifier le lot' : 'Nouveau lot'}
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false)
            setEditingLot(null)
            form.resetFields()
          }}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="libelle"
              label="Libellé"
              rules={[{ required: true, message: 'Le libellé est requis' }]}
            >
              <Input placeholder="Ex: Paie Janvier 2024" />
            </Form.Item>
            <Form.Item
              name="periode"
              label="Période"
              rules={[{ required: true, message: 'La période est requise' }]}
            >
              <RangePicker className="w-full" format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item className="mb-0 text-right">
              <Space>
                <Button
                  onClick={() => {
                    setIsModalOpen(false)
                    setEditingLot(null)
                    form.resetFields()
                  }}
                >
                  Annuler
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={editingLot ? updateMutation.isPending : createMutation.isPending}
                >
                  {editingLot ? 'Modifier' : 'Créer'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Spin>
    </div>
  )
}
