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
  Tooltip,
} from 'antd'
import { Plus, Pencil, Trash2, FileX2 } from 'lucide-react'
import type { MotifRupture, CreateMotifRuptureDto, UpdateMotifRuptureDto } from '@/types/motif-rupture'
import { MotifRuptureService } from '@/services/motif-rupture.service'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography

export const Route = createFileRoute('/admin/parametrage/motifs-rupture')({
  component: MotifsRupturePage,
})

function MotifsRupturePage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMotif, setEditingMotif] = useState<MotifRupture | null>(null)
  const [searchText, setSearchText] = useState('')
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data: motifs = [], isLoading } = useQuery({
    queryKey: ['motifs-rupture'],
    queryFn: () => MotifRuptureService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateMotifRuptureDto) => MotifRuptureService.create(data),
    onSuccess: () => {
      message.success('Motif de rupture créé avec succès')
      queryClient.invalidateQueries({ queryKey: ['motifs-rupture'] })
      handleCloseModal()
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la création')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMotifRuptureDto }) =>
      MotifRuptureService.update(id, data),
    onSuccess: () => {
      message.success('Motif de rupture modifié avec succès')
      queryClient.invalidateQueries({ queryKey: ['motifs-rupture'] })
      handleCloseModal()
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la modification')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => MotifRuptureService.delete(id),
    onSuccess: () => {
      message.success('Motif de rupture supprimé avec succès')
      queryClient.invalidateQueries({ queryKey: ['motifs-rupture'] })
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la suppression')
    },
  })

  const handleOpenModal = (motif?: MotifRupture) => {
    if (motif) {
      setEditingMotif(motif)
      form.setFieldsValue(motif)
    } else {
      setEditingMotif(null)
      form.resetFields()
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingMotif(null)
    form.resetFields()
  }

  const handleSubmit = (values: CreateMotifRuptureDto) => {
    if (editingMotif) {
      updateMutation.mutate({ id: editingMotif._id, data: values })
    } else {
      createMutation.mutate(values)
    }
  }

  const filteredMotifs = motifs.filter((m) => {
    if (!searchText.trim()) return true
    const search = searchText.toLowerCase()
    return (
      m.libelle.toLowerCase().includes(search) ||
      (m.description?.toLowerCase().includes(search) ?? false)
    )
  })

  const columns: ColumnsType<MotifRupture> = [
    {
      title: 'Libellé',
      dataIndex: 'libelle',
      key: 'libelle',
      render: (libelle: string) => <Text strong>{libelle}</Text>,
      sorter: (a, b) => a.libelle.localeCompare(b.libelle),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (description: string) => description ? <Text type="secondary">{description}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: 'Créé le',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 130,
      render: (date: string) => date ? new Date(date).toLocaleDateString('fr-FR') : '—',
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
            title="Supprimer ce motif ?"
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <FileX2 className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <Title level={4} style={{ margin: 0 }}>Motifs de rupture de contrat</Title>
            <Text type="secondary">Gérez les motifs de rupture de contrat des employés</Text>
          </div>
        </div>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => handleOpenModal()}
          danger
        >
          Nouveau motif
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <Input.Search
            placeholder="Rechercher par libellé ou description..."
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 400 }}
          />
        </div>
        <Table
          columns={columns}
          dataSource={filteredMotifs}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `${total} motif(s)`,
          }}
          size="middle"
        />
      </Card>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <FileX2 className="w-5 h-5 text-red-600" />
            <span>{editingMotif ? 'Modifier le motif' : 'Nouveau motif de rupture'}</span>
          </div>
        }
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={480}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="libelle"
            label="Libellé"
            rules={[{ required: true, message: 'Le libellé est requis' }]}
          >
            <Input placeholder="Ex: Démission, Licenciement, Fin de contrat..." />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea
              placeholder="Description optionnelle du motif..."
              rows={3}
            />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button onClick={handleCloseModal}>Annuler</Button>
            <Button
              type="primary"
              htmlType="submit"
              danger
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editingMotif ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
