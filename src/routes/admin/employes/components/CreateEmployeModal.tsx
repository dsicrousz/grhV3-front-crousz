import { useState, useEffect } from 'react'
import { Modal, Form, Input, DatePicker, Select, Radio, Button, Typography, Tag, InputNumber } from 'antd'
import { Users2 } from 'lucide-react'
import dayjs from 'dayjs'
import type { Employe, CreateEmployeDto, UpdateEmployeDto } from '@/types/employe'
import { Genre, Civilite } from '@/types/employe'
import { TypeContrat } from '@/types/contrat'
import type { CreateContratDto } from '@/types/contrat'
import type { CreateAffectationSiteDto } from '@/types/affectation-site'
import type { Categorie } from '@/types/categorie'
import type { Site } from '@/types/site'
import type { Poste } from '@/types/poste'
import type { Division } from '@/types/division'

const { Text } = Typography

interface CreateEmployeModalProps {
  isOpen: boolean
  editingEmploye: Employe | null
  initialValues?: any
  categories: Categorie[]
  sites: Site[]
  postes: Poste[]
  divisions: Division[]
  allServices: Array<{ _id: string; nom: string; division: string | { _id: string } }>
  isPending: boolean
  onClose: () => void
  onSubmit: (data: {
    employe: CreateEmployeDto | UpdateEmployeDto
    contrat?: CreateContratDto
    affectation?: CreateAffectationSiteDto
  }) => void
}

export function CreateEmployeModal({
  isOpen,
  editingEmploye,
  initialValues,
  categories,
  sites,
  postes,
  divisions,
  allServices,
  isPending,
  onClose,
  onSubmit,
}: CreateEmployeModalProps) {
  const [form] = Form.useForm()
  const [addContrat, setAddContrat] = useState(false)
  const [contratType, setContratType] = useState<TypeContrat | null>(null)
  const [addAffectation, setAddAffectation] = useState(false)
  const [selectedDivisionAffectation, setSelectedDivisionAffectation] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && initialValues) {
      form.setFieldsValue(initialValues)
    } else if (isOpen && editingEmploye) {
      form.setFieldsValue({
        ...editingEmploye,
        categorie: typeof editingEmploye.contrat_actif?.categorie === 'object' 
          ? editingEmploye.contrat_actif?.categorie?._id 
          : editingEmploye.contrat_actif?.categorie,
        date_de_naissance: dayjs(editingEmploye.date_de_naissance),
      })
    }
  }, [isOpen, initialValues, editingEmploye, form])

  const handleClose = () => {
    form.resetFields()
    setAddContrat(false)
    setContratType(null)
    setAddAffectation(false)
    setSelectedDivisionAffectation(null)
    onClose()
  }

  const handleSubmit = async (values: any) => {
    const {
      contrat_type, contrat_poste, contrat_date_debut, contrat_date_fin,
      contrat_salaire_fixe, contrat_description,
      categorie, matricule_de_solde, nombre_de_parts,
      affectation_site: _aff, affectation_division, affectation_service, affectation_date_debut, affectation_description,
      ...employeValues
    } = values

    const employeData: CreateEmployeDto = {
      ...employeValues,
      date_de_naissance: employeValues.date_de_naissance.format('YYYY-MM-DD'),
    }

    let contratData: CreateContratDto | undefined
    let affectationData: CreateAffectationSiteDto | undefined

    if (!editingEmploye && addContrat && contrat_type && contrat_poste && contrat_date_debut) {
      contratData = {
        type: contrat_type,
        poste: contrat_poste,
        date_debut: contrat_date_debut.format('YYYY-MM-DD'),
        date_fin: contrat_date_fin?.format('YYYY-MM-DD'),
        salaire_fixe: contrat_salaire_fixe,
        description: contrat_description,
        employe: '', // Sera rempli par le hook
        ...(contrat_type === TypeContrat.CDI && {
          categorie,
          matricule_de_solde,
          nombre_de_parts,
        }),
      }
    }

    if (!editingEmploye && addAffectation && _aff && affectation_date_debut) {
      affectationData = {
        employe: '', // Sera rempli par le hook
        site: _aff,
        division: affectation_division,
        service: affectation_service,
        date_debut: affectation_date_debut.format('YYYY-MM-DD'),
        description: affectation_description,
      }
    }

    onSubmit({
      employe: editingEmploye
        ? Object.fromEntries(
            Object.entries(employeData).filter(([key, value]) =>
              value !== undefined && value !== editingEmploye[key as keyof Employe]
            )
          ) as UpdateEmployeDto
        : employeData,
      contrat: contratData,
      affectation: affectationData,
    })
  }

  const servicesDivision = selectedDivisionAffectation
    ? allServices.filter(s => {
        const divId = typeof s.division === 'string' ? s.division : s.division._id
        return divId === selectedDivisionAffectation
      })
    : []

  return (
    <Modal
      title={null}
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      width={860}
      styles={{ body: { padding: 0 } }}
    >
      {/* Header du modal */}
      <div className="px-6 py-5 border-b bg-linear-to-r from-teal-600 to-teal-500 rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Users2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-base m-0">
              {editingEmploye ? `Modifier — ${editingEmploye.prenom} ${editingEmploye.nom}` : 'Nouvel employé'}
            </h3>
            <p className="text-teal-100 text-xs m-0">
              {editingEmploye ? 'Modifier les informations personnelles et administratives' : 'Renseigner les informations puis créer le profil'}
            </p>
          </div>
        </div>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit} className="px-6 py-5">
        {/* ── Bloc 1 : Identité ── */}
        <div className="mb-4 flex items-center gap-2">
          <div className="w-1 h-4 bg-teal-500 rounded-full" />
          <Text strong className="text-sm text-gray-700 uppercase tracking-wide">Identité</Text>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-0">
          <Form.Item name="civilite" label="Civilité" rules={[{ required: true, message: 'Requis' }]}>
            <Radio.Group buttonStyle="solid">
              {Object.values(Civilite).map(v => (
                <Radio.Button key={v} value={v}>{v}</Radio.Button>
              ))}
            </Radio.Group>
          </Form.Item>
          <Form.Item name="genre" label="Genre" rules={[{ required: true, message: 'Requis' }]}>
            <Radio.Group buttonStyle="solid">
              {Object.values(Genre).map(v => (
                <Radio.Button key={v} value={v}>{v}</Radio.Button>
              ))}
            </Radio.Group>
          </Form.Item>
          <Form.Item name="prenom" label="Prénom" rules={[{ required: true, message: 'Requis' }]}>
            <Input placeholder="Prénom" />
          </Form.Item>
          <Form.Item name="nom" label="Nom" rules={[{ required: true, message: 'Requis' }]}>
            <Input placeholder="Nom de famille" />
          </Form.Item>
          <Form.Item name="date_de_naissance" label="Date de naissance" rules={[{ required: true, message: 'Requise' }]}>
            <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="JJ/MM/AAAA" />
          </Form.Item>
          <Form.Item name="lieu_de_naissance" label="Lieu de naissance">
            <Input placeholder="Ville, Pays" />
          </Form.Item>
          <Form.Item name="nationalite" label="Nationalité" rules={[{ required: true, message: 'Requise' }]}>
            <Input placeholder="Ex: Sénégalaise" />
          </Form.Item>
          <Form.Item name="nci" label="Numéro CNI" rules={[{ required: true, message: 'Requis' }]}>
            <Input placeholder="Numéro carte nationale d'identité" />
          </Form.Item>
          <Form.Item name="telephone" label="Téléphone" rules={[{ required: true, message: 'Requis' }]}>
            <Input placeholder="+221 77 000 00 00" />
          </Form.Item>
          <Form.Item name="adresse" label="Adresse" rules={[{ required: true, message: 'Requise' }]}>
            <Input placeholder="Quartier, Ville" />
          </Form.Item>
        </div>

        {/* ── Blocs optionnels uniquement à la création ── */}
        {!editingEmploye && (
          <>
            {/* ── Bloc 3 : Contrat initial ── */}
            <div
              className={`rounded-xl border-2 transition-all duration-200 mb-4 ${addContrat ? 'border-teal-400 bg-teal-50' : 'border-dashed border-gray-200 bg-gray-50'}`}
            >
              <button
                type="button"
                onClick={() => {
                  const next = !addContrat
                  setAddContrat(next)
                  setContratType(null)
                  if (next) form.setFieldValue('contrat_date_debut', dayjs())
                }}
                className="w-full flex items-center justify-between px-4 py-3 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${addContrat ? 'bg-teal-500' : 'bg-gray-300'}`} />
                  <Text strong className={`text-sm ${addContrat ? 'text-teal-700' : 'text-gray-500'}`}>
                    Contrat initial
                  </Text>
                  {!addContrat && <Text type="secondary" className="text-xs">(optionnel — peut être ajouté plus tard)</Text>}
                </div>
                <Tag color={addContrat ? 'teal' : 'default'} className="text-xs">
                  {addContrat ? 'Activé' : 'Désactivé'}
                </Tag>
              </button>

              {addContrat && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-0 px-4 pb-4">
                  <Form.Item name="contrat_type" label="Type de contrat" rules={[{ required: true, message: 'Requis' }]}>
                    <Select
                      placeholder="CDI / CDD / Temporaire"
                      options={[
                        { value: TypeContrat.CDI, label: 'CDI — Durée indéterminée' },
                        { value: TypeContrat.CDD, label: 'CDD — Durée déterminée' },
                        { value: TypeContrat.TEMPORAIRE, label: 'Temporaire' },
                      ]}
                      onChange={(val) => setContratType(val)}
                    />
                  </Form.Item>
                  <Form.Item name="contrat_poste" label="Poste" rules={[{ required: true, message: 'Requis' }]}>
                    <Select
                      showSearch
                      placeholder="Sélectionner un poste"
                      optionFilterProp="label"
                      options={postes.map(p => ({ value: p._id, label: p.nom }))}
                    />
                  </Form.Item>
                  <Form.Item name="contrat_date_debut" label="Date de début" rules={[{ required: true, message: 'Requise' }]}>
                    <DatePicker className="w-full" format="DD/MM/YYYY" defaultValue={dayjs()} />
                  </Form.Item>
                  {(contratType === TypeContrat.CDD || contratType === TypeContrat.TEMPORAIRE) && (
                    <Form.Item name="contrat_date_fin" label="Date de fin" rules={[{ required: true, message: 'Requise' }]}>
                      <DatePicker className="w-full" format="DD/MM/YYYY" />
                    </Form.Item>
                  )}
                  {(contratType === TypeContrat.CDD || contratType === TypeContrat.TEMPORAIRE) && (
                    <Form.Item name="contrat_salaire_fixe" label="Salaire fixe (FCFA)" rules={[{ required: true, message: 'Requis' }]}>
                      <InputNumber 
                        className="w-full" 
                        min={0} 
                        formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                      />
                    </Form.Item>
                  )}
                  {/* Champs CDI uniquement */}
                  {contratType === TypeContrat.CDI && (
                    <>
                      <Form.Item name="categorie" label="Catégorie">
                        <Select
                          allowClear showSearch placeholder="Sélectionner"
                          options={categories.map(cat => ({ value: cat._id, label: `${cat.code || ''} — ${cat.valeur || 0}` }))}
                        />
                      </Form.Item>
                      <Form.Item name="matricule_de_solde" label="Matricule de solde">
                        <Input placeholder="Ex: MAT-0001" />
                      </Form.Item>
                      <Form.Item name="nombre_de_parts" label="Nombre de parts">
                        <InputNumber className="w-full" min={0} placeholder="0" />
                      </Form.Item>
                    </>
                  )}
                  <Form.Item
                    name="contrat_description"
                    label="Description"
                    className={contratType === TypeContrat.CDI ? 'col-span-1' : 'col-span-2'}
                  >
                    <Input.TextArea rows={1} placeholder="Remarques éventuelles" />
                  </Form.Item>
                </div>
              )}
            </div>

            {/* ── Bloc 4 : Affectation site ── */}
            <div
              className={`rounded-xl border-2 transition-all duration-200 mb-2 ${addAffectation ? 'border-blue-400 bg-blue-50' : 'border-dashed border-gray-200 bg-gray-50'}`}
            >
              <button
                type="button"
                onClick={() => {
                  const next = !addAffectation
                  setAddAffectation(next)
                  if (next) form.setFieldValue('affectation_date_debut', dayjs())
                }}
                className="w-full flex items-center justify-between px-4 py-3 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${addAffectation ? 'bg-blue-500' : 'bg-gray-300'}`} />
                  <Text strong className={`text-sm ${addAffectation ? 'text-blue-700' : 'text-gray-500'}`}>
                    Affectation de site
                  </Text>
                  {!addAffectation && <Text type="secondary" className="text-xs">(optionnel — peut être ajouté plus tard)</Text>}
                </div>
                <Tag color={addAffectation ? 'blue' : 'default'} className="text-xs">
                  {addAffectation ? 'Activée' : 'Désactivée'}
                </Tag>
              </button>

              {addAffectation && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-0 px-4 pb-4">
                  <Form.Item name="affectation_site" label="Site" rules={[{ required: true, message: 'Requis' }]}>
                    <Select
                      showSearch
                      placeholder="Sélectionner un site"
                      options={sites.map(s => ({
                        value: s._id,
                        label: `${s.nom}${s.ville ? ` — ${s.ville}` : ''}`,
                      }))}
                    />
                  </Form.Item>
                  <Form.Item name="affectation_division" label="Division">
                    <Select
                      showSearch
                      placeholder="Sélectionner une division"
                      allowClear
                      onChange={(val) => {
                        setSelectedDivisionAffectation(val)
                        form.setFieldValue('affectation_service', undefined)
                      }}
                      options={divisions.map(d => ({ value: d._id, label: d.nom }))}
                    />
                  </Form.Item>
                  <Form.Item name="affectation_service" label="Service">
                    <Select
                      showSearch
                      placeholder="Sélectionner un service"
                      allowClear
                      disabled={!selectedDivisionAffectation}
                      options={servicesDivision.map(s => ({ value: s._id, label: s.nom }))}
                    />
                  </Form.Item>
                  <Form.Item name="affectation_date_debut" label="Date d'affectation" rules={[{ required: true, message: 'Requise' }]}>
                    <DatePicker className="w-full" format="DD/MM/YYYY" defaultValue={dayjs()} />
                  </Form.Item>
                  <Form.Item name="affectation_description" label="Description" className="col-span-2">
                    <Input.TextArea rows={1} placeholder="Remarques éventuelles" />
                  </Form.Item>
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button onClick={handleClose} size="large">
            Annuler
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={isPending}
            style={{ backgroundColor: '#0d9488', borderColor: '#0d9488' }}
          >
            {editingEmploye ? 'Enregistrer les modifications' : 'Créer l\'employé'}
          </Button>
        </div>
      </Form>
    </Modal>
  )
}
