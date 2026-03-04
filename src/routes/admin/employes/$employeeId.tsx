import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Typography, Card, Button, Space, Tabs, Spin, Tag, Popconfirm, message } from 'antd'
import { ChevronLeft, Power } from 'lucide-react'
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
    queryFn: () => EmployeService.getOne(employeeId),
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

  const items = [
    {
      key: 'informations',
      label: 'Informations',
      children: <EmployeInformations employe={employe} />
    },
    {
      key: 'professionnal_card',
      label: 'Carte professionnelle',
      children: <ProfessionalCard employe={employe} />
    },
    {
      key: 'nominations',
      label: 'Nominations',
      children: <EmployeNominations employeId={employeeId} />
    },
    {
      key: 'attributions',
      label: 'Attributions',
      children: <EmployeAttributions employeId={employeeId} />
    },
    {
      key: 'exclusions',
      label: 'Exclusions',
      children: <EmployeExclusions employeId={employeeId} />
    },
    {
      key: 'bulletins',
      label: 'Bulletins',
      children: <EmployeBulletins employeId={employeeId} />
    },
    {
      key: 'absences',
      label: 'Absences',
      children: <EmployeAbsences employeId={employeeId} />
    },
    {
      key: 'conges',
      label: 'Congés',
      children: <EmployeConges employeId={employeeId} />
    },
    {
      key: 'pieces-jointes',
      label: 'Pièces jointes',
      children: <EmployePiecesJointes employeId={employeeId} />
    }
  ]

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
          <Title level={4} className="mb-0!">
            {employe.prenom} {employe.nom}
          </Title>
          <Tag color={employe.is_actif ? 'green' : 'red'}>
            {employe.is_actif ? 'Actif' : 'Inactif'}
          </Tag>
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
