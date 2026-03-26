import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  Mail,
  Settings,
  BrainCircuit,
  FolderKanban,
  CheckSquare,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  roles?: string[];
}

// ── Phase 1 nav items ──────────────────────────────────────────────────────
const phase1Items: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: <LayoutDashboard size={18} /> },
  { label: "Analytics", to: "/analytics", icon: <BrainCircuit size={18} />, roles: ["ADMIN", "MANAGER"] },
  { label: "Users", to: "/users", icon: <Users size={18} />, roles: ["ADMIN"] },
  {
    label: "Departments",
    to: "/departments",
    icon: <Building2 size={18} />,
    roles: ["ADMIN", "MANAGER"],
  },
  {
    label: "Invitations",
    to: "/invitations",
    icon: <Mail size={18} />,
    roles: ["ADMIN"],
  },
  {
    label: "Settings",
    to: "/settings",
    icon: <Settings size={18} />,
    roles: ["ADMIN"],
  },
];

// ── Phase 2 nav items ──────────────────────────────────────────────────────
const phase2Items: NavItem[] = [
  {
    label: "Projects",
    to: "/projects",
    icon: <FolderKanban size={18} />,
    // visible to all roles
  },
  {
    label: "My Tasks",
    to: "/tasks/my-tasks",
    icon: <CheckSquare size={18} />,
    roles: ["EMPLOYEE"],
  },
  {
    label: "Notifications",
    to: "/notifications",
    icon: <Bell size={18} />,
  },
];

export default function Sidebar() {
  const { role } = usePermissions();

  const filterByRole = (items: NavItem[]) =>
    items.filter((item) => !item.roles || (role && item.roles.includes(role)));

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
      isActive
        ? "bg-indigo-600 text-white"
        : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
    );

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-zinc-900 text-zinc-100 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-zinc-800">
        <BrainCircuit className="h-6 w-6 text-indigo-400" />
        <span className="text-base font-bold tracking-tight">Opervox</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">

        {/* Phase 1 — Org Management */}
        <div>
          <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Organisation
          </p>
          <div className="space-y-1">
            {filterByRole(phase1Items).map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass}>
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Phase 2 — Project Management */}
        <div>
          <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Projects
          </p>
          <div className="space-y-1">
            {filterByRole(phase2Items).map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass}>
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

      </nav>
    </aside>
  );
}
