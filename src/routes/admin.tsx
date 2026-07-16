import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { authClient } from "@/auth/auth-client"
import { Bell, Search } from "lucide-react"
import { Input } from "antd"
import dayjs from "dayjs"
import "dayjs/locale/fr"

dayjs.locale("fr")

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    const session = await authClient.getSession()
    if (!session.data?.user) {
      throw redirect({ to: '/' })
    }
    return { user: session.data.user }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
   <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="w-8/12">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card/50 backdrop-blur-sm px-4 transition-[width,height] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <SidebarTrigger className="-ml-1 press-feedback" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">GRH CROUS/Z</span>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-muted-foreground">Administration</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden lg:flex items-center relative">
              <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Rechercher un employé, un lot..."
                className="!w-64 !rounded-lg !pl-9 !h-9 !bg-muted/50 !border-transparent"
                variant="borderless"
              />
            </div>
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors press-feedback">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500" />
            </button>
            <div className="hidden md:block text-xs text-muted-foreground font-medium border-l border-border pl-3">
              {dayjs().format("dddd D MMM")}
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div key={location.pathname} className="page-enter flex flex-col gap-4">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  </div>
}
