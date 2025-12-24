"use client"

import { AppSidebar } from "@/components/side-bar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

