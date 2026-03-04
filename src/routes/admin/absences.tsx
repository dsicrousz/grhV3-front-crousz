import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
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
  message,
  Tooltip,
  Popconfirm,
  Tag,
  Input,
  DatePicker,
  Row,
  Col
} from 'antd'
import { Plus, Pencil, Trash2, Calendar, CheckCircle, XCircle, Clock, Stethoscope, User, Users, HelpCircle, Search, Filter, CalendarDays, Printer, Download } from 'lucide-react'
import { exportToExcel, exportToCSV, absenceExportColumns } from '@/lib/export-utils'
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import type { TDocumentDefinitions } from 'pdfmake/interfaces'
import type { Absence, CreateAbsenceDto, UpdateAbsenceDto } from '@/types/absence'
import { TypeAbsence, StatutDemande } from '@/types/absence'
import { AbsenceService } from '@/services/absence.service'
import { EmployeService } from '@/services/employe.service'
import type { Employe } from '@/types/employe'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

pdfMake.vfs = pdfFonts.vfs

const { Title, Text } = Typography
const { RangePicker } = DatePicker

export const Route = createFileRoute('/admin/absences')({
  component: AbsencesPage,
})

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

function AbsencesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAbsence, setEditingAbsence] = useState<Absence | null>(null)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  // Filtres
  const [searchText, setSearchText] = useState('')
  const [filterEmploye, setFilterEmploye] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string | null>(null)
  const [filterStatut, setFilterStatut] = useState<string | null>(null)
  const [filterDates, setFilterDates] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)

  const { data: absences = [], isLoading } = useQuery({
    queryKey: ['absences'],
    queryFn: () => AbsenceService.getAll(),
  })

  const { data: employes = [] } = useQuery({
    queryKey: ['employes'],
    queryFn: () => EmployeService.getAll(),
  })

  // Données filtrées
  const filteredAbsences = useMemo(() => {
    return absences.filter((absence) => {
      const employe = typeof absence.employe === 'string' 
        ? employes.find(e => e._id === absence.employe)
        : absence.employe as Employe

      const searchLower = searchText.toLowerCase()
      const matchesSearch = searchText === '' || 
        (employe && `${employe.prenom} ${employe.nom}`.toLowerCase().includes(searchLower)) ||
        absence.motif?.toLowerCase().includes(searchLower)

      const matchesEmploye = !filterEmploye || 
        (typeof absence.employe === 'string' ? absence.employe === filterEmploye : (absence.employe as Employe)._id === filterEmploye)

      const matchesType = !filterType || absence.type === filterType

      const matchesStatut = !filterStatut || absence.statut === filterStatut

      const matchesDates = !filterDates || (
        (dayjs(absence.date_debut).isAfter(filterDates[0], 'day') || dayjs(absence.date_debut).isSame(filterDates[0], 'day')) &&
        (dayjs(absence.date_fin).isBefore(filterDates[1], 'day') || dayjs(absence.date_fin).isSame(filterDates[1], 'day'))
      )

      return matchesSearch && matchesEmploye && matchesType && matchesStatut && matchesDates
    })
  }, [absences, employes, searchText, filterEmploye, filterType, filterStatut, filterDates])

  const resetFilters = () => {
    setSearchText('')
    setFilterEmploye(null)
    setFilterType(null)
    setFilterStatut(null)
    setFilterDates(null)
  }

  const hasActiveFilters = searchText || filterEmploye || filterType || filterStatut || filterDates

  const createMutation = useMutation({
    mutationFn: (data: CreateAbsenceDto) => AbsenceService.create(data),
    onSuccess: () => {
      message.success('Absence créée avec succès')
      setIsModalOpen(false)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['absences'] })
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
      queryClient.invalidateQueries({ queryKey: ['absences'] })
    },
    onError: () => {
      message.error('Erreur lors de la mise à jour de l\'absence')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => AbsenceService.delete(id),
    onSuccess: () => {
      message.success('Absence supprimée avec succès')
      queryClient.invalidateQueries({ queryKey: ['absences'] })
    },
    onError: () => {
      message.error('Erreur lors de la suppression de l\'absence')
    }
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => AbsenceService.approve(id),
    onSuccess: () => {
      message.success('Absence approuvée')
      queryClient.invalidateQueries({ queryKey: ['absences'] })
    },
    onError: () => {
      message.error('Erreur lors de l\'approbation')
    }
  })

  const rejectMutation = useMutation({
    mutationFn: (id: string) => AbsenceService.reject(id),
    onSuccess: () => {
      message.success('Absence rejetée')
      queryClient.invalidateQueries({ queryKey: ['absences'] })
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
      employe: values.employe
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
    const employeId = typeof absence.employe === 'string' ? absence.employe : (absence.employe as Employe)._id
    form.setFieldsValue({
      dates: [dayjs(absence.date_debut), dayjs(absence.date_fin)],
      type: absence.type,
      motif: absence.motif,
      employe: employeId
    })
    setIsModalOpen(true)
  }

  const calculateDays = (dateDebut: string, dateFin: string): number => {
    const start = dayjs(dateDebut)
    const end = dayjs(dateFin)
    return end.diff(start, 'day') + 1
  }

  const generateAbsencePDF = async (absence: Absence) => {
    const employe = getEmployeInfo(absence)
    if (!employe) {
      message.error('Employé non trouvé')
      return
    }

    const nbJours = calculateDays(absence.date_debut, absence.date_fin)
    const typeConfig = typeAbsenceLabels[absence.type]
    const statutConfig = statutLabels[absence.statut]

    // Génération du numéro de référence
    const refNumber = `ABS-${dayjs(absence.date_debut).format('YYYY')}-${String(absences.indexOf(absence) + 1).padStart(4, '0')}`

    const toBase64 = (url: string): Promise<string> => {
      return new Promise((resolve) => {
        const img = new Image()
        img.crossOrigin = 'Anonymous'
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0)
          resolve(canvas.toDataURL('image/png'))
        }
        img.onerror = () => resolve('')
        img.src = url
      })
    }

    try {
      const drapeauBase64 = await toBase64('/drapeau.png')

      // Watermark selon le statut
      let watermark: any = undefined
      if (absence.statut === StatutDemande.EN_ATTENTE) {
        watermark = {
          text: 'EN ATTENTE',
          color: '#ff9800',
          opacity: 0.15,
          angle: 45,
          fontSize: 80,
          bold: true,
        }
      } else if (absence.statut === StatutDemande.APPROUVEE) {
        watermark = {
          text: 'APPROUVÉ',
          color: '#4caf50',
          opacity: 0.1,
          angle: 45,
          fontSize: 80,
          bold: true,
        }
      } else if (absence.statut === StatutDemande.REJETEE) {
        watermark = {
          text: 'REJETÉ',
          color: '#f44336',
          opacity: 0.1,
          angle: 45,
          fontSize: 80,
          bold: true,
        }
      }

      const docDefinition: TDocumentDefinitions = {
        pageSize: 'A4',
        pageMargins: [40, 50, 40, 60],
        watermark,
        content: [
          // Header
          {
            columns: [
              {
                width: '*',
                stack: [
                  { text: 'REPUBLIQUE DU SENEGAL', fontSize: 9, bold: true, alignment: 'center' as const },
                  { text: 'Un Peuple, Un but, Une Foi', fontSize: 8, bold: true, margin: [0, 2, 0, 5] as [number, number, number, number], alignment: 'center' as const },
                  ...(drapeauBase64 ? [{ image: drapeauBase64, width: 45, alignment: 'center' as const, margin: [0, 0, 0, 8] as [number, number, number, number] }] : []),
                  { text: "MINISTERE DE L'ENSEIGNEMENT SUPERIEUR", fontSize: 8, bold: true, alignment: 'center' as const },
                  { text: "DE LA RECHERCHE ET DE L'INNOVATION", fontSize: 8, bold: true, alignment: 'center' as const },
                  { text: 'CENTRE REGIONAL DES OEUVRES UNIVERSITAIRES', fontSize: 8, bold: true, margin: [0, 5, 0, 0] as [number, number, number, number], alignment: 'center' as const },
                  { text: 'SOCIALES DE ZIGUINCHOR', fontSize: 8, bold: true, alignment: 'center' as const },
                ]
              }
            ]
          },
          { text: '', margin: [0, 5] },
          { 
            canvas: [
              {
                type: 'line',
                x1: 0,
                y1: 0,
                x2: 515,
                y2: 0,
                lineWidth: 2,
                lineColor: '#1a237e',
              }
            ],
            margin: [0, 0, 0, 15]
          },
          { text: "DEMANDE D'ABSENCE", fontSize: 18, bold: true, alignment: 'center', margin: [0, 0, 0, 20], color: '#1a237e' },
          
          // Informations générales
          {
            table: {
              widths: ['30%', '70%'],
              body: [
                [
                  { text: 'Numéro de référence', bold: true, fillColor: '#e8eaf6', margin: [8, 10], fontSize: 10 },
                  { text: refNumber, margin: [8, 10], fontSize: 10 }
                ],
                [
                  { text: "Date de la demande", bold: true, fillColor: '#e8eaf6', margin: [8, 10], fontSize: 10 },
                  { text: dayjs(absence.createdAt || new Date()).format('DD/MM/YYYY'), margin: [8, 10], fontSize: 10 }
                ],
              ]
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => '#c5cae9',
              vLineColor: () => '#c5cae9',
            },
            margin: [0, 0, 0, 20]
          },

          // Informations de l'employé
          {
            table: {
              widths: ['35%', '65%'],
              body: [
                [
                  { text: 'Nom et Prénom', bold: true, fillColor: '#f5f5f5', margin: [8, 10], fontSize: 10 },
                  { text: `${employe.prenom} ${employe.nom}`, margin: [8, 10], fontSize: 10 }
                ],
                [
                  { text: 'Matricule', bold: true, fillColor: '#f5f5f5', margin: [8, 10], fontSize: 10 },
                  { text: employe.matricule_de_solde || employe.code || '-', margin: [8, 10], fontSize: 10 }
                ],
                [
                  { text: 'Poste / Fonction', bold: true, fillColor: '#f5f5f5', margin: [8, 10], fontSize: 10 },
                  { text: employe.poste || '-', margin: [8, 10], fontSize: 10 }
                ],
                [
                  { text: "Type d'absence", bold: true, fillColor: '#f5f5f5', margin: [8, 10], fontSize: 10 },
                  { text: typeConfig.label, margin: [8, 10], fontSize: 10 }
                ],
                [
                  { text: 'Date de début', bold: true, fillColor: '#f5f5f5', margin: [8, 10], fontSize: 10 },
                  { text: dayjs(absence.date_debut).format('DD/MM/YYYY'), margin: [8, 10], fontSize: 10 }
                ],
                [
                  { text: 'Date de fin', bold: true, fillColor: '#f5f5f5', margin: [8, 10], fontSize: 10 },
                  { text: dayjs(absence.date_fin).format('DD/MM/YYYY'), margin: [8, 10], fontSize: 10 }
                ],
                [
                  { text: 'Durée', bold: true, fillColor: '#f5f5f5', margin: [8, 10], fontSize: 10 },
                  { text: `${nbJours} jour(s)`, margin: [8, 10], fontSize: 10 }
                ],
                [
                  { text: 'Statut actuel', bold: true, fillColor: '#f5f5f5', margin: [8, 10], fontSize: 10 },
                  { 
                    text: statutConfig.label, 
                    margin: [8, 10], 
                    fontSize: 10,
                    color: statutConfig.color === 'green' ? '#2e7d32' : statutConfig.color === 'red' ? '#c62828' : statutConfig.color === 'orange' ? '#ef6c00' : '#333333'
                  }
                ],
              ]
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => '#e0e0e0',
              vLineColor: () => '#e0e0e0',
            },
            margin: [0, 0, 0, 20]
          },

          // Motif dans un encadré
          {
            stack: [
              { text: 'Motif de l\'absence', bold: true, fontSize: 11, margin: [0, 0, 0, 8] },
              {
                table: {
                  body: [
                    [
                      {
                        text: absence.motif || 'Aucun motif spécifié',
                        margin: [10, 10],
                        fontSize: 10,
                        alignment: 'justify'
                      }
                    ]
                  ]
                },
                layout: {
                  hLineWidth: () => 1,
                  vLineWidth: () => 1,
                  hLineColor: () => '#1a237e',
                  vLineColor: () => '#1a237e',
                }
              }
            ],
            margin: [0, 0, 0, 30]
          },

          // Signatures
          {
            table: {
              widths: ['50%', '50%'],
              body: [
                [
                  {
                    stack: [
                      { text: "Signature de l'employé", alignment: 'center', fontSize: 10, bold: true, margin: [0, 0, 0, 30] },
                      { 
                        canvas: [
                          {
                            type: 'line',
                            x1: 20,
                            y1: 0,
                            x2: 200,
                            y2: 0,
                            lineWidth: 1,
                            lineColor: '#333333',
                          }
                        ],
                        margin: [0, 0, 0, 5]
                      },
                      { text: 'Date: ____________', alignment: 'center', fontSize: 9, color: '#666666' }
                    ],
                    margin: [0, 10]
                  },
                  {
                    stack: [
                      { text: 'Signature du responsable', alignment: 'center', fontSize: 10, bold: true, margin: [0, 0, 0, 30] },
                      { 
                        canvas: [
                          {
                            type: 'line',
                            x1: 20,
                            y1: 0,
                            x2: 200,
                            y2: 0,
                            lineWidth: 1,
                            lineColor: '#333333',
                          }
                        ],
                        margin: [0, 0, 0, 5]
                      },
                      { text: 'Date: ____________', alignment: 'center', fontSize: 9, color: '#666666' }
                    ],
                    margin: [0, 10]
                  }
                ]
              ]
            },
            layout: {
              hLineWidth: () => 0,
              vLineWidth: () => 0,
            }
          }
        ]
      }

      pdfMake.createPdf(docDefinition).open()
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error)
      message.error('Erreur lors de la génération du PDF')
    }
  }

  const getEmployeInfo = (absence: Absence): Employe | undefined => {
    if (typeof absence.employe === 'string') {
      return employes.find(e => e._id === absence.employe)
    }
    return absence.employe as Employe
  }

  const columns: ColumnsType<Absence> = [
    {
      title: 'Employé',
      key: 'employe',
      render: (_, record) => {
        const employe = getEmployeInfo(record)
        return employe ? (
          <div>
            <div className="font-medium">{employe.prenom} {employe.nom}</div>
            <div className="text-xs text-gray-500">{employe.matricule_de_solde || employe.code}</div>
          </div>
        ) : '-'
      },
      sorter: (a, b) => {
        const empA = getEmployeInfo(a)
        const empB = getEmployeInfo(b)
        return `${empA?.nom} ${empA?.prenom}`.localeCompare(`${empB?.nom} ${empB?.prenom}`)
      },
    },
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
      sorter: (a, b) => dayjs(a.date_debut).unix() - dayjs(b.date_debut).unix(),
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
      filters: Object.entries(typeAbsenceLabels).map(([value, config]) => ({
        text: config.label,
        value,
      })),
      onFilter: (value, record) => record.type === value,
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
      render: (statut: StatutDemande) => {
        const config = statutLabels[statut]
        return (
          <Tag color={config.color} className="flex items-center gap-1 w-fit">
            {config.icon}
            {config.label}
          </Tag>
        )
      },
      filters: Object.entries(statutLabels).map(([value, config]) => ({
        text: config.label,
        value,
      })),
      onFilter: (value, record) => record.statut === value,
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
          <Tooltip title="Imprimer">
            <Button
              type="text"
              size="small"
              icon={<Printer className="w-4 h-4 text-gray-500" />}
              onClick={() => generateAbsencePDF(record)}
            />
          </Tooltip>
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

  // Statistiques
  const stats = useMemo(() => {
    const enAttente = absences.filter(a => a.statut === StatutDemande.EN_ATTENTE).length
    const approuvees = absences.filter(a => a.statut === StatutDemande.APPROUVEE).length
    const rejetees = absences.filter(a => a.statut === StatutDemande.REJETEE).length
    return { enAttente, approuvees, rejetees, total: absences.length }
  }, [absences])

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <CalendarDays className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <Title level={4} style={{ margin: 0 }}>Gestion des absences</Title>
            <Text type="secondary">Gérez toutes les demandes d'absence</Text>
          </div>
        </div>
        <Space>
          <Button
            icon={<Download className="w-4 h-4" />}
            onClick={() => exportToExcel(filteredAbsences, absenceExportColumns, 'absences')}
          >
            Excel
          </Button>
          <Button
            icon={<Download className="w-4 h-4" />}
            onClick={() => exportToCSV(filteredAbsences, absenceExportColumns, 'absences')}
          >
            CSV
          </Button>
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
        </Space>
      </div>

      {/* Statistiques */}
      <Row gutter={16} className="mb-6">
        <Col xs={12} sm={6}>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700">{stats.total}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="border-l-4 border-l-orange-500">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.enAttente}</div>
              <div className="text-xs text-gray-500">En attente</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="border-l-4 border-l-green-500">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.approuvees}</div>
              <div className="text-xs text-gray-500">Approuvées</div>
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="border-l-4 border-l-red-500">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.rejetees}</div>
              <div className="text-xs text-gray-500">Rejetées</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filtres */}
      <Card className="mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="font-medium">Filtres</span>
          {hasActiveFilters && (
            <Button type="link" size="small" onClick={resetFilters}>
              Réinitialiser
            </Button>
          )}
        </div>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Rechercher..."
              prefix={<Search className="w-4 h-4 text-gray-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filtrer par employé"
              value={filterEmploye}
              onChange={setFilterEmploye}
              allowClear
              showSearch
              optionFilterProp="label"
              style={{ width: '100%' }}
              options={employes.map(emp => ({
                value: emp._id,
                label: `${emp.prenom} ${emp.nom}`,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Type"
              value={filterType}
              onChange={setFilterType}
              allowClear
              style={{ width: '100%' }}
              options={Object.entries(typeAbsenceLabels).map(([value, config]) => ({
                value,
                label: config.label,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Statut"
              value={filterStatut}
              onChange={setFilterStatut}
              allowClear
              style={{ width: '100%' }}
              options={Object.entries(statutLabels).map(([value, config]) => ({
                value,
                label: config.label,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <RangePicker
              value={filterDates}
              onChange={(dates) => setFilterDates(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
              format="DD/MM/YYYY"
              placeholder={['Début', 'Fin']}
              style={{ width: '100%' }}
            />
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredAbsences}
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

      {/* Modal Create/Edit */}
      <Modal
        title={editingAbsence ? 'Modifier l\'absence' : 'Nouvelle absence'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          setEditingAbsence(null)
          form.resetFields()
        }}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="employe"
            label="Employé"
            rules={[{ required: true, message: 'L\'employé est requis' }]}
          >
            <Select
              placeholder="Sélectionner un employé"
              showSearch={
                {
                  optionFilterProp: 'label',
                  filterOption: (input, option: any) => {
                    const label = option?.label?.toLowerCase();
                    return label?.includes(input.toLowerCase());
                  },
                }
              }
              disabled={!!editingAbsence}
              options={employes.map(emp => ({
                value: emp._id,
                label: `${emp.prenom} ${emp.nom} (${emp.matricule_de_solde || emp.code || ''})`,
              }))}
            />
          </Form.Item>

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

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
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
          </div>
        </Form>
      </Modal>
    </div>
  )
}
