import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  InputNumber,
  Switch,
  Space, 
  Typography, 
  Card, 
  Popconfirm, 
  message,
  Tooltip
} from 'antd'
import { Plus, Pencil, Trash2, Users } from 'lucide-react'
import type { Categorie, CreateCategorieDto, UpdateCategorieDto } from '@/types/categorie'
import { CategorieService } from '@/services/categorie.service'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography

export const Route = createFileRoute('/admin/parametrage/categories')({
  component: CategoriesPage,
})

function CategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategorie, setEditingCategorie] = useState<Categorie | null>(null)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => CategorieService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateCategorieDto) => CategorieService.create(data),
    onSuccess: () => {
      message.success('Catégorie créée avec succès')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      handleCloseModal()
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la création')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategorieDto }) => 
      CategorieService.update(id, data),
    onSuccess: () => {
      message.success('Catégorie modifiée avec succès')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      handleCloseModal()
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la modification')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => CategorieService.delete(id),
    onSuccess: () => {
      message.success('Catégorie supprimée avec succès')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la suppression')
    },
  })

  const handleOpenModal = (categorie?: Categorie) => {
    if (categorie) {
      setEditingCategorie(categorie)
      form.setFieldsValue(categorie)
    } else {
      setEditingCategorie(null)
      form.resetFields()
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCategorie(null)
    form.resetFields()
  }

  const handleSubmit = async (values: CreateCategorieDto) => {
    if (editingCategorie) {
      updateMutation.mutate({ id: editingCategorie._id, data: values })
    } else {
      createMutation.mutate(values)
    }
  }

  const columns: ColumnsType<Categorie> = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      sorter: (a, b) => a.code - b.code,
    },
    {
      title: 'Valeur',
      dataIndex: 'valeur',
      key: 'valeur',
      width: 100,
      sorter: (a, b) => a.valeur - b.valeur,
    },
    {
      title: 'Est cadre',
      dataIndex: 'estCadre',
      key: 'estCadre',
      width: 100,
      align: 'center',
      render: (estCadre: boolean, record: Categorie) => (
        <Switch 
          checked={estCadre} 
          onChange={(checked) => updateMutation.mutate({ id: record._id, data: { estCadre: checked } })}
          size="small"
          checkedChildren="Oui"
          unCheckedChildren="Non"
        />
      ),
    },
    {
      title: 'Créé le',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => date ? new Date(date).toLocaleDateString('fr-FR') : '-',
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
              icon={<Pencil className="w-4 h-4" />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Supprimer cette catégorie ?"
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
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Users className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <Title level={4} style={{ margin: 0 }}>Gestion des catégories</Title>
            <Text type="secondary">Gérez les catégories professionnelles</Text>
          </div>
        </div>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => handleOpenModal()}
          style={{ backgroundColor: '#0d9488' }}
        >
          Nouvelle catégorie
        </Button>
      </div>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `${total} catégorie(s)`,
          }}
          size="middle"
        />
      </Card>

      {/* Modal Create/Edit */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>{editingCategorie ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</span>
          </div>
        }
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={400}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="code"
            label="Code"
            rules={[{ required: true, message: 'Le code est requis' }]}
          >
            <InputNumber
              min={0}
              placeholder="Ex: 1, 2, 3..."
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="valeur"
            label="Valeur"
            rules={[{ required: true, message: 'La valeur est requise' }]}
          >
            <InputNumber
              min={0}
              placeholder="Ex: 100, 200, 300..."
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="estCadre"
            label="Est cadre"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch
              checkedChildren="Oui"
              unCheckedChildren="Non"
            />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button onClick={handleCloseModal}>
              Annuler
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createMutation.isPending || updateMutation.isPending}
              style={{ backgroundColor: '#0d9488' }}
            >
              {editingCategorie ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
