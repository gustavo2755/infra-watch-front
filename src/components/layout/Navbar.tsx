import { NavLink } from "react-router-dom";
import { Server, Activity, LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/Button";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-sky-600 text-white shadow">
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        <nav className="flex items-center gap-4">
          <NavLink
            to="/servers"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-md font-medium ${
                isActive ? "bg-sky-500/50" : "hover:bg-sky-500/30"
              }`
            }
          >
            <Server className="w-5 h-5" />
            Servers
          </NavLink>
          <NavLink
            to="/service-checks"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-md font-medium ${
                isActive ? "bg-sky-500/50" : "hover:bg-sky-500/30"
              }`
            }
          >
            <Activity className="w-5 h-5" />
            Services
          </NavLink>
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">
            {user?.email ?? "User"}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => logout()}
            className="flex items-center gap-1 !bg-sky-500/30 !border-sky-400 !text-white hover:!bg-sky-500/50"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
