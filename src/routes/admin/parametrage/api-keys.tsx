import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Space,
  Typography,
  Card,
  Popconfirm,
  message,
  Tooltip,
  Tag,
  Alert,
  Badge,
} from 'antd'
import { Plus, Trash2, Key, Copy, Eye, EyeOff, RefreshCw } from 'lucide-react'
import type { ColumnsType } from 'antd/es/table'
import { authClient } from '@/auth/auth-client'
import { USER_ROLE } from '@/types/user.roles'
import dayjs from 'dayjs'

type ApiKey = NonNullable<Awaited<ReturnType<typeof authClient.apiKey.list>>['data']>['apiKeys'][number]
type CreateApiKeyDto = Parameters<typeof authClient.apiKey.create>[0]

const { Title, Text } = Typography

export const Route = createFileRoute('/admin/parametrage/api-keys')({
  beforeLoad: async () => {
    const session = await authClient.getSession()
    if (session.data?.user?.role !== USER_ROLE.ADMIN) {
      throw redirect({ to: '/admin' })
    }
  },
  component: ApiKeysPage,
})

function ApiKeysPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [showKey, setShowKey] = useState(false)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data: apiKeysData, isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const res = await authClient.apiKey.list({ query: { sortBy: 'createdAt', sortDirection: 'desc' } })
      if (res.error) throw new Error(res.error.message)
      return res.data
    },
  })

  const apiKeys = apiKeysData?.apiKeys ?? []

  const createMutation = useMutation({
    mutationFn: async (data: CreateApiKeyDto) => {
      const res = await authClient.apiKey.create(data)
      if (res.error) throw new Error(res.error.message)
      return res.data
    },
    onSuccess: (result) => {
      setCreatedKey(result!.key)
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
      form.resetFields()
    },
    onError: () => {
      message.error("Erreur lors de la création de la clé API")
    },
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ keyId, enabled }: { keyId: string; enabled: boolean }) => {
      const res = await authClient.apiKey.update({ keyId, enabled })
      if (res.error) throw new Error(res.error.message)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
    },
    onError: () => {
      message.error("Erreur lors de la mise à jour")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const res = await authClient.apiKey.delete({ keyId })
      if (res.error) throw new Error(res.error.message)
      return res.data
    },
    onSuccess: () => {
      message.success('Clé API supprimée')
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
    },
    onError: () => {
      message.error("Erreur lors de la suppression")
    },
  })

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setCreatedKey(null)
    setShowKey(false)
    form.resetFields()
  }

  const handleSubmit = (values: { name?: string; prefix?: string; expiresInDays?: number }) => {
    createMutation.mutate({
      name: values.name,
      prefix: values.prefix,
      expiresIn: values.expiresInDays ? values.expiresInDays * 60 * 60 * 24 : undefined,
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    message.success('Clé copiée dans le presse-papiers')
  }

  const isExpired = (key: ApiKey) => key.expiresAt && dayjs(key.expiresAt).isBefore(dayjs())

  const columns: ColumnsType<ApiKey> = [
    {
      title: 'Nom',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <Space>
          <Key className="w-4 h-4 text-gray-400" />
          <Text strong>{name || '—'}</Text>
          {isExpired(record) && <Tag color="red">Expirée</Tag>}
        </Space>
      ),
    },
    {
      title: 'Préfixe / Début',
      key: 'start',
      width: 160,
      render: (_, record) => (
        <Text type="secondary" style={{ fontFamily: 'monospace', fontSize: 12 }}>
          {record.prefix ? `${record.prefix}_` : ''}{record.start ?? ''}••••
        </Text>
      ),
    },
    {
      title: 'Statut',
      key: 'enabled',
      width: 110,
      render: (_, record) => (
        <Switch
          checked={record.enabled}
          size="small"
          loading={toggleMutation.isPending}
          onChange={(enabled: boolean) => toggleMutation.mutate({ keyId: record.id, enabled })}
          checkedChildren="Actif"
          unCheckedChildren="Inactif"
        />
      ),
    },
    {
      title: 'Requêtes',
      key: 'requests',
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 12 }}>
            {record.remaining != null ? (
              <Badge status="processing" text={`${record.remaining} restantes`} />
            ) : (
              <Text type="secondary" style={{ fontSize: 12 }}>Illimité</Text>
            )}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Expiration',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      width: 140,
      render: (date?: string) => date
        ? <Text type={dayjs(date).isBefore(dayjs()) ? 'danger' : 'secondary'} style={{ fontSize: 12 }}>
            {dayjs(date).format('DD/MM/YYYY HH:mm')}
          </Text>
        : <Text type="secondary" style={{ fontSize: 12 }}>Jamais</Text>,
    },
    {
      title: 'Créée le',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 130,
      render: (date: string) => <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(date).format('DD/MM/YYYY')}</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Popconfirm
          title="Supprimer cette clé API ?"
          description="Cette action est irréversible. Les services utilisant cette clé seront bloqués."
          onConfirm={() => deleteMutation.mutate(record.id)}
          okText="Supprimer"
          cancelText="Annuler"
          okButtonProps={{ danger: true }}
        >
          <Tooltip title="Supprimer">
            <Button type="text" size="small" danger icon={<Trash2 className="w-4 h-4" />} />
          </Tooltip>
        </Popconfirm>
      ),
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-900 rounded-lg">
            <Key className="w-6 h-6 text-white" />
          </div>
          <div>
            <Title level={4} style={{ margin: 0 }}>Clés API</Title>
            <Text type="secondary">Gérer les clés d'authentification pour les intégrations externes</Text>
          </div>
        </div>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
          style={{ backgroundColor: '#111827' }}
        >
          Nouvelle clé
        </Button>
      </div>

      <Alert
        type="warning"
        showIcon
        title="Sécurité"
        description="Les clés API donnent accès à l'API au nom de l'utilisateur. Ne partagez jamais une clé API publiquement. La valeur complète n'est affichée qu'une seule fois lors de la création."
        banner
      />

      <Card>
        <Table
          columns={columns}
          dataSource={apiKeys}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 'max-content' }}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `${total} clé(s)`,
          }}
          size="middle"
          locale={{ emptyText: 'Aucune clé API créée' }}
        />
      </Card>

      {/* Modal création */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            <span>{createdKey ? 'Clé API créée' : 'Nouvelle clé API'}</span>
          </div>
        }
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={520}
        maskClosable={!createdKey}
      >
        {createdKey ? (
          <div className="space-y-4 py-2">
            <Alert
              type="success"
              showIcon
              title="Clé générée avec succès"
              description="Copiez cette clé maintenant. Elle ne sera plus affichée par la suite."
            />
            <div>
              <Text type="secondary" className="text-xs block mb-1">Votre clé API</Text>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border font-mono text-sm break-all">
                <span className="flex-1">
                  {showKey ? createdKey : createdKey.replace(/./g, '•').slice(0, 32) + '••••'}
                </span>
                <Button
                  type="text"
                  size="small"
                  icon={showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  onClick={() => setShowKey(!showKey)}
                />
                <Button
                  type="primary"
                  size="small"
                  icon={<Copy className="w-4 h-4" />}
                  onClick={() => copyToClipboard(createdKey)}
                  style={{ backgroundColor: '#111827' }}
                >
                  Copier
                </Button>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={handleCloseModal}>Fermer</Button>
            </div>
          </div>
        ) : (
          <Form form={form} layout="vertical" onFinish={handleSubmit} className="pt-2">
            <Form.Item name="name" label="Nom de la clé">
              <Input placeholder="Ex: Integration CRM, Webhook RH..." />
            </Form.Item>

            <Form.Item name="prefix" label="Préfixe (optionnel)" tooltip="Sera ajouté avant la clé pour identification">
              <Input placeholder="Ex: grh, prod, dev" maxLength={16} />
            </Form.Item>

            <Form.Item name="expiresInDays" label="Expiration (jours)" tooltip="Laisser vide pour une clé sans expiration">
              <InputNumber
                placeholder="Ex: 30, 90, 365"
                min={1}
                style={{ width: '100%' }}
              />
            </Form.Item>


            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button onClick={handleCloseModal}>Annuler</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createMutation.isPending}
                icon={<RefreshCw className="w-4 h-4" />}
                style={{ backgroundColor: '#111827' }}
              >
                Générer la clé
              </Button>
            </div>
          </Form>
        )}
      </Modal>
    </div>
  )
}
