import { LayoutDashboard, Settings, Bot, ShieldQuestion, Heart, Server, FileText, Users, ChevronRight, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type MenuItem = {
  name: string;
  path?: string;                // optional if it has children
  icon?: LucideIcon;
  children?: MenuItem[];
  badge?: string;
};

const includeIf = <T,>(condition: boolean, items: T[]): T[] => (condition ? items : []);

export const getMenuItems = (isAdmin: boolean): MenuItem[] => [
  { name: "Dashboard", icon: LayoutDashboard, path: "/" },
  {
    name: "NL to SQL",
    icon: Bot,
    children: [
      { name: "Chat", path: "/chat" },
      { name: "Questions", path: "/question" },
    ],
  },
  { name: "Account", icon: User, path: "/user" },
  ...includeIf(isAdmin, [{ name: "Settings", icon: Settings, path: "/settings" }]),
  { name: "Costs", icon: Server, path: "/costs" },
  { name: "Status", icon: Heart, path: "/status" },
];