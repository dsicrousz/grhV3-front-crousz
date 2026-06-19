import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Table, Space, Button, Tooltip, Modal, Form, Input, Popconfirm, Tag, message, Card, Steps } from 'antd'
import { Plus, Pencil, Trash2, Eye, Check, FileText, Send, X, Clock, Undo2 } from 'lucide-react'
import { LotCddService } from '@/services/lot-cdd.service'
import { StateLot } from '@/types/lot'
import type { Lot, CreateLotDto } from '@/types/lot'
import { Typography } from 'antd'
import { DatePicker } from 'antd'
import dayjs from 'dayjs'
import { USER_ROLE } from '@/types/user.roles'
import { useSession } from '@/auth/auth-client'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

export const Route = createFileRoute('/admin/lots-cdd/')({
  component: LotsCddPage,
})

function LotsCddPage() {
  const { data: session } = useSession()
  const navigate = Route.useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLot, setEditingLot] = useState<Lot | null>(null)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data: lots = [], isLoading } = useQuery({
    queryKey: ['lots-cdd'],
    queryFn: () => LotCddService.getAll()
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateLotDto) => LotCddService.create(data),
    onSuccess: () => {
      message.success('Lot CDD créé avec succès')
      setIsModalOpen(false)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['lots-cdd'] })
    },
    onError: () => {
      message.error('Erreur lors de la création du lot CDD')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: CreateLotDto }) => 
      LotCddService.update(id, data),
    onSuccess: () => {
      message.success('Lot CDD mis à jour avec succès')
      setIsModalOpen(false)
      setEditingLot(null)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['lots-cdd'] })
    },
    onError: () => {
      message.error('Erreur lors de la mise à jour du lot CDD')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => LotCddService.delete(id),
    onSuccess: () => {
      message.success('Lot CDD supprimé avec succès')
      queryClient.invalidateQueries({ queryKey: ['lots-cdd'] })
    },
    onError: () => {
      message.error('Erreur lors de la suppression du lot CDD')
    }
  })

  const generateMutation = useMutation({
    mutationFn: (id: string) => LotCddService.generate(id),
    onSuccess: () => {
      message.success('Lot CDD généré avec succès')
      queryClient.invalidateQueries({ queryKey: ['lots-cdd'] })
    },
    onError: () => {
      message.error('Erreur lors de la génération du lot CDD')
    }
  })

  const publishMutation = useMutation({
    mutationFn: (id: string) => LotCddService.publish(id),
    onSuccess: () => {
      message.success('Lot CDD publié avec succès')
      queryClient.invalidateQueries({ queryKey: ['lots-cdd'] })
    },
    onError: () => {
      message.error('Erreur lors de la publication du lot CDD')
    }
  })

  const submitMutation = useMutation({
    mutationFn: (id: string) => LotCddService.submit(id),
    onSuccess: () => {
      message.success('Lot CDD soumis avec succès')
      queryClient.invalidateQueries({ queryKey: ['lots-cdd'] })
    },
    onError: () => {
      message.error('Erreur lors de la soumission du lot CDD')
    }
  })

  const cancelSubmitMutation = useMutation({
    mutationFn: (id: string) => LotCddService.cancelSubmit(id),
    onSuccess: () => {
      message.success('Soumission annulée avec succès')
      queryClient.invalidateQueries({ queryKey: ['lots-cdd'] })
    },
    onError: () => {
      message.error('Erreur lors de l\'annulation de la soumission')
    }
  })

  const setWaitingMutation = useMutation({
    mutationFn: (id: string) => LotCddService.setWaiting(id),
    onSuccess: () => {
      message.success('Lot CDD mis en attente avec succès')
      queryClient.invalidateQueries({ queryKey: ['lots-cdd'] })
    },
    onError: () => {
      message.error('Erreur lors de la mise en attente du lot CDD')
    }
  })

  const cancelWaitingMutation = useMutation({
    mutationFn: (id: string) => LotCddService.cancelWaiting(id),
    onSuccess: () => {
      message.success('Mise en attente annulée avec succès')
      queryClient.invalidateQueries({ queryKey: ['lots-cdd'] })
    },
    onError: () => {
      message.error('Erreur lors de l\'annulation de la mise en attente')
    }
  })

  const validateMutation = useMutation({
    mutationFn: (id: string) => LotCddService.validate(id),
    onSuccess: () => {
      message.success('Lot CDD validé avec succès')
      queryClient.invalidateQueries({ queryKey: ['lots-cdd'] })
    },
    onError: () => {
      message.error('Erreur lors de la validation du lot CDD')
    }
  })

  const rejectMutation = useMutation({
    mutationFn: (id: string) => LotCddService.reject(id),
    onSuccess: () => {
      message.success('Lot CDD rejeté avec succès')
      queryClient.invalidateQueries({ queryKey: ['lots-cdd'] })
    },
    onError: () => {
      message.error('Erreur lors du rejet du lot CDD')
    }
  })

  const getStateStep = (etat: string) => {
    switch(etat) {
      case 'BROUILLON':
        return 0
      case 'SOUMIS':
        return 1
      case 'EN COURS DE VALIDATION':
        return 2
      case 'VALIDE':
        return 3
      default:
        return 0
    }
  }

  const getStateColor = (etat: string) => {
    switch(etat) {
      case 'BROUILLON':
        return 'default'
      case 'SOUMIS':
        return 'processing'
      case 'EN COURS DE VALIDATION':
        return 'warning'
      case 'VALIDE':
        return 'success'
      default:
        return 'default'
    }
  }

  const handleSubmit = (values: { periode: [any, any], libelle: string }) => {
    const [debut, fin] = values.periode
    const data: CreateLotDto = {
      libelle: values.libelle,
      debut: debut.format('YYYY-MM-DD'),
      fin: fin.format('YYYY-MM-DD'),
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

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingLot(null)
    form.resetFields()
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
          titlePlacement="vertical"
          items={[
            { title: 'BROUILLON' },
            { title: 'SOUMIS' },
            { title: 'EN COURS DE VALIDATION' },
            { title: 'VALIDE' }
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
              onClick={() => navigate({ to: '/admin/lots-cdd/$lotId', params: { lotId: record._id } })}
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Title level={4} className="mb-0! text-orange-600">Lots CDD</Title>
          <Text type="secondary">Gestion des lots de paie CDD</Text>
        </div>
        <Button
          type="primary"
          style={{ backgroundColor: '#f97316', borderColor: '#f97316' }}
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            form.resetFields()
            setEditingLot(null)
            setIsModalOpen(true)
          }}
        >
          Nouveau lot CDD
        </Button>
      </div>

      <Card className="border-orange-200" style={{ borderColor: '#fdba74' }}>
        <Table
          columns={columns}
          dataSource={lots}
          loading={isLoading}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingLot ? 'Modifier le lot CDD' : 'Nouveau lot CDD'}
        open={isModalOpen}
        onCancel={handleCloseModal}
        onOk={() => form.submit()}
        okText={editingLot ? 'Enregistrer' : 'Créer'}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
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
            <RangePicker format="DD/MM/YYYY" className="w-full" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
