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
  Tag, 
  Popconfirm, 
  message,
  Tooltip,
  Avatar
} from 'antd'
import { Trash2, Ban, CheckCircle, Users, UserPlus, Key } from 'lucide-react'
import { USER_ROLE, USER_ROLE_LABELS, USER_ROLE_COLORS } from '@/types/user.roles'
import { UserService, type UserData } from '@/services/user.service'
import type { ColumnsType } from 'antd/es/table'
import type { CreateUserDto } from '@/types/user'

const { Title, Text } = Typography

export const Route = createFileRoute('/admin/parametrage/utilisateurs')({
  component: UtilisateursPage,
})

function UtilisateursPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [isBanModalOpen, setIsBanModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [createForm] = Form.useForm()
  const [roleForm] = Form.useForm()
  const [banForm] = Form.useForm()
  const queryClient = useQueryClient()

  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [searchText, setSearchText] = useState('')

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users', pagination, searchText],
    queryFn: () => UserService.listUsers({
      limit: pagination.pageSize,
      offset: (pagination.current - 1) * pagination.pageSize,
      searchValue: searchText || undefined,
      searchField: 'name',
      searchOperator: 'contains',
    }),
  })

  const createMutation = useMutation({
    mutationFn: (data: { email: string; password: string; name: string; role: string }) => 
      UserService.createUser(data),
    onSuccess: () => {
      message.success('Utilisateur créé avec succès')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setIsCreateModalOpen(false)
      createForm.resetFields()
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la création')
    },
  })

  const setRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) => 
      UserService.setRole(userId, role),
    onSuccess: () => {
      message.success('Rôle modifié avec succès')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setIsRoleModalOpen(false)
      setSelectedUser(null)
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la modification du rôle')
    },
  })

  const banMutation = useMutation({
    mutationFn: ({ userId, banReason }: { userId: string; banReason?: string }) => 
      UserService.banUser(userId, banReason),
    onSuccess: () => {
      message.success('Utilisateur banni')
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setIsBanModalOpen(false)
      setSelectedUser(null)
      banForm.resetFields()
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors du bannissement')
    },
  })

  const unbanMutation = useMutation({
    mutationFn: (userId: string) => UserService.unbanUser(userId),
    onSuccess: () => {
      message.success('Utilisateur débanni')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors du débannissement')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => UserService.removeUser(userId),
    onSuccess: () => {
      message.success('Utilisateur supprimé')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la suppression')
    },
  })

  const handleOpenRoleModal = (user: UserData) => {
    setSelectedUser(user)
    roleForm.setFieldsValue({ role: user.role })
    setIsRoleModalOpen(true)
  }

  const handleOpenBanModal = (user: UserData) => {
    setSelectedUser(user)
    banForm.resetFields()
    setIsBanModalOpen(true)
  }

  const columns: ColumnsType<UserData> = [
    {
      title: 'Utilisateur',
      key: 'user',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar 
            src={record.image} 
            size={40}
            style={{ backgroundColor: record.image ? undefined : '#0d9488' }}
          >
            {record.name?.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" className="text-xs">{record.email}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Rôle',
      dataIndex: 'role',
      key: 'role',
      width: 180,
      filters: Object.values(USER_ROLE).map(role => ({
        text: USER_ROLE_LABELS[role],
        value: role,
      })),
      onFilter: (value, record) => record.role === value,
      render: (role: USER_ROLE) => (
        <Tag color={USER_ROLE_COLORS[role] || 'default'}>
          {USER_ROLE_LABELS[role] || role}
        </Tag>
      ),
    },
    {
      title: 'Email vérifié',
      dataIndex: 'emailVerified',
      key: 'emailVerified',
      width: 120,
      align: 'center',
      render: (verified: boolean) => (
        <Tag color={verified ? 'green' : 'orange'}>
          {verified ? 'Vérifié' : 'Non vérifié'}
        </Tag>
      ),
    },
    {
      title: 'Statut',
      dataIndex: 'banned',
      key: 'banned',
      width: 100,
      align: 'center',
      render: (banned: boolean, record) => (
        <Tooltip title={banned ? record.banReason : undefined}>
          <Tag color={banned ? 'red' : 'green'}>
            {banned ? 'Banni' : 'Actif'}
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: 'Créé le',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      render: (date: string) => date ? new Date(date).toLocaleDateString('fr-FR') : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Modifier le rôle">
            <Button
              type="text"
              size="small"
              icon={<Key className="w-4 h-4" />}
              onClick={() => handleOpenRoleModal(record)}
            />
          </Tooltip>
          {record.banned ? (
            <Tooltip title="Débannir">
              <Button
                type="text"
                size="small"
                icon={<CheckCircle className="w-4 h-4 text-green-500" />}
                onClick={() => unbanMutation.mutate(record.id)}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Bannir">
              <Button
                type="text"
                size="small"
                icon={<Ban className="w-4 h-4 text-orange-500" />}
                onClick={() => handleOpenBanModal(record)}
              />
            </Tooltip>
          )}
          <Popconfirm
            title="Supprimer cet utilisateur ?"
            description="Cette action est irréversible."
            onConfirm={() => deleteMutation.mutate(record.id)}
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

  const users = usersData?.users || []
  const total = usersData?.total || 0

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <Title level={4} style={{ margin: 0 }}>Gestion des utilisateurs</Title>
            <Text type="secondary">Gérez les comptes et les permissions</Text>
          </div>
        </div>
        <Button
          type="primary"
          icon={<UserPlus className="w-4 h-4" />}
          onClick={() => setIsCreateModalOpen(true)}
          style={{ backgroundColor: '#0d9488' }}
        >
          Nouvel utilisateur
        </Button>
      </div>

      {/* Search */}
      <Card className="mb-4">
        <Input.Search
          placeholder="Rechercher par nom..."
          allowClear
          onSearch={(value) => {
            setSearchText(value)
            setPagination({ ...pagination, current: 1 })
          }}
          style={{ maxWidth: 300 }}
        />
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (t) => `${t} utilisateur(s)`,
            onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
          }}
          size="middle"
        />
      </Card>

      {/* Modal Create User */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-teal-600" />
            <span>Nouvel utilisateur</span>
          </div>
        }
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false)
          createForm.resetFields()
        }}
        footer={null}
        width={500}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={(values:CreateUserDto) => createMutation.mutate(values)}
        >
          <Form.Item
            name="name"
            label="Nom complet"
            rules={[{ required: true, message: 'Le nom est requis' }]}
          >
            <Input placeholder="Jean Dupont" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "L'email est requis" },
              { type: 'email', message: 'Email invalide' },
            ]}
          >
            <Input placeholder="jean.dupont@entreprise.com" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mot de passe"
            rules={[
              { required: true, message: 'Le mot de passe est requis' },
              { min: 8, message: 'Minimum 8 caractères' },
            ]}
          >
            <Input.Password placeholder="Minimum 8 caractères" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Rôle"
            rules={[{ required: true, message: 'Le rôle est requis' }]}
            initialValue={USER_ROLE.USER}
          >
            <Select
             role="select"
             showSearch={
                {
                    optionFilterProp:"label"
                }
             }
              options={Object.values(USER_ROLE).map(role => ({
                value: role,
                label: USER_ROLE_LABELS[role],
              }))}
            />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button onClick={() => {
              setIsCreateModalOpen(false)
              createForm.resetFields()
            }}>
              Annuler
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createMutation.isPending}
              style={{ backgroundColor: '#0d9488' }}
            >
              Créer
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal Change Role */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-teal-600" />
            <span>Modifier le rôle</span>
          </div>
        }
        open={isRoleModalOpen}
        onCancel={() => {
          setIsRoleModalOpen(false)
          setSelectedUser(null)
        }}
        footer={null}
        width={400}
      >
        <div className="mb-4">
          <Text type="secondary">
            Utilisateur : <Text strong>{selectedUser?.name}</Text>
          </Text>
        </div>
        <Form
          form={roleForm}
          layout="vertical"
          onFinish={(values: { role: USER_ROLE }) => {
            if (selectedUser) {
              setRoleMutation.mutate({ userId: selectedUser.id, role: values.role })
            }
          }}
        >
          <Form.Item
            name="role"
            label="Nouveau rôle"
            rules={[{ required: true, message: 'Le rôle est requis' }]}
          >
            <Select
            role="select"
             showSearch={
                {
                    optionFilterProp:"label"
                }
             }
              options={Object.values(USER_ROLE).map(role => ({
                value: role,
                label: USER_ROLE_LABELS[role],
              }))}
            />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button onClick={() => {
              setIsRoleModalOpen(false)
              setSelectedUser(null)
            }}>
              Annuler
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={setRoleMutation.isPending}
              style={{ backgroundColor: '#0d9488' }}
            >
              Modifier
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal Ban User */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Ban className="w-5 h-5 text-orange-500" />
            <span>Bannir l'utilisateur</span>
          </div>
        }
        open={isBanModalOpen}
        onCancel={() => {
          setIsBanModalOpen(false)
          setSelectedUser(null)
          banForm.resetFields()
        }}
        footer={null}
        width={400}
      >
        <div className="mb-4">
          <Text type="secondary">
            Utilisateur : <Text strong>{selectedUser?.name}</Text>
          </Text>
        </div>
        <Form
          form={banForm}
          layout="vertical"
          onFinish={(values: { banReason: string }) => {
            if (selectedUser) {
              banMutation.mutate({ userId: selectedUser.id, banReason: values.banReason })
            }
          }}
        >
          <Form.Item
            name="banReason"
            label="Raison du bannissement (optionnel)"
          >
            <Input.TextArea 
              placeholder="Ex: Violation des conditions d'utilisation"
              rows={3}
            />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button onClick={() => {
              setIsBanModalOpen(false)
              setSelectedUser(null)
              banForm.resetFields()
            }}>
              Annuler
            </Button>
            <Button
              type="primary"
              danger
              htmlType="submit"
              loading={banMutation.isPending}
            >
              Bannir
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
