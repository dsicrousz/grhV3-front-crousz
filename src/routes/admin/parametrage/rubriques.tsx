import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  Switch, 
  Space, 
  Typography, 
  Card, 
  Tag, 
  Popconfirm, 
  message,
  Tooltip,
  Mentions
} from 'antd'
import { Plus, Pencil, Trash2, Settings, FileText } from 'lucide-react'
import type { Rubrique, CreateRubriqueDto } from '@/types/rubrique'
import { TypeRubrique } from '@/types/rubrique'
import { RubriqueService } from '@/services/rubrique.service'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography

export const Route = createFileRoute('/admin/parametrage/rubriques')({
  component: RubriquesPage,
})

function RubriquesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRubrique, setEditingRubrique] = useState<Rubrique | null>(null)
  const [form] = Form.useForm<CreateRubriqueDto>()
  const queryClient = useQueryClient()

  const { data: rubriques = [], isLoading } = useQuery({
    queryKey: ['rubriques'],
    queryFn: () => RubriqueService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateRubriqueDto) => RubriqueService.create(data),
    onSuccess: () => {
      message.success('Rubrique créée avec succès')
      queryClient.invalidateQueries({ queryKey: ['rubriques'] })
      handleCloseModal()
    },
    onError: () => {
      message.error('Erreur lors de la création de la rubrique')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateRubriqueDto> }) => 
      RubriqueService.update(id, data),
    onSuccess: () => {
      message.success('Rubrique modifiée avec succès')
      queryClient.invalidateQueries({ queryKey: ['rubriques'] })
      handleCloseModal()
    },
    onError: () => {
      message.error('Erreur lors de la modification de la rubrique')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => RubriqueService.delete(id),
    onSuccess: () => {
      message.success('Rubrique supprimée avec succès')
      queryClient.invalidateQueries({ queryKey: ['rubriques'] })
    },
    onError: () => {
      message.error('Erreur lors de la suppression de la rubrique')
    },
  })

  const handleOpenModal = (rubrique?: Rubrique) => {
    if (rubrique) {
      setEditingRubrique(rubrique)
      form.setFieldsValue(rubrique)
    } else {
      setEditingRubrique(null)
      form.resetFields()
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingRubrique(null)
    form.resetFields()
  }

  const handleSubmit = async (values: CreateRubriqueDto) => {
    if (editingRubrique) {
      updateMutation.mutate({ id: editingRubrique._id, data: values })
    } else {
      createMutation.mutate(values)
    }
  }

  const getTypeColor = (type: TypeRubrique) => {
    switch (type) {
      case TypeRubrique.IMPOSABLE:
        return 'blue'
      case TypeRubrique.NON_IMPOSABLE:
        return 'green'
      case TypeRubrique.RETENUE:
        return 'red'
      default:
        return 'default'
    }
  }

  const getTypeLabel = (type: TypeRubrique) => {
    switch (type) {
      case TypeRubrique.IMPOSABLE:
        return 'Imposable'
      case TypeRubrique.NON_IMPOSABLE:
        return 'Non imposable'
      case TypeRubrique.RETENUE:
        return 'Retenue'
      default:
        return type
    }
  }

  const columns: ColumnsType<Rubrique> = [
    {
      title: 'Ordre',
      dataIndex: 'ordre',
      key: 'ordre',
      width: 80,
      sorter: (a, b) => a.ordre - b.ordre,
      defaultSortOrder: 'ascend',
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      render: (code: string) => (
        <Text code strong>{code}</Text>
      ),
    },
    {
      title: 'Libellé',
      dataIndex: 'libelle',
      key: 'libelle',
      ellipsis: true,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 140,
      filters: [
        { text: 'Imposable', value: TypeRubrique.IMPOSABLE },
        { text: 'Non imposable', value: TypeRubrique.NON_IMPOSABLE },
        { text: 'Retenue', value: TypeRubrique.RETENUE },
      ],
      onFilter: (value, record) => record.type === value,
      render: (type: TypeRubrique) => (
        <Tag color={getTypeColor(type)}>{getTypeLabel(type)}</Tag>
      ),
    },
   {
    title:'Regle Montant',
    dataIndex:"regle_montant",
    key:"regle_montant",
    ellipsis:true,
    render: (regle_montant: string) => (
      <Text code strong>{regle_montant}</Text>
    ),
   },
   {
     title:'Regle Base',
    dataIndex:"regle_base",
    key:"regle_base",
    ellipsis:true,
    render: (regle_base: string) => (
      <Text code strong>{regle_base}</Text>
    ),
   },
    {
      title: 'Brut',
      dataIndex: 'add_to_brut',
      key: 'add_to_brut',
      width: 70,
      align: 'center',
      render: (value: boolean) => (
        <Tag color={value ? 'green' : 'default'}>{value ? 'Oui' : 'Non'}</Tag>
      ),
    },
    {
      title: 'IPRES',
      dataIndex: 'add_to_ipres',
      key: 'add_to_ipres',
      width: 70,
      align: 'center',
      render: (value: boolean) => (
        <Tag color={value ? 'green' : 'default'}>{value ? 'Oui' : 'Non'}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Modifier">
            <Button
              type="text"
              size="small"
              icon={<Pencil className="w-4 h-4" />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Supprimer cette rubrique ?"
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
            <FileText className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <Title level={4} style={{ margin: 0 }}>Rubriques de paie</Title>
            <Text type="secondary">Gérez les rubriques utilisées dans les bulletins de paie</Text>
          </div>
        </div>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => handleOpenModal()}
          style={{ backgroundColor: '#0d9488' }}
        >
          Nouvelle rubrique
        </Button>
      </div>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={rubriques}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `${total} rubrique(s)`,
          }}
          size="middle"
        />
      </Card>

      {/* Modal Create/Edit */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-teal-600" />
            <span>{editingRubrique ? 'Modifier la rubrique' : 'Nouvelle rubrique'}</span>
          </div>
        }
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            taux1: 0,
            taux2: 0,
            ordre: 0,
            add_to_brut: false,
            add_to_ipres: false,
            type: TypeRubrique.IMPOSABLE,
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="code"
              label="Code"
              rules={[{ required: true, message: 'Le code est requis' }]}
            >
              <InputNumber placeholder="Ex: 100" />
            </Form.Item>

            <Form.Item
              name="ordre"
              label="Ordre de calcul"
              rules={[{ required: true, message: "L'ordre est requis" }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
            </Form.Item>
          </div>

          <Form.Item
            name="libelle"
            label="Libellé"
            rules={[{ required: true, message: 'Le libellé est requis' }]}
          >
            <Input placeholder="Ex: Salaire de base" />
          </Form.Item>

           <Form.Item
            name="formule"
            label="Formule"
            rules={[{ required: true, message: 'La formule est requise' }]}
          >
          <Input placeholder="Ex: BASE_SALAIRE * TAUX1" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Type de rubrique"
            rules={[{ required: true, message: 'Le type est requis' }]}
          >
            <Select
              role="select"
              showSearch={
                {
                  optionFilterProp: 'children',
                }
              }
              options={[
                { value: TypeRubrique.IMPOSABLE, label: 'Imposable' },
                { value: TypeRubrique.NON_IMPOSABLE, label: 'Non imposable' },
                { value: TypeRubrique.RETENUE, label: 'Retenue' },
              ]}
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="taux1"
              label="Taux 1 (%)"
              rules={[{ required: true, message: 'Le taux 1 est requis' }]}
            >
              <InputNumber
                min={0}
                max={100}
                style={{ width: '100%' }}
                placeholder="0"
                addonAfter="%"
              />
            </Form.Item>

            <Form.Item
              name="taux2"
              label="Taux 2 (%)"
              rules={[{ required: true, message: 'Le taux 2 est requis' }]}
            >
              <InputNumber
                min={0}
                max={100}
                style={{ width: '100%' }}
                placeholder="0"
                addonAfter="%"
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="regle_montant"
              label="Règle montant"
              rules={[{ required: true, message: 'La règle montant est requise' }]}
            >
                  <Mentions
                        style={{ width: '100%' }}
                        className='h-28'
                        placeholder="Ex: BASE_SALAIRE * 50 .."   
                        options={[...rubriques.map((rubrique) => ({
                            value: rubrique.formule,
                            label: rubrique.libelle,
                        })),{value: 'CATEGORIE_VALEUR', label: 'Base de la Categorie'},
                         {value: 'EMP_CLASSE', label: 'Classe de l\'employé'},
                         {value: 'ENCIENNETE', label: 'Enciennté de l\'employé'},
                         {value: 'IMPOT', label: 'Impot de l\'employé'},
                         {value: 'TRIMF', label: 'Trimf de l\'employé'},
                         {value: 'BRUT', label: 'Salaire brut'},
                         {value: 'IPRES', label: 'IPRES'},
                         {value: 'EST_CADRE', label: 'Est cadres'}]}
                    />
            </Form.Item>

            <Form.Item
              name="regle_base"
              label="Règle base"
              rules={[{ required: true, message: 'La règle base est requise' }]}
            >
              <Mentions
                        style={{ width: '100%' }}
                        className='h-28'
                        placeholder="Ex: BASE_SALAIRE * 50 .."
                        options={[...rubriques.map((rubrique) => ({
                            value: rubrique.formule,
                            label: rubrique.libelle,
                        })),{value: 'CATEGORIE_VALEUR', label: 'Base de la Categorie'},
                         {value: 'EMP_CLASSE', label: 'Classe de l\'employé'},
                         {value: 'ENCIENNETE', label: 'Enciennté de l\'employé'},
                         {value: 'IMPOT', label: 'Impot de l\'employé'},
                         {value: 'TRIMF', label: 'Trimf de l\'employé'},
                         {value: 'BRUT', label: 'Salaire brut'},
                         {value: 'IPRES', label: 'IPRES'},
                         {value: 'EST_CADRE', label: 'Est cadres'}]}
                    />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="add_to_brut"
              label="Ajouter au brut"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="add_to_ipres"
              label="Ajouter à l'IPRES"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button onClick={handleCloseModal}>Annuler</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createMutation.isPending || updateMutation.isPending}
              style={{ backgroundColor: '#0d9488' }}
            >
              {editingRubrique ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
