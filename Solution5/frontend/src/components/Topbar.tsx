// Topbar.tsx
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '@/contexts/ThemeContext'
import { Breadcrumbs } from '@material-tailwind/react'
import { Bell, LogOut, Sun, Moon, User } from 'lucide-react'
import { useMsal } from '@azure/msal-react';
import { useAuth } from '../contexts/AuthContext';

export default function Topbar() {

  const { instance, accounts } = useMsal();
  const { user } = useAuth();

  const handleLogout = () => {
    instance.logoutPopup();
  };
  const { darkMode, toggleDarkMode } = useTheme()
  const location = useLocation()
  const segments = location.pathname.split('/').filter(Boolean)

  // Build an array of <Link> or <span> for Material Tailwind
  const items = [
    <Link key="home" to="/" className="opacity-60 hover:opacity-100">
      Home
    </Link>,
    ...segments.map((seg, i) => {
      const path = '/' + segments.slice(0, i + 1).join('/')
      const label = seg.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      const isLast = i === segments.length - 1

      return isLast ? (
        <span key={path}>{label}</span>
      ) : (
        <Link key={path} to={path} className="opacity-60 hover:opacity-100">
          {label}
        </Link>
      )
    }),
  ]

  return (
    <header className="flex items-center justify-between bg-inherit px-6 py-4">
      {/* Material Tailwind Breadcrumbs */}
      <Breadcrumbs className="bg-transparent" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
        {items}
      </Breadcrumbs>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
          <Bell size={20} />
          <span className="absolute top-0 right-0 inline-flex w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
          <span className="absolute top-0 right-0 inline-flex w-2.5 h-2.5 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center space-x-2">
        
        <span className="text-sm font-semibold">{user?.name || user?.username}</span>
        <User size={20}  />
        </div>
        
        <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition" onClick={handleLogout}>
          <LogOut size={20} />
        </button>
      </div>
    </header>
  )
}
