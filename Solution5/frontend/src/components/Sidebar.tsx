// Sidebar.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useSidebar } from "@/contexts/SidebarContext";
import { menuItems, type MenuItem } from "./sidebar-menu";

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const { pathname } = useLocation();

  // Track which groups are expanded when the sidebar is open
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // Helper: is this item (or any of its children) active for current route?
  const isActivePath = (path?: string) => !!path && pathname === path;
  const hasActiveDescendant = (item: MenuItem): boolean =>
    (item.children ?? []).some(
      (c) => isActivePath(c.path) || (c.children ? hasActiveDescendant(c) : false)
    );

  // Expand groups that contain the active route
  useEffect(() => {
    const next: Record<string, boolean> = {};
    const markActives = (items: MenuItem[]) => {
      for (const it of items) {
        if (it.children?.length) {
          next[it.name] = hasActiveDescendant(it);
          markActives(it.children);
        }
      }
    };
    markActives(menuItems);
    setOpenGroups((prev) => ({ ...prev, ...next }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleGroup = (name: string) =>
    setOpenGroups((s) => ({ ...s, [name]: !s[name] }));

  return (
    <aside
      className={[
        "h-screen flex flex-col bg-white dark:bg-gray-800 border-r dark:border-gray-700 transition-all duration-300",
        sidebarOpen ? "w-64" : "w-20",
      ].join(" ")}
    >
      {/* Logo + Collapse */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {sidebarOpen ? "Admin Portal" : "A"}
        </h1>
        <button
          onClick={toggleSidebar}
          className={[
            "transform transition-transform text-gray-600 dark:text-gray-400",
            sidebarOpen ? "" : "rotate-90",
          ].join(" ")}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.name}
            item={item}
            sidebarOpen={sidebarOpen}
            isActivePath={isActivePath}
            hasActiveDescendant={hasActiveDescendant}
            openGroups={openGroups}
            onToggleGroup={toggleGroup}
            forceOpenSidebar={() => {
              if (!sidebarOpen) toggleSidebar();
            }}
          />
        ))}
      </nav>
    </aside>
  );
}

type ItemProps = {
  item: MenuItem;
  sidebarOpen: boolean;
  isActivePath: (p?: string) => boolean;
  hasActiveDescendant: (i: MenuItem) => boolean;
  openGroups: Record<string, boolean>;
  onToggleGroup: (name: string) => void;
  forceOpenSidebar: () => void;
};

function SidebarItem({
  item,
  sidebarOpen,
  isActivePath,
  hasActiveDescendant,
  openGroups,
  onToggleGroup,
  forceOpenSidebar,
}: ItemProps) {
  const Icon = item.icon;
  const isLeaf = !item.children || item.children.length === 0;

  // Active states
  const activeLeaf = isLeaf && isActivePath(item.path);
  const activeGroup = !isLeaf && hasActiveDescendant(item);

  // Base classes
  const baseCls =
    "group relative flex items-center p-2 rounded-lg transition-colors duration-200";
  const activeClsLeaf =
    "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300";
  const hoverCls =
    "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700";
  const groupActiveCls =
    "text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700/60";

  if (isLeaf) {
    return (
      <div className="relative">
        <Link
          to={item.path || "#"}
          className={`${baseCls} ${activeLeaf ? activeClsLeaf : hoverCls}`}
        >
          {Icon && <Icon className="w-5 h-5" />}
          {sidebarOpen && (
            <span className="ml-4 text-sm font-medium truncate">{item.name}</span>
          )}
          {/* Tooltip when collapsed */}
          {!sidebarOpen && (
            <Tooltip label={item.name} />
          )}
        </Link>
      </div>
    );
  }

  // Group item (has children)
  const isOpen = !!openGroups[item.name];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          if (!sidebarOpen) {
            // expand the whole sidebar first when collapsed
            forceOpenSidebar();
          } else {
            onToggleGroup(item.name);
          }
        }}
        className={`${baseCls} ${activeGroup ? groupActiveCls : hoverCls} w-full text-left`}
        aria-expanded={isOpen}
        aria-controls={`submenu-${item.name}`}
      >
        {Icon && <Icon className="w-5 h-5" />}
        {sidebarOpen ? (
          <>
            <span className="ml-4 text-sm font-medium truncate flex-1">{item.name}</span>
            {isOpen ? (
              <ChevronDown className="w-4 h-4 opacity-70" />
            ) : (
              <ChevronRight className="w-4 h-4 opacity-70" />
            )}
          </>
        ) : (
          <Tooltip label={item.name} />
        )}
      </button>

      {/* Inline submenu when expanded sidebar */}
      {sidebarOpen && (
        <ul
          id={`submenu-${item.name}`}
          className={[
            "mt-1 ml-2 border-l border-gray-200 dark:border-gray-700 pl-2 space-y-1",
            isOpen ? "block" : "hidden",
          ].join(" ")}
        >
          {(item.children ?? []).map((child) => {
            const childActive = isActivePath(child.path) || hasActiveDescendant(child);
            return (
              <li key={child.name}>
                <Link
                  to={child.path || "#"}
                  className={[
                    "flex items-center p-2 rounded-lg text-sm transition-colors",
                    childActive
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700",
                  ].join(" ")}
                >
                  <span className="ml-6 truncate">{child.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {/* Flyout submenu when collapsed sidebar */}
      {!sidebarOpen && item.children && item.children.length > 0 && (
        <div className="absolute left-full top-0 ml-2 z-20 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition">
          <div className="min-w-[12rem] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2">
            {(item.children ?? []).map((child) => {
              const childActive = isActivePath(child.path) || hasActiveDescendant(child);
              return (
                <Link
                  key={child.name}
                  to={child.path || "#"}
                  className={[
                    "block px-3 py-2 text-sm rounded",
                    childActive
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700",
                  ].join(" ")}
                >
                  {child.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Tooltip({ label }: { label: string }) {
  return (
    <span
      className="
        absolute left-full top-1/2 -translate-y-1/2
        ml-2 whitespace-nowrap
        bg-gray-800 text-white text-xs font-medium
        px-2 py-1 rounded opacity-0
        group-hover:opacity-100
        transition-opacity
      "
      role="tooltip"
    >
      {label}
    </span>
  );
}
