import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Typography, Card, Button, Space, Descriptions, Tag, Steps, Spin, Divider } from 'antd'
import { ChevronLeft, Calendar, FileText, File } from 'lucide-react'
import { Empty } from 'antd'
import { LotService } from '@/services/lot.service'
import { StateLot } from '@/types/lot'
import dayjs from 'dayjs'
import { env } from '@/env'

const { Title, Text } = Typography

export const Route = createFileRoute('/admin/lots/$lotId')({
  component: LotDetailsPage,
})

function LotDetailsPage() {
  const { lotId } = Route.useParams()
  const navigate = Route.useNavigate()

  const { data: lot, isLoading } = useQuery({
    queryKey: ['lot', lotId],
    queryFn: () => LotService.getOne(lotId),
  })

  console.log(lot)

  const getStateStep = (etat: StateLot) => {
    switch(etat) {
      case StateLot.BROUILLON:
        return 0
      case StateLot.WAITING1:
        return 1
      case StateLot.WAITING2:
        return 2
      case StateLot.VALIDE:
        return 3
      default:
        return 0
    }
  }

  const getStateColor = (etat: StateLot) => {
    switch(etat) {
      case StateLot.BROUILLON:
        return 'default'
      case StateLot.WAITING1:
        return 'processing'
      case StateLot.WAITING2:
        return 'warning'
      case StateLot.VALIDE:
        return 'success'
      default:
        return 'default'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" />
      </div>
    )
  }

  if (!lot) {
    return (
      <div className="p-6">
        <Space>
          <Button 
            icon={<ChevronLeft className="w-4 h-4" />}
            onClick={() => navigate({ to: '/admin/lots' })}
          >
            Retour
          </Button>
          <Text type="danger">Lot non trouvé</Text>
        </Space>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <Space className="w-full justify-between">
        <Space>
          <Button 
            icon={<ChevronLeft className="w-4 h-4" />}
            onClick={() => navigate({ to: '/admin/lots' })}
          >
            Retour
          </Button>
          <Title level={4} className="mb-0!">
            {lot.libelle}
          </Title>
          <Tag color={getStateColor(lot.etat)}>{lot.etat}</Tag>
        </Space>
      </Space>

      <Card>
        <div className="space-y-6">
          <div>
            <Title level={5} className="mb-4!">
              <FileText className="w-4 h-4 inline mr-2" />
              Informations du lot
            </Title>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Libellé">{lot.libelle}</Descriptions.Item>
              <Descriptions.Item label="État">
                <Tag color={getStateColor(lot.etat)}>{lot.etat}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Date de début">
                {dayjs(lot.debut).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Date de fin">
                {dayjs(lot.fin).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Publié">
                <Tag color={lot.isPublished ? 'success' : 'default'}>
                  {lot.isPublished ? 'Oui' : 'Non'}
                </Tag>
              </Descriptions.Item>
              {lot.createdAt && (
                <Descriptions.Item label="Créé le">
                  {dayjs(lot.createdAt).format('DD/MM/YYYY HH:mm')}
                </Descriptions.Item>
              )}
              {lot.updatedAt && (
                <Descriptions.Item label="Modifié le">
                  {dayjs(lot.updatedAt).format('DD/MM/YYYY HH:mm')}
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>

          <Divider />

          <div>
            <Title level={5} className="mb-4!">
              <Calendar className="w-4 h-4 inline mr-2" />
              Progression
            </Title>
            <Steps
              current={getStateStep(lot.etat)}
              items={[
                { title: 'Brouillon', description: 'Lot créé' },
                { title: 'Soumis', description: 'En attente de validation' },
                { title: 'En cours', description: 'Validation en cours' },
                { title: 'Validé', description: 'Lot validé' }
              ]}
            />
          </div>

          {lot.url && (
            <>
              <Divider />
              <div>
                <Title level={5} className="mb-4!">
                  <File className="w-4 h-4 inline mr-2" />
                  Document PDF
                </Title>
                <div className="border rounded-lg overflow-hidden" style={{ height: '600px' }}>
                  <iframe
                    src={env.VITE_APP_BACKEND + '/' + lot.url}
                    width="100%"
                    height="100%"
                    title="PDF du lot"
                    style={{ border: 'none' }}
                  />
                </div>
              </div>
            </>
          )}

          {!lot.url && (
            <>
              <Divider />
              <div>
                <Title level={5} className="mb-4!">
                  <File className="w-4 h-4 inline mr-2" />
                  Document PDF
                </Title>
                <Empty description="Aucun document PDF disponible" />
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
