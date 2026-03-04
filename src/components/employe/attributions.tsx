import { useState } from 'react'
import { Typography, Button, Space, Card, Spin, Modal, Form, Select, message, Popconfirm, InputNumber } from 'antd'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AttributionIndividuelle } from '@/types/attribution-individuelle'
import type { CreateAttributionIndividuelleDto } from '@/types/attribution-individuelle'
import { AttributionIndividuelleService } from '@/services/attribution-individuelle.service'
import { RubriqueService } from '@/services/rubrique.service'

const { Title, Text } = Typography

interface EmployeAttributionsProps {
  employeId: string
}

export const EmployeAttributions = ({ employeId }: EmployeAttributionsProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAttribution, setEditingAttribution] = useState<AttributionIndividuelle | null>(null)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data: attributions = [], isLoading: isLoadingAttributions } = useQuery({
    queryKey: ['attributions', employeId],
    queryFn: () => AttributionIndividuelleService.getByEmploye(employeId),
    enabled: !!employeId
  })

  const { data: rubriques = [], isLoading: isLoadingRubriques } = useQuery({
    queryKey: ['rubriques'],
    queryFn: () => RubriqueService.getAll()
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateAttributionIndividuelleDto) => AttributionIndividuelleService.create(data),
    onSuccess: () => {
      message.success('Attribution créée avec succès')
      setIsModalOpen(false)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['attributions'] })
    },
    onError: () => {
      message.error('Erreur lors de la création de l\'attribution')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: CreateAttributionIndividuelleDto }) => 
      AttributionIndividuelleService.update(id, data),
    onSuccess: () => {
      message.success('Attribution mise à jour avec succès')
      setIsModalOpen(false)
      setEditingAttribution(null)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['attributions'] })
    },
    onError: () => {
      message.error('Erreur lors de la mise à jour de l\'attribution')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => AttributionIndividuelleService.delete(id),
    onSuccess: () => {
      message.success('Attribution supprimée avec succès')
      queryClient.invalidateQueries({ queryKey: ['attributions'] })
    },
    onError: () => {
      message.error('Erreur lors de la suppression de l\'attribution')
    }
  })

  const handleSubmit = (values: any) => {
    const data = {
      ...values,
      employe: employeId
    }

    if (editingAttribution) {
      updateMutation.mutate({
        id: editingAttribution._id,
        data
      })
    } else {
      createMutation.mutate(data)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <Title level={5} className="mb-0!">Attributions individuelles</Title>
        <Button 
          type="primary" 
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Nouvelle attribution
        </Button>
      </div>

      <div className="space-y-4">
        {isLoadingAttributions ? (
          <Spin />
        ) : attributions.length === 0 ? (
          <Text type="secondary">Aucune attribution</Text>
        ) : (
          attributions.map((attribution) => (
            <Card key={attribution._id} size="small" className="bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <Text strong>
                    {rubriques.find(r => r._id === attribution.rubrique._id)?.libelle}
                  </Text>
                  <div className="text-gray-500 text-sm">
                    {attribution.rubrique.formule}
                  </div>
                </div>
                <Space>
                  <Button
                    type="text"
                    size="small"
                    icon={<Pencil className="w-4 h-4" />}
                    onClick={() => {
                      setEditingAttribution(attribution)
                      form.setFieldsValue(attribution)
                      setIsModalOpen(true)
                    }}
                  />
                  <Popconfirm
                    title="Supprimer cette attribution ?"
                    description="Cette action est irréversible."
                    onConfirm={() => deleteMutation.mutate(attribution._id)}
                    okText="Supprimer"
                    cancelText="Annuler"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<Trash2 className="w-4 h-4" />}
                    />
                  </Popconfirm>
                </Space>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal
        title={editingAttribution ? 'Modifier l\'attribution' : 'Nouvelle attribution'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          setEditingAttribution(null)
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
            name="rubrique"
            label="Rubrique"
            rules={[{ required: true, message: 'La rubrique est requise' }]}
          >
            <Select
              placeholder="Sélectionner une rubrique"
              loading={isLoadingRubriques}
              role="select"
              showSearch={
                {
                  optionFilterProp: 'label',
                  filterOption: (input, option) => {
                    return (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  },
                }
              }
              options={rubriques.map(r => ({ label: r.libelle, value: r._id }))}
            />
          </Form.Item>

           <Form.Item
            name="valeur_par_defaut"
            label="Valeur par défaut"
          >
         <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={editingAttribution ? updateMutation.isPending : createMutation.isPending}
              >
                {editingAttribution ? 'Modifier' : 'Créer'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
