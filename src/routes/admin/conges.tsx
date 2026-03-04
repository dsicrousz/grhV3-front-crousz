import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Select,
  Space, 
  Typography, 
  Card, 
  message,
  Tooltip,
  Popconfirm,
  Tag,
  Input,
  DatePicker,
  InputNumber,
  Row,
  Col
} from 'antd'
import { Plus, Pencil, Trash2, Calendar, CheckCircle, XCircle, Clock, Palmtree, Baby, Stethoscope, GraduationCap, Briefcase, HelpCircle, Search, Filter, Umbrella, Download } from 'lucide-react'
import { exportToExcel, exportToCSV, congeExportColumns } from '@/lib/export-utils'
import type { Conge, CreateCongeDto, UpdateCongeDto } from '@/types/conge'
import { TypeConge, StatutDemandeConge } from '@/types/conge'
import { CongeService } from '@/services/conge.service'
import { EmployeService } from '@/services/employe.service'
import type { Employe } from '@/types/employe'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

export const Route = createFileRoute('/admin/conges')({
  component: CongesPage,
})

const typeCongeLabels: Record<TypeConge, { label: string; color: string; icon: React.ReactNode }> = {
  [TypeConge.ANNUEL]: { label: 'Annuel', color: 'green', icon: <Palmtree className="w-3 h-3" /> },
  [TypeConge.MALADIE]: { label: 'Maladie', color: 'red', icon: <Stethoscope className="w-3 h-3" /> },
  [TypeConge.MATERNITE]: { label: 'Maternité', color: 'pink', icon: <Baby className="w-3 h-3" /> },
  [TypeConge.PATERNITE]: { label: 'Paternité', color: 'blue', icon: <Baby className="w-3 h-3" /> },
  [TypeConge.SANS_SOLDE]: { label: 'Sans solde', color: 'orange', icon: <Briefcase className="w-3 h-3" /> },
  [TypeConge.EXCEPTIONNEL]: { label: 'Exceptionnel', color: 'purple', icon: <Calendar className="w-3 h-3" /> },
  [TypeConge.FORMATION]: { label: 'Formation', color: 'cyan', icon: <GraduationCap className="w-3 h-3" /> },
  [TypeConge.AUTRE]: { label: 'Autre', color: 'default', icon: <HelpCircle className="w-3 h-3" /> },
}

const statutLabels: Record<StatutDemandeConge, { label: string; color: string; icon: React.ReactNode }> = {
  [StatutDemandeConge.EN_ATTENTE]: { label: 'En attente', color: 'orange', icon: <Clock className="w-3 h-3" /> },
  [StatutDemandeConge.APPROUVEE]: { label: 'Approuvé', color: 'green', icon: <CheckCircle className="w-3 h-3" /> },
  [StatutDemandeConge.REJETEE]: { label: 'Rejeté', color: 'red', icon: <XCircle className="w-3 h-3" /> },
}

function CongesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingConge, setEditingConge] = useState<Conge | null>(null)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  // Filtres
  const [searchText, setSearchText] = useState('')
  const [filterEmploye, setFilterEmploye] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string | null>(null)
  const [filterStatut, setFilterStatut] = useState<string | null>(null)
  const [filterDates, setFilterDates] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)

  const { data: conges = [], isLoading } = useQuery({
    queryKey: ['conges'],
    queryFn: () => CongeService.getAll(),
  })

  const { data: employes = [] } = useQuery({
    queryKey: ['employes'],
    queryFn: () => EmployeService.getAll(),
  })

  // Données filtrées
  const filteredConges = useMemo(() => {
    return conges.filter((conge) => {
      const employe = typeof conge.employe === 'string' 
        ? employes.find(e => e._id === conge.employe)
        : conge.employe as Employe

      const searchLower = searchText.toLowerCase()
      const matchesSearch = searchText === '' || 
        (employe && `${employe.prenom} ${employe.nom}`.toLowerCase().includes(searchLower)) ||
        conge.motif?.toLowerCase().includes(searchLower)

      const matchesEmploye = !filterEmploye || 
        (typeof conge.employe === 'string' ? conge.employe === filterEmploye : (conge.employe as Employe)._id === filterEmploye)

      const matchesType = !filterType || conge.type === filterType

      const matchesStatut = !filterStatut || conge.statut === filterStatut

      const matchesDates = !filterDates || (
        (dayjs(conge.date_debut).isAfter(filterDates[0], 'day') || dayjs(conge.date_debut).isSame(filterDates[0], 'day')) &&
        (dayjs(conge.date_fin).isBefore(filterDates[1], 'day') || dayjs(conge.date_fin).isSame(filterDates[1], 'day'))
      )

      return matchesSearch && matchesEmploye && matchesType && matchesStatut && matchesDates
    })
  }, [conges, employes, searchText, filterEmploye, filterType, filterStatut, filterDates])

  const resetFilters = () => {
    setSearchText('')
    setFilterEmploye(null)
    setFilterType(null)
    setFilterStatut(null)
    setFilterDates(null)
  }

  const hasActiveFilters = searchText || filterEmploye || filterType || filterStatut || filterDates

  const createMutation = useMutation({
    mutationFn: (data: CreateCongeDto) => CongeService.create(data),
    onSuccess: () => {
      message.success('Congé créé avec succès')
      setIsModalOpen(false)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['conges'] })
    },
    onError: () => {
      message.error('Erreur lors de la création du congé')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCongeDto }) => 
      CongeService.update(id, data),
    onSuccess: () => {
      message.success('Congé mis à jour avec succès')
      setIsModalOpen(false)
      setEditingConge(null)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['conges'] })
    },
    onError: () => {
      message.error('Erreur lors de la mise à jour du congé')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => CongeService.delete(id),
    onSuccess: () => {
      message.success('Congé supprimé avec succès')
      queryClient.invalidateQueries({ queryKey: ['conges'] })
    },
    onError: () => {
      message.error('Erreur lors de la suppression du congé')
    }
  })

  const validateMutation = useMutation({
    mutationFn: ({ id, statut }: { id: string; statut: StatutDemandeConge }) => 
      CongeService.validate(id, { statut }),
    onSuccess: (_, variables) => {
      message.success(variables.statut === StatutDemandeConge.APPROUVEE ? 'Congé approuvé' : 'Congé rejeté')
      queryClient.invalidateQueries({ queryKey: ['conges'] })
    },
    onError: () => {
      message.error('Erreur lors de la validation')
    }
  })

  const handleSubmit = (values: any) => {
    const [dateDebut, dateFin] = values.dates
    const nombreJours = dateFin.diff(dateDebut, 'day') + 1
    
    const data: CreateCongeDto = {
      date_debut: dateDebut.toISOString(),
      date_fin: dateFin.toISOString(),
      nombre_jours: values.nombre_jours || nombreJours,
      type: values.type,
      motif: values.motif,
      employe: values.employe
    }

    if (editingConge) {
      updateMutation.mutate({
        id: editingConge._id,
        data: {
          date_debut: data.date_debut,
          date_fin: data.date_fin,
          nombre_jours: data.nombre_jours,
          type: data.type,
          motif: data.motif
        }
      })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = (conge: Conge) => {
    setEditingConge(conge)
    const employeId = typeof conge.employe === 'string' ? conge.employe : (conge.employe as Employe)._id
    form.setFieldsValue({
      dates: [dayjs(conge.date_debut), dayjs(conge.date_fin)],
      nombre_jours: conge.nombre_jours,
      type: conge.type,
      motif: conge.motif,
      employe: employeId
    })
    setIsModalOpen(true)
  }

  const handleDatesChange = (dates: any) => {
    if (dates && dates[0] && dates[1]) {
      const nombreJours = dates[1].diff(dates[0], 'day') + 1
      form.setFieldValue('nombre_jours', nombreJours)
    }
  }

  const getEmployeInfo = (conge: Conge): Employe | undefined => {
    if (typeof conge.employe === 'string') {
      return employes.find(e => e._id === conge.employe)
    }
    return conge.employe as Employe
  }

  const columns: ColumnsType<Conge> = [
    {
      title: 'Employé',
      key: 'employe',
      render: (_, record) => {
        const employe = getEmployeInfo(record)
        return employe ? (
          <div>
            <div className="font-medium">{employe.prenom} {employe.nom}</div>
            <div className="text-xs text-gray-500">{employe.matricule_de_solde || employe.code}</div>
          </div>
        ) : '-'
      },
      sorter: (a, b) => {
        const empA = getEmployeInfo(a)
        const empB = getEmployeInfo(b)
        return `${empA?.nom} ${empA?.prenom}`.localeCompare(`${empB?.nom} ${empB?.prenom}`)
      },
    },
    {
      title: 'Période',
      key: 'periode',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div>
            <div className="font-medium">
              {dayjs(record.date_debut).format('DD/MM/YYYY')} - {dayjs(record.date_fin).format('DD/MM/YYYY')}
            </div>
            <div className="text-xs text-gray-500">
              {record.nombre_jours} jour(s)
            </div>
          </div>
        </div>
      ),
      sorter: (a, b) => dayjs(a.date_debut).unix() - dayjs(b.date_debut).unix(),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: TypeConge) => {
        const config = typeCongeLabels[type]
        return (
          <Tag color={config.color} className="flex items-center gap-1 w-fit">
            {config.icon}
            {config.label}
          </Tag>
        )
      },
      filters: Object.entries(typeCongeLabels).map(([value, config]) => ({
        text: config.label,
        value,
      })),
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'Motif',
      dataIndex: 'motif',
      key: 'motif',
      ellipsis: true,
      render: (motif: string) => motif || <Text type="secondary">-</Text>,
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: (statut: StatutDemandeConge) => {
        const config = statutLabels[statut]
        return (
          <Tag color={config.color} className="flex items-center gap-1 w-fit">
            {config.icon}
            {config.label}
          </Tag>
        )
      },
      filters: Object.entries(statutLabels).map(([value, config]) => ({
        text: config.label,
        value,
      })),
      onFilter: (value, record) => record.statut === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          {record.statut === StatutDemandeConge.EN_ATTENTE && (
            <>
              <Tooltip title="Approuver">
                <Button
                  type="text"
                  size="small"
                  icon={<CheckCircle className="w-4 h-4 text-green-500" />}
                  onClick={() => validateMutation.mutate({ id: record._id, statut: StatutDemandeConge.APPROUVEE })}
                  loading={validateMutation.isPending}
                />
              </Tooltip>
              <Tooltip title="Rejeter">
                <Button
                  type="text"
                  size="small"
                  icon={<XCircle className="w-4 h-4 text-red-500" />}
                  onClick={() => validateMutation.mutate({ id: record._id, statut: StatutDemandeConge.REJETEE })}
                  loading={validateMutation.isPending}
                />
              </Tooltip>
            </>
          )}
          <Tooltip title="Modifier">
            <Button
              type="text"
              size="small"
              icon={<Pencil className="w-4 h-4 text-blue-500" />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Supprimer ce congé ?"
            onConfirm={() => deleteMutation.mutate(record._id)}
            okText="Oui"
            cancelText="Non"
          >
            <Tooltip title="Supprimer">
              <Button
                type="text"
                size="small"
                icon={<Trash2 className="w-4 h-4 text-red-500" />}
                loading={deleteMutation.isPending}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  // Statistiques
  const stats = useMemo(() => {
    const enAttente = conges.filter(c => c.statut === StatutDemandeConge.EN_ATTENTE).length
    const approuves = conges.filter(c => c.statut === StatutDemandeConge.APPROUVEE).length
    const rejetes = conges.filter(c => c.statut === StatutDemandeConge.REJETEE).length
    const totalJours = conges
      .filter(c => c.statut === StatutDemandeConge.APPROUVEE)
      .reduce((acc, c) => acc + c.nombre_jours, 0)
    return { enAttente, approuves, rejetes, total: conges.length, totalJours }
  }, [conges])

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Umbrella className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <Title level={4} style={{ margin: 0 }}>Gestion des congés</Title>
            <Text type="secondary">Gérez toutes les demandes de congés</Text>
          </div>
        </div>
        <Space>
          <Button
            icon={<Download className="w-4 h-4" />}
            onClick={() => exportToExcel(filteredConges, congeExportColumns, 'conges')}
          >
            Excel
          </Button>
          <Button
            icon={<Download className="w-4 h-4" />}
            onClick={() => exportToCSV(filteredConges, congeExportColumns, 'conges')}
          >
            CSV
          </Button>
          <Button
            type="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setEditingConge(null)
              form.resetFields()
              setIsModalOpen(true)
            }}
          >
            Nouveau congé
          </Button>
        </Space>
      </div>

      {/* Statistiques */}
      <Row gutter={16} className="mb-6">
        <Col xs={12} sm={6} lg={4}>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700">{stats.total}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={4}>
          <Card size="small" className="border-l-4 border-l-orange-500">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.enAttente}</div>
              <div className="text-xs text-gray-500">En attente</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={4}>
          <Card size="small" className="border-l-4 border-l-green-500">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.approuves}</div>
              <div className="text-xs text-gray-500">Approuvés</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={4}>
          <Card size="small" className="border-l-4 border-l-red-500">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.rejetes}</div>
              <div className="text-xs text-gray-500">Rejetés</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card size="small" className="border-l-4 border-l-blue-500">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalJours}</div>
              <div className="text-xs text-gray-500">Jours approuvés</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filtres */}
      <Card className="mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="font-medium">Filtres</span>
          {hasActiveFilters && (
            <Button type="link" size="small" onClick={resetFilters}>
              Réinitialiser
            </Button>
          )}
        </div>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Rechercher..."
              prefix={<Search className="w-4 h-4 text-gray-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filtrer par employé"
              value={filterEmploye}
              onChange={setFilterEmploye}
              allowClear
              showSearch
              optionFilterProp="label"
              style={{ width: '100%' }}
              options={employes.map(emp => ({
                value: emp._id,
                label: `${emp.prenom} ${emp.nom}`,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Type"
              value={filterType}
              onChange={setFilterType}
              allowClear
              style={{ width: '100%' }}
              options={Object.entries(typeCongeLabels).map(([value, config]) => ({
                value,
                label: config.label,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Statut"
              value={filterStatut}
              onChange={setFilterStatut}
              allowClear
              style={{ width: '100%' }}
              options={Object.entries(statutLabels).map(([value, config]) => ({
                value,
                label: config.label,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <RangePicker
              value={filterDates}
              onChange={(dates) => setFilterDates(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
              format="DD/MM/YYYY"
              placeholder={['Début', 'Fin']}
              style={{ width: '100%' }}
            />
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredConges}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} congé(s)`,
          }}
          locale={{
            emptyText: 'Aucun congé enregistré'
          }}
        />
      </Card>

      {/* Modal Create/Edit */}
      <Modal
        title={editingConge ? 'Modifier le congé' : 'Nouveau congé'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          setEditingConge(null)
          form.resetFields()
        }}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="employe"
            label="Employé"
            rules={[{ required: true, message: 'L\'employé est requis' }]}
          >
            <Select
              placeholder="Sélectionner un employé"
              showSearch
              optionFilterProp="label"
              disabled={!!editingConge}
              options={employes.map(emp => ({
                value: emp._id,
                label: `${emp.prenom} ${emp.nom} (${emp.matricule_de_solde || emp.code || ''})`,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="dates"
            label="Période de congé"
            rules={[{ required: true, message: 'La période est requise' }]}
          >
            <RangePicker 
              className="w-full" 
              format="DD/MM/YYYY"
              placeholder={['Date de début', 'Date de fin']}
              onChange={handleDatesChange}
            />
          </Form.Item>

          <Form.Item
            name="nombre_jours"
            label="Nombre de jours"
            rules={[{ required: true, message: 'Le nombre de jours est requis' }]}
          >
            <InputNumber min={1} className="w-full" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Type de congé"
            rules={[{ required: true, message: 'Le type est requis' }]}
          >
            <Select
              placeholder="Sélectionner un type"
              options={Object.entries(typeCongeLabels).map(([value, config]) => ({
                value,
                label: (
                  <div className="flex items-center gap-2">
                    {config.icon}
                    {config.label}
                  </div>
                )
              }))}
            />
          </Form.Item>

          <Form.Item
            name="motif"
            label="Motif"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Décrivez le motif du congé (optionnel)"
            />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={editingConge ? updateMutation.isPending : createMutation.isPending}
            >
              {editingConge ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
