// src/pages/Users.tsx
import React, { useState } from "react";
import TokenUsageDashboard from "@/components/tokenUsageDashboard/TokenUsageDashboard";
import { useMsal } from "@azure/msal-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "react-i18next";

type TabKey = "usage" | "future1" | "future2";

export default function Users() {
  const [activeTab, setActiveTab] = useState<TabKey>("usage"); // Token Usage is a tab again
  const { instance } = useMsal();
  const { darkMode, toggleDarkMode } = useTheme();
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => i18n.changeLanguage(lng);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">
        {t("users", { defaultValue: "Users" })}
      </h2>

      {/* Top controls: Theme & Language (Token Usage moved into tab below) */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Theme */}
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

          {/* Language */}
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
              <option value="it">Italiano</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-2">
        <div
          role="tablist"
          aria-label={t("userTools", { defaultValue: "User tools" })}
          className="border-b border-gray-200 dark:border-gray-800"
        >
          <div className="flex gap-2">
            <TabButton
              active={activeTab === "usage"}
              onClick={() => setActiveTab("usage")}
              label={t("tokenUsage", { defaultValue: "Token Usage" })}
            />
            <TabButton
              active={activeTab === "future1"}
              onClick={() => setActiveTab("future1")}
              label={t("futureSettings", { defaultValue: "(Future) Settings" })}
              disabled
            />
            <TabButton
              active={activeTab === "future2"}
              onClick={() => setActiveTab("future2")}
              label={t("futureAudit", { defaultValue: "(Future) Audit" })}
              disabled
            />
          </div>
        </div>

        <div className="mt-4">
          {activeTab === "usage" && (
            <>
              {instance ? (
                <TokenUsageDashboard instance={instance} defaultDays={14} />
              ) : (
                <div className="p-4 rounded border border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-200">
                  {t("msalInstanceMissing", {
                    defaultValue:
                      "Cannot find MSAL instance. If you’re not using @azure/msal-react, pass your IPublicClientApplication to TokenUsageDashboard via props.",
                  })}
                </div>
              )}
            </>
          )}

          {activeTab === "future1" && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6 text-sm text-gray-600 dark:text-gray-300">
              {t("futureSettingsPlaceholder", {
                defaultValue: "Placeholder for future “Settings” tab.",
              })}
            </div>
          )}

          {activeTab === "future2" && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6 text-sm text-gray-600 dark:text-gray-300">
              {t("futureAuditPlaceholder", {
                defaultValue: "Placeholder for future “Audit” tab.",
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Small tab button --------------------------- */

function TabButton({
  label,
  active,
  onClick,
  disabled = false,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      role="tab"
      aria-selected={!!active}
      onClick={onClick}
      disabled={disabled}
      className={[
        "relative -mb-px px-3 py-2 text-sm border-b-2 focus:outline-none transition-colors",
        active
          ? "text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400"
          : "text-gray-600 dark:text-gray-300 border-transparent hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600",
        disabled && "opacity-50 cursor-not-allowed",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
