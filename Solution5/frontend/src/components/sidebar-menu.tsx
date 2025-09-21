import { LayoutDashboard, Settings, Bot, ShieldQuestion, Heart, Server, FileText, Users, ChevronRight, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type MenuItem = {
  name: string;
  path?: string;                // optional if it has children
  icon?: LucideIcon;
  children?: MenuItem[];
  badge?: string;
};

export const menuItems: MenuItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/" },
   {
    name: "NL to SQL",
    icon: Bot,
    children: [
      { name: "Chat", path: "/chat" },
      { name: "Questions", path: "/question" },
    ],
  },
  { name: "Account",icon: User, path: "/user"  },
  {
    name: "Settings",icon: Settings, path: "/settings"  },
  { name: "Status", icon: Heart, path: "/status" },

  // Examples of more nested groups (optional):
  // {
  //   name: "Ops",
  //   icon: Server,
  //   children: [
  //     { name: "Environment", path: "/environment" },
  //     { name: "Logs", path: "/logs" },
  //     { name: "Users", path: "/users" },
  //   ],
  // },
];