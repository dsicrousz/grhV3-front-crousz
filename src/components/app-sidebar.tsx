import {
  ListTodo,
  Menu,
  Settings,
  Users2,
  CalendarDays,
  Award,
  BarChart3
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
import { USER_ROLE } from "@/types/user.roles"
import { Avatar } from "antd"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Tableau de bord",
      roles: [USER_ROLE.RH,USER_ROLE.USER],
      icon: Menu,
      isActive: true,
      items: [
        {
          title: "Tableau de bord",
          url: "/admin",
          roles: [USER_ROLE.RH,USER_ROLE.USER],
        },
      ],
    },
    {
      title: "Employés",
      roles: [USER_ROLE.RH,USER_ROLE.USER],
      icon: Users2,
      isActive: true,
      items: [
        {
          title: "Liste des employés",
          url: "/admin/employes",
          roles: [USER_ROLE.RH,USER_ROLE.USER],
        },
      ],
    },
    {
      title: "Nominations",
      roles: [USER_ROLE.RH,USER_ROLE.USER],
      icon: Award,
      isActive: true,
      items: [
        {
          title: "Gestion des nominations",
          url: "/admin/nominations",
          roles: [USER_ROLE.RH,USER_ROLE.USER],
        },
      ],
    },
    {
      title: "Lots de bulletins",
      roles: [USER_ROLE.RH,USER_ROLE.USER],
      icon: ListTodo,
      isActive: true,
      items: [
        {
          title: "Liste des lots",
          url: "/admin/lots",
          roles: [USER_ROLE.RH,USER_ROLE.USER],
        },
      ],
    },
    {
      title: "Absences & Congés",
      roles: [USER_ROLE.RH,USER_ROLE.USER],
      icon: CalendarDays,
      isActive: true,
      items: [
        {
          title: "Gestion des absences",
          url: "/admin/absences",
          roles: [USER_ROLE.RH,USER_ROLE.USER],
        },
        {
          title: "Gestion des congés",
          url: "/admin/conges",
          roles: [USER_ROLE.RH,USER_ROLE.USER],
        },
        {
          title: "Calendrier",
          url: "/admin/calendrier",
          roles: [USER_ROLE.RH,USER_ROLE.USER],
        },
      ],
    },
    {
      title: "Reporting",
      roles: [USER_ROLE.RH,USER_ROLE.USER],
      icon: BarChart3,
      isActive: false,
      items: [
        {
          title: "Statistiques avancées",
          url: "/admin/reporting",
          roles: [USER_ROLE.RH,USER_ROLE.USER],
        },
      ],
    },
    {
      title: "Paramétrage",
      roles: [USER_ROLE.USER,USER_ROLE.RH],
      icon: Settings,
      isActive: false,
      items: [
        {
          title: "Utilisateurs",
          url: "/admin/parametrage/utilisateurs",
          roles: [USER_ROLE.USER,USER_ROLE.RH],
        },
        {
          title: "Rubriques de paie",
          url: "/admin/parametrage/rubriques",
          roles: [USER_ROLE.USER,USER_ROLE.RH],
        },
        {
          title: "Categories",
          url: "/admin/parametrage/categories",
          roles: [USER_ROLE.USER,USER_ROLE.RH],
        },
        {
          title: "Attributions",
          url: "/admin/parametrage/attributions",
          roles: [USER_ROLE.USER,USER_ROLE.RH],
          items: [
            {
              title: "Attributions fonctionnelles",
              url: "/admin/parametrage/attributions",
              roles: [USER_ROLE.USER,USER_ROLE.RH],
            },
          ],
        },
         {
              title: "Attributions individuelles",
              url: "/admin/parametrage/attributions-individuelles",
              roles: [USER_ROLE.USER,USER_ROLE.RH],
            },
            {
              title: "Exclusions spécifiques",
              url: "/admin/parametrage/exclusions",
              roles: [USER_ROLE.USER,USER_ROLE.RH],
            },
        {
          title: "Fonctions",
          url: "/admin/parametrage/fonctions",
          roles: [USER_ROLE.USER,USER_ROLE.RH],
        },
        {
          title: "Divisions & Services",
          url: "/admin/parametrage/divisions",
          roles: [USER_ROLE.USER,USER_ROLE.RH],
        },
        {
          title: "Tous les paramètres",
          url: "/admin/parametrage",
          roles: [USER_ROLE.USER,USER_ROLE.RH],
        },
      ],
    },
  ],
  // projects: [
  //   {
  //     name: "Design Engineering",
  //     url: "#",
  //     icon: Frame,
  //   },
  //   {
  //     name: "Sales & Marketing",
  //     url: "#",
  //     icon: PieChart,
  //   },
  //   {
  //     name: "Travel",
  //     url: "#",
  //     icon: Map,
  //   },
  // ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: sessionData } = useSession();  
  // Adapter les données de session au format attendu par NavUser
  const user = sessionData?.user ? {
    name: sessionData.user.name,
    email: sessionData.user.email,
    avatar: sessionData.user.image || '',
  } : undefined;

  // Filtrer les éléments de navigation selon les rôles de l'utilisateur
  const userRoles = sessionData?.user?.role;
  const filteredNavMain = data.navMain
    .filter((item: any) => !item.roles || item.roles.some((role: string) => userRoles === role))
    .map((item: any) => ({
      ...item,
      items: item.items?.filter((subItem: any) => 
        !subItem.roles || subItem.roles.some((role: string) => userRoles === role)
      ),
    }));
  
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
