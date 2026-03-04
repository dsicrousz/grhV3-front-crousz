import { useState } from 'react'
import { Typography, Button, Space, Card, Tag, Modal, Form, DatePicker, Select, Input, InputNumber, message, Table, Popconfirm, Tooltip, Progress } from 'antd'
import { Plus, Pencil, Trash2, Calendar, CheckCircle, XCircle, Clock, Palmtree, Baby, Stethoscope, GraduationCap, Briefcase, HelpCircle } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Conge, CreateCongeDto, UpdateCongeDto } from '@/types/conge'
import { TypeConge, StatutDemandeConge } from '@/types/conge'
import { CongeService } from '@/services/conge.service'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

interface EmployeCongesProps {
  employeId: string
}

const typeCongeLabels: Record<TypeConge, { label: string; color: string; icon: React.ReactNode }> = {
  [TypeConge.ANNUEL]: { label: 'Annuel', color: 'green', icon: <Palmtree className="w-3 h-3" /> },
  [TypeConge.MALADIE]: { label: 'Maladie', color: 'red', icon: <Stethoscope className="w-3 h-3" /> },
  [TypeConge.MATERNITE]: { label: 'Maternité', color: 'pink', icon: <Baby className="w-3 h-3" /> },
  [TypeConge.PATERNITE]: { label: 'Paternité', color: 'blue', icon: <Baby className="w-3 h-3" /> },
  [TypeConge.SANS_SOLDE]: { label: 'Sans solde', color: 'orange', icon: <Briefcase className="w-3 h-3" /> },
  [TypeConge.EXCEPTIONNEL]: { label: 'Exceptionnel', color: 'purple', icon: <Calendar className="w-3 h-3" /> },
  [TypeConge.FORMATION]: { label: 'Formation', color: 'cyan', icon: <GraduationCap className="w-3 h-3" /> },
  [TypeConge.AUTRE]: { label: 'Autre', color: 'default', icon: <HelpCircle className="w-3 h-3" /> },
}

const statutLabels: Record<StatutDemandeConge, { label: string; color: string; icon: React.ReactNode }> = {
  [StatutDemandeConge.EN_ATTENTE]: { label: 'En attente', color: 'orange', icon: <Clock className="w-3 h-3" /> },
  [StatutDemandeConge.APPROUVEE]: { label: 'Approuvé', color: 'green', icon: <CheckCircle className="w-3 h-3" /> },
  [StatutDemandeConge.REJETEE]: { label: 'Rejeté', color: 'red', icon: <XCircle className="w-3 h-3" /> },
}

export const EmployeConges = ({ employeId }: EmployeCongesProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingConge, setEditingConge] = useState<Conge | null>(null)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data: conges = [], isLoading } = useQuery({
    queryKey: ['conges', employeId],
    queryFn: () => CongeService.getByEmploye(employeId),
    enabled: !!employeId
  })

  const { data: solde } = useQuery({
    queryKey: ['solde-conges', employeId],
    queryFn: () => CongeService.getSoldeConges(employeId),
    enabled: !!employeId
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateCongeDto) => CongeService.create(data),
    onSuccess: () => {
      message.success('Congé créé avec succès')
      setIsModalOpen(false)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['conges', employeId] })
      queryClient.invalidateQueries({ queryKey: ['solde-conges', employeId] })
    },
    onError: () => {
      message.error('Erreur lors de la création du congé')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCongeDto }) => 
      CongeService.update(id, data),
    onSuccess: () => {
      message.success('Congé mis à jour avec succès')
      setIsModalOpen(false)
      setEditingConge(null)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['conges', employeId] })
      queryClient.invalidateQueries({ queryKey: ['solde-conges', employeId] })
    },
    onError: () => {
      message.error('Erreur lors de la mise à jour du congé')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => CongeService.delete(id),
    onSuccess: () => {
      message.success('Congé supprimé avec succès')
      queryClient.invalidateQueries({ queryKey: ['conges', employeId] })
      queryClient.invalidateQueries({ queryKey: ['solde-conges', employeId] })
    },
    onError: () => {
      message.error('Erreur lors de la suppression du congé')
    }
  })

  const validateMutation = useMutation({
    mutationFn: ({ id, statut }: { id: string; statut: StatutDemandeConge }) => 
      CongeService.validate(id, { statut }),
    onSuccess: (_, variables) => {
      message.success(variables.statut === StatutDemandeConge.APPROUVEE ? 'Congé approuvé' : 'Congé rejeté')
      queryClient.invalidateQueries({ queryKey: ['conges', employeId] })
      queryClient.invalidateQueries({ queryKey: ['solde-conges', employeId] })
    },
    onError: () => {
      message.error('Erreur lors de la validation')
    }
  })

  const handleSubmit = (values: any) => {
    const [dateDebut, dateFin] = values.dates
    const nombreJours = dateFin.diff(dateDebut, 'day') + 1
    
    const data: CreateCongeDto = {
      date_debut: dateDebut.toISOString(),
      date_fin: dateFin.toISOString(),
      nombre_jours: values.nombre_jours || nombreJours,
      type: values.type,
      motif: values.motif,
      employe: employeId
    }

    if (editingConge) {
      updateMutation.mutate({
        id: editingConge._id,
        data: {
          date_debut: data.date_debut,
          date_fin: data.date_fin,
          nombre_jours: data.nombre_jours,
          type: data.type,
          motif: data.motif
        }
      })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = (conge: Conge) => {
    setEditingConge(conge)
    form.setFieldsValue({
      dates: [dayjs(conge.date_debut), dayjs(conge.date_fin)],
      nombre_jours: conge.nombre_jours,
      type: conge.type,
      motif: conge.motif
    })
    setIsModalOpen(true)
  }

  const handleDatesChange = (dates: any) => {
    if (dates && dates[0] && dates[1]) {
      const nombreJours = dates[1].diff(dates[0], 'day') + 1
      form.setFieldValue('nombre_jours', nombreJours)
    }
  }

  const columns: ColumnsType<Conge> = [
    {
      title: 'Période',
      key: 'periode',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div>
            <div className="font-medium">
              {dayjs(record.date_debut).format('DD/MM/YYYY')} - {dayjs(record.date_fin).format('DD/MM/YYYY')}
            </div>
            <div className="text-xs text-gray-500">
              {record.nombre_jours} jour(s)
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: TypeConge) => {
        const config = typeCongeLabels[type]
        return (
          <Tag color={config.color} className="flex items-center gap-1 w-fit">
            {config.icon}
            {config.label}
          </Tag>
        )
      },
    },
    {
      title: 'Motif',
      dataIndex: 'motif',
      key: 'motif',
      ellipsis: true,
      render: (motif: string) => motif || <Text type="secondary">-</Text>,
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: (statut: StatutDemandeConge) => {
        const config = statutLabels[statut]
        return (
          <Tag color={config.color} className="flex items-center gap-1 w-fit">
            {config.icon}
            {config.label}
          </Tag>
        )
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          {record.statut === StatutDemandeConge.EN_ATTENTE && (
            <>
              <Tooltip title="Approuver">
                <Button
                  type="text"
                  size="small"
                  icon={<CheckCircle className="w-4 h-4 text-green-500" />}
                  onClick={() => validateMutation.mutate({ id: record._id, statut: StatutDemandeConge.APPROUVEE })}
                  loading={validateMutation.isPending}
                />
              </Tooltip>
              <Tooltip title="Rejeter">
                <Button
                  type="text"
                  size="small"
                  icon={<XCircle className="w-4 h-4 text-red-500" />}
                  onClick={() => validateMutation.mutate({ id: record._id, statut: StatutDemandeConge.REJETEE })}
                  loading={validateMutation.isPending}
                />
              </Tooltip>
            </>
          )}
          <Tooltip title="Modifier">
            <Button
              type="text"
              size="small"
              icon={<Pencil className="w-4 h-4 text-blue-500" />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Supprimer ce congé ?"
            onConfirm={() => deleteMutation.mutate(record._id)}
            okText="Oui"
            cancelText="Non"
          >
            <Tooltip title="Supprimer">
              <Button
                type="text"
                size="small"
                icon={<Trash2 className="w-4 h-4 text-red-500" />}
                loading={deleteMutation.isPending}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <Title level={5} className="mb-0!">Congés</Title>
        <Button 
          type="primary" 
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setEditingConge(null)
            form.resetFields()
            setIsModalOpen(true)
          }}
        >
          Nouveau congé
        </Button>
      </div>

      {/* Solde de congés */}
      {solde && (
        <Card size="small" className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <Text strong>Solde de congés {solde.annee}</Text>
              <div className="text-sm text-gray-500">
                {solde.utilises} jour(s) utilisé(s) sur {solde.quota}
              </div>
            </div>
            <div className="w-32">
              <Progress 
                percent={Math.round((solde.utilises / solde.quota) * 100)} 
                size="small"
                status={solde.restants < 5 ? 'exception' : 'normal'}
              />
              <div className="text-center text-sm font-medium">
                {solde.restants} jour(s) restant(s)
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <Table
          columns={columns}
          dataSource={conges}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} congé(s)`,
          }}
          locale={{
            emptyText: 'Aucun congé enregistré'
          }}
        />
      </Card>

      <Modal
        title={editingConge ? 'Modifier le congé' : 'Nouveau congé'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          setEditingConge(null)
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
            name="dates"
            label="Période de congé"
            rules={[{ required: true, message: 'La période est requise' }]}
          >
            <RangePicker 
              className="w-full" 
              format="DD/MM/YYYY"
              placeholder={['Date de début', 'Date de fin']}
              onChange={handleDatesChange}
            />
          </Form.Item>

          <Form.Item
            name="nombre_jours"
            label="Nombre de jours"
            rules={[{ required: true, message: 'Le nombre de jours est requis' }]}
          >
            <InputNumber min={1} className="w-full" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Type de congé"
            rules={[{ required: true, message: 'Le type est requis' }]}
          >
            <Select
              placeholder="Sélectionner un type"
              options={Object.entries(typeCongeLabels).map(([value, config]) => ({
                value,
                label: (
                  <div className="flex items-center gap-2">
                    {config.icon}
                    {config.label}
                  </div>
                )
              }))}
            />
          </Form.Item>

          <Form.Item
            name="motif"
            label="Motif"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Décrivez le motif du congé (optionnel)"
            />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={editingConge ? updateMutation.isPending : createMutation.isPending}
              >
                {editingConge ? 'Modifier' : 'Créer'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
