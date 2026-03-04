import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Select,
  Space, 
  Typography, 
  Card, 
  Popconfirm, 
  message,
  Tooltip,
  Tabs,
  InputNumber
} from 'antd'
import { Plus, Trash2, Link2, FileText } from 'lucide-react'
import type { 
  AttributionFonctionnelle, 
  AttributionGlobale,
  CreateAttributionFonctionnelleDto, 
  CreateAttributionGlobaleDto 
} from '@/types/attribution'
import { AttributionFonctionnelleService, AttributionGlobaleService } from '@/services/attribution.service'
import { FonctionService } from '@/services/fonction.service'
import { RubriqueService } from '@/services/rubrique.service'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography
const { TabPane } = Tabs

export const Route = createFileRoute('/admin/parametrage/attributions')({
  component: AttributionsPage,
})

function AttributionsPage() {
  const [activeTab, setActiveTab] = useState('fonctionnelle')
  const [isModalOpen, setIsModalOpen] = useState(false)
  // Pas d'édition pour les attributions, seulement création et suppression
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  // Fonctionnelles
  const { data: attributionsFonctionnelles = [], isLoading: isLoadingFonctionnelles } = useQuery({
    queryKey: ['attributions-fonctionnelles'],
    queryFn: () => AttributionFonctionnelleService.getAll(),
  })

  // Globales
  const { data: attributionsGlobales = [], isLoading: isLoadingGlobales } = useQuery({
    queryKey: ['attributions-globales'],
    queryFn: () => AttributionGlobaleService.getAll(),
  })

  // Fonctions pour les selects
  const { data: fonctions = [] } = useQuery({
    queryKey: ['fonctions'],
    queryFn: () => FonctionService.getAll(),
  })

  // Rubriques pour les selects
  const { data: rubriques = [] } = useQuery({
    queryKey: ['rubriques'],
    queryFn: () => RubriqueService.getAll(),
  })

  // Mutations fonctionnelles
  const createFonctionnelleMutation = useMutation({
    mutationFn: (data: CreateAttributionFonctionnelleDto) => 
      AttributionFonctionnelleService.create(data),
    onSuccess: () => {
      message.success('Attribution fonctionnelle créée avec succès')
      queryClient.invalidateQueries({ queryKey: ['attributions-fonctionnelles'] })
      handleCloseModal()
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la création')
    },
  })

  const deleteFonctionnelleMutation = useMutation({
    mutationFn: (id: string) => AttributionFonctionnelleService.delete(id),
    onSuccess: () => {
      message.success('Attribution fonctionnelle supprimée avec succès')
      queryClient.invalidateQueries({ queryKey: ['attributions-fonctionnelles'] })
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la suppression')
    },
  })

  // Mutations globales
  const createGlobaleMutation = useMutation({
    mutationFn: (data: CreateAttributionGlobaleDto) => 
      AttributionGlobaleService.create(data),
    onSuccess: () => {
      message.success('Attribution globale créée avec succès')
      queryClient.invalidateQueries({ queryKey: ['attributions-globales'] })
      handleCloseModal()
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la création')
    },
  })

  const deleteGlobaleMutation = useMutation({
    mutationFn: (id: string) => AttributionGlobaleService.delete(id),
    onSuccess: () => {
      message.success('Attribution globale supprimée avec succès')
      queryClient.invalidateQueries({ queryKey: ['attributions-globales'] })
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la suppression')
    },
  })

  const handleOpenModal = () => {
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    form.resetFields()
  }

  const handleSubmit = async (values: CreateAttributionFonctionnelleDto | CreateAttributionGlobaleDto) => {
    if (activeTab === 'fonctionnelle') {
      createFonctionnelleMutation.mutate(values as CreateAttributionFonctionnelleDto)
    } else {
      createGlobaleMutation.mutate(values as CreateAttributionGlobaleDto)
    }
  }

  const columnsFonctionnelles: ColumnsType<AttributionFonctionnelle> = [
    {
      title: 'Fonction',
      key: 'fonction',
      render: (_, record) => {
        const fonction = fonctions.find(f => f._id === (typeof record.fonction === 'string' ? record.fonction : record.fonction._id))
        return fonction?.nom || '-'
      },
    },
    {
      title: 'Rubrique',
      key: 'rubrique',
      render: (_, record) => {
        const rubrique = rubriques.find(r => r._id === (typeof record.rubrique === 'string' ? record.rubrique : record.rubrique._id))
        return rubrique?.code || '-'
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Popconfirm
            title="Supprimer cette attribution ?"
            description="Cette action est irréversible."
            onConfirm={() => deleteFonctionnelleMutation.mutate(record._id)}
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

  const columnsGlobales: ColumnsType<AttributionGlobale> = [
    {
      title: 'Rubrique',
      key: 'rubrique',
      render: (_, record) => {
        const rubrique = rubriques.find(r => r._id === (typeof record.rubrique === 'string' ? record.rubrique : record.rubrique._id))
        return rubrique?.code + ' - ' + rubrique?.libelle || '-'
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Popconfirm
            title="Supprimer cette attribution ?"
            description="Cette action est irréversible."
            onConfirm={() => deleteGlobaleMutation.mutate(record._id)}
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-100 rounded-lg">
            <Link2 className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <Title level={4} style={{ margin: 0 }}>Gestion des attributions</Title>
            <Text type="secondary">Gérez les attributions de rubriques</Text>
          </div>
        </div>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => handleOpenModal()}
          style={{ backgroundColor: '#0d9488' }}
        >
          Nouvelle attribution
        </Button>
      </div>

      {/* Tabs & Tables */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane 
            tab={
              <span className="flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Attributions fonctionnelles
              </span>
            } 
            key="fonctionnelle"
          >
            <Table
              columns={columnsFonctionnelles}
              dataSource={attributionsFonctionnelles}
              rowKey="id"
              loading={isLoadingFonctionnelles}
              pagination={{
                showSizeChanger: true,
                showTotal: (total) => `${total} attribution(s)`,
              }}
              size="middle"
            />
          </TabPane>
          <TabPane 
            tab={
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Attributions globales
              </span>
            } 
            key="globale"
          >
            <Table
              columns={columnsGlobales}
              dataSource={attributionsGlobales}
              rowKey="id"
              loading={isLoadingGlobales}
              pagination={{
                showSizeChanger: true,
                showTotal: (total) => `${total} attribution(s)`,
              }}
              size="middle"
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Modal Create/Edit */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            {activeTab === 'fonctionnelle' ? (
              <Link2 className="w-5 h-5 text-rose-600" />
            ) : (
              <FileText className="w-5 h-5 text-rose-600" />
            )}
            <span>Nouvelle attribution {activeTab === 'fonctionnelle' ? 'fonctionnelle' : 'globale'}</span>
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
          {activeTab === 'fonctionnelle' && (
            <Form.Item
              name="fonction"
              label="Fonction"
              rules={[{ required: true, message: 'La fonction est requise' }]}
            >
              <Select
                showSearch={
                  {
                    optionFilterProp: 'label',
                    filterOption: (input, option) => {
                      return (option?.label ?? '').toLowerCase().includes(input.toLowerCase());
                    },
                  }
                }
                placeholder="Sélectionner une fonction"
                role="select"
                options={fonctions.map(fonction => ({
                  value: fonction._id,
                  label: fonction.nom,
                }))}
              />
            </Form.Item>
          )}

          <Form.Item
            name="rubrique"
            label="Rubrique"
            rules={[{ required: true, message: 'La rubrique est requise' }]}
          >
            <Select
              showSearch={
                {
                  optionFilterProp: 'label',
                  filterOption: (input, option) => {
                    return (option?.label ?? '').toLowerCase().includes(input.toLowerCase());
                  },
                }
              }
              role="select"
              placeholder="Sélectionner une rubrique"
              options={rubriques.map(rubrique => ({
                value: rubrique._id,
                label: `${rubrique.code} - ${rubrique.libelle}`,
              }))}
            />
          </Form.Item>

           <Form.Item
            name="valeur_par_defaut"
            label="Valeur par défaut"
          >
         <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button onClick={handleCloseModal}>
              Annuler
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createFonctionnelleMutation.isPending || createGlobaleMutation.isPending}
              style={{ backgroundColor: '#0d9488' }}
            >
              Créer
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
