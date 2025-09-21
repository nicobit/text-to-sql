// src/pages/Users.tsx
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import TokenUsageDashboard from "@/components/tokenUsageDashboard/TokenUsageDashboard";
import { useMsal } from "@azure/msal-react"; // make sure you have this; otherwise inject your instance


type TabKey = "usage" | "future1" | "future2";

export default function Users() {
  const [activeTab, setActiveTab] = useState<TabKey>("usage");
  const { instance } = useMsal(); // if you don't use msal-react, pass your instance via props instead

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Users</h2>


      {/* Tabs */}
      <div className="mt-2">
        <div role="tablist" aria-label="User tools" className="border-b border-gray-200 dark:border-gray-800">
          <div className="flex gap-2">
            <TabButton
              active={activeTab === "usage"}
              onClick={() => setActiveTab("usage")}
              label="Token Usage"
            />
            <TabButton
              active={activeTab === "future1"}
              onClick={() => setActiveTab("future1")}
              label="(Future) Settings"
              disabled
            />
            <TabButton
              active={activeTab === "future2"}
              onClick={() => setActiveTab("future2")}
              label="(Future) Audit"
              disabled
            />
          </div>
        </div>

        <div className="mt-4">
          {activeTab === "usage" && instance && (
            <TokenUsageDashboard instance={instance} defaultDays={14} />
          )}

          {activeTab === "usage" && !instance && (
            <div className="p-4 rounded border border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-200">
              Cannot find MSAL instance. If you’re not using <code>@azure/msal-react</code>,
              pass your <code>IPublicClientApplication</code> to <code>TokenUsageDashboard</code> via props.
            </div>
          )}

          {activeTab === "future1" && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6 text-sm text-gray-600 dark:text-gray-300">
              Placeholder for future “Settings” tab.
            </div>
          )}

          {activeTab === "future2" && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6 text-sm text-gray-600 dark:text-gray-300">
              Placeholder for future “Audit” tab.
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
