import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { LogOut, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { organizationService } from "@/services/organizationService";

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: org } = useQuery({
    queryKey: ["organization"],
    queryFn: organizationService.getOrganization,
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // cache for 5 min
  });

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-6 shrink-0">
      {/* Org name */}
      <div className="text-sm font-semibold text-foreground">
        {org?.name ?? "Loading..."}
      </div>

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 outline-none cursor-pointer">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-indigo-600 text-white text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{user?.role}</p>
          </div>
          <ChevronDown size={14} className="text-muted-foreground" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">
            {user?.email}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive cursor-pointer"
            onClick={handleLogout}
          >
            <LogOut size={14} className="mr-2" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
