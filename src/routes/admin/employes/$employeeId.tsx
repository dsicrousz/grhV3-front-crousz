import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Typography, Card, Button, Space, Tabs, Spin, Tag, Popconfirm, message } from 'antd'
import { ChevronLeft, Power, FileText, MapPin } from 'lucide-react'
import { EmployeService } from '@/services/employe.service'
import { EmployeInformations } from '@/components/employe/informations'
import { EmployeNominations } from '@/components/employe/nominations'
import { EmployeAttributions } from '@/components/employe/attributions'
import { EmployeExclusions } from '@/components/employe/exclusions'
import { ProfessionalCard } from '@/components/employe/professional_card'
import { EmployeBulletins } from '@/components/employe/bulletins'
import { EmployeAbsences } from '@/components/employe/absences'
import { EmployeConges } from '@/components/employe/conges'
import { EmployePiecesJointes } from '@/components/employe/pieces-jointes'
import { EmployeContrats } from '@/components/employe/contrats'
import { EmployeAffectationsSite } from '@/components/employe/affectations-site'
import { EmployeHistorique } from '@/components/employe/historique'

const { Title } = Typography

export const Route = createFileRoute('/admin/employes/$employeeId')({
  component: EmployeDetailsPage,
})

function EmployeDetailsPage() {
  const { employeeId } = Route.useParams()
  const navigate = Route.useNavigate()
  const queryClient = useQueryClient()

  const { data: employe, isLoading: isLoadingEmploye } = useQuery({
    queryKey: ['employe', employeeId],
    queryFn: async () => {
      const all = await EmployeService.getAllAgregated()
      return all.find((e) => e._id === employeeId) ?? await EmployeService.getOne(employeeId)
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (isActif: boolean) => EmployeService.toggle(employeeId, { is_actif: isActif }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employe', employeeId] })
      queryClient.invalidateQueries({ queryKey: ['employes'] })
      message.success(employe?.is_actif ? 'Employé désactivé avec succès' : 'Employé activé avec succès')
    },
    onError: () => {
      message.error('Une erreur est survenue')
    }
  })

  if (isLoadingEmploye) return <div className="flex items-center justify-center h-screen"><Spin size="large" /></div>
  if (!employe) return <div>Employé non trouvé</div>

  const isCDI = employe.contrat_actif?.type === 'CDI'

  const items = [
    {
      key: 'informations',
      label: 'Informations',
      children: <EmployeInformations employe={employe} />
    },
    ...(isCDI ? [{
      key: 'professionnal_card',
      label: 'Carte professionnelle',
      children: <ProfessionalCard employe={employe} />
    }] : []),
    ...(isCDI ? [{
      key: 'nominations',
      label: 'Nominations',
      children: <EmployeNominations employeId={employeeId} />
    }] : []),
    ...(isCDI ? [{
      key: 'attributions',
      label: 'Attributions',
      children: <EmployeAttributions employeId={employeeId} />
    }] : []),
    ...(isCDI ? [{
      key: 'exclusions',
      label: 'Exclusions',
      children: <EmployeExclusions employeId={employeeId} />
    }] : []),
    {
      key: 'bulletins',
      label: 'Bulletins',
      children: <EmployeBulletins employeId={employeeId} />
    },
    ...(isCDI ? [{
      key: 'absences',
      label: 'Absences',
      children: <EmployeAbsences employeId={employeeId} />
    }] : []),
    ...(isCDI ? [{
      key: 'conges',
      label: 'Congés',
      children: <EmployeConges employeId={employeeId} />
    }] : []),
    {
      key: 'contrats',
      label: 'Contrats',
      children: <EmployeContrats employeId={employeeId} />
    },
    {
      key: 'affectations-site',
      label: 'Affectations site',
      children: <EmployeAffectationsSite employeId={employeeId} />
    },
    {
      key: 'pieces-jointes',
      label: 'Pièces jointes',
      children: <EmployePiecesJointes employeId={employeeId} />
    },
    {
      key: 'historique',
      label: 'Historique',
      children: <EmployeHistorique employeId={employeeId} />
    }
  ]

  const contrat = employe.contrat_actif
  const site = employe.affectation_site
    ? typeof employe.affectation_site.site === 'object' ? employe.affectation_site.site : null
    : null

  return (
    <div className="space-y-6 p-6">
      <Space className="w-full justify-between">
        <Space>
          <Button 
            icon={<ChevronLeft className="w-4 h-4" />}
            onClick={() => navigate({ to: '/admin/employes' })}
          >
            Retour
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Title level={4} className="mb-0!">
                {employe.prenom} {employe.nom}
              </Title>
              <Tag color={employe.is_actif ? 'green' : 'red'}>
                {employe.is_actif ? 'Actif' : 'Inactif'}
              </Tag>
              {contrat && (
                <Tag color={contrat.type === 'CDI' ? 'green' : contrat.type === 'CDD' ? 'orange' : 'blue'}>
                  {contrat.type}
                </Tag>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1">
              {contrat?.poste && (
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <FileText className="w-3 h-3" />{typeof contrat.poste === 'string' ? contrat.poste : contrat.poste?.nom}
                </span>
              )}
              {site && (
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />{site.nom}{site.ville ? ` — ${site.ville}` : ''}
                </span>
              )}
            </div>
          </div>
        </Space>
        <Popconfirm
          title={employe.is_actif ? "Désactiver l'employé" : "Activer l'employé"}
          description={employe.is_actif 
            ? "Êtes-vous sûr de vouloir désactiver cet employé ?" 
            : "Êtes-vous sûr de vouloir activer cet employé ?"}
          onConfirm={() => toggleMutation.mutate(!employe.is_actif)}
          okText="Oui"
          cancelText="Non"
        >
          <Button 
            type={employe.is_actif ? 'default' : 'primary'}
            danger={employe.is_actif}
            icon={<Power className="w-4 h-4" />}
            loading={toggleMutation.isPending}
          >
            {employe.is_actif ? 'Désactiver' : 'Activer'}
          </Button>
        </Popconfirm>
      </Space>

      <Card>
        <Tabs
          defaultActiveKey="informations"
          items={items}
          size="large"
        />
      </Card>
    </div>
  )
}
