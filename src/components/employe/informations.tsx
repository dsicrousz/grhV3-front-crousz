import { Typography, Descriptions, Space, Tag } from 'antd'
import { Phone, MapPin, Calendar, Building2, Briefcase, User2 } from 'lucide-react'
import type { Employe } from '@/types/employe'
import { TypeEmploye } from '@/types/employe'
import dayjs from 'dayjs'

const { Title, Text } = Typography

interface EmployeInformationsProps {
  employe: Employe
}

export const EmployeInformations = ({ employe }: EmployeInformationsProps) => {
  const age = dayjs().diff(dayjs(employe.date_de_naissance), 'year')
  const anneesService = dayjs().diff(dayjs(employe.date_de_recrutement), 'year')

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <Title level={3} className="mb-1!">
            {employe.civilite}. {employe.prenom} {employe.nom}
          </Title>
          <Text type="secondary">{employe.poste}</Text>
        </div>
        <Tag color={employe.type === TypeEmploye.CDI ? 'green' : 'orange'}>
          {employe.type}
        </Tag>
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
                {anneesService} ans
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
                {employe.matricule_de_solde}
              </Space>
            )
          },
          {
            key: 'npp',
            label: 'NPP',
            children: (
              <Space>
                <Briefcase className="w-4 h-4" />
                {employe.npp}
              </Space>
            )
          },
          {
            key: 'categorie',
            label: 'Catégorie',
            children: (
              <Space>
                <Building2 className="w-4 h-4" />
                {employe.categorie?.code} - {employe.categorie?.valeur}
              </Space>
            )
          },
          {
            key: 'recrutement',
            label: 'Date de recrutement',
            children: (
              <Space>
                <Calendar className="w-4 h-4" />
                {dayjs(employe.date_de_recrutement).format('DD/MM/YYYY')}
              </Space>
            )
          },
        ]}
      />
    </div>
  )
}
