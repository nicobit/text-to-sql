import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Settings, Server, FileText, Users , Bot, ShieldQuestion} from 'lucide-react'
import { useSidebar } from '@/contexts/SidebarContext'

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Chat',  icon: Bot,        path: '/chat' },
  { name: 'Questions',     icon: ShieldQuestion,          path: '/question' },
  { name: 'Settings',  icon: Settings,        path: '/settings' },
  { name: 'Environment', icon: Server,        path: '/environment' },
  { name: 'Logs',      icon: FileText,       path: '/logs' },
  { name: 'Users',     icon: Users,          path: '/users' },
  
]

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useSidebar()
  const { pathname } = useLocation()

  return (
    <aside
      className={`
        h-screen flex flex-col
        bg-white dark:bg-gray-800
        border-r dark:border-gray-700
        transition-all duration-300
        ${sidebarOpen ? 'w-64' : 'w-20'}
      `}
    >
      {/* Logo + Collapse */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {sidebarOpen ? 'Admin Portal' : 'A'}
        </h1>
        <button
          onClick={toggleSidebar}
          className={`
            transform transition-transform
            ${sidebarOpen ? '' : 'rotate-90'}
            text-gray-600 dark:text-gray-400
          `}
        >
          ☰
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map(({ name, icon: Icon, path }) => {
          const isActive = pathname === path
          return (
            <Link
              key={path}
              to={path}
              className={`
                group relative flex items-center
                p-2 rounded-lg
                transition-colors duration-200
                ${isActive
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                }
              `}
            >
              <Icon className="w-5 h-5" />

              {/* Label (shown only when expanded) */}
              {sidebarOpen && (
                <span className="ml-4 text-sm font-medium">
                  {name}
                </span>
              )}

              {/* Tooltip (when collapsed) */}
              {!sidebarOpen && (
                <span className="
                  absolute left-full top-1/2 -translate-y-1/2
                  ml-2 whitespace-nowrap
                  bg-gray-800 text-white text-xs font-medium
                  px-2 py-1 rounded opacity-0
                  group-hover:opacity-100
                  transition-opacity
                ">
                  {name}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
