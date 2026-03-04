import { createFileRoute } from '@tanstack/react-router'
import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { NumberTicker } from '@/components/ui/number-ticker'
import { EmployeService } from '@/services/employe.service'
import { LotService } from '@/services/lot.service'
import { DivisionService, ServiceService } from '@/services/division.service'
import { NominationService } from '@/services/nomination.service'
import { FonctionService } from '@/services/fonction.service'
import type { Employe, Genre, TypeEmploye } from '@/types/employe'
import { StateLot, type Lot } from '@/types/lot'
import type { Nomination } from '@/types/nomination'
import { 
  Users, 
  Building2, 
  Briefcase, 
  FileText, 
  TrendingUp, 
  UserCheck, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar
} from 'lucide-react'
import { DashboardRappels } from '@/components/dashboard/rappels'

export const Route = createFileRoute('/admin/')({
  component: RouteComponent,
})

interface DashboardStats {
  totalEmployes: number
  employesCDI: number
  employesCDD: number
  hommes: number
  femmes: number
  totalDivisions: number
  totalServices: number
  totalLots: number
  lotsBrouillon: number
  lotsSoumis: number
  lotsValides: number
  lotsEnCours: number
  recentEmployes: Employe[]
  recentLots: Lot[]
  employesParDivision: { nom: string; count: number }[]
  employesParService: { nom: string; count: number }[]
  employesParFonction: { nom: string; count: number }[]
}

function RouteComponent() {
  const results = useQueries({
    queries: [
      {
        queryKey: ['employes'],
        queryFn: () => EmployeService.getAll(),
      },
      {
        queryKey: ['lots'],
        queryFn: () => LotService.getAll(),
      },
      {
        queryKey: ['divisions'],
        queryFn: () => DivisionService.getAll(),
      },
      {
        queryKey: ['services'],
        queryFn: () => ServiceService.getAll(),
      },
      {
        queryKey: ['nominations'],
        queryFn: () => NominationService.getAll(),
      },
      {
        queryKey: ['fonctions'],
        queryFn: () => FonctionService.getAll(),
      },
    ],
  })

  const [employesQuery, lotsQuery, divisionsQuery, servicesQuery, nominationsQuery, fonctionsQuery] = results
  const isLoading = results.some((r) => r.isLoading)
  const isError = results.some((r) => r.isError)

  const stats = useMemo<DashboardStats>(() => {
    const employes = employesQuery.data ?? []
    const lots = lotsQuery.data ?? []
    const divisions = divisionsQuery.data ?? []
    const services = servicesQuery.data ?? []

    const employesCDI = employes.filter((e: Employe) => e.type === 'CDI' as TypeEmploye).length
    const employesCDD = employes.filter((e: Employe) => e.type === 'CDD' as TypeEmploye).length
    const hommes = employes.filter((e: Employe) => e.genre === 'Homme' as Genre).length
    const femmes = employes.filter((e: Employe) => e.genre === 'Femme' as Genre).length

    const lotsBrouillon = lots.filter((l: Lot) => l.etat === StateLot.BROUILLON).length
    const lotsSoumis = lots.filter((l: Lot) => l.etat === StateLot.WAITING1).length
    const lotsValides = lots.filter((l: Lot) => l.etat === StateLot.VALIDE).length
    const lotsEnCours = lots.filter((l: Lot) => l.etat === StateLot.WAITING2).length

    const recentEmployes = [...employes]
      .sort((a, b) => new Date(b.date_de_recrutement || '').getTime() - new Date(a.date_de_recrutement || '').getTime())
      .slice(0, 5)

    const recentLots = [...lots]
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
      .slice(0, 5)

    // Statistiques des nominations actives
    const nominations = nominationsQuery.data ?? []
    const nominationsActives = nominations.filter((n: Nomination) => n.est_active)

    // Employés par division
    const divisionCounts = new Map<string, number>()
    nominationsActives.forEach((n: Nomination) => {
      if (n.division) {
        const divName = typeof n.division === 'string' ? n.division : n.division.nom
        divisionCounts.set(divName, (divisionCounts.get(divName) || 0) + 1)
      }
    })
    const employesParDivision = Array.from(divisionCounts.entries())
      .map(([nom, count]) => ({ nom, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Employés par service
    const serviceCounts = new Map<string, number>()
    nominationsActives.forEach((n: Nomination) => {
      if (n.service) {
        const svcName = typeof n.service === 'string' ? n.service : n.service.nom
        serviceCounts.set(svcName, (serviceCounts.get(svcName) || 0) + 1)
      }
    })
    const employesParService = Array.from(serviceCounts.entries())
      .map(([nom, count]) => ({ nom, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Employés par fonction
    const fonctionCounts = new Map<string, number>()
    nominationsActives.forEach((n: Nomination) => {
      if (n.fonction) {
        const fctName = typeof n.fonction === 'string' ? n.fonction : n.fonction.nom
        fonctionCounts.set(fctName, (fonctionCounts.get(fctName) || 0) + 1)
      }
    })
    const employesParFonction = Array.from(fonctionCounts.entries())
      .map(([nom, count]) => ({ nom, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return {
      totalEmployes: employes.length,
      employesCDI,
      employesCDD,
      hommes,
      femmes,
      totalDivisions: divisions.length,
      totalServices: services.length,
      totalLots: lots.length,
      lotsBrouillon,
      lotsSoumis,
      lotsValides,
      lotsEnCours,
      recentEmployes,
      recentLots,
      employesParDivision,
      employesParService,
      employesParFonction,
    }
  }, [employesQuery.data, lotsQuery.data, divisionsQuery.data, servicesQuery.data, nominationsQuery.data, fonctionsQuery.data])

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-destructive">Erreur lors du chargement des statistiques</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground">Vue d'ensemble de la gestion des ressources humaines</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employés</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberTicker value={stats.totalEmployes} />
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.employesCDI} CDI · {stats.employesCDD} CDD
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Divisions</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberTicker value={stats.totalDivisions} />
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalServices} services
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lots de paie</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberTicker value={stats.totalLots} />
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.lotsValides} validés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Répartition H/F</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalEmployes > 0 
                ? Math.round((stats.hommes / stats.totalEmployes) * 100) 
                : 0}% / {stats.totalEmployes > 0 
                ? Math.round((stats.femmes / stats.totalEmployes) * 100) 
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.hommes} hommes · {stats.femmes} femmes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Statuts des lots */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-gray-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brouillons</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberTicker value={stats.lotsBrouillon} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Soumis</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberTicker value={stats.lotsSoumis} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En validation</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberTicker value={stats.lotsEnCours} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validés</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberTicker value={stats.lotsValides} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listes récentes */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Employés récents
            </CardTitle>
            <CardDescription>Les 5 derniers employés ajoutés</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentEmployes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun employé</p>
            ) : (
              <div className="space-y-3">
                {stats.recentEmployes.map((employe) => (
                  <div key={employe._id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                        {employe.prenom[0]}{employe.nom[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{employe.prenom} {employe.nom}</p>
                        <p className="text-xs text-muted-foreground">{employe.poste}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      employe.type === 'CDI' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {employe.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Lots récents
            </CardTitle>
            <CardDescription>Les 5 derniers lots de paie</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentLots.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun lot</p>
            ) : (
              <div className="space-y-3">
                {stats.recentLots.map((lot) => (
                  <div key={lot._id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{lot.libelle}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(lot.debut).toLocaleDateString('fr-FR')} - {new Date(lot.fin).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      lot.etat === 'VALIDÉ' 
                        ? 'bg-green-100 text-green-700' 
                        : lot.etat === 'SOUMIS'
                        ? 'bg-yellow-100 text-yellow-700'
                        : lot.etat === 'EN COURS DE VALIDATION'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {lot.etat}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Statistiques des nominations */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Employés par division
            </CardTitle>
            <CardDescription>Top 10 des divisions</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.employesParDivision.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune donnée</p>
            ) : (
              <div className="space-y-3">
                {stats.employesParDivision.map((item, index) => (
                  <div key={item.nom} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground w-4">{index + 1}.</span>
                      <span className="text-sm font-medium truncate max-w-[180px]">{item.nom}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full" 
                          style={{ width: `${Math.min((item.count / (stats.employesParDivision[0]?.count || 1)) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-blue-600 w-8 text-right">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Employés par service
            </CardTitle>
            <CardDescription>Top  10 des services</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.employesParService.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune donnée</p>
            ) : (
              <div className="space-y-3">
                {stats.employesParService.map((item, index) => (
                  <div key={item.nom} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground w-4">{index + 1}.</span>
                      <span className="text-sm font-medium truncate max-w-[180px]">{item.nom}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full" 
                          style={{ width: `${Math.min((item.count / (stats.employesParService[0]?.count || 1)) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-green-600 w-8 text-right">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Employés par fonction
            </CardTitle>
            <CardDescription>Top 10 des fonctions</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.employesParFonction.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune donnée</p>
            ) : (
              <div className="space-y-3">
                {stats.employesParFonction.map((item, index) => (
                  <div key={item.nom} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground w-4">{index + 1}.</span>
                      <span className="text-sm font-medium truncate max-w-[180px]">{item.nom}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 rounded-full" 
                          style={{ width: `${Math.min((item.count / (stats.employesParFonction[0]?.count || 1)) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-purple-600 w-8 text-right">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Rappels & Alertes */}
      <DashboardRappels />
    </div>
  )
}
