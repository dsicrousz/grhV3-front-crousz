import { useState, useRef } from 'react'
import { Typography, Button, Space, Card, Spin, Modal, Form, Select, Input, DatePicker, message, Popconfirm, Tag, Tooltip, Empty } from 'antd'
import { Plus, Trash2, Download, FileText, Eye, AlertTriangle, Paperclip, File, Image, FileSpreadsheet } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { PieceJointe } from '@/types/piece-jointe'
import { TypePieceJointe } from '@/types/piece-jointe'
import type { CreatePieceJointeDto } from '@/types/piece-jointe'
import { PieceJointeService } from '@/services/piece-jointe.service'
import { env } from '@/env'
import dayjs from 'dayjs'

const { Title, Text } = Typography

interface EmployePiecesJointesProps {
  employeId: string
}

const typeLabels: Record<TypePieceJointe, string> = {
  [TypePieceJointe.CONTRAT]: 'Contrat',
  [TypePieceJointe.DIPLOME]: 'Diplôme',
  [TypePieceJointe.CV]: 'CV',
  [TypePieceJointe.PIECE_IDENTITE]: 'Pièce d\'identité',
  [TypePieceJointe.CERTIFICAT_TRAVAIL]: 'Certificat de travail',
  [TypePieceJointe.ATTESTATION]: 'Attestation',
  [TypePieceJointe.FICHE_POSTE]: 'Fiche de poste',
  [TypePieceJointe.EVALUATION]: 'Évaluation',
  [TypePieceJointe.FORMATION]: 'Formation',
  [TypePieceJointe.MEDICAL]: 'Médical',
  [TypePieceJointe.AUTRE]: 'Autre',
}

const typeColors: Record<TypePieceJointe, string> = {
  [TypePieceJointe.CONTRAT]: 'purple',
  [TypePieceJointe.DIPLOME]: 'green',
  [TypePieceJointe.CV]: 'cyan',
  [TypePieceJointe.PIECE_IDENTITE]: 'blue',
  [TypePieceJointe.CERTIFICAT_TRAVAIL]: 'gold',
  [TypePieceJointe.ATTESTATION]: 'orange',
  [TypePieceJointe.FICHE_POSTE]: 'geekblue',
  [TypePieceJointe.EVALUATION]: 'volcano',
  [TypePieceJointe.FORMATION]: 'lime',
  [TypePieceJointe.MEDICAL]: 'red',
  [TypePieceJointe.AUTRE]: 'default',
}

const getFileIcon = (mimetype?: string) => {
  if (!mimetype) return <File className="w-8 h-8 text-gray-400" />
  if (mimetype.startsWith('image/')) return <Image className="w-8 h-8 text-pink-500" />
  if (mimetype.includes('spreadsheet') || mimetype.includes('excel')) return <FileSpreadsheet className="w-8 h-8 text-green-500" />
  if (mimetype.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />
  return <File className="w-8 h-8 text-blue-500" />
}

const formatSize = (bytes?: number) => {
  if (!bytes) return '-'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const isExpired = (date?: string) => {
  if (!date) return false
  return dayjs(date).isBefore(dayjs(), 'day')
}

const isExpiringSoon = (date?: string, days = 30) => {
  if (!date) return false
  const expDate = dayjs(date)
  return expDate.isAfter(dayjs()) && expDate.diff(dayjs(), 'day') <= days
}

export const EmployePiecesJointes = ({ employeId }: EmployePiecesJointesProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filterType, setFilterType] = useState<TypePieceJointe | null>(null)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: pieces = [], isLoading } = useQuery({
    queryKey: ['pieces-jointes', employeId],
    queryFn: () => PieceJointeService.getByEmploye(employeId),
    enabled: !!employeId,
  })

  const uploadMutation = useMutation({
    mutationFn: ({ data, fichier }: { data: CreatePieceJointeDto; fichier: File }) =>
      PieceJointeService.upload(data, fichier),
    onSuccess: () => {
      message.success('Pièce jointe ajoutée avec succès')
      setIsModalOpen(false)
      setSelectedFile(null)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['pieces-jointes', employeId] })
    },
    onError: () => {
      message.error("Erreur lors de l'ajout de la pièce jointe")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => PieceJointeService.softDelete(id),
    onSuccess: () => {
      message.success('Pièce jointe supprimée avec succès')
      queryClient.invalidateQueries({ queryKey: ['pieces-jointes', employeId] })
    },
    onError: () => {
      message.error('Erreur lors de la suppression')
    },
  })

  const handleSubmit = (values: any) => {
    if (!selectedFile) {
      message.warning('Veuillez sélectionner un fichier')
      return
    }

    const data: CreatePieceJointeDto = {
      nom: values.nom,
      type: values.type,
      description: values.description,
      date_document: values.date_document?.toISOString(),
      date_expiration: values.date_expiration?.toISOString(),
      employe: employeId,
    }

    uploadMutation.mutate({ data, fichier: selectedFile })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        message.error('Le fichier ne doit pas dépasser 10 Mo')
        return
      }
      setSelectedFile(file)
      if (!form.getFieldValue('nom')) {
        form.setFieldValue('nom', file.name.replace(/\.[^/.]+$/, ''))
      }
    }
  }

  const handleDownload = (piece: PieceJointe) => {
    if (piece.url) {
      window.open(`${env.VITE_APP_BACKEND}/${piece.url}`, '_blank')
    }
  }

  const filteredPieces = filterType
    ? pieces.filter((p: PieceJointe) => p.type === filterType)
    : pieces

  // Stats
  const totalPieces = pieces.length
  const expiredCount = pieces.filter((p: PieceJointe) => isExpired(p.date_expiration)).length
  const expiringSoonCount = pieces.filter((p: PieceJointe) => isExpiringSoon(p.date_expiration)).length
  const totalSize = pieces.reduce((sum: number, p: PieceJointe) => sum + (p.taille || 0), 0)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <Title level={5} className="mb-0!">Pièces jointes</Title>
          <Tag>{totalPieces} document{totalPieces > 1 ? 's' : ''}</Tag>
          {expiredCount > 0 && (
            <Tag color="red" icon={<AlertTriangle className="w-3 h-3 inline mr-1" />}>
              {expiredCount} expiré{expiredCount > 1 ? 's' : ''}
            </Tag>
          )}
          {expiringSoonCount > 0 && (
            <Tag color="orange">
              {expiringSoonCount} expire bientôt
            </Tag>
          )}
        </div>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setSelectedFile(null)
            form.resetFields()
            setIsModalOpen(true)
          }}
        >
          Ajouter un document
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-2 flex-wrap">
        <Tag
          className="cursor-pointer"
          color={!filterType ? 'blue' : 'default'}
          onClick={() => setFilterType(null)}
        >
          Tous ({totalPieces})
        </Tag>
        {Object.entries(typeLabels).map(([key, label]) => {
          const count = pieces.filter((p: PieceJointe) => p.type === key).length
          if (count === 0) return null
          return (
            <Tag
              key={key}
              className="cursor-pointer"
              color={filterType === key ? typeColors[key as TypePieceJointe] : 'default'}
              onClick={() => setFilterType(filterType === key ? null : key as TypePieceJointe)}
            >
              {label} ({count})
            </Tag>
          )
        })}
      </div>

      {/* Liste des pièces jointes */}
      {isLoading ? (
        <Spin />
      ) : filteredPieces.length === 0 ? (
        <Empty
          description={filterType ? 'Aucun document de ce type' : 'Aucune pièce jointe'}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <div className="space-y-3">
          {filteredPieces.map((piece: PieceJointe) => {
            const expired = isExpired(piece.date_expiration)
            const expiringSoon = isExpiringSoon(piece.date_expiration)

            return (
              <Card
                key={piece._id}
                size="small"
                className={`transition-all ${expired ? 'border-red-300 bg-red-50/50' : expiringSoon ? 'border-orange-300 bg-orange-50/30' : 'bg-gray-50'}`}
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="shrink-0">
                    {getFileIcon(piece.mimetype)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Text strong className="truncate">{piece.nom}</Text>
                      <Tag color={typeColors[piece.type]} className="text-xs">
                        {typeLabels[piece.type] || piece.type}
                      </Tag>
                      {expired && (
                        <Tag color="red" className="text-xs">
                          Expiré
                        </Tag>
                      )}
                      {expiringSoon && !expired && (
                        <Tag color="orange" className="text-xs">
                          Expire bientôt
                        </Tag>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      {piece.nom_fichier && (
                        <span className="truncate max-w-[200px]" title={piece.nom_fichier}>
                          <Paperclip className="w-3 h-3 inline mr-0.5" />
                          {piece.nom_fichier}
                        </span>
                      )}
                      <span>{formatSize(piece.taille)}</span>
                      {piece.date_document && (
                        <span>Doc: {dayjs(piece.date_document).format('DD/MM/YYYY')}</span>
                      )}
                      {piece.date_expiration && (
                        <span className={expired ? 'text-red-500 font-medium' : expiringSoon ? 'text-orange-500' : ''}>
                          Exp: {dayjs(piece.date_expiration).format('DD/MM/YYYY')}
                        </span>
                      )}
                      {piece.createdAt && (
                        <span>Ajouté le {dayjs(piece.createdAt).format('DD/MM/YYYY')}</span>
                      )}
                    </div>
                    {piece.description && (
                      <Text type="secondary" className="text-xs mt-1 block">{piece.description}</Text>
                    )}
                  </div>

                  {/* Actions */}
                  <Space size="small">
                    {piece.url && (
                      <>
                        <Tooltip title="Télécharger">
                          <Button
                            type="text"
                            size="small"
                            icon={<Download className="w-4 h-4" />}
                            onClick={() => handleDownload(piece)}
                          />
                        </Tooltip>
                        <Tooltip title="Visualiser">
                          <Button
                            type="text"
                            size="small"
                            icon={<Eye className="w-4 h-4" />}
                            onClick={() => handleDownload(piece)}
                          />
                        </Tooltip>
                      </>
                    )}
                    <Popconfirm
                      title="Supprimer cette pièce jointe ?"
                      description="Cette action est irréversible."
                      onConfirm={() => deleteMutation.mutate(piece._id)}
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
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Résumé taille */}
      {totalPieces > 0 && (
        <div className="text-xs text-gray-400 text-right">
          Taille totale : {formatSize(totalSize)}
        </div>
      )}

      {/* Modal ajout */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Paperclip className="w-5 h-5 text-blue-600" />
            <span>Ajouter une pièce jointe</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          setSelectedFile(null)
          form.resetFields()
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {/* File picker */}
          <div className="mb-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.bmp,.webp"
            />
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  {getFileIcon(selectedFile.type)}
                  <div className="text-left">
                    <Text strong>{selectedFile.name}</Text>
                    <div className="text-xs text-gray-500">{formatSize(selectedFile.size)}</div>
                  </div>
                  <Button
                    type="text"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFile(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                  >
                    Changer
                  </Button>
                </div>
              ) : (
                <div>
                  <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <Text type="secondary">Cliquez pour sélectionner un fichier</Text>
                  <div className="text-xs text-gray-400 mt-1">PDF, Word, Excel, Images — Max 10 Mo</div>
                </div>
              )}
            </div>
          </div>

          <Form.Item
            name="nom"
            label="Nom du document"
            rules={[{ required: true, message: 'Le nom est requis' }]}
          >
            <Input placeholder="Ex: CNI de l'employé" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="type"
              label="Type"
              rules={[{ required: true, message: 'Le type est requis' }]}
            >
              <Select
                placeholder="Sélectionner un type"
                options={Object.entries(typeLabels).map(([value, label]) => ({ value, label }))}
              />
            </Form.Item>

            <Form.Item
              name="date_document"
              label="Date du document"
            >
              <DatePicker className="w-full" format="DD/MM/YYYY" />
            </Form.Item>
          </div>

          <Form.Item
            name="date_expiration"
            label="Date d'expiration"
          >
            <DatePicker className="w-full" format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={2} placeholder="Description optionnelle..." />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={uploadMutation.isPending}
                disabled={!selectedFile}
              >
                Ajouter
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
