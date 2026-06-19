import { useState } from 'react'
import { Typography, Button, Space, Card, Spin, Modal, Form, Select, Input, DatePicker, InputNumber, message, Popconfirm, Tag, Empty, Tooltip } from 'antd'
import { Plus, FileText, Square, Trash2, Pencil, OctagonX, Printer } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Contrat } from '@/types/contrat'
import { TypeContrat, MotifTerminaison } from '@/types/contrat'
import type { CreateContratDto, UpdateContratDto, TerminerContratDto } from '@/types/contrat'
import { ContratService } from '@/services/contrat.service'
import { CategorieService } from '@/services/categorie.service'
import { PosteService } from '@/services/poste.service'
import { EmployeService } from '@/services/employe.service'
import { generateContratDecisionPDF } from '@/lib/contrat-decision-pdf'
import type { Poste } from '@/types/poste'
import dayjs from 'dayjs'

const { Title, Text } = Typography

interface EmployeContratsProps {
  employeId: string
}

const typeLabels: Record<TypeContrat, { label: string; color: string }> = {
  [TypeContrat.CDI]: { label: 'CDI', color: 'green' },
  [TypeContrat.CDD]: { label: 'CDD', color: 'orange' },
  [TypeContrat.TEMPORAIRE]: { label: 'Temporaire', color: 'blue' },
}

const motifLabels: Record<MotifTerminaison, string> = {
  [MotifTerminaison.DEMISSION]: 'Démission',
  [MotifTerminaison.LICENCIEMENT_ABUSIF]: 'Licenciement abusif',
  [MotifTerminaison.LICENCIEMENT_ECONOMIQUE]: 'Licenciement économique',
  [MotifTerminaison.LICENCIEMENT_DISCIPLINAIRE]: 'Licenciement disciplinaire',
  [MotifTerminaison.RETRAITE]: 'Retraite',
  [MotifTerminaison.DECES]: 'Décès',
  [MotifTerminaison.FIN_CDD]: 'Fin de CDD',
  [MotifTerminaison.RUPTURE_CONVENTIONNELLE]: 'Rupture conventionnelle',
  [MotifTerminaison.AUTRE]: 'Autre',
}

export const EmployeContrats = ({ employeId }: EmployeContratsProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingContrat, setEditingContrat] = useState<Contrat | null>(null)
  const [selectedType, setSelectedType] = useState<TypeContrat | null>(null)
  const [isTerminationModalOpen, setIsTerminationModalOpen] = useState(false)
  const [terminatingContrat, setTerminatingContrat] = useState<Contrat | null>(null)
  const [form] = Form.useForm()
  const [terminationForm] = Form.useForm()
  const queryClient = useQueryClient()

  const { data: contrats = [], isLoading } = useQuery({
    queryKey: ['contrats', employeId],
    queryFn: () => ContratService.getByEmploye(employeId),
    enabled: !!employeId,
  })

  const { data: employe } = useQuery({
    queryKey: ['employe', employeId],
    queryFn: () => EmployeService.getOne(employeId),
    enabled: !!employeId,
  })

  const handlePrintDecision = (contrat: Contrat) => {
    if (!employe) {
      message.error("Données de l'employé indisponibles")
      return
    }
    try {
      generateContratDecisionPDF(contrat, employe)
    } catch (e) {
      console.error(e)
      message.error('Erreur lors de la génération du PDF')
    }
  }

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => CategorieService.getAll(),
  })

  const { data: postes = [] } = useQuery({
    queryKey: ['postes'],
    queryFn: () => PosteService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateContratDto) => ContratService.create(data),
    onSuccess: () => {
      message.success('Contrat créé avec succès')
      setIsModalOpen(false)
      form.resetFields()
      setSelectedType(null)
      queryClient.invalidateQueries({ queryKey: ['contrats', employeId] })
      queryClient.invalidateQueries({ queryKey: ['employes'] })
      queryClient.invalidateQueries({ queryKey: ['employe', employeId] })
    },
    onError: () => {
      message.error('Erreur lors de la création du contrat')
    },
  })

  const terminerMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TerminerContratDto }) => ContratService.terminer(id, data),
    onSuccess: () => {
      message.success('Contrat terminé avec succès')
      setIsTerminationModalOpen(false)
      setTerminatingContrat(null)
      terminationForm.resetFields()
      queryClient.invalidateQueries({ queryKey: ['contrats', employeId] })
      queryClient.invalidateQueries({ queryKey: ['employes'] })
      queryClient.invalidateQueries({ queryKey: ['employe', employeId] })
    },
    onError: () => {
      message.error('Erreur lors de la terminaison du contrat')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateContratDto }) => ContratService.update(id, data),
    onSuccess: () => {
      message.success('Contrat modifié avec succès')
      setIsModalOpen(false)
      form.resetFields()
      setEditingContrat(null)
      setSelectedType(null)
      queryClient.invalidateQueries({ queryKey: ['contrats', employeId] })
      queryClient.invalidateQueries({ queryKey: ['employes'] })
      queryClient.invalidateQueries({ queryKey: ['employe', employeId] })
    },
    onError: () => {
      message.error('Erreur lors de la modification du contrat')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ContratService.delete(id),
    onSuccess: () => {
      message.success('Contrat supprimé avec succès')
      queryClient.invalidateQueries({ queryKey: ['contrats', employeId] })
      queryClient.invalidateQueries({ queryKey: ['employes'] })
    },
    onError: () => {
      message.error('Erreur lors de la suppression')
    },
  })

  const getPosteName = (poste: Poste | string | undefined): string => {
    if (!poste) return ''
    if (typeof poste === 'string') return poste
    return poste.nom
  }

  const handleSubmit = (values: any) => {
    const isCDI = values.type === TypeContrat.CDI
    const baseData = {
      type: values.type,
      date_debut: values.date_debut.format('YYYY-MM-DD'),
      date_fin: values.date_fin?.format('YYYY-MM-DD'),
      poste: values.poste,
      salaire_fixe: values.salaire_fixe,
      description: values.description,
      ...(isCDI && {
        categorie: values.categorie,
        matricule_de_solde: values.matricule_de_solde,
        nombre_de_parts: values.nombre_de_parts,
      }),
    }
    
    if (editingContrat) {
      // Mode édition
      const data: UpdateContratDto = { ...baseData }
      updateMutation.mutate({ id: editingContrat._id, data })
    } else {
      // Mode création
      const data: CreateContratDto = { ...baseData, employe: employeId }
      createMutation.mutate(data)
    }
  }

  const handleOpenEditModal = (contrat: Contrat) => {
    setEditingContrat(contrat)
    setSelectedType(contrat.type)
    
    // Pré-remplir le formulaire avec les valeurs du contrat
    const formValues: any = {
      type: contrat.type,
      poste: typeof contrat.poste === 'string' ? contrat.poste : contrat.poste?._id,
      date_debut: dayjs(contrat.date_debut),
      date_fin: contrat.date_fin ? dayjs(contrat.date_fin) : undefined,
      salaire_fixe: contrat.salaire_fixe,
      description: contrat.description,
    }
    
    // Ajouter les champs spécifiques CDI
    if (contrat.type === TypeContrat.CDI) {
      formValues.categorie = typeof contrat.categorie === 'string' ? contrat.categorie : contrat.categorie?._id
      formValues.matricule_de_solde = contrat.matricule_de_solde
      formValues.nombre_de_parts = contrat.nombre_de_parts
    }
    
    form.setFieldsValue(formValues)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    form.resetFields()
    setEditingContrat(null)
    setSelectedType(null)
  }

  const handleOpenTerminationModal = (contrat: Contrat) => {
    setTerminatingContrat(contrat)
    setIsTerminationModalOpen(true)
  }

  const handleCloseTerminationModal = () => {
    setIsTerminationModalOpen(false)
    setTerminatingContrat(null)
    terminationForm.resetFields()
  }

  const handleTerminationSubmit = (values: any) => {
    if (!terminatingContrat) return
    const data: TerminerContratDto = {
      motif_terminaison: values.motif_terminaison,
      date_fin: values.date_fin ? values.date_fin.format('YYYY-MM-DD') : undefined,
    }
    terminerMutation.mutate({ id: terminatingContrat._id, data })
  }

  const showConditionalFields = selectedType === TypeContrat.CDD || selectedType === TypeContrat.TEMPORAIRE

  const contratActif = contrats.find((c: Contrat) => c.est_actif)
  const contratsTermines = contrats.filter((c: Contrat) => !c.est_actif)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <Title level={5} className="mb-0!">Contrats</Title>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            form.resetFields()
            setEditingContrat(null)
            setSelectedType(null)
            setIsModalOpen(true)
          }}
          disabled={!!contratActif}
        >
          {contratActif ? 'Contrat actif existant' : 'Nouveau contrat'}
        </Button>
      </div>

      {isLoading ? (
        <Spin />
      ) : contrats.length === 0 ? (
        <Empty description="Aucun contrat" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <div className="space-y-3">
          {/* Contrat actif en premier */}
          {contratActif && (
            <Card
              size="small"
              className="border-green-300 bg-green-50/50"
              title={
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  <Text strong>Contrat actif</Text>
                  <Tag color={typeLabels[contratActif.type].color}>
                    {typeLabels[contratActif.type].label}
                  </Tag>
                </div>
              }
              extra={
                <Space>
                  {(contratActif.type === TypeContrat.CDI || contratActif.type === TypeContrat.CDD) && (
                    <Button
                      size="small"
                      icon={<Printer className="w-3 h-3" />}
                      onClick={() => handlePrintDecision(contratActif)}
                    >
                      Imprimer décision
                    </Button>
                  )}
                  <Button
                    size="small"
                    icon={<Pencil className="w-3 h-3" />}
                    onClick={() => handleOpenEditModal(contratActif)}
                  >
                    Modifier
                  </Button>
                  <Button
                    size="small"
                    icon={<Square className="w-3 h-3" />}
                    danger
                    onClick={() => handleOpenTerminationModal(contratActif)}
                  >
                    Terminer
                  </Button>
                </Space>
              }
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Text type="secondary" className="text-xs block">Poste</Text>
                  <Text strong>{getPosteName(contratActif.poste)}</Text>
                </div>
                <div>
                  <Text type="secondary" className="text-xs block">Date début</Text>
                  <Text>{dayjs(contratActif.date_debut).format('DD/MM/YYYY')}</Text>
                </div>
                {contratActif.date_fin && (
                  <div>
                    <Text type="secondary" className="text-xs block">Date fin</Text>
                    <Text>{dayjs(contratActif.date_fin).format('DD/MM/YYYY')}</Text>
                  </div>
                )}
                {contratActif.salaire_fixe != null && (
                  <div>
                    <Text type="secondary" className="text-xs block">Salaire fixe</Text>
                    <Text>{contratActif.salaire_fixe.toLocaleString('fr-FR')} FCFA</Text>
                  </div>
                )}
              </div>
              {contratActif.description && (
                <Text type="secondary" className="text-xs mt-2 block">{contratActif.description}</Text>
              )}
            </Card>
          )}

          {/* Historique des contrats terminés */}
          {contratsTermines.length > 0 && (
            <>
              <Text type="secondary" className="text-xs block mt-4">Historique des contrats</Text>
              {contratsTermines.map((contrat: Contrat) => (
                <Card key={contrat._id} size="small" className="bg-gray-50 opacity-75">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Tag color={typeLabels[contrat.type].color}>
                          {typeLabels[contrat.type].label}
                        </Tag>
                        <Tag color="default">Terminé</Tag>
                        <Text strong className="text-sm">{getPosteName(contrat.poste)}</Text>
                      </div>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>Du {dayjs(contrat.date_debut).format('DD/MM/YYYY')}</span>
                        {contrat.date_fin && <span>au {dayjs(contrat.date_fin).format('DD/MM/YYYY')}</span>}
                        {contrat.salaire_fixe != null && <span>{contrat.salaire_fixe.toLocaleString('fr-FR')} FCFA</span>}
                        {contrat.motif_terminaison && <span className="text-red-600">Motif: {motifLabels[contrat.motif_terminaison]}</span>}
                      </div>
                    </div>
                    <Space>
                      {(contrat.type === TypeContrat.CDI || contrat.type === TypeContrat.CDD) && (
                        <Tooltip title="Imprimer la décision">
                          <Button
                            type="text"
                            size="small"
                            icon={<Printer className="w-4 h-4" />}
                            onClick={() => handlePrintDecision(contrat)}
                          />
                        </Tooltip>
                      )}
                      <Popconfirm
                        title="Supprimer ce contrat ?"
                        description="Cette action est irréversible."
                        onConfirm={() => deleteMutation.mutate(contrat._id)}
                        okText="Supprimer"
                        cancelText="Annuler"
                        okButtonProps={{ danger: true }}
                      >
                        <Tooltip title="Supprimer">
                          <Button type="text" size="small" danger icon={<Trash2 className="w-4 h-4" />} />
                        </Tooltip>
                      </Popconfirm>
                    </Space>
                  </div>
                </Card>
              ))}
            </>
          )}
        </div>
      )}

      {/* Modal création/édition */}
      <Modal
        title={editingContrat ? 'Modifier le contrat' : 'Nouveau contrat'}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="type"
              label="Type de contrat"
              rules={[{ required: true, message: 'Requis' }]}
            >
              <Select
                placeholder="Sélectionner"
                options={Object.values(TypeContrat).map(t => ({
                  value: t,
                  label: typeLabels[t].label,
                }))}
                onChange={(val) => setSelectedType(val)}
              />
            </Form.Item>

            <Form.Item
              name="poste"
              label="Poste"
              rules={[{ required: true, message: 'Requis' }]}
            >
              <Select
                showSearch
                placeholder="Sélectionner un poste"
                optionFilterProp="label"
                options={postes.map(p => ({ value: p._id, label: p.nom }))}
              />
            </Form.Item>

            <Form.Item
              name="date_debut"
              label="Date de début"
              rules={[{ required: true, message: 'Requis' }]}
            >
              <DatePicker className="w-full" format="DD/MM/YYYY" />
            </Form.Item>

            {showConditionalFields && (
              <Form.Item
                name="date_fin"
                label="Date de fin"
                rules={[{ required: true, message: 'Requis pour CDD/Temporaire' }]}
              >
                <DatePicker className="w-full" format="DD/MM/YYYY" />
              </Form.Item>
            )}

            {showConditionalFields && (
              <Form.Item
                name="salaire_fixe"
                label="Salaire fixe (FCFA)"
                rules={[{ required: true, message: 'Requis pour CDD/Temporaire' }]}
              >
                <InputNumber className="w-full" min={0} />
              </Form.Item>
            )}

            {selectedType === TypeContrat.CDI && (
              <>
                <Form.Item
                  name="categorie"
                  label="Catégorie"
                  rules={[{ required: true, message: 'Requis pour CDI' }]}
                >
                  <Select
                    placeholder="Sélectionner"
                    showSearch
                    options={categories.map(c => ({ label: `${c.code} — ${c.valeur}`, value: c._id }))}
                  />
                </Form.Item>
                <Form.Item
                  name="matricule_de_solde"
                  label="Matricule de solde"
                  rules={[{ required: true, message: 'Requis pour CDI' }]}
                >
                  <Input placeholder="Ex: MAT-0001" />
                </Form.Item>
                <Form.Item
                  name="nombre_de_parts"
                  label="Nombre de parts"
                  rules={[{ required: true, message: 'Requis pour CDI' }]}
                >
                  <InputNumber className="w-full" min={0} />
                </Form.Item>
              </>
            )}
          </div>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="Description optionnelle..." />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={handleCloseModal}>Annuler</Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {editingContrat ? 'Enregistrer' : 'Créer'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de terminaison */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <OctagonX className="w-5 h-5 text-red-600" />
            <span>Terminer le contrat</span>
          </div>
        }
        open={isTerminationModalOpen}
        onCancel={handleCloseTerminationModal}
        footer={null}
        width={500}
      >
        <Form form={terminationForm} layout="vertical" onFinish={handleTerminationSubmit}>
          <Form.Item
            name="motif_terminaison"
            label="Motif de terminaison"
            rules={[{ required: true, message: 'Le motif est requis' }]}
          >
            <Select
              placeholder="Sélectionner un motif"
              options={Object.values(MotifTerminaison).map(m => ({
                value: m,
                label: motifLabels[m],
              }))}
            />
          </Form.Item>

          <Form.Item
            name="date_fin"
            label="Date de fin (optionnel)"
            tooltip="Laisser vide pour utiliser la date du jour"
          >
            <DatePicker className="w-full" format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={handleCloseTerminationModal}>Annuler</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={terminerMutation.isPending}
                danger
              >
                Terminer le contrat
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
