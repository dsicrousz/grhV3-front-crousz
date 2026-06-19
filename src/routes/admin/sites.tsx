import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Table, Button, Modal, Form, Input, Space, Typography, Card, message, Popconfirm, Tag, Tooltip } from 'antd'
import { Plus, Pencil, Trash2, MapPin } from 'lucide-react'
import type { Site, CreateSiteDto, UpdateSiteDto } from '@/types/site'
import { SiteService } from '@/services/site.service'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography

export const Route = createFileRoute('/admin/sites')({
  component: SitesPage,
})

function SitesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSite, setEditingSite] = useState<Site | null>(null)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data: sites = [], isLoading } = useQuery({
    queryKey: ['sites'],
    queryFn: () => SiteService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateSiteDto) => SiteService.create(data),
    onSuccess: () => {
      message.success('Site créé avec succès')
      queryClient.invalidateQueries({ queryKey: ['sites'] })
      handleClose()
    },
    onError: () => message.error('Erreur lors de la création'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSiteDto }) => SiteService.update(id, data),
    onSuccess: () => {
      message.success('Site modifié avec succès')
      queryClient.invalidateQueries({ queryKey: ['sites'] })
      handleClose()
    },
    onError: () => message.error('Erreur lors de la modification'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => SiteService.delete(id),
    onSuccess: () => {
      message.success('Site supprimé avec succès')
      queryClient.invalidateQueries({ queryKey: ['sites'] })
    },
    onError: () => message.error('Erreur lors de la suppression'),
  })

  const handleClose = () => {
    setIsModalOpen(false)
    setEditingSite(null)
    form.resetFields()
  }

  const handleOpen = (site?: Site) => {
    if (site) {
      setEditingSite(site)
      form.setFieldsValue(site)
    } else {
      setEditingSite(null)
      form.resetFields()
    }
    setIsModalOpen(true)
  }

  const handleSubmit = (values: any) => {
    if (editingSite) {
      updateMutation.mutate({ id: editingSite._id, data: values })
    } else {
      createMutation.mutate(values)
    }
  }

  const columns: ColumnsType<Site> = [
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
      render: (nom: string) => <Text strong>{nom}</Text>,
      sorter: (a, b) => a.nom.localeCompare(b.nom),
    },
    {
      title: 'Adresse',
      dataIndex: 'adresse',
      key: 'adresse',
      render: (adresse?: string) => adresse || <Text type="secondary">—</Text>,
    },
    {
      title: 'Ville',
      dataIndex: 'ville',
      key: 'ville',
      render: (ville?: string) => ville || <Text type="secondary">—</Text>,
    },
    {
      title: 'Statut',
      dataIndex: 'est_actif',
      key: 'est_actif',
      render: (est_actif: boolean) => (
        <Tag color={est_actif ? 'green' : 'red'}>{est_actif ? 'Actif' : 'Inactif'}</Tag>
      ),
      filters: [
        { text: 'Actif', value: true },
        { text: 'Inactif', value: false },
      ],
      onFilter: (value, record) => record.est_actif === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="Modifier">
            <Button type="text" size="small" icon={<Pencil className="w-4 h-4" />} onClick={() => handleOpen(record)} />
          </Tooltip>
          <Popconfirm
            title="Supprimer ce site ?"
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
        </Space>
      ),
    },
  ]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <MapPin className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <Title level={4} style={{ margin: 0 }}>Gestion des sites</Title>
            <Text type="secondary">Gérez les sites de l'entreprise</Text>
          </div>
        </div>
        <Button type="primary" icon={<Plus className="w-4 h-4" />} onClick={() => handleOpen()}>
          Nouveau site
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={sites}
          rowKey="_id"
          loading={isLoading}
          pagination={{ showSizeChanger: true, showTotal: (total) => `${total} site(s)` }}
          size="middle"
        />
      </Card>

      <Modal
        title={editingSite ? 'Modifier le site' : 'Nouveau site'}
        open={isModalOpen}
        onCancel={handleClose}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="nom" label="Nom" rules={[{ required: true, message: 'Le nom est requis' }]}>
            <Input placeholder="Nom du site" />
          </Form.Item>
          <Form.Item name="adresse" label="Adresse">
            <Input placeholder="Adresse" />
          </Form.Item>
          <Form.Item name="ville" label="Ville">
            <Input placeholder="Ville" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="Description optionnelle..." />
          </Form.Item>
          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={handleClose}>Annuler</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {editingSite ? 'Modifier' : 'Créer'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
