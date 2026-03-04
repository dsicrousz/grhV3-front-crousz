import { useState } from 'react'
import { Typography, Button, Space, Card, Tag, Modal, Form, DatePicker, Select, Input, message, Table, Popconfirm, Tooltip } from 'antd'
import { Plus, Pencil, Trash2, Calendar, CheckCircle, XCircle, Clock, Stethoscope, User, Users, HelpCircle } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Absence, CreateAbsenceDto, UpdateAbsenceDto } from '@/types/absence'
import { TypeAbsence, StatutDemande } from '@/types/absence'
import { AbsenceService } from '@/services/absence.service'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

interface EmployeAbsencesProps {
  employeId: string
}

const typeAbsenceLabels: Record<TypeAbsence, { label: string; color: string; icon: React.ReactNode }> = {
  [TypeAbsence.MALADIE]: { label: 'Maladie', color: 'red', icon: <Stethoscope className="w-3 h-3" /> },
  [TypeAbsence.PERSONNEL]: { label: 'Personnel', color: 'blue', icon: <User className="w-3 h-3" /> },
  [TypeAbsence.FAMILIAL]: { label: 'Familial', color: 'purple', icon: <Users className="w-3 h-3" /> },
  [TypeAbsence.AUTRE]: { label: 'Autre', color: 'default', icon: <HelpCircle className="w-3 h-3" /> },
}

const statutLabels: Record<StatutDemande, { label: string; color: string; icon: React.ReactNode }> = {
  [StatutDemande.EN_ATTENTE]: { label: 'En attente', color: 'orange', icon: <Clock className="w-3 h-3" /> },
  [StatutDemande.APPROUVEE]: { label: 'Approuvée', color: 'green', icon: <CheckCircle className="w-3 h-3" /> },
  [StatutDemande.REJETEE]: { label: 'Rejetée', color: 'red', icon: <XCircle className="w-3 h-3" /> },
}

export const EmployeAbsences = ({ employeId }: EmployeAbsencesProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAbsence, setEditingAbsence] = useState<Absence | null>(null)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data: absences = [], isLoading } = useQuery({
    queryKey: ['absences', employeId],
    queryFn: () => AbsenceService.getByEmploye(employeId),
    enabled: !!employeId
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateAbsenceDto) => AbsenceService.create(data),
    onSuccess: () => {
      message.success('Absence créée avec succès')
      setIsModalOpen(false)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['absences', employeId] })
    },
    onError: () => {
      message.error('Erreur lors de la création de l\'absence')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAbsenceDto }) => 
      AbsenceService.update(id, data),
    onSuccess: () => {
      message.success('Absence mise à jour avec succès')
      setIsModalOpen(false)
      setEditingAbsence(null)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['absences', employeId] })
    },
    onError: () => {
      message.error('Erreur lors de la mise à jour de l\'absence')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => AbsenceService.delete(id),
    onSuccess: () => {
      message.success('Absence supprimée avec succès')
      queryClient.invalidateQueries({ queryKey: ['absences', employeId] })
    },
    onError: () => {
      message.error('Erreur lors de la suppression de l\'absence')
    }
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => AbsenceService.approve(id),
    onSuccess: () => {
      message.success('Absence approuvée')
      queryClient.invalidateQueries({ queryKey: ['absences', employeId] })
    },
    onError: () => {
      message.error('Erreur lors de l\'approbation')
    }
  })

  const rejectMutation = useMutation({
    mutationFn: (id: string) => AbsenceService.reject(id),
    onSuccess: () => {
      message.success('Absence rejetée')
      queryClient.invalidateQueries({ queryKey: ['absences', employeId] })
    },
    onError: () => {
      message.error('Erreur lors du rejet')
    }
  })

  const handleSubmit = (values: any) => {
    const [dateDebut, dateFin] = values.dates
    const data: CreateAbsenceDto = {
      date_debut: dateDebut.toISOString(),
      date_fin: dateFin.toISOString(),
      type: values.type,
      motif: values.motif,
      employe: employeId
    }

    if (editingAbsence) {
      updateMutation.mutate({
        id: editingAbsence._id,
        data: {
          date_debut: data.date_debut,
          date_fin: data.date_fin,
          type: data.type,
          motif: data.motif
        }
      })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = (absence: Absence) => {
    setEditingAbsence(absence)
    form.setFieldsValue({
      dates: [dayjs(absence.date_debut), dayjs(absence.date_fin)],
      type: absence.type,
      motif: absence.motif
    })
    setIsModalOpen(true)
  }

  const calculateDays = (dateDebut: string, dateFin: string): number => {
    const start = dayjs(dateDebut)
    const end = dayjs(dateFin)
    return end.diff(start, 'day') + 1
  }

  const columns: ColumnsType<Absence> = [
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
              {calculateDays(record.date_debut, record.date_fin)} jour(s)
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: TypeAbsence) => {
        const config = typeAbsenceLabels[type]
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
      render: (motif: string) => motif || <Text type="secondary">-</Text>,
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: (statut: StatutDemande) => {
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
          {record.statut === StatutDemande.EN_ATTENTE && (
            <>
              <Tooltip title="Approuver">
                <Button
                  type="text"
                  size="small"
                  icon={<CheckCircle className="w-4 h-4 text-green-500" />}
                  onClick={() => approveMutation.mutate(record._id)}
                  loading={approveMutation.isPending}
                />
              </Tooltip>
              <Tooltip title="Rejeter">
                <Button
                  type="text"
                  size="small"
                  icon={<XCircle className="w-4 h-4 text-red-500" />}
                  onClick={() => rejectMutation.mutate(record._id)}
                  loading={rejectMutation.isPending}
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
            title="Supprimer cette absence ?"
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
        <Title level={5} className="mb-0!">Absences</Title>
        <Button 
          type="primary" 
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setEditingAbsence(null)
            form.resetFields()
            setIsModalOpen(true)
          }}
        >
          Nouvelle absence
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={absences}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} absence(s)`,
          }}
          locale={{
            emptyText: 'Aucune absence enregistrée'
          }}
        />
      </Card>

      <Modal
        title={editingAbsence ? 'Modifier l\'absence' : 'Nouvelle absence'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          setEditingAbsence(null)
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
            label="Période d'absence"
            rules={[{ required: true, message: 'La période est requise' }]}
          >
            <RangePicker 
              className="w-full" 
              format="DD/MM/YYYY"
              placeholder={['Date de début', 'Date de fin']}
            />
          </Form.Item>

          <Form.Item
            name="type"
            label="Type d'absence"
            rules={[{ required: true, message: 'Le type est requis' }]}
          >
            <Select
              placeholder="Sélectionner un type"
              options={Object.entries(typeAbsenceLabels).map(([value, config]) => ({
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
              placeholder="Décrivez le motif de l'absence (optionnel)"
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
                loading={editingAbsence ? updateMutation.isPending : createMutation.isPending}
              >
                {editingAbsence ? 'Modifier' : 'Créer'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
