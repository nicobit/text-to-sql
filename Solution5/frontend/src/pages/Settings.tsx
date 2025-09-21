import React, { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import { useMsal } from "@azure/msal-react";
import HealthConfigManager from "@/components/health/healthConfigManager";

export default function Settings() {
  const { darkMode, toggleDarkMode } = useTheme();
  const { t, i18n } = useTranslation();
  const { instance } = useMsal();

  const [activeTab, setActiveTab] = useState<"general" | "health">("general");

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const tabs: { id: "general" | "health"; label: string }[] = [
    { id: "general", label: t("generalSettings", { defaultValue: "General" }) },
    { id: "health", label: t("healthConfig", { defaultValue: "Health Config" }) },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{t("settings", { defaultValue: "Settings" })}</h2>

      {/* Tabs header */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex gap-4" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={[
                  "whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium",
                  isActive
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300 dark:hover:text-white",
                ].join(" ")}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab panels */}
      {activeTab === "general" && (
        <div className="space-y-6">
          {/* Theme Selection */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("theme", { defaultValue: "Theme" })}
            </label>
            <button
              onClick={toggleDarkMode}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
            >
              {darkMode
                ? t("switchToLightMode", { defaultValue: "Switch to Light Mode" })
                : t("switchToDarkMode", { defaultValue: "Switch to Dark Mode" })}
            </button>
          </div>

          {/* Language Selection */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("language", { defaultValue: "Language" })}
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
      )}

      {activeTab === "health" && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {t("healthConfigDescription", {
              defaultValue:
                "Manage health check configuration. Add, edit, or remove services; updates are versioned with ETags.",
            })}
          </p>
          {/* Health configuration manager (uses your health_config.tsx client internally) */}
          <HealthConfigManager instance={instance} />
        </div>
      )}
    </div>
  );
}
