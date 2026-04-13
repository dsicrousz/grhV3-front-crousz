import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input,
  Space, 
  Typography, 
  Card, 
  Popconfirm, 
  message,
  Tooltip
} from 'antd'
import { Plus, Pencil, Trash2, Briefcase } from 'lucide-react'
import type { Fonction, CreateFonctionDto, UpdateFonctionDto } from '@/types/fonction'
import { FonctionService } from '@/services/fonction.service'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography

export const Route = createFileRoute('/admin/parametrage/fonctions')({
  component: FonctionsPage,
})

function FonctionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFonction, setEditingFonction] = useState<Fonction | null>(null)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data: fonctions = [], isLoading } = useQuery({
    queryKey: ['fonctions'],
    queryFn: () => FonctionService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateFonctionDto) => FonctionService.create(data),
    onSuccess: () => {
      message.success('Fonction créée avec succès')
      queryClient.invalidateQueries({ queryKey: ['fonctions'] })
      handleCloseModal()
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la création')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFonctionDto }) => 
      FonctionService.update(id, data),
    onSuccess: () => {
      message.success('Fonction modifiée avec succès')
      queryClient.invalidateQueries({ queryKey: ['fonctions'] })
      handleCloseModal()
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la modification')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => FonctionService.delete(id),
    onSuccess: () => {
      message.success('Fonction supprimée avec succès')
      queryClient.invalidateQueries({ queryKey: ['fonctions'] })
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la suppression')
    },
  })

  const handleOpenModal = (fonction?: Fonction) => {
    if (fonction) {
      setEditingFonction(fonction)
      form.setFieldsValue({ nom: fonction.nom })
    } else {
      setEditingFonction(null)
      form.resetFields()
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingFonction(null)
    form.resetFields()
  }

  const handleSubmit = async (values: CreateFonctionDto) => {
    if (editingFonction) {
      updateMutation.mutate({ id: editingFonction._id, data: values })
    } else {
      createMutation.mutate(values)
    }
  }

  const columns: ColumnsType<Fonction> = [
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
      sorter: (a, b) => a.nom.localeCompare(b.nom),
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
            title="Supprimer cette fonction ?"
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
          <div className="p-2 bg-amber-100 rounded-lg">
            <Briefcase className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <Title level={4} style={{ margin: 0 }}>Gestion des fonctions</Title>
            <Text type="secondary">Gérez les fonctions des employés</Text>
          </div>
        </div>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => handleOpenModal()}
          style={{ backgroundColor: '#0d9488' }}
        >
          Nouvelle fonction
        </Button>
      </div>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={fonctions}
          rowKey="id"
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `${total} fonction(s)`,
          }}
          size="middle"
        />
      </Card>

      {/* Modal Create/Edit */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-600" />
            <span>{editingFonction ? 'Modifier la fonction' : 'Nouvelle fonction'}</span>
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
            name="nom"
            label="Nom de la fonction"
            rules={[{ required: true, message: 'Le nom est requis' }]}
          >
            <Input placeholder="Ex: Directeur, Comptable, Secrétaire..." />
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
              {editingFonction ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
