import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Link } from "@tanstack/react-router"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url?: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu principal</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem className="space-y-1">
              <CollapsibleTrigger asChild>
                <SidebarMenuButton 
                  tooltip={item.title}
                  className="group/item hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] press-feedback"
                >
                  {item.icon && (
                    <div className="rounded-md bg-indigo-100/60 p-2 text-indigo-600 transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/item:bg-indigo-200/60 group-hover/item:text-indigo-700 group-data-[state=open]/collapsible:bg-indigo-200/60 group-data-[state=open]/collapsible:text-indigo-700">
                      <item.icon className="size-4" />
                    </div>
                  )}
                  <span className="font-medium">{item.title}</span>
                  <ChevronRight className="ml-auto size-4 text-muted-foreground transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 px-3 py-2">
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <Link 
                          to={subItem.url}
                          className="w-full rounded-md px-2 py-1.5 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] press-feedback"
                        >
                          <span className="text-sm">{subItem.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
