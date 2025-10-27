"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface SidebarNavItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  active?: boolean
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex h-full w-64 flex-col border-r bg-background",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef<HTMLDivElement, SidebarHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center border-b p-6", className)}
      {...props}
    >
      {children}
    </div>
  )
)
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef<HTMLDivElement, SidebarContentProps>(
  ({ className, children, ...props }, ref) => (
    <div className="flex-1">
      <div
        ref={ref}
        className={cn("flex flex-col gap-2 p-6", className)}
        {...props}
      >
        {children}
      </div>
    </div>
  )
)
SidebarContent.displayName = "SidebarContent"

const SidebarNav = React.forwardRef<HTMLDivElement, SidebarNavProps>(
  ({ className, children, ...props }, ref) => (
    <nav
      ref={ref}
      className={cn("flex flex-col gap-1", className)}
      {...props}
    >
      {children}
    </nav>
  )
)
SidebarNav.displayName = "SidebarNav"

const SidebarNavItem = React.forwardRef<HTMLDivElement, SidebarNavItemProps>(
  ({ className, children, active, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground h-10",
        active && "text-[#0A0F2C] bg-[#31B79D]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
SidebarNavItem.displayName = "SidebarNavItem"

interface MobileSidebarProps {
  children: React.ReactNode
}

const MobileSidebar = ({ children }: MobileSidebarProps) => (
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="ghost" size="icon" className="md:hidden">
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>
    </SheetTrigger>
    <SheetContent side="left" className="p-0 w-64">
      {children}
    </SheetContent>
  </Sheet>
)

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarNav,
  SidebarNavItem,
  MobileSidebar,
}
