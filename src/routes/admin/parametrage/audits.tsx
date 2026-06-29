import { createFileRoute } from '@tanstack/react-router'
import { Card, Table, Tag, Typography, Input, Space, Button, Tooltip } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { SessionAuditService } from '@/services/session-audit.service'
import { TypeActionSession } from '@/types/session-audit'
import type { SessionAudit } from '@/types/session-audit'
import { LogIn, LogOut, Search, RefreshCw, Monitor, Globe, Clock } from 'lucide-react'
import { useState } from 'react'
import dayjs from 'dayjs'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography

export const Route = createFileRoute('/admin/parametrage/audits')({
  component: SessionAuditPage,
})

const actionConfig: Record<TypeActionSession, { color: string; icon: React.ReactNode; label: string }> = {
  [TypeActionSession.LOGIN]: { color: 'green', icon: <LogIn className="w-3.5 h-3.5" />, label: 'Connexion' },
  [TypeActionSession.LOGOUT]: { color: 'orange', icon: <LogOut className="w-3.5 h-3.5" />, label: 'Déconnexion' },
}

function SessionAuditPage() {
  const [search, setSearch] = useState('')

  const { data: audits = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['session-audits'],
    queryFn: () => SessionAuditService.findRecent(100),
  })
  const filteredAudits = audits.filter((audit) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      audit.userEmail?.toLowerCase().includes(q) ||
      audit.ipAddress?.toLowerCase().includes(q) ||
      audit.action?.toLowerCase().includes(q)
    )
  })

  const columns: ColumnsType<SessionAudit> = [
    {
      title: 'Utilisateur',
      dataIndex: 'userEmail',
      key: 'userEmail',
      width: 250,
      render: (email: string) => (
        <Text strong className="text-sm">{email || '—'}</Text>
      ),
      sorter: (a, b) => (a.userEmail || '').localeCompare(b.userEmail || ''),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 140,
      render: (action: TypeActionSession) => {
        const config = actionConfig[action]
        if (!config) return <Tag>{action}</Tag>
        return (
          <Tag color={config.color} className="flex items-center gap-1 w-fit">
            {config.icon}
            {config.label}
          </Tag>
        )
      },
      filters: Object.entries(actionConfig).map(([value, config]) => ({
        text: config.label,
        value,
      })),
      onFilter: (value, record) => record.action === value,
    },
    {
      title: 'Adresse IP',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 160,
      render: (ip: string) => (
        <div className="flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <Text className="text-sm font-mono">{ip || '—'}</Text>
        </div>
      ),
    },
    {
      title: 'Navigateur / OS',
      dataIndex: 'userAgent',
      key: 'userAgent',
      ellipsis: true,
      render: (ua: string) => {
        if (!ua) return <Text type="secondary">—</Text>
        let browser = 'Inconnu'
        let os = 'Inconnu'
        if (ua.includes('Firefox')) browser = 'Firefox'
        else if (ua.includes('Edg')) browser = 'Edge'
        else if (ua.includes('Chrome')) browser = 'Chrome'
        else if (ua.includes('Safari')) browser = 'Safari'
        if (ua.includes('Windows')) os = 'Windows'
        else if (ua.includes('Mac')) os = 'macOS'
        else if (ua.includes('Linux')) os = 'Linux'
        else if (ua.includes('Android')) os = 'Android'
        else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'
        return (
          <Tooltip title={ua}>
            <div className="flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-slate-400" />
              <Text className="text-sm">{browser} · {os}</Text>
            </div>
          </Tooltip>
        )
      },
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => (
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <Text className="text-sm">{dayjs(date).format('DD/MM/YYYY HH:mm:ss')}</Text>
        </div>
      ),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: 'descend',
    },
  ]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title level={4} style={{ margin: 0 }}>Audit des sessions</Title>
          <Text type="secondary">Historique des connexions et déconnexions des utilisateurs</Text>
        </div>
        <Space>
          <Input
            prefix={<Search className="w-4 h-4 text-slate-400" />}
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Button
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={() => refetch()}
            loading={isFetching}
          >
            Actualiser
          </Button>
        </Space>
      </div>

      <Card>
        <Table<SessionAudit>
          columns={columns}
          dataSource={filteredAudits}
          rowKey="_id"
          loading={isLoading}
          size="middle"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            pageSizeOptions: ['20', '50', '100'],
            showTotal: (total) => `${total} entrée${total > 1 ? 's' : ''}`,
          }}
        />
      </Card>
    </div>
  )
}
