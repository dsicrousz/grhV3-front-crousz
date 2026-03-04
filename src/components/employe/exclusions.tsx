import { useState } from 'react'
import { Typography, Button, Space, Card, Spin, Modal, Form, Select, Input, message, Popconfirm } from 'antd'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ExclusionSpecifique } from '@/types/exclusion-specifique'
import type { CreateExclusionSpecifiqueDto } from '@/types/exclusion-specifique'
import { ExclusionSpecifiqueService } from '@/services/exclusion-specifique.service'
import { RubriqueService } from '@/services/rubrique.service'

const { Title, Text } = Typography

interface EmployeExclusionsProps {
  employeId: string
}

export const EmployeExclusions = ({ employeId }: EmployeExclusionsProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExclusion, setEditingExclusion] = useState<ExclusionSpecifique | null>(null)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data: exclusions = [], isLoading: isLoadingExclusions } = useQuery({
    queryKey: ['exclusions', employeId],
    queryFn: () => ExclusionSpecifiqueService.getByEmploye(employeId),
    enabled: !!employeId
  })

  const { data: rubriques = [], isLoading: isLoadingRubriques } = useQuery({
    queryKey: ['rubriques'],
    queryFn: () => RubriqueService.getAll()
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateExclusionSpecifiqueDto) => ExclusionSpecifiqueService.create(data),
    onSuccess: () => {
      message.success('Exclusion créée avec succès')
      setIsModalOpen(false)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['exclusions'] })
    },
    onError: () => {
      message.error('Erreur lors de la création de l\'exclusion')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: CreateExclusionSpecifiqueDto }) => 
      ExclusionSpecifiqueService.update(id, data),
    onSuccess: () => {
      message.success('Exclusion mise à jour avec succès')
      setIsModalOpen(false)
      setEditingExclusion(null)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['exclusions'] })
    },
    onError: () => {
      message.error('Erreur lors de la mise à jour de l\'exclusion')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ExclusionSpecifiqueService.delete(id),
    onSuccess: () => {
      message.success('Exclusion supprimée avec succès')
      queryClient.invalidateQueries({ queryKey: ['exclusions'] })
    },
    onError: () => {
      message.error('Erreur lors de la suppression de l\'exclusion')
    }
  })

  const handleSubmit = (values: any) => {
    const data = {
      ...values,
      employe: employeId
    }

    if (editingExclusion) {
      updateMutation.mutate({
        id: editingExclusion._id,
        data
      })
    } else {
      createMutation.mutate(data)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <Title level={5} className="mb-0!">Exclusions spécifiques</Title>
        <Button 
          type="primary" 
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Nouvelle exclusion
        </Button>
      </div>

      <div className="space-y-4">
        {isLoadingExclusions ? (
          <Spin />
        ) : exclusions.length === 0 ? (
          <Text type="secondary">Aucune exclusion</Text>
        ) : (
          exclusions.map((exclusion) => (
            <Card key={exclusion._id} size="small" className="bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <Text strong>
                    {exclusion.rubrique.libelle}
                  </Text>
                  <div className="text-gray-500 text-sm">
                    {exclusion.description}
                  </div>
                </div>
                <Space>
                  <Button
                    type="text"
                    size="small"
                    icon={<Pencil className="w-4 h-4" />}
                    onClick={() => {
                      setEditingExclusion(exclusion)
                      form.setFieldsValue(exclusion)
                      setIsModalOpen(true)
                    }}
                  />
                  <Popconfirm
                    title="Supprimer cette exclusion ?"
                    description="Cette action est irréversible."
                    onConfirm={() => deleteMutation.mutate(exclusion._id)}
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
        title={editingExclusion ? 'Modifier l\'exclusion' : 'Nouvelle exclusion'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          setEditingExclusion(null)
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
              options={rubriques.map(r => ({ label: r.libelle, value: r._id }))}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'La description est requise' }]}
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Raison de l'exclusion..."
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
                loading={editingExclusion ? updateMutation.isPending : createMutation.isPending}
              >
                {editingExclusion ? 'Modifier' : 'Créer'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
