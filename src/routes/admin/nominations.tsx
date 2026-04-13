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
  Row,
  Col,
  Switch
} from 'antd'
import { Plus, Pencil, Trash2, Calendar, Search, Filter, Award, Building2, Users, Briefcase } from 'lucide-react'
import type { Nomination, CreateNominationDto, UpdateNominationDto } from '@/types/nomination'
import { NominationService } from '@/services/nomination.service'
import { EmployeService } from '@/services/employe.service'
import { DivisionService, ServiceService } from '@/services/division.service'
import { FonctionService } from '@/services/fonction.service'
import type { Employe } from '@/types/employe'
import type { Division, Service } from '@/types/division'
import type { Fonction } from '@/types/fonction'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { Title, Text } = Typography

export const Route = createFileRoute('/admin/nominations')({
  component: NominationsPage,
})

function NominationsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNomination, setEditingNomination] = useState<Nomination | null>(null)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  // Filtres
  const [searchText, setSearchText] = useState('')
  const [filterEmploye, setFilterEmploye] = useState<string | null>(null)
  const [filterDivision, setFilterDivision] = useState<string | null>(null)
  const [filterService, setFilterService] = useState<string | null>(null)
  const [filterFonction, setFilterFonction] = useState<string | null>(null)
  const [filterActif, setFilterActif] = useState<boolean | null>(null)
  const [filterDate, setFilterDate] = useState<dayjs.Dayjs | null>(null)

  const { data: nominations = [], isLoading } = useQuery({
    queryKey: ['nominations'],
    queryFn: () => NominationService.getAll(),
  })

  const { data: employes = [] } = useQuery({
    queryKey: ['employes'],
    queryFn: () => EmployeService.getAll(),
  })

  const { data: divisions = [] } = useQuery({
    queryKey: ['divisions'],
    queryFn: () => DivisionService.getAll(),
  })

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => ServiceService.getAll(),
  })

  const { data: fonctions = [] } = useQuery({
    queryKey: ['fonctions'],
    queryFn: () => FonctionService.getAll(),
  })

  // Services filtrés par division sélectionnée dans le formulaire
  const [selectedDivisionId, setSelectedDivisionId] = useState<string | null>(null)
  const filteredServicesForForm = useMemo(() => {
    if (!selectedDivisionId) return services
    return services.filter((s: Service) => {
      const divId = typeof s.division === 'string' ? s.division : s.division?._id
      return divId === selectedDivisionId
    })
  }, [services, selectedDivisionId])

  // Données filtrées
  const filteredNominations = useMemo(() => {
    return nominations.filter((nomination) => {
      const employe = nomination.employe as Employe
      const division = nomination.division as Division
      const service = nomination.service as Service | undefined
      const fonction = nomination.fonction as Fonction

      const searchLower = searchText.toLowerCase()
      const matchesSearch = searchText === '' || 
        (employe && `${employe.prenom} ${employe.nom}`.toLowerCase().includes(searchLower)) ||
        (division && division.nom?.toLowerCase().includes(searchLower)) ||
        (service && service.nom?.toLowerCase().includes(searchLower)) ||
        (fonction && fonction.nom?.toLowerCase().includes(searchLower)) ||
        nomination.description?.toLowerCase().includes(searchLower)

      const matchesEmploye = !filterEmploye || employe?._id === filterEmploye

      const matchesDivision = !filterDivision || division?._id === filterDivision

      const matchesService = !filterService || service?._id === filterService

      const matchesFonction = !filterFonction || fonction?._id === filterFonction

      const matchesActif = filterActif === null || nomination.est_active === filterActif

      const matchesDate = !filterDate || dayjs(nomination.date).isSame(filterDate, 'day')

      return matchesSearch && matchesEmploye && matchesDivision && matchesService && matchesFonction && matchesActif && matchesDate
    })
  }, [nominations, searchText, filterEmploye, filterDivision, filterService, filterFonction, filterActif, filterDate])

  const resetFilters = () => {
    setSearchText('')
    setFilterEmploye(null)
    setFilterDivision(null)
    setFilterService(null)
    setFilterFonction(null)
    setFilterActif(null)
    setFilterDate(null)
  }

  const hasActiveFilters = searchText || filterEmploye || filterDivision || filterService || filterFonction || filterActif !== null || filterDate

  const createMutation = useMutation({
    mutationFn: (data: CreateNominationDto) => NominationService.create(data),
    onSuccess: () => {
      message.success('Nomination créée avec succès')
      setIsModalOpen(false)
      form.resetFields()
      setSelectedDivisionId(null)
      queryClient.invalidateQueries({ queryKey: ['nominations'] })
    },
    onError: () => {
      message.error('Erreur lors de la création de la nomination')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNominationDto }) => 
      NominationService.update(id, data),
    onSuccess: () => {
      message.success('Nomination mise à jour avec succès')
      setIsModalOpen(false)
      setEditingNomination(null)
      form.resetFields()
      setSelectedDivisionId(null)
      queryClient.invalidateQueries({ queryKey: ['nominations'] })
    },
    onError: () => {
      message.error('Erreur lors de la mise à jour de la nomination')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => NominationService.delete(id),
    onSuccess: () => {
      message.success('Nomination supprimée avec succès')
      queryClient.invalidateQueries({ queryKey: ['nominations'] })
    },
    onError: () => {
      message.error('Erreur lors de la suppression de la nomination')
    }
  })

  const handleSubmit = (values: any) => {
    const data: CreateNominationDto = {
      date: values.date.toISOString(),
      description: values.description,
      est_active: values.est_active ?? true,
      employe: values.employe,
      fonction: values.fonction,
      division: values.division,
      service: values.service
    }

    if (editingNomination) {
      updateMutation.mutate({
        id: editingNomination._id,
        data: {
          date: data.date,
          description: data.description,
          est_active: data.est_active,
          fonction: data.fonction,
          division: data.division,
          service: data.service
        }
      })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = (nomination: Nomination) => {
    setEditingNomination(nomination)
    const employe = nomination.employe as Employe
    const division = nomination.division as Division
    const service = nomination.service as Service | undefined
    const fonction = nomination.fonction as Fonction
    
    setSelectedDivisionId(division?._id || null)
    
    form.setFieldsValue({
      date: dayjs(nomination.date),
      description: nomination.description,
      est_active: nomination.est_active,
      employe: employe?._id,
      fonction: fonction?._id,
      division: division?._id,
      service: service?._id
    })
    setIsModalOpen(true)
  }

  const columns: ColumnsType<Nomination> = [
    {
      title: 'Employé',
      key: 'employe',
      render: (_, record) => {
        const employe = record.employe as Employe
        return employe ? (
          <div>
            <div className="font-medium">{employe.prenom} {employe.nom}</div>
            <div className="text-xs text-gray-500">{employe.matricule_de_solde || employe.code}</div>
          </div>
        ) : '-'
      },
      sorter: (a, b) => {
        const empA = a.employe as Employe
        const empB = b.employe as Employe
        return `${empA?.nom} ${empA?.prenom}`.localeCompare(`${empB?.nom} ${empB?.prenom}`)
      },
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          {dayjs(date).format('DD/MM/YYYY')}
        </div>
      ),
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: 'Division',
      key: 'division',
      render: (_, record) => {
        const division = record.division as Division
        return division ? (
          <Tag color="blue" className="flex items-center gap-1 w-fit">
            <Building2 className="w-3 h-3" />
            {division.nom}
          </Tag>
        ) : '-'
      },
      filters: divisions.map((d: Division) => ({ text: d.nom, value: d._id })),
      onFilter: (value, record) => (record.division as Division)?._id === value,
    },
    {
      title: 'Service',
      key: 'service',
      render: (_, record) => {
        const service = record.service as Service | undefined
        return service ? (
          <Tag color="green" className="flex items-center gap-1 w-fit">
            <Users className="w-3 h-3" />
            {service.nom}
          </Tag>
        ) : <Text type="secondary">-</Text>
      },
    },
    {
      title: 'Fonction',
      key: 'fonction',
      render: (_, record) => {
        const fonction = record.fonction as Fonction
        return fonction ? (
          <Tag color="purple" className="flex items-center gap-1 w-fit">
            <Briefcase className="w-3 h-3" />
            {fonction.nom}
          </Tag>
        ) : '-'
      },
      filters: fonctions.map((f: Fonction) => ({ text: f.nom, value: f._id })),
      onFilter: (value, record) => (record.fonction as Fonction)?._id === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Modifier">
            <Button
              type="text"
              size="small"
              icon={<Pencil className="w-4 h-4 text-blue-500" />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Supprimer cette nomination ?"
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
    const actives = nominations.filter(n => n.est_active).length
    const inactives = nominations.filter(n => !n.est_active).length
    const uniqueEmployes = new Set(nominations.map(n => (n.employe as Employe)?._id)).size
    return { total: nominations.length, actives, inactives, uniqueEmployes }
  }, [nominations])

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Award className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <Title level={4} style={{ margin: 0 }}>Gestion des nominations</Title>
            <Text type="secondary">Gérez toutes les nominations des employés</Text>
          </div>
        </div>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setEditingNomination(null)
            form.resetFields()
            setSelectedDivisionId(null)
            setIsModalOpen(true)
          }}
        >
          Nouvelle nomination
        </Button>
      </div>

      {/* Statistiques */}
      <Row gutter={16} className="mb-6">
        <Col xs={12} sm={6}>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700">{stats.total}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="border-l-4 border-l-green-500">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.actives}</div>
              <div className="text-xs text-gray-500">Actives</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="border-l-4 border-l-gray-400">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.inactives}</div>
              <div className="text-xs text-gray-500">Inactives</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="border-l-4 border-l-blue-500">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.uniqueEmployes}</div>
              <div className="text-xs text-gray-500">Employés concernés</div>
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
          <Col xs={24} sm={12} md={4}>
            <Input
              placeholder="Rechercher..."
              prefix={<Search className="w-4 h-4 text-gray-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Employé"
              value={filterEmploye}
              onChange={setFilterEmploye}
              allowClear
              showSearch={
                {
                  optionFilterProp: 'label',
                  filterOption: (input, option:any) => {
                    return option?.label.toLowerCase().includes(input.toLowerCase())
                  }
                }
              }
              style={{ width: '100%' }}
              options={employes.map((emp: Employe) => ({
                value: emp._id,
                label: `${emp.prenom} ${emp.nom}`,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Division"
              value={filterDivision}
              onChange={setFilterDivision}
              allowClear
              style={{ width: '100%' }}
              options={divisions.map((d: Division) => ({
                value: d._id,
                label: d.nom,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Service"
              value={filterService}
              onChange={setFilterService}
              allowClear
              style={{ width: '100%' }}
              options={services.map((s: Service) => ({
                value: s._id,
                label: s.nom,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={3}>
            <Select
              placeholder="Fonction"
              value={filterFonction}
              onChange={setFilterFonction}
              allowClear
              style={{ width: '100%' }}
              options={fonctions.map((f: Fonction) => ({
                value: f._id,
                label: f.nom,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={3}>
            <Select
              placeholder="Statut"
              value={filterActif}
              onChange={setFilterActif}
              allowClear
              style={{ width: '100%' }}
              options={[
                { value: true, label: 'Active' },
                { value: false, label: 'Inactive' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={2}>
            <DatePicker
              value={filterDate}
              onChange={setFilterDate}
              format="DD/MM/YYYY"
              placeholder="Date"
              style={{ width: '100%' }}
            />
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredNominations}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} nomination(s)`,
          }}
          locale={{
            emptyText: 'Aucune nomination enregistrée'
          }}
        />
      </Card>

      {/* Modal Create/Edit */}
      <Modal
        title={editingNomination ? 'Modifier la nomination' : 'Nouvelle nomination'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          setEditingNomination(null)
          form.resetFields()
          setSelectedDivisionId(null)
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ est_active: true }}
        >
          <Form.Item
            name="employe"
            label="Employé"
            rules={[{ required: true, message: 'L\'employé est requis' }]}
          >
            <Select
              placeholder="Sélectionner un employé"
              showSearch={
                {
                  optionFilterProp: 'label',
                  filterOption: (input, option:any) => option?.label.toLowerCase().includes(input.toLowerCase())
                }
              }
              disabled={!!editingNomination}
              options={employes.map((emp: Employe) => ({
                value: emp._id,
                label: `${emp.prenom} ${emp.nom} (${emp.matricule_de_solde || emp.code || ''})`,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="date"
            label="Date de nomination"
            rules={[{ required: true, message: 'La date est requise' }]}
          >
            <DatePicker 
              className="w-full" 
              format="DD/MM/YYYY"
              placeholder="Sélectionner une date"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="division"
                label="Division"
                rules={[{ required: true, message: 'La division est requise' }]}
              >
                <Select
                  placeholder="Sélectionner une division"
                  onChange={(value) => {
                    setSelectedDivisionId(value)
                    form.setFieldValue('service', undefined)
                  }}
                  options={divisions.map((d: Division) => ({
                    value: d._id,
                    label: d.nom,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="service"
                label="Service"
              >
                <Select
                  placeholder="Sélectionner un service"
                  allowClear
                  disabled={!selectedDivisionId}
                  options={filteredServicesForForm.map((s: Service) => ({
                    value: s._id,
                    label: s.nom,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="fonction"
            label="Fonction"
            rules={[{ required: true, message: 'La fonction est requise' }]}
          >
            <Select
              placeholder="Sélectionner une fonction"
              showSearch={
                {
                  optionFilterProp: 'label',
                  filterOption: (input, option:any) => option?.label.toLowerCase().includes(input.toLowerCase())
                } 
              }
              options={fonctions.map((f: Fonction) => ({
                value: f._id,
                label: f.nom,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Description de la nomination (optionnel)"
            />
          </Form.Item>

          <Form.Item
            name="est_active"
            label="Nomination active"
            valuePropName="checked"
          >
            <Switch checkedChildren="Oui" unCheckedChildren="Non" />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={editingNomination ? updateMutation.isPending : createMutation.isPending}
            >
              {editingNomination ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
