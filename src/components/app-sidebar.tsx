import {
  ListTodo,
  Menu,
  Settings,
  Users2,
  CalendarDays,
  Award,
  BarChart3,
  MapPin
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useSession } from "@/auth/auth-client"
import { useAbility } from "@/auth/ability-context"
import type { Action, Subject } from "@/auth/abilities"
import { Avatar } from "antd"

type NavItem = {
  title: string
  url: string
  I?: Action
  a?: Subject
  items?: NavItem[]
}

type NavSection = {
  title: string
  I?: Action
  a?: Subject
  icon: typeof Menu
  isActive: boolean
  items: NavItem[]
}

const data: { navMain: NavSection[] } = {
  navMain: [
    {
      title: "Tableau de bord",
      I: 'read',
      a: 'employe',
      icon: Menu,
      isActive: true,
      items: [
        { title: "Tableau de bord", url: "/admin", I: 'read', a: 'employe' },
      ],
    },
    {
      title: "Employés",
      I: 'read',
      a: 'employe',
      icon: Users2,
      isActive: true,
      items: [
        { title: "Liste des employés", url: "/admin/employes", I: 'list', a: 'employe' },
      ],
    },
    {
      title: "Sites",
      I: 'read',
      a: 'site',
      icon: MapPin,
      isActive: false,
      items: [
        { title: "Gestion des sites", url: "/admin/sites", I: 'list', a: 'site' },
      ],
    },
    {
      title: "Nominations",
      I: 'read',
      a: 'nomination',
      icon: Award,
      isActive: true,
      items: [
        { title: "Gestion des nominations", url: "/admin/nominations", I: 'list', a: 'nomination' },
      ],
    },
    {
      title: "Lots de bulletins",
      I: 'read',
      a: 'lot',
      icon: ListTodo,
      isActive: true,
      items: [
        { title: "Lots CDI", url: "/admin/lots", I: 'list', a: 'lot' },
        { title: "Lots CDD", url: "/admin/lots-cdd", I: 'list', a: 'lot' },
        { title: "Lots Temporaires", url: "/admin/lots-temporaires", I: 'list', a: 'lot' },
      ],
    },
    {
      title: "Absences & Congés",
      I: 'read',
      a: 'absence',
      icon: CalendarDays,
      isActive: true,
      items: [
        { title: "Gestion des absences", url: "/admin/absences", I: 'list', a: 'absence' },
        { title: "Gestion des congés", url: "/admin/conges", I: 'list', a: 'conge' },
        { title: "Calendrier", url: "/admin/calendrier", I: 'read', a: 'absence' },
      ],
    },
    {
      title: "Reporting",
      I: 'read',
      a: 'reporting',
      icon: BarChart3,
      isActive: false,
      items: [
        { title: "Statistiques avancées", url: "/admin/reporting", I: 'list', a: 'reporting' },
      ],
    },
    {
      title: "Paramétrage",
      I: 'read',
      a: 'rubrique',
      icon: Settings,
      isActive: false,
      items: [
        { title: "Utilisateurs", url: "/admin/parametrage/utilisateurs", I: 'create', a: 'session' },
        { title: "Rubriques de paie", url: "/admin/parametrage/rubriques", I: 'list', a: 'rubrique' },
        { title: "Categories", url: "/admin/parametrage/categories", I: 'list', a: 'categorie' },
        {
          title: "Attributions",
          url: "/admin/parametrage/attributions",
          I: 'list',
          a: 'attribution',
          items: [
            { title: "Attributions fonctionnelles", url: "/admin/parametrage/attributions", I: 'list', a: 'attribution' },
          ],
        },
        { title: "Attributions individuelles", url: "/admin/parametrage/attributions-individuelles", I: 'list', a: 'attribution' },
        { title: "Exclusions spécifiques", url: "/admin/parametrage/exclusions", I: 'list', a: 'exclusion' },
        { title: "Fonctions", url: "/admin/parametrage/fonctions", I: 'list', a: 'fonction' },
        { title: "Postes", url: "/admin/parametrage/postes", I: 'list', a: 'poste' },
        { title: "Divisions & Services", url: "/admin/parametrage/divisions", I: 'list', a: 'division' },
        { title: "Tous les paramètres", url: "/admin/parametrage", I: 'read', a: 'rubrique' },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: sessionData } = useSession();  
  const ability = useAbility();

  const user = sessionData?.user ? {
    name: sessionData.user.name,
    email: sessionData.user.email,
    avatar: sessionData.user.image || '',
  } : undefined;

  const filterItems = (items: NavItem[]): NavItem[] =>
    items.filter((item) => {
      if (!item.I || !item.a) return true
      if (!ability.can(item.I, item.a)) return false
      if (item.items) {
        item.items = filterItems(item.items)
        return item.items.length > 0
      }
      return true
    })

  const filteredNavMain = data.navMain
    .filter((section) => {
      if (!section.I || !section.a) return true
      return ability.can(section.I, section.a)
    })
    .map((section) => ({
      ...section,
      items: filterItems(section.items),
    }))
    .filter((section) => section.items.length > 0);
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <div className="flex items-center justify-center">
          <Avatar size={80} src="/logo.png" />
        </div>
        <NavMain items={filteredNavMain} />
      </SidebarContent>
      <SidebarFooter>
        {user && <NavUser user={user} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
