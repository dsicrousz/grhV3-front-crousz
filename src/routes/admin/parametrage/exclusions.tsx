import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input,
  Select,
  Space, 
  Typography, 
  Card, 
  message,
  Tooltip,
  Popconfirm
} from 'antd'
import { Plus, Pencil, Trash2, Ban } from 'lucide-react'
import type { ExclusionSpecifique, CreateExclusionSpecifiqueDto } from '@/types/exclusion'
import { ExclusionSpecifiqueService } from '@/services/exclusion.service'
import { EmployeService } from '@/services/employe.service'
import { RubriqueService } from '@/services/rubrique.service'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography

export const Route = createFileRoute('/admin/parametrage/exclusions')({
  component: ExclusionsPage,
})

function ExclusionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExclusion, setEditingExclusion] = useState<ExclusionSpecifique | null>(null)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data: exclusions = [], isLoading } = useQuery({
    queryKey: ['exclusions'],
    queryFn: () => ExclusionSpecifiqueService.getAll(),
  })

  const { data: employes = [] } = useQuery({
    queryKey: ['employes'],
    queryFn: () => EmployeService.getAll(),
  })

  const { data: rubriques = [] } = useQuery({
    queryKey: ['rubriques'],
    queryFn: () => RubriqueService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateExclusionSpecifiqueDto) => ExclusionSpecifiqueService.create(data),
    onSuccess: () => {
      message.success('Exclusion créée avec succès')
      queryClient.invalidateQueries({ queryKey: ['exclusions'] })
      handleCloseModal()
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la création')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateExclusionSpecifiqueDto }) => 
      ExclusionSpecifiqueService.update(id, data),
    onSuccess: () => {
      message.success('Exclusion modifiée avec succès')
      queryClient.invalidateQueries({ queryKey: ['exclusions'] })
      handleCloseModal()
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la modification')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ExclusionSpecifiqueService.delete(id),
    onSuccess: () => {
      message.success('Exclusion supprimée avec succès')
      queryClient.invalidateQueries({ queryKey: ['exclusions'] })
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la suppression')
    },
  })

  const handleOpenModal = (exclusion?: ExclusionSpecifique) => {
    if (exclusion) {
      setEditingExclusion(exclusion)
      form.setFieldsValue({
        employe: exclusion.employe._id,
        rubrique: exclusion.rubrique._id,
        description: exclusion.description
      })
    } else {
      setEditingExclusion(null)
      form.resetFields()
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingExclusion(null)
    form.resetFields()
  }

  const handleSubmit = async (values: CreateExclusionSpecifiqueDto) => {
    if (editingExclusion) {
      updateMutation.mutate({ id: editingExclusion._id, data: values })
    } else {
      createMutation.mutate(values)
    }
  }

  const columns: ColumnsType<ExclusionSpecifique> = [
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
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
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
            title="Supprimer cette exclusion ?"
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
          <div className="p-2 bg-red-100 rounded-lg">
            <Ban className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <Title level={4} style={{ margin: 0 }}>Exclusions spécifiques</Title>
            <Text type="secondary">Gérez les exclusions de rubriques par employé</Text>
          </div>
        </div>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => handleOpenModal()}
          style={{ backgroundColor: '#0d9488' }}
        >
          Nouvelle exclusion
        </Button>
      </div>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={exclusions}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `${total} exclusion(s)`,
          }}
        />
      </Card>

      {/* Modal Create/Edit */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Ban className="w-5 h-5 text-red-600" />
            <span>{editingExclusion ? 'Modifier l\'exclusion' : 'Nouvelle exclusion'}</span>
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
                  optionFilterProp: 'children',
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
                  optionFilterProp: 'children',
                }
              }
              placeholder="Sélectionner une rubrique"
              role="select"
              options={rubriques.map(rubrique => ({
                value: rubrique._id,
                label: `${rubrique.code} - ${rubrique.libelle}`,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'La description est requise' }]}
          >
            <Input.TextArea rows={4} />
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
              {editingExclusion ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
