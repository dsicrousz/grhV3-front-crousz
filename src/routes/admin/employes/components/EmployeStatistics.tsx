import { useMemo } from 'react'
import { Card, Typography, Row, Col, Statistic } from 'antd'
import { Users2, UserCheck, UserX, AlertTriangle } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts'
import type { Employe } from '@/types/employe'
import { Genre } from '@/types/employe'
import { TypeContrat } from '@/types/contrat'
import dayjs from 'dayjs'

const { Title } = Typography
const COLORS = ['#0d9488', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899']

interface EmployeStatisticsProps {
  employes: Employe[]
}

export function EmployeStatistics({ employes }: EmployeStatisticsProps) {
  const stats = useMemo(() => {
    const actifs = employes.filter(e => e.is_actif)
    const inactifs = employes.filter(e => !e.is_actif)
    
    const cadres = actifs.filter(e => typeof e.contrat_actif?.categorie === 'object' && e.contrat_actif.categorie?.estCadre === true)
    const nonCadres = actifs.filter(e => !e.contrat_actif?.categorie || (typeof e.contrat_actif.categorie === 'object' && e.contrat_actif.categorie?.estCadre === false))
    
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
      { name: 'CDI', value: actifs.filter(e => e.contrat_actif?.type === TypeContrat.CDI).length },
      { name: 'CDD', value: actifs.filter(e => e.contrat_actif?.type === TypeContrat.CDD).length },
      { name: 'Temporaire', value: actifs.filter(e => e.contrat_actif?.type === TypeContrat.TEMPORAIRE).length },
    ].filter(d => d.value > 0)
    
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
                  label
                >
                  {stats.genre.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card size="small" title="Types de contrat">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={stats.typeContrat}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  dataKey="value"
                  label
                >
                  {stats.typeContrat.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card size="small" title="Répartition par âge">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.ageRanges}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="count" fill="#0d9488" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </Card>
  )
}
