"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Shield, 
  Settings, 
  Activity, 
  Home,
  FileText,
  Radar
} from "lucide-react"
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarNav,
  SidebarNavItem,
  MobileSidebar 
} from "@/components/ui/sidebar"
// import { Button } from "@/components/ui/button"
import Image from "next/image"
import logo from "../../../public/Frame 3020.svg"
interface MainLayoutProps {
  children: React.ReactNode
}

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    name: "Projects",
    href: "/projects",
    icon: Settings,
  },
  {
    name: "Policies",
    href: "/policies",
    icon: FileText,
  },
  {
    name: "Detectors",
    href: "/detectors",
    icon: Shield,
  },
  {
    name: "Scan",
    href: "/tests",
    icon: Activity,
  },
  {
    name: "Agentic Radar",
    href: "/agentic-radar/scan",
    icon: Radar,
  },
  // {
  //   name: "configurations",
  //   href: "/configurations",
  //   icon: Settings2,
  // },
]

function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          {/* <Shield className="h-6 w-6 text-red-600" /> */}
          {/* <span className="font-semibold text-lg">Aynigma</span> */}
          <Image src={logo} alt='logo' width={150} />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarNav>
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/" && pathname.startsWith(item.href))
            
            return (
              <Link key={item.name} href={item.href}>
                <SidebarNavItem active={isActive}>
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </SidebarNavItem>
              </Link>
            )
          })}
        </SidebarNav>
      </SidebarContent>
    </Sidebar>
  )
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar - Fixed */}
      <div className="hidden md:flex fixed left-0 top-0 h-full z-50">
        <AppSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b md:hidden">
          <div className="flex items-center gap-2">
            {/* <Shield className="h-6 w-6 text-red-600" /> */}
            <Image src={logo} alt='logo' width={150} />
          </div>
          <MobileSidebar>
            <AppSidebar />
          </MobileSidebar>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
