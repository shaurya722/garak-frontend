'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Shield,
  Settings,
  Activity,
  Home,
  FileText,
  Radar,
  LogOut,
  User,
} from 'lucide-react'
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarNav,
  SidebarNavItem,
  MobileSidebar,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useAuth } from '@/contexts/auth-context'
import Image from 'next/image'
import logo from '../../../public/Frame 3020.svg'
interface MainLayoutProps {
  children: React.ReactNode
}

const navigation = [
  {
    name: 'Getting Started',
    href: '/getting-start',
    icon: Home,
  },
  {
    name: 'Dashboard',
    href: '/',
    icon: Home,
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: Settings,
  },
  {
    name: 'Policies',
    href: '/policies',
    icon: FileText,
  },
  {
    name: 'Detectors',
    href: '/detectors',
    icon: Shield,
  },
  {
    name: 'Scan',
    href: '/tests',
    icon: Activity,
  },
  {
    name: 'Agentic Radar',
    href: '/agentic-radar/scan',
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
  const { user, logout } = useAuth()
console.log('user',user)
  return (
    <Sidebar>
      <SidebarHeader>
        <div className='flex items-center gap-2'>
          <Image src={logo} alt='logo' width={150} />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className='flex flex-col justify-between'>
          <SidebarNav>
            {navigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href))

              return (
                <Link key={item.name} href={item.href}>
                  <SidebarNavItem active={isActive}>
                    <item.icon className='h-4 w-4' />
                    {item.name}
                  </SidebarNavItem>
                </Link>
              )
            })}
          </SidebarNav>

          <div className='mt-96 overflow-y-auto p-4 border-t'>
            <div className='flex items-center gap-2 mb-3'>
              <User className='h-4 w-4' />
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium truncate'>{user?.email}</p>
                {user?.company && (
                  <p className='text-xs text-muted-foreground truncate'>
                    {user.company}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={logout}
              className='w-full'
            >
              <LogOut className='h-4 w-4 mr-2' />
              Logout
            </Button>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <ProtectedRoute>
      <div className='flex bg-background'>
        {/* Desktop Sidebar - Fixed */}
        <div className='hidden md:flex fixed left-0 top-0 h-full z-50'>
          <AppSidebar />
        </div>

        {/* Main Content */}
        <div className='flex-1 flex flex-col overflow-hidden md:ml-64'>
          {/* Mobile Header */}
          <div className='flex items-center justify-between p-4 border-b md:hidden'>
            <div className='flex items-center gap-2'>
              <Image src={logo} alt='logo' width={150} />
            </div>
            <MobileSidebar>
              <AppSidebar />
            </MobileSidebar>
          </div>

          {/* Page Content */}
          <main className='flex-1'>{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
