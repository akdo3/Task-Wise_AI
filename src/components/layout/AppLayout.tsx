
"use client";

import type { ReactNode } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/icons/Logo";
import { PlusCircle, LayoutDashboard } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
  onAddTask: () => void;
}

export function AppLayout({ children, onAddTask }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar variant="sidebar" collapsible="icon" className="border-r border-sidebar-border">
        <SidebarHeader className="p-4 items-start"> {/* Increased padding and alignment */}
          <Logo />
          <SidebarTrigger className="ml-auto md:hidden" /> {/* Show trigger only on mobile if sidebar is icon-collapsible */}
        </SidebarHeader>
        <SidebarContent className="p-2"> {/* Added padding to content */}
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={onAddTask}
                className="font-semibold text-base bg-primary text-primary-foreground hover:bg-primary/90" /* Prominent styling */
                size="lg"
                tooltip="Add a new task to your list"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                <span>Add New Task</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                // onClick={() => { /* Placeholder for navigation */ }}
                variant="ghost"
                className="text-base"
                isActive={true} // Assuming this is the main view for now
                tooltip="View your task dashboard"
              >
                <LayoutDashboard className="mr-2 h-5 w-5" />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {/* Add more sidebar items here in the future */}
          </SidebarMenu>
        </SidebarContent>
        {/* SidebarFooter could be added here if needed */}
      </Sidebar>
      <SidebarInset className="flex flex-col">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
