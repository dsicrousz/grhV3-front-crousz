import { Typography, Descriptions, Space, Tag, Avatar, Tooltip, Spin, message } from 'antd'
import { Phone, MapPin, Calendar, Building2, Briefcase, User2, Camera } from 'lucide-react'
import type { Employe } from '@/types/employe'
import dayjs from 'dayjs'
import { useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { EmployeService } from '@/services/employe.service'
import { env } from '@/env'

const { Title, Text } = Typography

interface EmployeInformationsProps {
  employe: Employe
}

export const EmployeInformations = ({ employe }: EmployeInformationsProps) => {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadMutation = useMutation({
    mutationFn: (file: File) => EmployeService.uploadProfile(employe._id, file),
    onSuccess: () => {
      message.success('Photo de profil mise à jour')
      queryClient.invalidateQueries({ queryKey: ['employe', employe._id] })
      queryClient.invalidateQueries({ queryKey: ['employes'] })
    },
    onError: () => {
      message.error('Erreur lors de la mise à jour de la photo')
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadMutation.mutate(file)
    e.target.value = ''
  }
  const age = dayjs().diff(dayjs(employe.date_de_naissance), 'year')
  const contrat = employe.contrat_actif
  const anneesService = contrat?.date_debut
    ? dayjs().diff(dayjs(contrat.date_debut), 'year')
    : null

  const rawCat = contrat?.categorie
  const categorieObj = typeof rawCat === 'object' && rawCat ? rawCat : null

  const site = employe.affectation_site
    ? typeof employe.affectation_site.site === 'object'
      ? employe.affectation_site.site
      : null
    : null

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Tooltip title="Changer la photo de profil">
            <div
              className="relative cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <Spin spinning={uploadMutation.isPending}>
                <Avatar
                  size={120}
                  src={employe.profile ? `${env.VITE_R2_URL}/profiles/${employe.profile}` : undefined}
                  icon={!employe.profile && <User2 className="w-8 h-8" />}
                  className="border-2 border-gray-200"
                />
              </Spin>
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
          </Tooltip>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <div>
            <Title level={3} className="mb-1!">
              {employe.civilite}. {employe.prenom} {employe.nom}
            </Title>
            <Text type="secondary">{typeof contrat?.poste === 'string' ? contrat.poste : contrat?.poste?.nom || '—'}</Text>
          </div>
        </div>
        {contrat && (
          <Tag color={contrat.type === 'CDI' ? 'green' : contrat.type === 'CDD' ? 'orange' : 'blue'}>
            {contrat.type}
          </Tag>
        )}
      </div>

      <Descriptions
        title="Informations personnelles"
        column={2}
        items={[
          {
            key: 'telephone',
            label: 'Téléphone',
            children: (
              <Space>
                <Phone className="w-4 h-4" />
                <a href={`tel:${employe.telephone}`}>{employe.telephone}</a>
              </Space>
            )
          },
          {
            key: 'adresse',
            label: 'Adresse',
            children: (
              <Space>
                <MapPin className="w-4 h-4" />
                {employe.adresse}
              </Space>
            )
          },
          {
            key: 'age',
            label: 'Âge',
            children: (
              <Space>
                <Calendar className="w-4 h-4" />
                {age} ans
              </Space>
            )
          },
          {
            key: 'annees_service',
            label: 'Années de service',
            children: (
              <Space>
                <Briefcase className="w-4 h-4" />
                {anneesService != null ? `${anneesService} ans` : '—'}
              </Space>
            )
          },
        ]}
      />

      <Descriptions
        title="Informations administratives"
        column={2}
        items={[
          {
            key: 'matricule',
            label: 'Matricule de solde',
            children: (
              <Space>
                <User2 className="w-4 h-4" />
                {employe.contrat_actif?.matricule_de_solde || '—'}
              </Space>
            )
          },
          {
            key: 'npp',
            label: 'NPP',
            children: (
              <Space>
                <Briefcase className="w-4 h-4" />
                {employe.npp || '—'}
              </Space>
            )
          },
          {
            key: 'categorie',
            label: 'Catégorie',
            children: (
              <Space>
                <Building2 className="w-4 h-4" />
                {categorieObj ? `${categorieObj.code} - ${categorieObj.valeur}` : '—'}
              </Space>
            )
          },
          {
            key: 'site',
            label: 'Site',
            children: (
              <Space>
                <MapPin className="w-4 h-4" />
                {site ? `${site.nom}${site.ville ? ` — ${site.ville}` : ''}` : '—'}
              </Space>
            )
          },
        ]}
      />
    </div>
  )
}
