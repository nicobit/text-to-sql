import { useTheme } from '@/contexts/ThemeContext';
import { Bell, LogOut, Sun, Moon } from 'lucide-react';

export default function Topbar() {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <header className="flex items-center justify-between bg-white dark:bg-gray-800 shadow px-6 py-4 border-b dark:border-gray-700">
      {/* Left side - Page Title */}
      <div className="text-xl font-semibold text-gray-800 dark:text-white">
        Admin Portal
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center space-x-4">
        {/* Dark/Light Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications Bell */}
        <button className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
          <Bell size={20} />
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-2.5 h-2.5 bg-red-500 rounded-full" />
        </button>

        {/* Logout */}
        <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
