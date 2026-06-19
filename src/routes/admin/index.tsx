import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { NumberTicker } from '@/components/ui/number-ticker'
import { EmployeService } from '@/services/employe.service'
import { LotService } from '@/services/lot.service'
import { DivisionService, ServiceService } from '@/services/division.service'
import { NominationService } from '@/services/nomination.service'
import type { Employe, Genre } from '@/types/employe'
import type { Poste } from '@/types/poste'
import { StateLot, type Lot } from '@/types/lot'
import type { Nomination } from '@/types/nomination'
import dayjs from 'dayjs'
import 'dayjs/locale/fr'
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
  Calendar,
  Cake,
  FileWarning,
  Plus,
  BarChart3,
  Settings,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react'
import { DashboardRappels } from '@/components/dashboard/rappels'

dayjs.locale('fr')

export const Route = createFileRoute('/admin/')({
  component: RouteComponent,
})

interface DashboardStats {
  totalEmployes: number
  employesCDI: number
  employesCDD: number
  employesTemporaire: number
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
  anniversaires: Employe[]
  cddExpirant: Employe[]
  nouveauxCetteSemaine: number
}

const QUICK_ACTIONS = [
  { label: 'Nouvel employé', icon: Plus, to: '/admin/employes', color: 'bg-blue-500 hover:bg-blue-600' },
  { label: 'Nouveau lot', icon: FileText, to: '/admin/lots', color: 'bg-emerald-500 hover:bg-emerald-600' },
  { label: 'Nominations', icon: UserCheck, to: '/admin/nominations', color: 'bg-purple-500 hover:bg-purple-600' },
  { label: 'Reporting', icon: BarChart3, to: '/admin/reporting', color: 'bg-amber-500 hover:bg-amber-600' },
  { label: 'Paramétrage', icon: Settings, to: '/admin/parametrage', color: 'bg-slate-500 hover:bg-slate-600' },
] as const

function getSalutation() {
  const h = new Date().getHours()
  if (h < 6) return 'Bonne nuit'
  if (h < 12) return 'Bonjour'
  if (h < 18) return 'Bon après-midi'
  return 'Bonsoir'
}

function RouteComponent() {
  const getPosteName = (poste: Poste | string | undefined): string => {
    if (!poste) return ''
    if (typeof poste === 'string') return poste
    return poste.nom
  }

  const { data: employesData, isLoading: isLoadingEmployes, isError: isErrorEmployes } = useQuery({
    queryKey: ['employes', 'agregated'],
    queryFn: () => EmployeService.getAllAgregated(),
  })
  const { data: lotsData, isLoading: isLoadingLots, isError: isErrorLots } = useQuery({
    queryKey: ['lots'],
    queryFn: () => LotService.getAll(),
  })
  const { data: divisionsData, isLoading: isLoadingDivisions, isError: isErrorDivisions } = useQuery({
    queryKey: ['divisions'],
    queryFn: () => DivisionService.getAll(),
  })
  const { data: servicesData, isLoading: isLoadingServices, isError: isErrorServices } = useQuery({
    queryKey: ['services'],
    queryFn: () => ServiceService.getAll(),
  })
  const { data: nominationsData, isLoading: isLoadingNominations, isError: isErrorNominations } = useQuery({
    queryKey: ['nominations'],
    queryFn: () => NominationService.getAll(),
  })

  const isLoading = isLoadingEmployes || isLoadingLots || isLoadingDivisions || isLoadingServices || isLoadingNominations
  const isError = isErrorEmployes || isErrorLots || isErrorDivisions || isErrorServices || isErrorNominations

  const stats = useMemo<DashboardStats>(() => {
    const employes = employesData ?? []
    const lots = lotsData ?? []
    const divisions = divisionsData ?? []
    const services = servicesData ?? []

    const employesCDI = employes.filter((e: Employe) => e.contrat_actif?.type === 'CDI').length
    const employesCDD = employes.filter((e: Employe) => e.contrat_actif?.type === 'CDD').length
    const employesTemporaire = employes.filter((e: Employe) => e.contrat_actif?.type === 'TEMPORAIRE').length
    const hommes = employes.filter((e: Employe) => e.genre === 'Homme' as Genre).length
    const femmes = employes.filter((e: Employe) => e.genre === 'Femme' as Genre).length

    const lotsBrouillon = lots.filter((l: Lot) => l.etat === StateLot.BROUILLON).length
    const lotsSoumis = lots.filter((l: Lot) => l.etat === StateLot.WAITING1).length
    const lotsValides = lots.filter((l: Lot) => l.etat === StateLot.VALIDE).length
    const lotsEnCours = lots.filter((l: Lot) => l.etat === StateLot.WAITING2).length

    const recentEmployes = [...employes]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 5)

    const recentLots = [...lots]
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
      .slice(0, 5)

    // Employés par division
    const divisionCounts = new Map<string, number>()
    employes.forEach((e: Employe) => {
      if (e.affectation_site?.division) {
        const divName = typeof e.affectation_site.division === 'string' ? e.affectation_site.division : e.affectation_site.division.nom
        divisionCounts.set(divName, (divisionCounts.get(divName) || 0) + 1)
      }
    })
    const employesParDivision = Array.from(divisionCounts.entries())
      .map(([nom, count]) => ({ nom, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Employés par service
    const serviceCounts = new Map<string, number>()
    employes.forEach((e: Employe) => {
      if (e.affectation_site?.service) {
        const svcName = typeof e.affectation_site.service === 'string' ? e.affectation_site.service : e.affectation_site.service.nom
        serviceCounts.set(svcName, (serviceCounts.get(svcName) || 0) + 1)
      }
    })
    const employesParService = Array.from(serviceCounts.entries())
      .map(([nom, count]) => ({ nom, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Employés par fonction
    const nominations = nominationsData ?? []
    const nominationsActives = nominations.filter((n: Nomination) => n.est_active)
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

    // Anniversaires du mois courant
    const today = dayjs()
    const currentMonth = today.month()
    const anniversaires = employes
      .filter((e: Employe) => {
        if (!e.is_actif || !e.date_de_naissance) return false
        return dayjs(e.date_de_naissance).month() === currentMonth
      })
      .sort((a, b) => dayjs(a.date_de_naissance).date() - dayjs(b.date_de_naissance).date())
      .slice(0, 8)

    // Contrats CDD expirant dans les 30 prochains jours
    const in30Days = today.add(30, 'day')
    const cddExpirant = employes
      .filter((e: Employe) => {
        if (!e.is_actif || e.contrat_actif?.type !== 'CDD' || !e.contrat_actif?.date_fin) return false
        const dateFin = dayjs(e.contrat_actif.date_fin)
        return dateFin.isAfter(today) && dateFin.isBefore(in30Days)
      })
      .sort((a, b) => dayjs(a.contrat_actif!.date_fin!).valueOf() - dayjs(b.contrat_actif!.date_fin!).valueOf())
      .slice(0, 8)

    // Nouveaux employés cette semaine
    const startOfWeek = today.startOf('week')
    const nouveauxCetteSemaine = employes.filter((e: Employe) =>
      e.createdAt && dayjs(e.createdAt).isAfter(startOfWeek),
    ).length

    return {
      totalEmployes: employes.length,
      employesCDI,
      employesCDD,
      employesTemporaire,
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
      anniversaires,
      cddExpirant,
      nouveauxCetteSemaine,
    }
  }, [employesData, lotsData, divisionsData, servicesData, nominationsData])

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

  const tauxHommes = stats.totalEmployes > 0 ? Math.round((stats.hommes / stats.totalEmployes) * 100) : 0
  const tauxFemmes = stats.totalEmployes > 0 ? 100 - tauxHommes : 0

  return (
    <div className="p-6 space-y-6">
      {/* Header avec salutation */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{getSalutation()} 👋</h1>
          <p className="text-muted-foreground">Vue d'ensemble de la gestion des ressources humaines</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {dayjs().format('dddd D MMMM YYYY')}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.to}
              to={action.to}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-white text-sm font-medium transition-colors ${action.color}`}
            >
              <Icon className="h-4 w-4" />
              {action.label}
            </Link>
          )
        })}
      </div>

      {/* Statistiques principales — cards cliquables */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link to="/admin/employes" className="group">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employés</CardTitle>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Users className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <NumberTicker value={stats.totalEmployes} />
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.employesCDI} CDI · {stats.employesCDD} CDD · {stats.employesTemporaire} Temp
              </p>
              {stats.nouveauxCetteSemaine > 0 && (
                <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" />
                  +{stats.nouveauxCetteSemaine} cette semaine
                </p>
              )}
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/parametrage/divisions" className="group">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Divisions</CardTitle>
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                <Building2 className="h-4 w-4" />
              </div>
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
        </Link>

        <Link to="/admin/lots" className="group">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-l-4 border-l-emerald-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lots de paie</CardTitle>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <FileText className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <NumberTicker value={stats.totalLots} />
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.lotsValides} validés · {stats.lotsBrouillon} brouillons
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card className="border-l-4 border-l-pink-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Répartition H/F</CardTitle>
            <div className="p-2 rounded-lg bg-pink-50 text-pink-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-bold text-blue-600">{tauxHommes}%</span>
              <div className="flex-1 h-2 bg-pink-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${tauxHommes}%` }}
                />
              </div>
              <span className="text-sm font-bold text-pink-600">{tauxFemmes}%</span>
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

      {/* Événements & Alertes */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Anniversaires du mois */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cake className="h-5 w-5 text-pink-500" />
              Anniversaires du mois
            </CardTitle>
            <CardDescription>
              {dayjs().format('MMMM YYYY')} · {stats.anniversaires.length} anniversaire{stats.anniversaires.length > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.anniversaires.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun anniversaire ce mois-ci</p>
            ) : (
              <div className="space-y-3">
                {stats.anniversaires.map((employe) => {
                  const dateNaiss = dayjs(employe.date_de_naissance)
                  const today = dayjs()
                  const isToday = dateNaiss.month() === today.month() && dateNaiss.date() === today.date()
                  const age = today.year() - dateNaiss.year()
                  return (
                    <div key={employe._id} className={`flex items-center justify-between border-b pb-2 last:border-0 ${isToday ? 'bg-pink-50 -mx-2 px-2 rounded' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${isToday ? 'bg-pink-500 text-white' : 'bg-pink-100 text-pink-700'}`}>
                          {employe.prenom[0]}{employe.nom[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{employe.prenom} {employe.nom}</p>
                          <p className="text-xs text-muted-foreground">
                            {dateNaiss.format('DD MMMM')} · {age} ans
                          </p>
                        </div>
                      </div>
                      {isToday && (
                        <span className="text-xs px-2 py-1 rounded-full bg-pink-500 text-white font-medium">
                          Aujourd'hui 🎉
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* CDD expirant */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileWarning className="h-5 w-5 text-orange-500" />
              CDD arrivant à échéance
            </CardTitle>
            <CardDescription>
              Dans les 30 prochains jours · {stats.cddExpirant.length} contrat{stats.cddExpirant.length > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.cddExpirant.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun CDD à renouveler prochainement</p>
            ) : (
              <div className="space-y-3">
                {stats.cddExpirant.map((employe) => {
                  const dateFin = dayjs(employe.contrat_actif!.date_fin!)
                  const joursRestants = dateFin.diff(dayjs(), 'day')
                  const isUrgent = joursRestants <= 7
                  return (
                    <Link
                      key={employe._id}
                      to="/admin/employes/$employeeId"
                      params={{ employeeId: employe._id }}
                      className="flex items-center justify-between border-b pb-2 last:border-0 hover:bg-orange-50 -mx-2 px-2 rounded transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${isUrgent ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                          {employe.prenom[0]}{employe.nom[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{employe.prenom} {employe.nom}</p>
                          <p className="text-xs text-muted-foreground">
                            {getPosteName(employe.contrat_actif?.poste) || '—'}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${isUrgent ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                        {joursRestants === 0 ? "Aujourd'hui" : `${joursRestants}j`}
                      </span>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Listes récentes */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Employés récents
              </CardTitle>
              <CardDescription>Les 5 derniers employés ajoutés</CardDescription>
            </div>
            <Link to="/admin/employes" className="text-xs text-primary hover:underline flex items-center gap-1">
              Voir tout
              <ChevronRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {stats.recentEmployes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun employé</p>
            ) : (
              <div className="space-y-3">
                {stats.recentEmployes.map((employe) => (
                  <Link
                    key={employe._id}
                    to="/admin/employes/$employeeId"
                    params={{ employeeId: employe._id }}
                    className="flex items-center justify-between border-b pb-2 last:border-0 hover:bg-muted/50 -mx-2 px-2 rounded transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                        {employe.prenom[0]}{employe.nom[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{employe.prenom} {employe.nom}</p>
                        <p className="text-xs text-muted-foreground">{getPosteName(employe.contrat_actif?.poste) || '—'}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      employe.contrat_actif?.type === 'CDI'
                        ? 'bg-green-100 text-green-700'
                        : employe.contrat_actif?.type === 'CDD'
                        ? 'bg-orange-100 text-orange-700'
                        : employe.contrat_actif?.type === 'TEMPORAIRE'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {employe.contrat_actif?.type || '—'}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Lots récents
              </CardTitle>
              <CardDescription>Les 5 derniers lots de paie</CardDescription>
            </div>
            <Link to="/admin/lots" className="text-xs text-primary hover:underline flex items-center gap-1">
              Voir tout
              <ChevronRight className="h-3 w-3" />
            </Link>
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
                        {dayjs(lot.debut).format('DD/MM/YYYY')} - {dayjs(lot.fin).format('DD/MM/YYYY')}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      lot.etat === StateLot.VALIDE
                        ? 'bg-green-100 text-green-700'
                        : lot.etat === StateLot.WAITING1
                        ? 'bg-yellow-100 text-yellow-700'
                        : lot.etat === StateLot.WAITING2
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

      {/* Statistiques de répartition */}
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
            <CardDescription>Top 10 des services</CardDescription>
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
