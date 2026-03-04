import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input,
  DatePicker,
  InputNumber,
  Select,
  Space, 
  Typography, 
  Card, 
  message,
  Tooltip,
  Tag,
  Row,
  Col,
  Statistic
} from 'antd'
import { Plus, Pencil, Users2, Eye, UserCheck, UserX, AlertTriangle, Download } from 'lucide-react'
import { exportToExcel, exportToCSV, employeExportColumns } from '@/lib/export-utils'
import type { Employe, CreateEmployeDto, UpdateEmployeDto } from '@/types/employe'
import { TypeEmploye, Genre, Civilite } from '@/types/employe'
import { EmployeService } from '@/services/employe.service'
import { CategorieService } from '@/services/categorie.service'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import type { Categorie } from '@/types/categorie'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts'

const { Title, Text } = Typography

export const Route = createFileRoute('/admin/employes/')({
  component: EmployesPage,
})

function EmployesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEmploye, setEditingEmploye] = useState<Employe | null>(null)
  const [searchText, setSearchText] = useState('')
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data: employes = [], isLoading } = useQuery({
    queryKey: ['employes'],
    queryFn: () => EmployeService.getAll(),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => CategorieService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateEmployeDto) => EmployeService.create(data),
    onSuccess: () => {
      message.success('Employé créé avec succès')
      queryClient.invalidateQueries({ queryKey: ['employes'] })
      handleCloseModal()
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la création')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeDto }) => 
      EmployeService.update(id, data),
    onSuccess: () => {
      message.success('Employé modifié avec succès')
      queryClient.invalidateQueries({ queryKey: ['employes'] })
      handleCloseModal()
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la modification')
    },
  })

  // const deleteMutation = useMutation({
  //   mutationFn: (id: string) => EmployeService.delete(id),
  //   onSuccess: () => {
  //     message.success('Employé supprimé avec succès')
  //     queryClient.invalidateQueries({ queryKey: ['employes'] })
  //   },
  //   onError: (error: Error) => {
  //     message.error(error.message || 'Erreur lors de la suppression')
  //   },
  // })

  const handleOpenModal = (employe?: Employe) => {
    if (employe) {
      setEditingEmploye(employe)
      form.setFieldsValue({
        ...employe,
        categorie: employe.categorie?._id,
        date_de_naissance: dayjs(employe.date_de_naissance),
        date_de_recrutement: dayjs(employe.date_de_recrutement),
        date_de_fin_de_contrat: employe.date_de_fin_de_contrat ? dayjs(employe.date_de_fin_de_contrat) : undefined
      })
    } else {
      setEditingEmploye(null)
      form.resetFields()
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingEmploye(null)
    form.resetFields()
  }

  const handleSubmit = async (values: any) => {
    const data = {
      ...values,
      date_de_naissance: values.date_de_naissance.format('YYYY-MM-DD'),
      date_de_recrutement: values.date_de_recrutement.format('YYYY-MM-DD'),
      date_de_fin_de_contrat: values.date_de_fin_de_contrat?.format('YYYY-MM-DD')
    }

    if (editingEmploye) {
      const updateData: UpdateEmployeDto = Object.fromEntries(
        Object.entries(data).filter(([key, value]) => 
          value !== undefined && value !== editingEmploye[key as keyof Employe]
        )
      )
      updateMutation.mutate({ id: editingEmploye._id, data: updateData })
    } else {
      createMutation.mutate(data)
    }
  }

  // Filtres personnalisés
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
      dataIndex: 'matricule_de_solde',
      render: (matricule) => (
        <Text type="secondary" className="text-xs">{matricule || 'N/A'}</Text>
      ),
      filterSearch: true,
      filters: getUniqueValues(employes, 'matricule_de_solde')
        .filter((value): value is string => typeof value === 'string')
        .map(value => ({
          text: value,
          value: value
        })),
      onFilter: (value, record) => record.matricule_de_solde === value.toString(),
    },
    {
      title: 'Nom complet',
      key: 'nom',
      render: (_, record) => (
        <div className="flex flex-col">
          <Text strong>{record.civilite}. {record.prenom} {record.nom}</Text>
          <Text type="secondary" className="text-xs">{record.poste}</Text>
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
      title: 'Categorie',
      dataIndex: 'categorie',
      key: 'categorie',
      render: (categorie: Categorie) => (
        <Text type="secondary" className="text-xs">{categorie?.code || 'N/A'}</Text>
      ),
      filters: categories.map(cat => ({
        text: `${cat.code} - ${cat.valeur}`,
        value: cat._id
      })),
      onFilter: (value, record) => record.categorie?._id === value.toString(),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: TypeEmploye) => (
        <Tag color={type === TypeEmploye.CDI ? 'green' : 'orange'}>
          {type}
        </Tag>
      ),
      filters: Object.values(TypeEmploye).map(type => ({
        text: type,
        value: type
      })),
      onFilter: (value, record) => record.type === value.toString(),
    },
    {
      title:'Recrutement',
      dataIndex:'date_de_recrutement',
      key:'date_de_recrutement',
      sorter: (a, b) => dayjs(a.date_de_recrutement).diff(dayjs(b.date_de_recrutement)),
      render: (date_de_recrutement: string) => (
        <Text type="secondary" className="text-xs">{dayjs(date_de_recrutement).format('DD/MM/YYYY') || 'N/A'}</Text>
      ),
      filters: [
        { text: 'Cette année', value: 'thisYear' },
        { text: 'L\'année dernière', value: 'lastYear' },
        { text: 'Plus ancien', value: 'older' }
      ],
      onFilter: (value, record) => {
        const date = dayjs(record.date_de_recrutement)
        const thisYear = dayjs().year()
        switch(value) {
          case 'thisYear':
            return date.year() === thisYear
          case 'lastYear':
            return date.year() === thisYear - 1
          case 'older':
            return date.year() < thisYear - 1
          default:
            return true
        }
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="Voir">
            <Link
              to="/admin/employes/$employeeId"
              params={{ employeeId: record._id }}
            >
              <Button
                type="text"
                size="small"
                icon={<Eye className="w-4 h-4" />}
              />
            </Link>
          </Tooltip>
          <Tooltip title="Modifier">
            <Button
              type="text"
              size="small"
              icon={<Pencil className="w-4 h-4" />}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div className="p-6">
      {/* Header */}
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
            onClick={() => handleOpenModal()}
            style={{ backgroundColor: '#0d9488' }}
          >
            Nouvel employé
          </Button>
        </Space>
      </div>

      {/* Table */}
      <Card>
        <div className="mb-4">
          <Input.Search
            placeholder="Rechercher par nom ou prénom..."
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 400 }}
            size="large"
          />
        </div>
        <Table
          columns={columns}
          dataSource={employes.filter((emp) => {
            if (!searchText.trim()) return true
            const search = searchText.toLowerCase().trim()
            const nom = (emp.nom || '').toLowerCase()
            const prenom = (emp.prenom || '').toLowerCase()
            return nom.includes(search) || prenom.includes(search) || `${prenom} ${nom}`.includes(search) || `${nom} ${prenom}`.includes(search)
          })}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `${total} employé(s)`,
          }}
          size="middle"
          rowClassName={(record) => !record.is_actif ? 'bg-red-50 opacity-60' : ''}
        />
      </Card>

      {/* Statistiques */}
      <EmployeStatistics employes={employes} />

      {/* Modal Create/Edit */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Users2 className="w-5 h-5 text-blue-600" />
            <span>{editingEmploye ? 'Modifier l\'employé' : 'Nouvel employé'}</span>
          </div>
        }
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="grid grid-cols-2 gap-4"
        >
          {/* Informations personnelles */}
          <div className="col-span-2">
            <Title level={5}>Informations personnelles</Title>
          </div>

          <Form.Item
            name="civilite"
            label="Civilité"
            rules={[{ required: true, message: 'La civilité est requise' }]}
          >
            <Select role="select" showSearch options={Object.values(Civilite).map(v => ({ value: v, label: v }))} />
          </Form.Item>

          <Form.Item
            name="genre"
            label="Genre"
            rules={[{ required: true, message: 'Le genre est requis' }]}
          >
            <Select role="select" showSearch options={Object.values(Genre).map(v => ({ value: v, label: v }))} />
          </Form.Item>

          <Form.Item
            name="prenom"
            label="Prénom"
            rules={[{ required: true, message: 'Le prénom est requis' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="nom"
            label="Nom"
            rules={[{ required: true, message: 'Le nom est requis' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="date_de_naissance"
            label="Date de naissance"
            rules={[{ required: true, message: 'La date de naissance est requise' }]}
          >
            <DatePicker className="w-full" format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            name="lieu_de_naissance"
            label="Lieu de naissance"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="nationalite"
            label="Nationalité"
            rules={[{ required: true, message: 'La nationalité est requise' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="nci"
            label="Numéro CNI"
            rules={[{ required: true, message: 'Le numéro CNI est requis' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="telephone"
            label="Téléphone"
            rules={[{ required: true, message: 'Le téléphone est requis' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="adresse"
            label="Adresse"
            rules={[{ required: true, message: 'L\'adresse est requise' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="poste"
            label="Poste"
            rules={[{ required: true, message: 'Le poste est requis' }]}
          >
            <Input />
          </Form.Item>

          {/* Informations professionnelles */}
          <div className="col-span-2">
            <Title level={5}>Informations professionnelles</Title>
          </div>

          <Form.Item
            name="type"
            label="Type de contrat"
            rules={[{ required: true, message: 'Le type de contrat est requis' }]}
          >
            <Select role="select" showSearch options={Object.values(TypeEmploye).map(v => ({ value: v, label: v }))} />
          </Form.Item>

          <Form.Item
            name="categorie"
            label="Catégorie"
          >
            <Select
              allowClear
              role="select"
              showSearch
              options={categories.map(cat => ({
                value: cat._id,
                label: `${cat.code || ''} - ${cat.valeur || 0}`
              }))}
            />
          </Form.Item>

          <Form.Item
            name="qualification"
            label="Qualification"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="date_de_recrutement"
            label="Date de recrutement"
            rules={[{ required: true, message: 'La date de recrutement est requise' }]}
          >
            <DatePicker className="w-full" format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            name="date_de_fin_de_contrat"
            label="Date de fin de contrat"
          >
            <DatePicker className="w-full" format="DD/MM/YYYY" />
          </Form.Item>

          {/* Informations administratives */}
          <div className="col-span-2">
            <Title level={5}>Informations administratives</Title>
          </div>
          <Form.Item
            name="matricule_de_solde"
            label="Matricule de solde"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="npp"
            label="NPP"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="nombre_de_parts"
            label="Nombre de parts"
          >
            <InputNumber className="w-full" min={0} />
          </Form.Item>

          <Form.Item
            name="mensualite"
            label="Mensualité"
          >
            <InputNumber className="w-full" min={0} />
          </Form.Item>
          <div className="col-span-2 flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button onClick={handleCloseModal}>
              Annuler
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createMutation.isPending || updateMutation.isPending}
              style={{ backgroundColor: '#0d9488' }}
            >
              {editingEmploye ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

const COLORS = ['#0d9488', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899']

interface EmployeStatisticsProps {
  employes: Employe[]
}

function EmployeStatistics({ employes }: EmployeStatisticsProps) {
  const stats = useMemo(() => {
    const actifs = employes.filter(e => e.is_actif)
    const inactifs = employes.filter(e => !e.is_actif)
    
    const cadres = actifs.filter(e => e.categorie?.estCadre === true)
    const nonCadres = actifs.filter(e => e.categorie?.estCadre === false || !e.categorie)
    
    const ages = actifs.map(e => dayjs().diff(dayjs(e.date_de_naissance), 'year'))
    const procheRetraite = actifs.filter(e => {
      const age = dayjs().diff(dayjs(e.date_de_naissance), 'year')
      return age >= 55
    })
    
    const ageRanges = [
      { name: '< 30 ans', count: ages.filter(a => a < 30).length },
      { name: '30-39 ans', count: ages.filter(a => a >= 30 && a < 40).length },
      { name: '40-49 ans', count: ages.filter(a => a >= 40 && a < 50).length },
      { name: '50-54 ans', count: ages.filter(a => a >= 50 && a < 55).length },
      { name: '55-59 ans', count: ages.filter(a => a >= 55 && a < 60).length },
      { name: '60+ ans', count: ages.filter(a => a >= 60).length },
    ]
    
    const typeContrat = [
      { name: 'CDI', value: actifs.filter(e => e.type === TypeEmploye.CDI).length },
      { name: 'CDD', value: actifs.filter(e => e.type === TypeEmploye.CDD).length },
    ]
    
    const genre = [
      { name: 'Hommes', value: actifs.filter(e => e.genre === Genre.HOMME).length },
      { name: 'Femmes', value: actifs.filter(e => e.genre === Genre.FEMME).length },
    ]
    
    return {
      total: employes.length,
      actifs: actifs.length,
      inactifs: inactifs.length,
      cadres: cadres.length,
      nonCadres: nonCadres.length,
      procheRetraite: procheRetraite.length,
      ageRanges,
      typeContrat,
      genre,
      cadreData: [
        { name: 'Cadres', value: cadres.length },
        { name: 'Non-cadres', value: nonCadres.length},
      ]
    }
  }, [employes])

  if (employes.length === 0) return null

  return (
    <Card className="mt-6">
      <Title level={5} className="mb-4">Statistiques des employés</Title>
      
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center">
            <Statistic 
              title="Total" 
              value={stats.total} 
              prefix={<Users2 className="w-4 h-4 text-blue-600" />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center">
            <Statistic 
              title="Actifs" 
              value={stats.actifs} 
              valueStyle={{ color: '#0d9488' }}
              prefix={<UserCheck className="w-4 h-4" />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center">
            <Statistic 
              title="Inactifs" 
              value={stats.inactifs} 
              valueStyle={{ color: '#ef4444' }}
              prefix={<UserX className="w-4 h-4" />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className="text-center">
            <Statistic 
              title="Proche retraite (55+)" 
              value={stats.procheRetraite} 
              valueStyle={{ color: '#f59e0b' }}
              prefix={<AlertTriangle className="w-4 h-4" />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card size="small" title="Cadres / Non-cadres">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={stats.cadreData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {stats.cadreData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        <Col xs={24} md={8}>
          <Card size="small" title="Type de contrat">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={stats.typeContrat}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {stats.typeContrat.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        <Col xs={24} md={8}>
          <Card size="small" title="Répartition par genre">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={stats.genre}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {stats.genre.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index + 3]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        <Col xs={24}>
          <Card size="small" title="Répartition par tranche d'âge">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.ageRanges}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <RechartsTooltip />
                <Legend />
                <Bar 
                  dataKey="count" 
                  name="Nombre d'employés" 
                  fill="#0d9488"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </Card>
  )
}
