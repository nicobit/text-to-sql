import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMsal } from "@azure/msal-react";
import HealthConfigManager from "@/components/health/healthConfigManager";

type SettingsTab = "health" | "general";

export default function Settings() {
  const { t } = useTranslation();
  const { instance } = useMsal();
  const [activeTab, setActiveTab] = useState<SettingsTab>("health"); // Health is first tab

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: "health", label: t("healthConfig", { defaultValue: "Health Config" }) },
    { id: "general", label: t("generalSettings", { defaultValue: "General" }) },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">
        {t("settings", { defaultValue: "Settings" })}
      </h2>

      {/* Tabs header */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex gap-4" aria-label={t("settingsTabs", { defaultValue: "Settings tabs" })}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={[
                  "whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium focus:outline-none transition-colors",
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
      {activeTab === "health" && (
        <section aria-labelledby="health-tab" className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {t("healthConfigDescription", {
              defaultValue:
                "Manage health check configuration. Add, edit, or remove services; updates are versioned with ETags.",
            })}
          </p>
          <HealthConfigManager instance={instance} />
        </section>
      )}

      {activeTab === "general" && (
        <section aria-labelledby="general-tab" className="rounded-lg border border-gray-200 dark:border-gray-800 p-6 text-sm text-gray-600 dark:text-gray-300">
          {/* Placeholder for future general settings (Theme/Language were moved to Users page as requested) */}
          {t("generalSettingsPlaceholder", {
            defaultValue: "General settings will appear here.",
          })}
        </section>
      )}
    </div>
  );
}
