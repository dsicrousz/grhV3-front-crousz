import { useState } from 'react'
import { Typography, Button, Space, Card, Spin, Modal, Form, Select, Input, DatePicker, message, Popconfirm, Tag, Empty, Tooltip } from 'antd'
import { Plus, MapPin, Square, Trash2, Pencil } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AffectationSite, CreateAffectationSiteDto } from '@/types/affectation-site'
import type { Site } from '@/types/site'
import type { Division } from '@/types/division'
import { AffectationSiteService } from '@/services/affectation-site.service'
import { SiteService } from '@/services/site.service'
import { DivisionService, ServiceService } from '@/services/division.service'
import dayjs from 'dayjs'

const { Title, Text } = Typography

interface EmployeAffectationsSiteProps {
  employeId: string
}

export const EmployeAffectationsSite = ({ employeId }: EmployeAffectationsSiteProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null)
  const [editingAffectation, setEditingAffectation] = useState<AffectationSite | null>(null)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data: affectations = [], isLoading } = useQuery({
    queryKey: ['affectations-site', employeId],
    queryFn: () => AffectationSiteService.getByEmploye(employeId),
    enabled: !!employeId,
  })

  const { data: sites = [] } = useQuery({
    queryKey: ['sites'],
    queryFn: () => SiteService.getAll(),
  })

  const { data: divisions = [] } = useQuery({
    queryKey: ['divisions'],
    queryFn: () => DivisionService.getAll(),
  })

  const { data: allServices = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => ServiceService.getAll(),
  })

  const servicesDivision = selectedDivision
    ? allServices.filter(s => {
        const divId = typeof s.division === 'string' ? s.division : s.division._id
        return divId === selectedDivision
      })
    : []

  const createMutation = useMutation({
    mutationFn: (data: CreateAffectationSiteDto) => AffectationSiteService.create(data),
    onSuccess: () => {
      message.success('Affectation créée avec succès')
      setIsModalOpen(false)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['affectations-site', employeId] })
      queryClient.invalidateQueries({ queryKey: ['employes'] })
      queryClient.invalidateQueries({ queryKey: ['employe', employeId] })
    },
    onError: () => message.error("Erreur lors de la création de l'affectation"),
  })

  const terminerMutation = useMutation({
    mutationFn: (id: string) => AffectationSiteService.terminer(id),
    onSuccess: () => {
      message.success('Affectation terminée')
      queryClient.invalidateQueries({ queryKey: ['affectations-site', employeId] })
      queryClient.invalidateQueries({ queryKey: ['employes'] })
      queryClient.invalidateQueries({ queryKey: ['employe', employeId] })
    },
    onError: () => message.error('Erreur lors de la terminaison'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => AffectationSiteService.delete(id),
    onSuccess: () => {
      message.success('Affectation supprimée')
      queryClient.invalidateQueries({ queryKey: ['affectations-site', employeId] })
    },
    onError: () => message.error('Erreur lors de la suppression'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateAffectationSiteDto }) => 
      AffectationSiteService.update(id, data),
    onSuccess: () => {
      message.success('Affectation modifiée avec succès')
      setIsModalOpen(false)
      setEditingAffectation(null)
      form.resetFields()
      setSelectedDivision(null)
      queryClient.invalidateQueries({ queryKey: ['affectations-site', employeId] })
      queryClient.invalidateQueries({ queryKey: ['employes'] })
      queryClient.invalidateQueries({ queryKey: ['employe', employeId] })
    },
    onError: () => message.error('Erreur lors de la modification'),
  })

  const handleSubmit = (values: any) => {
    const data: CreateAffectationSiteDto = {
      employe: employeId,
      site: values.site,
      division: values.division,
      service: values.service,
      date_debut: values.date_debut.format('YYYY-MM-DD'),
      date_fin: values.date_fin?.format('YYYY-MM-DD'),
      description: values.description,
    }
    if (editingAffectation) {
      updateMutation.mutate({ id: editingAffectation._id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const getDivisionName = (division: Division | string | undefined) => {
    if (!division) return null
    if (typeof division === 'object') return division.nom
    const found = divisions.find((d: Division) => d._id === division)
    return found?.nom || null
  }

  const getServiceName = (service: { _id: string; nom: string } | string | undefined) => {
    if (!service) return null
    if (typeof service === 'object') return service.nom
    const found = allServices.find((s: any) => s._id === service)
    return found?.nom || null
  }

  const getSiteName = (site: Site | string) => {
    if (typeof site === 'object' && site) return site.nom
    const found = sites.find((s: Site) => s._id === site)
    return found?.nom || 'Inconnu'
  }

  const getSiteVille = (site: Site | string) => {
    if (typeof site === 'object' && site) return site.ville
    const found = sites.find((s: Site) => s._id === site)
    return found?.ville
  }

  const affectationActive = affectations.find((a: AffectationSite) => a.est_active)
  const affectationsTerminees = affectations.filter((a: AffectationSite) => !a.est_active)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <Title level={5} className="mb-0!">Affectations site</Title>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => { 
            setEditingAffectation(null)
            form.resetFields()
            setSelectedDivision(null)
            setIsModalOpen(true) 
          }}
          disabled={!!affectationActive && !editingAffectation}
        >
          {affectationActive && !editingAffectation ? 'Affectation active existante' : 'Nouvelle affectation'}
        </Button>
      </div>

      {isLoading ? (
        <Spin />
      ) : affectations.length === 0 ? (
        <Empty description="Aucune affectation" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <div className="space-y-3">
          {affectationActive && (
            <Card
              size="small"
              className="border-indigo-300 bg-indigo-50/50"
              title={
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  <Text strong>Affectation active</Text>
                  <Tag color="blue">{getSiteName(affectationActive.site)}</Tag>
                </div>
              }
              extra={
                <Space>
                  <Tooltip title="Modifier">
                    <Button
                      size="small"
                      icon={<Pencil className="w-3 h-3" />}
                      onClick={() => {
                        setEditingAffectation(affectationActive)
                        form.setFieldsValue({
                          site: typeof affectationActive.site === 'string' ? affectationActive.site : affectationActive.site._id,
                          division: typeof affectationActive.division === 'string' ? affectationActive.division : affectationActive.division?._id,
                          service: typeof affectationActive.service === 'string' ? affectationActive.service : affectationActive.service?._id,
                          date_debut: dayjs(affectationActive.date_debut),
                          date_fin: affectationActive.date_fin ? dayjs(affectationActive.date_fin) : undefined,
                          description: affectationActive.description,
                        })
                        setSelectedDivision(typeof affectationActive.division === 'string' ? affectationActive.division : affectationActive.division?._id || null)
                        setIsModalOpen(true)
                      }}
                    />
                  </Tooltip>
                  <Popconfirm
                    title="Terminer cette affectation ?"
                    onConfirm={() => terminerMutation.mutate(affectationActive._id)}
                    okText="Terminer"
                    cancelText="Annuler"
                  >
                    <Button size="small" icon={<Square className="w-3 h-3" />} danger>Terminer</Button>
                  </Popconfirm>
                </Space>
              }
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Text type="secondary" className="text-xs block">Site</Text>
                  <Text strong>{getSiteName(affectationActive.site)}</Text>
                  {getSiteVille(affectationActive.site) && (
                    <Text type="secondary" className="text-xs block">{getSiteVille(affectationActive.site)}</Text>
                  )}
                </div>
                {affectationActive.division && (
                  <div>
                    <Text type="secondary" className="text-xs block">Division</Text>
                    <Text>{getDivisionName(affectationActive.division)}</Text>
                  </div>
                )}
                {affectationActive.service && (
                  <div>
                    <Text type="secondary" className="text-xs block">Service</Text>
                    <Text>{getServiceName(affectationActive.service)}</Text>
                  </div>
                )}
                <div>
                  <Text type="secondary" className="text-xs block">Date début</Text>
                  <Text>{dayjs(affectationActive.date_debut).format('DD/MM/YYYY')}</Text>
                </div>
                {affectationActive.date_fin && (
                  <div>
                    <Text type="secondary" className="text-xs block">Date fin</Text>
                    <Text>{dayjs(affectationActive.date_fin).format('DD/MM/YYYY')}</Text>
                  </div>
                )}
              </div>
              {affectationActive.description && (
                <Text type="secondary" className="text-xs mt-2 block">{affectationActive.description}</Text>
              )}
            </Card>
          )}

          {affectationsTerminees.length > 0 && (
            <>
              <Text type="secondary" className="text-xs block mt-4">Historique</Text>
              {affectationsTerminees.map((aff: AffectationSite) => (
                <Card key={aff._id} size="small" className="bg-gray-50 opacity-75">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Tag color="default">{getSiteName(aff.site)}</Tag>
                        <Tag color="default">Terminée</Tag>
                      </div>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>Du {dayjs(aff.date_debut).format('DD/MM/YYYY')}</span>
                        {aff.date_fin && <span>au {dayjs(aff.date_fin).format('DD/MM/YYYY')}</span>}
                      </div>
                    </div>
                    <Popconfirm
                      title="Supprimer ?"
                      onConfirm={() => deleteMutation.mutate(aff._id)}
                      okText="Supprimer"
                      cancelText="Annuler"
                      okButtonProps={{ danger: true }}
                    >
                      <Tooltip title="Supprimer">
                        <Button type="text" size="small" danger icon={<Trash2 className="w-4 h-4" />} />
                      </Tooltip>
                    </Popconfirm>
                  </div>
                </Card>
              ))}
            </>
          )}
        </div>
      )}

      <Modal
        title={editingAffectation ? 'Modifier affectation site' : 'Nouvelle affectation site'}
        open={isModalOpen}
        onCancel={() => { 
          setIsModalOpen(false)
          setEditingAffectation(null)
          form.resetFields()
          setSelectedDivision(null) 
        }}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="site" label="Site" rules={[{ required: true, message: 'Requis' }]}>
            <Select
              placeholder="Sélectionner un site"
              showSearch
              optionFilterProp="label"
              options={sites
                .filter((s: Site) => s.est_actif)
                .map((s: Site) => ({ value: s._id, label: `${s.nom}${s.ville ? ` — ${s.ville}` : ''}` }))}
            />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="division" label="Division">
              <Select
                placeholder="Sélectionner une division"
                showSearch
                allowClear
                onChange={(val) => {
                  setSelectedDivision(val)
                  form.setFieldValue('service', undefined)
                }}
                options={divisions.map((d: Division) => ({ value: d._id, label: d.nom }))}
              />
            </Form.Item>
            <Form.Item name="service" label="Service">
              <Select
                placeholder="Sélectionner un service"
                showSearch
                allowClear
                disabled={!selectedDivision}
                options={servicesDivision.map((s: any) => ({ value: s._id, label: s.nom }))}
              />
            </Form.Item>
            <Form.Item name="date_debut" label="Date début" rules={[{ required: true, message: 'Requis' }]}>
              <DatePicker className="w-full" format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item name="date_fin" label="Date fin">
              <DatePicker className="w-full" format="DD/MM/YYYY" />
            </Form.Item>
          </div>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="Description optionnelle..." />
          </Form.Item>
          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Annuler</Button>
              <Button type="primary" htmlType="submit" loading={createMutation.isPending || updateMutation.isPending}>
                {editingAffectation ? 'Enregistrer' : 'Créer'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
