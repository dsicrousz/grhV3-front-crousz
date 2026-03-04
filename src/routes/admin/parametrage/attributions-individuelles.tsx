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
  InputNumber,
  Input,
  Row,
  Col
} from 'antd'
import { Plus, Pencil, Trash2, CircleDollarSign, Search, Filter } from 'lucide-react'
import type { AttributionIndividuelle, CreateAttributionIndividuelleDto } from '@/types/attribution-individuelle'
import { AttributionIndividuelleService } from '@/services/attribution-individuelle.service'
import { EmployeService } from '@/services/employe.service'
import { RubriqueService } from '@/services/rubrique.service'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography

export const Route = createFileRoute('/admin/parametrage/attributions-individuelles')({
  component: AttributionsIndividuellesPage,
})

function AttributionsIndividuellesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAttribution, setEditingAttribution] = useState<AttributionIndividuelle | null>(null)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  // Filtres
  const [searchText, setSearchText] = useState('')
  const [filterEmploye, setFilterEmploye] = useState<string | null>(null)
  const [filterRubrique, setFilterRubrique] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string | null>(null)

  const { data: attributions = [], isLoading } = useQuery({
    queryKey: ['attributions-individuelles'],
    queryFn: () => AttributionIndividuelleService.getAll(),
  })

  const { data: employes = [] } = useQuery({
    queryKey: ['employes'],
    queryFn: () => EmployeService.getAll(),
  })

  const { data: rubriques = [] } = useQuery({
    queryKey: ['rubriques'],
    queryFn: () => RubriqueService.getAll(),
  })

  // Données filtrées
  const filteredAttributions = useMemo(() => {
    return attributions.filter((attr) => {
      // Filtre par texte de recherche (nom/prénom employé ou code/libellé rubrique)
      const searchLower = searchText.toLowerCase()
      const matchesSearch = searchText === '' || 
        `${attr.employe.prenom} ${attr.employe.nom}`.toLowerCase().includes(searchLower) ||
        attr.employe.poste?.toLowerCase().includes(searchLower) ||
        attr.rubrique.code.toLowerCase().includes(searchLower) ||
        attr.rubrique.libelle.toLowerCase().includes(searchLower)

      // Filtre par employé
      const matchesEmploye = !filterEmploye || attr.employe._id === filterEmploye

      // Filtre par rubrique
      const matchesRubrique = !filterRubrique || attr.rubrique._id === filterRubrique

      // Filtre par type de rubrique
      const matchesType = !filterType || attr.rubrique.type === filterType

      return matchesSearch && matchesEmploye && matchesRubrique && matchesType
    })
  }, [attributions, searchText, filterEmploye, filterRubrique, filterType])

  const resetFilters = () => {
    setSearchText('')
    setFilterEmploye(null)
    setFilterRubrique(null)
    setFilterType(null)
  }

  const hasActiveFilters = searchText || filterEmploye || filterRubrique || filterType

  const createMutation = useMutation({
    mutationFn: (data: CreateAttributionIndividuelleDto) => AttributionIndividuelleService.create(data),
    onSuccess: () => {
      message.success('Attribution créée avec succès')
      queryClient.invalidateQueries({ queryKey: ['attributions-individuelles'] })
      handleCloseModal()
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la création')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateAttributionIndividuelleDto }) => 
      AttributionIndividuelleService.update(id, data),
    onSuccess: () => {
      message.success('Attribution modifiée avec succès')
      queryClient.invalidateQueries({ queryKey: ['attributions-individuelles'] })
      handleCloseModal()
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la modification')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => AttributionIndividuelleService.delete(id),
    onSuccess: () => {
      message.success('Attribution supprimée avec succès')
      queryClient.invalidateQueries({ queryKey: ['attributions-individuelles'] })
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la suppression')
    },
  })

  const handleOpenModal = (attribution?: AttributionIndividuelle) => {
    if (attribution) {
      setEditingAttribution(attribution)
      form.setFieldsValue({
        employe: attribution.employe._id,
        rubrique: attribution.rubrique._id
      })
    } else {
      setEditingAttribution(null)
      form.resetFields()
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingAttribution(null)
    form.resetFields()
  }

  const handleSubmit = async (values: CreateAttributionIndividuelleDto) => {
    if (editingAttribution) {
      updateMutation.mutate({ id: editingAttribution._id, data: values })
    } else {
      createMutation.mutate(values)
    }
  }

  const columns: ColumnsType<AttributionIndividuelle> = [
    {
      title: 'Employé',
      key: 'employe',
      render: (_, record) => (
        <div className="flex flex-col">
          <Text strong>{record.employe.prenom} {record.employe.nom}</Text>
          <Text type="secondary" className="text-xs">{record.employe.poste}</Text>
        </div>
      ),
    },
    {
      title: 'Rubrique',
      key: 'rubrique',
      render: (_, record) => (
        <div className="flex flex-col">
          <Text strong>{record.rubrique.code}</Text>
          <Text type="secondary" className="text-xs">{record.rubrique.libelle}</Text>
        </div>
      ),
    },
    {
      title: 'Type',
      key: 'type',
      render: (_, record) => (
        <Tag color={record.rubrique.type === 'IMPOSABLE' ? 'green' : 'red'}>
          {record.rubrique.type}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Modifier">
            <Button
              type="text"
              size="small"
              icon={<Pencil className="w-4 h-4 text-blue-600" />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Supprimer cette attribution ?"
            description="Cette action est irréversible."
            onConfirm={() => deleteMutation.mutate(record._id)}
            okText="Supprimer"
            cancelText="Annuler"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Supprimer">
              <Button
                type="text"
                size="small"
                danger
                icon={<Trash2 className="w-4 h-4" />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-100 rounded-lg">
            <CircleDollarSign className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <Title level={4} style={{ margin: 0 }}>Attributions individuelles</Title>
            <Text type="secondary">Gérez les attributions de rubriques par employé</Text>
          </div>
        </div>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => handleOpenModal()}
          style={{ backgroundColor: '#0d9488' }}
        >
          Nouvelle attribution
        </Button>
      </div>

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
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filtrer par rubrique"
              value={filterRubrique}
              onChange={setFilterRubrique}
              allowClear
              showSearch
              optionFilterProp="label"
              style={{ width: '100%' }}
              options={rubriques.map(rub => ({
                value: rub._id,
                label: `${rub.code} - ${rub.libelle}`,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filtrer par type"
              value={filterType}
              onChange={setFilterType}
              allowClear
              style={{ width: '100%' }}
              options={[
                { value: 'IMPOSABLE', label: 'Imposable' },
                { value: 'NON_IMPOSABLE', label: 'Non imposable' },
                { value: 'RETENUE', label: 'Retenue' },
              ]}
            />
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredAttributions}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} attribution(s)`,
          }}
        />
      </Card>

      {/* Modal Create/Edit */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <CircleDollarSign className="w-5 h-5 text-teal-600" />
            <span>{editingAttribution ? 'Modifier l\'attribution' : 'Nouvelle attribution'}</span>
          </div>
        }
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={600}
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
              showSearch={
                {
                  optionFilterProp: 'label',
                  filterOption: (input, option) => {
                    return (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  },
                }
              }
              placeholder="Sélectionner un employé"
              role="select"
              options={employes.map(employe => ({
                value: employe._id,
                label: `${employe.prenom} ${employe.nom} - ${employe.poste}`,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="rubrique"
            label="Rubrique"
            rules={[{ required: true, message: 'La rubrique est requise' }]}
          >
            <Select
              showSearch={
                {
                  optionFilterProp: 'label',
                  filterOption: (input, option) => {
                    return (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  },
                }
              }
              role="select"
              placeholder="Sélectionner une rubrique"
              options={rubriques.map(rubrique => ({
                value: rubrique._id,
                label: `${rubrique.code} - ${rubrique.libelle}`,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="valeur_par_defaut"
            label="Valeur par défaut"
          >
         <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={handleCloseModal}>
              Annuler
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createMutation.isPending || updateMutation.isPending}
              style={{ backgroundColor: '#0d9488' }}
            >
              {editingAttribution ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
