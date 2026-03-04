import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Button, 
  Modal, 
  Form, 
  Input,
  Select,
  Space, 
  Typography, 
  Card, 
  message,
  Tree,
  Dropdown
} from 'antd'
import { Plus, Pencil, Trash2, Building2, FolderTree, MoreHorizontal, Power, PowerOff } from 'lucide-react'
import type { 
  Division, 
  Service, 
  DivisionTree, 
  CreateDivisionDto, 
  UpdateDivisionDto,
  CreateServiceDto,
  UpdateServiceDto 
} from '@/types/division'
import { DivisionService, ServiceService } from '@/services/division.service'
import type { DataNode } from 'antd/es/tree'

const { Title, Text } = Typography

export const Route = createFileRoute('/admin/parametrage/divisions')({
  component: DivisionsPage,
})

function DivisionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'division' | 'service'>('division')
  const [editingDivision, setEditingDivision] = useState<Division | null>(null)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [selectedNode, setSelectedNode] = useState<{ key: string, type: 'division' | 'service' } | null>(null)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data: divisionTree = [] } = useQuery({
    queryKey: ['divisions-tree'],
    queryFn: () => DivisionService.getTree(),
  })

   const { data: divisions = [] } = useQuery({
    queryKey: ['divisions'],
    queryFn: () => DivisionService.getAll(),
  })

  // Division mutations
  const createDivisionMutation = useMutation({
    mutationFn: (data: CreateDivisionDto) => DivisionService.create(data),
    onSuccess: () => {
      message.success('Division créée avec succès')
      queryClient.invalidateQueries({ queryKey: ['divisions-tree'] })
      handleCloseModal()
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la création')
    },
  })

  const updateDivisionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDivisionDto }) => 
      DivisionService.update(id, data),
    onSuccess: () => {
      message.success('Division modifiée avec succès')
      queryClient.invalidateQueries({ queryKey: ['divisions-tree'] })
      handleCloseModal()
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la modification')
    },
  })

  const deleteDivisionMutation = useMutation({
    mutationFn: (id: string) => DivisionService.delete(id),
    onSuccess: () => {
      message.success('Division supprimée avec succès')
      queryClient.invalidateQueries({ queryKey: ['divisions-tree'] })
      setSelectedNode(null)
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la suppression')
    },
  })

  // Service mutations
  const createServiceMutation = useMutation({
    mutationFn: (data: CreateServiceDto) => ServiceService.create(data),
    onSuccess: () => {
      message.success('Service créé avec succès')
      queryClient.invalidateQueries({ queryKey: ['divisions-tree'] })
      handleCloseModal()
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la création')
    },
  })

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceDto }) => 
      ServiceService.update(id, data),
    onSuccess: () => {
      message.success('Service modifié avec succès')
      queryClient.invalidateQueries({ queryKey: ['divisions-tree'] })
      handleCloseModal()
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la modification')
    },
  })

  const deleteServiceMutation = useMutation({
    mutationFn: (id: string) => ServiceService.delete(id),
    onSuccess: () => {
      message.success('Service supprimé avec succès')
      queryClient.invalidateQueries({ queryKey: ['divisions-tree'] })
      setSelectedNode(null)
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la suppression')
    },
  })

  // Toggle activation mutations
  const toggleDivisionActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) => 
      DivisionService.update(id, { is_active }),
    onSuccess: (_, variables) => {
      message.success(variables.is_active ? 'Division activée' : 'Division désactivée')
      queryClient.invalidateQueries({ queryKey: ['divisions-tree'] })
      queryClient.invalidateQueries({ queryKey: ['divisions'] })
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la modification')
    },
  })

  const toggleServiceActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) => 
      ServiceService.update(id, { is_active }),
    onSuccess: (_, variables) => {
      message.success(variables.is_active ? 'Service activé' : 'Service désactivé')
      queryClient.invalidateQueries({ queryKey: ['divisions-tree'] })
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la modification')
    },
  })

  const handleOpenModal = (type: 'division' | 'service', item?: Partial<Division> | Partial<Service>) => {
    setModalType(type)
    if (item) {
      if (type === 'division') {
        setEditingDivision(item as Division)
        form.setFieldsValue({ nom: item.nom, parent: (item as Division).parent })
      } else {
        setEditingService(item as Service)
        form.setFieldsValue({ nom: item.nom, division: (item as Service).division })
      }
    } else {
      setEditingDivision(null)
      setEditingService(null)
      form.resetFields()
      if (type === 'service' && selectedNode?.type === 'division') {
        form.setFieldsValue({ division: selectedNode.key })
      }
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingDivision(null)
    setEditingService(null)
    form.resetFields()
  }

  const handleSubmit = async (values: { nom: string; parent?: string; division?: string }) => {
    if (modalType === 'division') {
      if (editingDivision) {
        // Lors de la modification, on ne change que les champs modifiés
        const updateData: UpdateDivisionDto = {
          nom: values.nom !== editingDivision.nom ? values.nom : undefined,
          parent: values.parent !== editingDivision.parent ? values.parent : undefined
        }
        updateDivisionMutation.mutate({ id: editingDivision._id, data: updateData })
      } else {
        createDivisionMutation.mutate(values as CreateDivisionDto)
      }
    } else {
      if (editingService) {
        // Lors de la modification, on ne change que les champs modifiés
        const updateData: UpdateServiceDto = {
          nom: values.nom !== editingService.nom ? values.nom : undefined,
          division: (values as CreateServiceDto).division !== editingService.division 
            ? (values as CreateServiceDto).division 
            : undefined
        }
        updateServiceMutation.mutate({ id: editingService._id, data: updateData })
      } else {
        createServiceMutation.mutate(values as CreateServiceDto)
      }
    }
  }

  const convertToTreeData = (divisions: DivisionTree[]): DataNode[] => {
    return divisions.map(division => ({
      key: `division-${division._id}`,
      title: (
        <div className="flex items-center justify-between gap-2 pr-2">
          <div className="flex items-center gap-2">
            <span>{division.nom}</span>
            {division.is_active === false && (
              <span className="text-xs px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded">Inactif</span>
            )}
          </div>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'edit',
                  label: <span className="text-blue-600">Modifier</span>,
                  icon: <Pencil className="w-4 h-4 text-blue-600" />,
                  onClick: () => handleOpenModal('division', division)
                },
                {
                  key: 'add-division',
                  label: <span className="text-purple-600">Ajouter une sous-division</span>,
                  icon: <FolderTree className="w-4 h-4 text-purple-600" />,
                  onClick: () => {
                    handleOpenModal('division',{nom:'',parent:division._id})
                  }
                },
                {
                  key: 'add-service',
                  label: <span className="text-teal-600">Ajouter un service</span>,
                  icon: <Building2 className="w-4 h-4 text-teal-600" />,
                  onClick: () => {
                    handleOpenModal('service',{nom:'',division:division._id})
                  }
                },
                {
                  type: 'divider'
                },
                {
                  key: 'toggle-active',
                  label: division.is_active !== false ? (
                    <span className="text-orange-600">Désactiver</span>
                  ) : (
                    <span className="text-green-600">Activer</span>
                  ),
                  icon: division.is_active !== false ? (
                    <PowerOff className="w-4 h-4 text-orange-600" />
                  ) : (
                    <Power className="w-4 h-4 text-green-600" />
                  ),
                  onClick: () => toggleDivisionActiveMutation.mutate({ 
                    id: division._id, 
                    is_active: division.is_active === false 
                  })
                },
                {
                  key: 'delete',
                  label: <span className="text-red-600">Supprimer</span>,
                  icon: <Trash2 className="w-4 h-4 text-red-600" />,
                  danger: true,
                  onClick: () => {
                    if (division.children.length > 0 || division.services.length > 0) {
                      message.error('Impossible de supprimer une division qui contient des sous-divisions ou des services')
                      return
                    }
                    deleteDivisionMutation.mutate(division._id)
                  }
                }
              ]
            }}
            trigger={['click']}
          >
            <Button
              type="text"
              size="small"
              className="opacity-50 group-hover:opacity-100 hover:text-blue-600 transition-all"
              icon={<MoreHorizontal className="w-4 h-4" />}
              onClick={e => e.stopPropagation()}
            />
          </Dropdown>
        </div>
      ),
      children: [
        ...convertToTreeData(division.children),
        ...division.services.map(service => ({
          key: `service-${service._id}`,
          title: (
            <div className="flex items-center justify-between gap-2 pr-2">
              <div className="flex items-center gap-2">
                <span className="text-teal-600">{service.nom}</span>
                {service.is_active === false && (
                  <span className="text-xs px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded">Inactif</span>
                )}
              </div>
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'edit',
                      label: <span className="text-blue-600">Modifier</span>,
                      icon: <Pencil className="w-4 h-4 text-blue-600" />,
                      onClick: () => handleOpenModal('service', service)
                    },
                    {
                      type: 'divider'
                    },
                    {
                      key: 'toggle-active',
                      label: service.is_active !== false ? (
                        <span className="text-orange-600">Désactiver</span>
                      ) : (
                        <span className="text-green-600">Activer</span>
                      ),
                      icon: service.is_active !== false ? (
                        <PowerOff className="w-4 h-4 text-orange-600" />
                      ) : (
                        <Power className="w-4 h-4 text-green-600" />
                      ),
                      onClick: () => toggleServiceActiveMutation.mutate({ 
                        id: service._id, 
                        is_active: service.is_active === false 
                      })
                    },
                    {
                      key: 'delete',
                      label: <span className="text-red-600">Supprimer</span>,
                      icon: <Trash2 className="w-4 h-4 text-red-600" />,
                      danger: true,
                      onClick: () => deleteServiceMutation.mutate(service._id)
                    }
                  ]
                }}
                trigger={['click']}
              >
                <Button
                  type="text"
                  size="small"
                  className="opacity-50 group-hover:opacity-100 hover:text-blue-600"
                  icon={<MoreHorizontal className="w-4 h-4" />}
                  onClick={e => e.stopPropagation()}
                />
              </Dropdown>
            </div>
          ),
          isLeaf: true,
        }))
      ]
    }))
  }

  const treeData = convertToTreeData(divisionTree)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Building2 className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <Title level={4} style={{ margin: 0 }}>Gestion des divisions et services</Title>
            <Text type="secondary">Gérez l'organigramme de l'entreprise</Text>
          </div>
        </div>
        <Space>
          <Button
            type="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => handleOpenModal('service')}
            style={{ backgroundColor: '#0d9488' }}
          >
            Nouveau service
          </Button>
          <Button
            type="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => handleOpenModal('division')}
          >
            Nouvelle division
          </Button>
        </Space>
      </div>

      {/* Tree */}
      <Card>
        <Tree
          treeData={treeData}
          showLine
          defaultExpandAll={true}
          className="[&_.ant-tree-node-content-wrapper:hover]:bg-slate-50!"
          onSelect={(selectedKeys) => {
            const key = selectedKeys[0]?.toString()
            if (key) {
              const type = key.startsWith('division-') ? 'division' : 'service'
              const id = key.replace(`${type}-`, '')
              setSelectedNode({ key: id, type })
            } else {
              setSelectedNode(null)
            }
          }}
        />
      </Card>

      {/* Modal Create/Edit */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            {modalType === 'division' ? (
              <FolderTree className="w-5 h-5 text-purple-600" />
            ) : (
              <Building2 className="w-5 h-5 text-teal-600" />
            )}
            <span>
              {editingDivision || editingService ? 'Modifier' : 'Nouveau'}{' '}
              {modalType === 'division' ? 'division' : 'service'}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={400}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="nom"
            label="Nom"
            rules={[{ required: true, message: 'Le nom est requis' }]}
          >
            <Input placeholder={modalType === 'division' ? "Ex: Direction commerciale" : "Ex: Service comptabilité"} />
          </Form.Item>

          {modalType === 'division' && (
            <Form.Item
              name="parent"
              label="Division parente"
            >
              <Select
                allowClear
                showSearch={
                  {
                    optionFilterProp: 'children',
                  }
                }
                role="select"
                placeholder="Sélectionner une division parente"
                options={divisions.map(d => ({
                  value: d._id,
                  label: d.nom,
                  disabled: editingDivision ? d._id === editingDivision._id : false
                }))}
              />
            </Form.Item>
          )}

          {modalType === 'service' && (
            <Form.Item
              name="division"
              label="Division"
              rules={[{ required: true, message: 'La division est requise' }]}
            >
              <Select
                role="select"
                placeholder="Sélectionner une division"
                showSearch={
                  {
                    optionFilterProp: 'children',
                  }
                }
                options={divisions.map(d => ({
                  value: d._id,
                  label: d.nom
                }))}
              />
            </Form.Item>
          )}

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button onClick={handleCloseModal}>
              Annuler
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={
                modalType === 'division'
                  ? createDivisionMutation.isPending || updateDivisionMutation.isPending
                  : createServiceMutation.isPending || updateServiceMutation.isPending
              }
              style={{ backgroundColor: '#0d9488' }}
            >
              {editingDivision || editingService ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
