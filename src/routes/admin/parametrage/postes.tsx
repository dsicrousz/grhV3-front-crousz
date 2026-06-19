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
import type { Poste, CreatePosteDto, UpdatePosteDto } from '@/types/poste'
import { PosteService } from '@/services/poste.service'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography

export const Route = createFileRoute('/admin/parametrage/postes')({
  component: PostesPage,
})

function PostesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPoste, setEditingPoste] = useState<Poste | null>(null)
  const [searchText, setSearchText] = useState('')
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data: postes = [], isLoading } = useQuery({
    queryKey: ['postes'],
    queryFn: () => PosteService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreatePosteDto) => PosteService.create(data),
    onSuccess: () => {
      message.success('Poste créé avec succès')
      queryClient.invalidateQueries({ queryKey: ['postes'] })
      handleCloseModal()
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la création')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePosteDto }) => 
      PosteService.update(id, data),
    onSuccess: () => {
      message.success('Poste modifié avec succès')
      queryClient.invalidateQueries({ queryKey: ['postes'] })
      handleCloseModal()
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la modification')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => PosteService.delete(id),
    onSuccess: () => {
      message.success('Poste supprimé avec succès')
      queryClient.invalidateQueries({ queryKey: ['postes'] })
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la suppression')
    },
  })

  const handleOpenModal = (poste?: Poste) => {
    if (poste) {
      setEditingPoste(poste)
      form.setFieldsValue({ nom: poste.nom })
    } else {
      setEditingPoste(null)
      form.resetFields()
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingPoste(null)
    form.resetFields()
  }

  const handleSubmit = async (values: CreatePosteDto) => {
    if (editingPoste) {
      updateMutation.mutate({ id: editingPoste._id, data: values })
    } else {
      createMutation.mutate(values)
    }
  }

  const columns: ColumnsType<Poste> = [
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
            title="Supprimer ce poste ?"
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
      <Card>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <Briefcase className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <Title level={4} className="m-0">Gestion des Postes</Title>
              <Text type="secondary" className="text-sm">Créer et gérer les postes de l'organisation</Text>
            </div>
          </div>
          <Button
            type="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => handleOpenModal()}
            style={{ backgroundColor: '#0d9488', borderColor: '#0d9488' }}
          >
            Nouveau Poste
          </Button>
        </div>

        <Card>
          <div className="mb-4">
            <Input.Search
              placeholder="Rechercher par nom..."
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
              style={{ maxWidth: 400 }}
            />
          </div>
          <Table
            columns={columns}
            dataSource={postes.filter((p) => {
              if (!searchText.trim()) return true
              return p.nom.toLowerCase().includes(searchText.toLowerCase())
            })}
            rowKey="_id"
            loading={isLoading}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </Card>

      <Modal
        title={editingPoste ? 'Modifier le poste' : 'Nouveau poste'}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="nom"
            label="Nom du poste"
            rules={[{ required: true, message: 'Requis' }]}
          >
            <Input placeholder="Ex: Comptable, Secrétaire, etc." />
          </Form.Item>
          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={handleCloseModal}>Annuler</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createMutation.isPending || updateMutation.isPending}
                style={{ backgroundColor: '#0d9488', borderColor: '#0d9488' }}
              >
                {editingPoste ? 'Modifier' : 'Créer'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
