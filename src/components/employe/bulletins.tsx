import { Typography, Spin, Tag, Table, Button, Empty } from 'antd'
import { Eye, FileText } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { BulletinService } from '@/services/bulletin.service'
import type { Bulletin } from '@/types/bulletin'
import type { Lot } from '@/types/lot'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useNavigate } from '@tanstack/react-router'
import { env } from '@/env'

const { Title, Text } = Typography

interface EmployeBulletinsProps {
  employeId: string
}

export const EmployeBulletins = ({ employeId }: EmployeBulletinsProps) => {
  const navigate = useNavigate()

  const { data: bulletins = [], isLoading } = useQuery({
    queryKey: ['bulletins', 'employe', employeId],
    queryFn: () => BulletinService.getByEmploye(employeId),
    enabled: !!employeId
  })

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(montant)
  }

  const columns: ColumnsType<Bulletin> = [
    {
      title: 'Lot',
      key: 'lot',
      render: (_, record) => {
        const lot = record.lot as Lot
        return (
          <div>
            <Text strong>{lot?.libelle || 'N/A'}</Text>
            {lot?.debut && lot?.fin && (
              <div className="text-gray-500 text-sm">
                {dayjs(lot.debut).format('DD/MM/YYYY')} - {dayjs(lot.fin).format('DD/MM/YYYY')}
              </div>
            )}
          </div>
        )
      }
    },
    {
      title: 'Total Imposable',
      dataIndex: 'totalIm',
      key: 'totalIm',
      align: 'right',
      render: (value) => <Text>{formatMontant(value)}</Text>
    },
    {
      title: 'Total Non Imposable',
      dataIndex: 'totalNI',
      key: 'totalNI',
      align: 'right',
      render: (value) => <Text>{formatMontant(value)}</Text>
    },
    {
      title: 'Total Retenues',
      dataIndex: 'totalRet',
      key: 'totalRet',
      align: 'right',
      render: (value) => <Text type="danger">{formatMontant(value)}</Text>
    },
    {
      title: 'Part Patronale',
      dataIndex: 'totalPP',
      key: 'totalPP',
      align: 'right',
      render: (value) => <Text>{formatMontant(value)}</Text>
    },
    {
      title: 'Net à Payer',
      dataIndex: 'nap',
      key: 'nap',
      align: 'right',
      render: (value) => <Text strong type="success">{formatMontant(value)}</Text>
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <div className="flex gap-2">
          {record.url && (
            <Button
              type="text"
              size="small"
              icon={<FileText className="w-4 h-4" />}
              onClick={() => window.open(env.VITE_APP_BACKEND + '/' + record.url, '_blank')}
              title="Voir le PDF"
            />
          )}
          <Button
            type="text"
            size="small"
            icon={<Eye className="w-4 h-4" />}
            onClick={() => {
              const lot = record.lot as Lot
              if (lot?._id) {
                navigate({ to: '/admin/lots/$lotId', params: { lotId: lot._id } })
              }
            }}
            title="Voir le lot"
          />
        </div>
      )
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <Title level={5} className="mb-0!">Bulletins de paie</Title>
        <Tag color="blue">{bulletins.length} bulletin(s)</Tag>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spin size="large" />
        </div>
      ) : bulletins.length === 0 ? (
        <Empty description="Aucun bulletin de paie" />
      ) : (
        <Table
          columns={columns}
          dataSource={bulletins}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          size="small"
        />
      )}
    </div>
  )
}
