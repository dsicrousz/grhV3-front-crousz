import { Table, Typography, Button, Tag, Input, Popconfirm, message, Dropdown } from 'antd'
import { Eye, Pencil, Trash2, MoreHorizontal } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import type { ColumnsType } from 'antd/es/table'
import type { Employe } from '@/types/employe'
import type { Categorie } from '@/types/categorie'
import { TypeContrat } from '@/types/contrat'
import type { Poste } from '@/types/poste'

const { Text } = Typography

interface EmployeTableProps {
  employes: Employe[]
  categories: Categorie[]
  isLoading: boolean
  searchText: string
  onSearchChange: (value: string) => void
  onEdit: (employe: Employe) => void
  onDelete: (employe: Employe) => void
}

export function EmployeTable({
  employes,
  categories,
  isLoading,
  searchText,
  onSearchChange,
  onEdit,
  onDelete,
}: EmployeTableProps) {
  const getPosteName = (poste: Poste | string | undefined): string => {
    if (!poste) return ''
    if (typeof poste === 'string') return poste
    return poste.nom
  }

  const getUniqueValues = (data: Employe[], key: keyof Employe) => {
    const values = new Set(data.map(item => {
      const value = item[key]
      return typeof value === 'object' ? null : String(value)
    }))
    return Array.from(values).filter((value): value is string => value !== null)
  }

  const columns: ColumnsType<Employe> = [
    {
      title: 'Matricule',
      key: 'matricule',
      render: (_, record) => (
        <Text type="secondary" className="text-xs">{record.contrat_actif?.matricule_de_solde || 'N/A'}</Text>
      ),
      filterSearch: true,
      filters: [...new Set(employes.map(e => e.contrat_actif?.matricule_de_solde).filter(Boolean))]
        .map(value => ({ text: value as string, value: value as string })),
      onFilter: (value, record) => record.contrat_actif?.matricule_de_solde === value.toString(),
    },
    {
      title: 'Nom complet',
      key: 'nom',
      render: (_, record) => (
        <div className="flex flex-col">
          <Text strong>{record.civilite}. {record.prenom} {record.nom}</Text>
          <Text type="secondary" className="text-xs">{getPosteName(record.contrat_actif?.poste)}</Text>
        </div>
      ),
      sorter: (a, b) => a.nom.localeCompare(b.nom),
      filterSearch: true,
      filterMode: 'menu',
      filters: [
        ...new Set(employes.map(e => e.civilite))
      ].map(civilite => ({
        text: civilite,
        value: civilite
      })),
      onFilter: (value, record) => {
        const searchValue = value.toString().toLowerCase()
        const fullName = `${record.prenom} ${record.nom}`.toLowerCase()
        return fullName.includes(searchValue) || 
               record.civilite.toLowerCase() === searchValue
      },
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <div className="flex flex-col">
          <Text>{record.telephone}</Text>
          <Text type="secondary" className="text-xs">{record.adresse}</Text>
        </div>
      ),
      filterSearch: true,
      filters: getUniqueValues(employes, 'adresse')
        .filter((value): value is string => typeof value === 'string')
        .map(value => ({
          text: value,
          value: value
        })),
      onFilter: (value, record) => record.adresse === value.toString(),
    },
    {
      title: 'Catégorie',
      key: 'categorie',
      render: (_, record) => {
        const raw = record.contrat_actif?.categorie
        const catId = typeof raw === 'object' && raw ? raw._id : raw
        const catObj = categories.find(c => c._id === catId)
        return <Text type="secondary" className="text-xs">{catObj ? `${catObj.code}` : 'N/A'}</Text>
      },
      filters: categories.map(cat => ({
        text: `${cat.code} - ${cat.valeur}`,
        value: cat._id
      })),
      onFilter: (value, record) => {
        const raw = record.contrat_actif?.categorie
        const catId = typeof raw === 'object' && raw ? raw._id : raw
        return catId === value.toString()
      },
    },
    {
      title: 'Contrat',
      key: 'contrat',
      render: (_, record) => {
        const contrat = record.contrat_actif
        if (!contrat) return <Text type="secondary" className="text-xs">Aucun</Text>
        return (
          <div className="flex flex-col">
            <Tag color={contrat.type === TypeContrat.CDI ? 'green' : contrat.type === TypeContrat.CDD ? 'orange' : 'blue'}>
              {contrat.type}
            </Tag>
            <Text type="secondary" className="text-xs">{getPosteName(contrat.poste)}</Text>
          </div>
        )
      },
      filters: Object.values(TypeContrat).map(type => ({
        text: type,
        value: type
      })),
      onFilter: (value, record) => record.contrat_actif?.type === value.toString(),
    },
    {
      title: 'Site',
      key: 'site',
      render: (_, record) => {
        const aff = record.affectation_site
        if (!aff) return <Text type="secondary" className="text-xs">—</Text>
        const site = typeof aff.site === 'object' ? aff.site : null
        return <Text className="text-xs">{site?.nom || '—'}</Text>
      },
    },
    {
      title: 'Statut',
      key: 'statut',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Tag color={record.is_actif ? 'green' : 'red'}>
          {record.is_actif ? 'Actif' : 'Inactif'}
        </Tag>
      ),
      filters: [
        { text: 'Actif', value: true },
        { text: 'Inactif', value: false },
      ],
      onFilter: (value, record) => Boolean(record.is_actif) === Boolean(value),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      align: 'center',
      render: (_, record) => {
        const handleDelete = () => {
          onDelete(record)
          message.success(`Employé ${record.nom} ${record.prenom} supprimé avec succès`)
        }

        const menuItems = [
          {
            key: 'view',
            label: (
              <Link
                to="/admin/employes/$employeeId"
                params={{ employeeId: record._id }}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Voir
              </Link>
            ),
          },
          {
            key: 'edit',
            label: (
              <button
                onClick={() => onEdit(record)}
                className="flex items-center gap-2 w-full text-left hover:bg-gray-50 px-2 py-1 rounded"
              >
                <Pencil className="w-4 h-4" />
                Modifier
              </button>
            ),
          },
          {
            type: 'divider' as const,
          },
          {
            key: 'delete',
            label: (
              <Popconfirm
                title="Supprimer l'employé"
                description={`Êtes-vous sûr de vouloir supprimer ${record.nom} ${record.prenom} ?`}
                onConfirm={handleDelete}
                okText="Supprimer"
                cancelText="Annuler"
                okButtonProps={{ danger: true }}
              >
                <button className="flex items-center gap-2 w-full text-left text-red-600 hover:bg-red-50 px-2 py-1 rounded">
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </Popconfirm>
            ),
          },
        ]

        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              type="text"
              size="small"
              icon={<MoreHorizontal className="w-4 h-4" />}
              className="text-gray-400 hover:text-gray-600"
            />
          </Dropdown>
        )
      },
    },
  ]

  const filteredEmployes = employes.filter((emp) => {
    if (!searchText.trim()) return true
    const search = searchText.toLowerCase().trim()
    const nom = (emp.nom || '').toLowerCase()
    const prenom = (emp.prenom || '').toLowerCase()
    const poste = getPosteName(emp.contrat_actif?.poste).toLowerCase()
    const siteObj = emp.affectation_site?.site
    const siteNom = (typeof siteObj === 'object' && siteObj ? siteObj.nom : '').toLowerCase()
    const matricule = (emp.contrat_actif?.matricule_de_solde || '').toLowerCase()
    return nom.includes(search) || prenom.includes(search) 
      || `${prenom} ${nom}`.includes(search) || `${nom} ${prenom}`.includes(search)
      || poste.includes(search) || siteNom.includes(search) || matricule.includes(search)
  })

  return (
    <div>
      <div className="mb-4">
        <Input.Search
          placeholder="Rechercher par nom, prénom, poste, site, matricule..."
          allowClear
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ maxWidth: 400 }}
          size="large"
        />
      </div>
      <Table
        columns={columns}
        dataSource={filteredEmployes}
        rowKey="_id"
        loading={isLoading}
        pagination={{
          showSizeChanger: true,
          showTotal: (total) => `${total} employé(s)`,
        }}
        size="middle"
        rowClassName={(record) => !record.is_actif ? 'bg-red-50 opacity-60' : ''}
      />
    </div>
  )
}
