import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  Mail,
  Settings,
  BrainCircuit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  roles?: string[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: <LayoutDashboard size={18} /> },
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

export default function Sidebar() {
  const { role } = usePermissions();

  const visibleItems = navItems.filter(
    (item) => !item.roles || (role && item.roles.includes(role))
  );

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-zinc-900 text-zinc-100 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-zinc-800">
        <BrainCircuit className="h-6 w-6 text-indigo-400" />
        <span className="text-base font-bold tracking-tight">ProjectAI</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              )
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
