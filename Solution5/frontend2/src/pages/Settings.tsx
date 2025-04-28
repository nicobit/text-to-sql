import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function Settings() {
  const { darkMode, toggleDarkMode } = useTheme();
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{t('settings')}</h2>

      {/* Theme Selection */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('theme')}  
        </label>
        <button
          onClick={toggleDarkMode}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
        >
          {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </button>
      </div>

      {/* Language Selection */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('language')}
        </label>
        <select
          onChange={(e) => changeLanguage(e.target.value)}
          className="block w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
          defaultValue={i18n.language}
        >
          <option value="en">English</option>
          <option value="fr">Français</option>
          <option value="es">Español</option>
        </select>
      </div>

    </div>
  );
}
