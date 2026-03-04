import { useState } from 'react'
import { Typography, Button, Space, Card, Tag, Spin, Modal, Form, DatePicker, Select, Input, message, Timeline } from 'antd'
import { Plus, Pencil, Check, X, Briefcase, Building2, Calendar } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Nomination } from '@/types/nomination'
import type { CreateNominationDto } from '@/types/nomination'
import { NominationService } from '@/services/nomination.service'
import { DivisionService } from '@/services/division.service'
import { FonctionService } from '@/services/fonction.service'
import dayjs from 'dayjs'

const { Title, Text } = Typography

interface EmployeNominationsProps {
  employeId: string
}

export const EmployeNominations = ({ employeId }: EmployeNominationsProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNomination, setEditingNomination] = useState<Nomination | null>(null)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data: nominations = [], isLoading: isLoadingNominations } = useQuery({
    queryKey: ['nominations', employeId],
    queryFn: () => NominationService.getByEmploye(employeId),
    enabled: !!employeId
  })

  const { data: fonctions = [], isLoading: isLoadingFonctions } = useQuery({
    queryKey: ['fonctions'],
    queryFn: () => FonctionService.getAll()
  })

  const { data: divisions = [], isLoading: isLoadingDivisions } = useQuery({
    queryKey: ['divisions'],
    queryFn: () => DivisionService.getAll()
  })

  const { data: services = [], isLoading: isLoadingServices } = useQuery({
    queryKey: ['services'],
    queryFn: () => DivisionService.getAll()
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateNominationDto) => NominationService.create(data),
    onSuccess: () => {
      message.success('Nomination créée avec succès')
      setIsModalOpen(false)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['nominations'] })
    },
    onError: () => {
      message.error('Erreur lors de la création de la nomination')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: CreateNominationDto }) => 
      NominationService.update(id, data),
    onSuccess: () => {
      message.success('Nomination mise à jour avec succès')
      setIsModalOpen(false)
      setEditingNomination(null)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['nominations'] })
    },
    onError: () => {
      message.error('Erreur lors de la mise à jour de la nomination')
    }
  })

  const handleSubmit = (values: any) => {
    const data = {
      ...values,
      employe: employeId,
      date: values.date.toISOString()
    }

    if (editingNomination) {
      updateMutation.mutate({
        id: editingNomination._id,
        data
      })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = (nomination: Nomination) => {
    setEditingNomination(nomination)
    form.setFieldsValue({
      ...nomination,
      fonction: nomination.fonction._id,
      division: nomination.division._id,
      service: nomination.service?._id,
      date: dayjs(nomination.date)
    })
    setIsModalOpen(true)
  }

  const handleToggleActive = (nomination: Nomination) => {
    updateMutation.mutate({
      id: nomination._id,
      data: {
        ...nomination,
        est_active: !nomination.est_active,
        employe: typeof nomination.employe === 'string' ? nomination.employe : nomination.employe._id,
        fonction: typeof nomination.fonction === 'string' ? nomination.fonction : nomination.fonction._id,
        division: typeof nomination.division === 'string' ? nomination.division : nomination.division._id,
        service: nomination.service ? (typeof nomination.service === 'string' ? nomination.service : nomination.service._id) : undefined
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <Title level={5} className="mb-0!">Nominations</Title>
        <Button 
          type="primary" 
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Nouvelle nomination
        </Button>
      </div>

      <div className="mt-6">
        {isLoadingNominations ? (
          <div className="flex justify-center py-8">
            <Spin />
          </div>
        ) : nominations.length === 0 ? (
          <div className="text-center py-8">
            <Text type="secondary">Aucune nomination</Text>
          </div>
        ) : (
          <Timeline
            mode="left"
            items={[...nominations]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((nomination: Nomination) => {
                const fonctionNom = fonctions.find(f => f._id === (typeof nomination.fonction === 'string' ? nomination.fonction : nomination.fonction._id))?.nom
                const divisionNom = divisions.find(d => d._id === (typeof nomination.division === 'string' ? nomination.division : nomination.division._id))?.nom
                const serviceNom = nomination.service ? services.find(s => s._id === (typeof nomination.service === 'string' ? nomination.service : (nomination.service as any)._id))?.nom : null

                return {
                  key: nomination._id,
                  color: nomination.est_active ? 'green' : 'gray',
                  dot: nomination.est_active ? (
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-green-600" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                    </div>
                  ),
                  label: (
                    <div className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1 text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span className="text-sm font-medium">
                          {dayjs(nomination.date).format('DD MMM YYYY')}
                        </span>
                      </div>
                    </div>
                  ),
                  children: (
                    <Card 
                      size="small" 
                      className={`ml-2 ${nomination.est_active ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-gray-300'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Text strong className="text-base">{fonctionNom}</Text>
                            <Tag color={nomination.est_active ? 'green' : 'default'} className="text-xs">
                              {nomination.est_active ? 'Active' : 'Inactive'}
                            </Tag>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500 text-sm mb-1">
                            <Building2 className="w-3 h-3" />
                            <span>{divisionNom}</span>
                            {serviceNom && (
                              <>
                                <span className="mx-1">/</span>
                                <span>{serviceNom}</span>
                              </>
                            )}
                          </div>
                          {nomination.description && (
                            <Text type="secondary" className="text-sm block mt-2">
                              {nomination.description}
                            </Text>
                          )}
                        </div>
                        <Space size="small">
                          <Button
                            type="text"
                            size="small"
                            icon={<Pencil className="w-4 h-4 text-blue-500" />}
                            onClick={() => handleEdit(nomination)}
                          />
                          <Button
                            type="text"
                            size="small"
                            icon={nomination.est_active ? 
                              <X className="w-4 h-4 text-red-500" /> : 
                              <Check className="w-4 h-4 text-green-500" />
                            }
                            onClick={() => handleToggleActive(nomination)}
                          />
                        </Space>
                      </div>
                    </Card>
                  ),
                }
              })
            }
          />
        )}
      </div>

      <Modal
        title={editingNomination ? 'Modifier la nomination' : 'Nouvelle nomination'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          setEditingNomination(null)
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
            name="fonction"
            label="Fonction"
            rules={[{ required: true, message: 'La fonction est requise' }]}
          >
            <Select
              placeholder="Sélectionner une fonction"
              loading={isLoadingFonctions}
              role="select"
              showSearch
              options={fonctions.map(f => ({ label: f.nom, value: f._id }))}
            />
          </Form.Item>

          <Form.Item
            name="division"
            label="Division"
            rules={[{ required: true, message: 'La division est requise' }]}
          >
            <Select
              placeholder="Sélectionner une division"
              loading={isLoadingDivisions}
              role="select"
              showSearch
              options={divisions.map(d => ({ label: d.nom, value: d._id }))}
            />
          </Form.Item>

          <Form.Item
            name="service"
            label="Service"
          >
            <Select
              placeholder="Sélectionner un service (optionnel)"
              loading={isLoadingServices}
              role="select"
              showSearch
              allowClear
              options={services.map(s => ({ label: s.nom, value: s._id }))}
            />
          </Form.Item>

          <Form.Item
            name="date"
            label="Date de prise de fonction"
            rules={[{ required: true, message: 'La date est requise' }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={editingNomination ? updateMutation.isPending : createMutation.isPending}
              >
                {editingNomination ? 'Modifier' : 'Créer'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
