import { Button, Space, Typography } from 'antd'
import { Plus, Users2, Download } from 'lucide-react'
import { exportToExcel, exportToCSV, employeExportColumns } from '@/lib/export-utils'
import type { Employe } from '@/types/employe'

const { Title, Text } = Typography

interface EmployeHeaderProps {
  employes: Employe[]
  onAddClick: () => void
}

export function EmployeHeader({ employes, onAddClick }: EmployeHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Users2 className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <Title level={4} style={{ margin: 0 }}>Gestion des employés</Title>
          <Text type="secondary">Gérez les informations des employés</Text>
        </div>
      </div>
      <Space>
        <Button
          icon={<Download className="w-4 h-4" />}
          onClick={() => exportToExcel(employes, employeExportColumns, 'employes')}
        >
          Excel
        </Button>
        <Button
          icon={<Download className="w-4 h-4" />}
          onClick={() => exportToCSV(employes, employeExportColumns, 'employes')}
        >
          CSV
        </Button>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={onAddClick}
          style={{ backgroundColor: '#0d9488' }}
        >
          Nouvel employé
        </Button>
      </Space>
    </div>
  )
}
