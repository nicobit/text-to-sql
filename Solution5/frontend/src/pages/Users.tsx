// src/pages/Users.tsx
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

import { useMsal } from "@azure/msal-react"; // make sure you have this; otherwise inject your instance

const users = [
  { id: 1, name: "John Doe", role: "Admin", status: "Active" },
  { id: 2, name: "Jane Smith", role: "Developer", status: "Pending" },
  { id: 3, name: "Alice Johnson", role: "Viewer", status: "Active" },
];

type TabKey = "usage" | "future1" | "future2";

export default function Users() {
  const [activeTab, setActiveTab] = useState<TabKey>("usage");
  const { instance } = useMsal(); // if you don't use msal-react, pass your instance via props instead

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Users</h2>

      {/* User cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <CardTitle>{user.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400">Role: {user.role}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Status: {user.status}</p>
            </CardContent>
          </Card>
        ))}
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
