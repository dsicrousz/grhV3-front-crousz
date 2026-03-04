import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Table, Space, Button, Tooltip, Modal, Form, Input, Popconfirm, Tag, Steps, message, Spin } from 'antd'
import { Plus, Pencil, Trash2, Eye, Send, Check, X, FileText, Clock, Undo2 } from 'lucide-react'
import { LotService } from '@/services/lot.service'
import { StateLot } from '@/types/lot'
import type { Lot, CreateLotDto } from '@/types/lot'
import { Typography } from 'antd'
import { Card } from 'antd'
import { DatePicker } from 'antd'
import dayjs from 'dayjs'
import { USER_ROLE } from '@/types/user.roles'
import { useSession } from '@/auth/auth-client'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

export const Route = createFileRoute('/admin/lots/')({
  component: LotsPage,
})

function LotsPage() {
  const { data: session } = useSession()
  const navigate = Route.useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLot, setEditingLot] = useState<Lot | null>(null)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data: lots = [], isLoading } = useQuery({
    queryKey: ['lots'],
    queryFn: () => LotService.getAll()
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateLotDto) => LotService.create(data),
    onSuccess: () => {
      message.success('Lot créé avec succès')
      setIsModalOpen(false)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['lots'] })
    },
    onError: () => {
      message.error('Erreur lors de la création du lot')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: CreateLotDto }) => 
      LotService.update(id, data),
    onSuccess: () => {
      message.success('Lot mis à jour avec succès')
      setIsModalOpen(false)
      setEditingLot(null)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['lots'] })
    },
    onError: () => {
      message.error('Erreur lors de la mise à jour du lot')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => LotService.delete(id),
    onSuccess: () => {
      message.success('Lot supprimé avec succès')
      queryClient.invalidateQueries({ queryKey: ['lots'] })
    },
    onError: () => {
      message.error('Erreur lors de la suppression du lot')
    }
  })

  const publishMutation = useMutation({
    mutationFn: (id: string) => LotService.publish(id),
    onSuccess: () => {
      message.success('Lot publié avec succès')
      queryClient.invalidateQueries({ queryKey: ['lots'] })
    },
    onError: () => {
      message.error('Erreur lors de la publication du lot')
    }
  })

  const generateMutation = useMutation({
    mutationFn: (id: string) => LotService.generate(id),
    onSuccess: () => {
      message.success('Lot généré avec succès')
      queryClient.invalidateQueries({ queryKey: ['lots'] })
    },
    onError: () => {
      message.error('Erreur lors de la génération du lot')
    }
  })

  const submitMutation = useMutation({
    mutationFn: (id: string) => LotService.submit(id),
    onSuccess: () => {
      message.success('Lot soumis avec succès')
      queryClient.invalidateQueries({ queryKey: ['lots'] })
    },
    onError: () => {
      message.error('Erreur lors de la soumission du lot')
    }
  })

  const cancelSubmitMutation = useMutation({
    mutationFn: (id: string) => LotService.cancelSubmit(id),
    onSuccess: () => {
      message.success('Soumission annulée avec succès')
      queryClient.invalidateQueries({ queryKey: ['lots'] })
    },
    onError: () => {
      message.error('Erreur lors de l\'annulation de la soumission')
    }
  })

  const setWaitingMutation = useMutation({
    mutationFn: (id: string) => LotService.setWaiting(id),
    onSuccess: () => {
      message.success('Lot mis en attente avec succès')
      queryClient.invalidateQueries({ queryKey: ['lots'] })
    },
    onError: () => {
      message.error('Erreur lors de la mise en attente du lot')
    }
  })

  const cancelWaitingMutation = useMutation({
    mutationFn: (id: string) => LotService.cancelWaiting(id),
    onSuccess: () => {
      message.success('Mise en attente annulée avec succès')
      queryClient.invalidateQueries({ queryKey: ['lots'] })
    },
    onError: () => {
      message.error('Erreur lors de l\'annulation de la mise en attente')
    }
  })

  const validateMutation = useMutation({
    mutationFn: (id: string) => LotService.validate(id),
    onSuccess: () => {
      message.success('Lot validé avec succès')
      queryClient.invalidateQueries({ queryKey: ['lots'] })
    },
    onError: () => {
      message.error('Erreur lors de la validation du lot')
    }
  })

  const rejectMutation = useMutation({
    mutationFn: (id: string) => LotService.reject(id),
    onSuccess: () => {
      message.success('Lot rejeté avec succès')
      queryClient.invalidateQueries({ queryKey: ['lots'] })
    },
    onError: () => {
      message.error('Erreur lors du rejet du lot')
    }
  })

  const handleSubmit = (values: { periode: [any, any], libelle: string }) => {
    const [debut, fin] = values.periode
    const data: CreateLotDto = {
      libelle: values.libelle,
      debut: debut.format('YYYY-MM-DD'),
      fin: fin.format('YYYY-MM-DD'),
      etat: StateLot.BROUILLON
    }

    if (editingLot) {
      updateMutation.mutate({ id: editingLot._id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = (lot: Lot) => {
    setEditingLot(lot)
    form.setFieldsValue({
      ...lot,
      periode: [dayjs(lot.debut), dayjs(lot.fin)]
    })
    setIsModalOpen(true)
  }

  const getStateStep = (etat: StateLot) => {
    switch(etat) {
      case StateLot.BROUILLON:
        return 0
      case StateLot.WAITING1:
        return 1
      case StateLot.WAITING2:
        return 2
      case StateLot.VALIDE:
        return 3
      default:
        return 0
    }
  }

  const getStateColor = (etat: StateLot) => {
    switch(etat) {
      case StateLot.BROUILLON:
        return 'default'
      case StateLot.WAITING1:
        return 'processing'
      case StateLot.WAITING2:
        return 'warning'
      case StateLot.VALIDE:
        return 'success'
      default:
        return 'default'
    }
  }

  const columns: ColumnsType<Lot> = [
    {
      title: 'Libellé',
      dataIndex: 'libelle',
      key: 'libelle',
      render: (libelle) => <Text strong>{libelle}</Text>
    },
    {
      title: 'Période',
      key: 'periode',
      render: (_, record) => (
        <Text type="secondary">
          Du {dayjs(record.debut).format('DD/MM/YYYY')} au {dayjs(record.fin).format('DD/MM/YYYY')}
        </Text>
      )
    },
    {
      title: 'État',
      dataIndex: 'etat',
      key: 'etat',
      render: (etat: StateLot) => (
        <Tag color={getStateColor(etat)}>{etat}</Tag>
      )
    },
    {
      title: 'Progression',
      key: 'progression',
      render: (_, record) => (
        <Steps
          size="small"
          current={getStateStep(record.etat)}
          items={[
            { title: 'Brouillon' },
            { title: 'Soumis' },
            { title: 'En cours' },
            { title: 'Validé' }
          ]}
        />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record: Lot) => (
        <Space>
          <Tooltip title="Voir le lot">
            <Button
              type="text"
              size="small"
              icon={<Eye className="w-4 h-4" />}
              onClick={() => navigate({ to: '/admin/lots/$lotId', params: { lotId: record._id } })}
            />
          </Tooltip>

          {/* Boutons pour le rôle RH */}
          {session?.user.role === USER_ROLE.RH && (
            <>
              {record.etat === StateLot.BROUILLON && (
                <>
                  <Tooltip title="Modifier">
                    <Button
                      type="text"
                      size="small"
                      icon={<Pencil className="w-4 h-4" />}
                      onClick={() => handleEdit(record)}
                    />
                  </Tooltip>
                  <Popconfirm
                    title="Supprimer ce lot ?"
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
                  <Tooltip title="Générer">
                    <Button
                      type="text"
                      size="small"
                      icon={<FileText className="w-4 h-4" />}
                      onClick={() => generateMutation.mutate(record._id)}
                    />
                  </Tooltip>
                  <Tooltip title="Soumettre">
                    <Button
                      type="text"
                      size="small"
                      icon={<Send className="w-4 h-4" />}
                      onClick={() => submitMutation.mutate(record._id)}
                    />
                  </Tooltip>
                </>
              )}
              {record.etat === StateLot.WAITING1 && (
                <Tooltip title="Annuler la soumission">
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<Undo2 className="w-4 h-4" />}
                    onClick={() => cancelSubmitMutation.mutate(record._id)}
                  />
                </Tooltip>
              )}
            </>
          )}

          {/* Boutons pour le rôle CSA */}
          {session?.user.role === USER_ROLE.CSA && (
            <>
              {record.etat === StateLot.WAITING1 && (
                <Tooltip title="Mettre en cours de validation">
                  <Button
                    type="text"
                    size="small"
                    icon={<Clock className="w-4 h-4" />}
                    onClick={() => setWaitingMutation.mutate(record._id)}
                  />
                </Tooltip>
              )}
              {record.etat === StateLot.WAITING2 && (
                <Tooltip title="Annuler la mise en validation">
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<Undo2 className="w-4 h-4" />}
                    onClick={() => cancelWaitingMutation.mutate(record._id)}
                  />
                </Tooltip>
              )}
            </>
          )}

          {/* Boutons pour le rôle Admin */}
          {session?.user.role === USER_ROLE.ADMIN && record.etat === StateLot.WAITING2 && (
            <>
              <Tooltip title="Valider">
                <Button
                  type="text"
                  size="small"
                  icon={<Check className="w-4 h-4" />}
                  onClick={() => validateMutation.mutate(record._id)}
                />
              </Tooltip>
              <Tooltip title="Rejeter">
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<X className="w-4 h-4" />}
                  onClick={() => rejectMutation.mutate(record._id)}
                />
              </Tooltip>
            </>
          )}

          {record.etat === StateLot.VALIDE && !record.isPublished && (
            <Tooltip title="Publier">
              <Button
                type="text"
                size="small"
                icon={<FileText className="w-4 h-4" />}
                onClick={() => publishMutation.mutate(record._id)}
              />
            </Tooltip>
          )}
        </Space>
      )
    }
  ]

  return (
    <div className="space-y-6 p-6">
      <Spin size="large" spinning={isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || generateMutation.isPending || submitMutation.isPending || cancelSubmitMutation.isPending || setWaitingMutation.isPending || cancelWaitingMutation.isPending || validateMutation.isPending || rejectMutation.isPending || publishMutation.isPending}>
      <Space className="w-full justify-between">
        <Title level={4}>Lots de bulletins</Title>
        {session?.user.role === USER_ROLE.RH && (
          <Button 
            type="primary" 
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Nouveau lot
          </Button>
        )}
      </Space>

      <Card>
        <Table
          columns={columns}
          dataSource={lots}
          rowKey="_id"
          loading={isLoading}
        />
      </Card>

      <Modal 
        title={editingLot ? 'Modifier le lot' : 'Nouveau lot'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          setEditingLot(null)
          form.resetFields()
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="libelle"
            label="Libellé"
            rules={[{ required: true, message: 'Le libellé est requis' }]}
          >
            <Input placeholder="Ex: Paie Janvier 2024" />
          </Form.Item>

          <Form.Item
            name="periode"
            label="Période"
            rules={[{ required: true, message: 'La période est requise' }]}
          >
            <RangePicker
              className="w-full"
              format="DD/MM/YYYY"
            />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => {
                setIsModalOpen(false)
                setEditingLot(null)
                form.resetFields()
              }}>
                Annuler
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={editingLot ? updateMutation.isPending : createMutation.isPending}
              >
                {editingLot ? 'Modifier' : 'Créer'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      </Spin>
    </div>
  )
}
