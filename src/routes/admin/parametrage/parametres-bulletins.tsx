import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Table,
  Button,
  Modal,
  Form,
  InputNumber,
  Space,
  Typography,
  Card,
  Popconfirm,
  message,
  Tooltip,
  Tag,
} from 'antd'
import { Plus, Pencil, Trash2, Palette } from 'lucide-react'
import type { ParametreBulletin, CreateParametreBulletinDto, UpdateParametreBulletinDto } from '@/types/parametre-bulletin'
import { ParametreBulletinService } from '@/services/parametre-bulletin.service'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography

export const Route = createFileRoute('/admin/parametrage/parametres-bulletins')({
  component: ParametresBulletinsPage,
})

function ParametresBulletinsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingParam, setEditingParam] = useState<ParametreBulletin | null>(null)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data: parametres = [], isLoading } = useQuery({
    queryKey: ['parametres-bulletins'],
    queryFn: () => ParametreBulletinService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateParametreBulletinDto) => ParametreBulletinService.create(data),
    onSuccess: () => {
      message.success('Paramètre créé avec succès')
      queryClient.invalidateQueries({ queryKey: ['parametres-bulletins'] })
      handleCloseModal()
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la création')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateParametreBulletinDto }) =>
      ParametreBulletinService.update(id, data),
    onSuccess: () => {
      message.success('Paramètre modifié avec succès')
      queryClient.invalidateQueries({ queryKey: ['parametres-bulletins'] })
      handleCloseModal()
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la modification')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ParametreBulletinService.delete(id),
    onSuccess: () => {
      message.success('Paramètre supprimé avec succès')
      queryClient.invalidateQueries({ queryKey: ['parametres-bulletins'] })
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la suppression')
    },
  })

  const handleOpenModal = (param?: ParametreBulletin) => {
    if (param) {
      setEditingParam(param)
      form.setFieldsValue(param)
    } else {
      setEditingParam(null)
      form.resetFields()
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingParam(null)
    form.resetFields()
  }

  const handleSubmit = (values: CreateParametreBulletinDto) => {
    if (editingParam) {
      updateMutation.mutate({ id: editingParam._id, data: values })
    } else {
      createMutation.mutate(values)
    }
  }

  const sortedParametres = [...parametres].sort((a, b) => b.annee - a.annee)

  const columns: ColumnsType<ParametreBulletin> = [
    {
      title: 'Année',
      dataIndex: 'annee',
      key: 'annee',
      width: 120,
      sorter: (a, b) => b.annee - a.annee,
      defaultSortOrder: 'ascend',
      render: (annee: number) => <Text strong>{annee}</Text>,
    },
    {
      title: 'Couleur',
      dataIndex: 'couleur',
      key: 'couleur',
      width: 200,
      render: (couleur: string) => (
        <Space>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 4,
              backgroundColor: couleur,
              border: '1px solid #d9d9d9',
              flexShrink: 0,
            }}
          />
          <Tag style={{ fontFamily: 'monospace' }}>{couleur}</Tag>
        </Space>
      ),
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
            title="Supprimer ce paramètre ?"
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
          <div className="p-2 bg-violet-100 rounded-lg">
            <Palette className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <Title level={4} style={{ margin: 0 }}>Couleurs des bulletins par année</Title>
            <Text type="secondary">Définissez la couleur d'impression des bulletins de paie par année</Text>
          </div>
        </div>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => handleOpenModal()}
          style={{ backgroundColor: '#7c3aed' }}
        >
          Nouveau paramètre
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={sortedParametres}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `${total} paramètre(s)`,
          }}
          size="middle"
        />
      </Card>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-violet-600" />
            <span>{editingParam ? 'Modifier le paramètre' : 'Nouveau paramètre de couleur'}</span>
          </div>
        }
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={420}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="annee"
            label="Année"
            rules={[
              { required: true, message: "L'année est requise" },
              { type: 'number', min: 2000, max: 2100, message: 'Année invalide' },
            ]}
          >
            <InputNumber
              placeholder={`Ex: ${new Date().getFullYear()}`}
              style={{ width: '100%' }}
              min={2000}
              max={2100}
            />
          </Form.Item>

          <Form.Item
            name="couleur"
            label="Couleur (hex)"
            rules={[
              { required: true, message: 'La couleur est requise' },
              {
                pattern: /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/,
                message: 'Format hex invalide (ex: #FF5733)',
              },
            ]}
          >
            <Space.Compact style={{ width: '100%' }}>
              <Form.Item name="couleur" noStyle>
                <input
                  type="color"
                  style={{
                    width: 40,
                    height: 32,
                    padding: 2,
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px 0 0 6px',
                    cursor: 'pointer',
                  }}
                  onChange={(e) => form.setFieldValue('couleur', e.target.value)}
                />
              </Form.Item>
              <Form.Item name="couleur" noStyle>
                <input
                  type="text"
                  placeholder="#RRGGBB"
                  style={{
                    flex: 1,
                    height: 32,
                    padding: '0 11px',
                    border: '1px solid #d9d9d9',
                    borderLeft: 'none',
                    borderRadius: '0 6px 6px 0',
                    fontFamily: 'monospace',
                    width: '100%',
                    outline: 'none',
                  }}
                  onChange={(e) => form.setFieldValue('couleur', e.target.value)}
                />
              </Form.Item>
            </Space.Compact>
          </Form.Item>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button onClick={handleCloseModal}>Annuler</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createMutation.isPending || updateMutation.isPending}
              style={{ backgroundColor: '#7c3aed' }}
            >
              {editingParam ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
